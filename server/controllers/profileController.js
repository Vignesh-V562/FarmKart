const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all buyer profiles
// @route   GET /api/profile/buyers
// @access  Public (or Private if needed)
exports.getBuyerProfiles = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        $or: [
          { fullName: { $regex: req.query.keyword, $options: 'i' } },
          { companyName: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const buyers = await User.find({ role: 'customer', ...keyword }).select('-passwordHash');
  res.json(buyers);
});

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    const { 
        fullName, mobile, bio, farmName, farmAddress, farmGeolocation, 
        cropsGrown, businessName, bankDetails, documents, photos, profilePicture 
    } = req.body;

    user.fullName = fullName || user.fullName;
    user.mobile = mobile || user.mobile;
    user.bio = bio || user.bio;
    user.farmName = farmName || user.farmName;
    user.businessName = businessName || user.businessName;
    user.cropsGrown = cropsGrown || user.cropsGrown;
    user.photos = photos || user.photos;
    user.profilePicture = profilePicture !== undefined ? profilePicture : user.profilePicture;

    if (farmAddress) {
        user.farmAddress = { ...user.farmAddress, ...farmAddress };
    }
    if (farmGeolocation) {
        user.farmGeolocation = { ...user.farmGeolocation, ...farmGeolocation };
    }
    if (bankDetails) {
        user.bankDetails = { ...user.bankDetails, ...bankDetails };
    }
    if (documents) {
        user.documents = documents;
    }

    const updatedUser = await user.save();

    const userObject = updatedUser.toObject();
    delete userObject.passwordHash;

    res.json(userObject);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Change user password
// @route   PUT /api/profile/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide current and new passwords');
    }

    const user = await User.findById(req.user.id);

    if (user) {
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isMatch) {
            res.status(401);
            throw new Error('Invalid current password');
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all farmer profiles (for RFQ invitation)
// @route   GET /api/profile/farmers
// @access  Private/Business
exports.getFarmers = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        $or: [
          { fullName: { $regex: req.query.keyword, $options: 'i' } },
          { farmName: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const farmers = await User.find({ role: 'farmer', ...keyword }).select('_id fullName farmName');
  res.json(farmers);
});
