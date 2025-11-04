const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const generateToken = require('../utils/generateToken');
const normalizeArrayField = require('../utils/normalizeArrayField');
const setRoleSpecificFields = require('../utils/setRoleSpecificFields');
const sendEmail = require('../utils/sendEmail');

// ================== REGISTER ==================
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullName, email, mobile, password, role } = req.body;
    if (!fullName || !email || !password || !role)
      return res.status(400).json({ message: 'fullName, email, password and role are required' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin registration is not allowed from this endpoint.' });
    }

    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
    // const verificationToken = crypto.randomBytes(20).toString('hex');

    let user = new User({
      fullName,
      email: email.toLowerCase(),
      mobile: mobile || '',
      passwordHash,
      role,
      isVerified: true, // Email verification is temporarily disabled
      // verificationToken,
    });

    // Set role-specific fields
    user = setRoleSpecificFields(user, req.body);
    await user.save();

    // Send verification email
    // const verifyLink = `http://localhost:5173/verify-email/${verificationToken}`;
    // await sendEmail({
    //   to: user.email,
    //   subject: "Verify your FarmKart email",
    //   html: `<p>Hi ${user.fullName},</p>
    //          <p>Thank you for registering on FarmKart. Please verify your email by clicking the link below:</p>
    //          <a href="${verifyLink}">Verify Email</a>
    //          <p>If you did not create this account, please ignore this email.</p>`
    // });

    // console.log(`Verification email sent to: ${user.email}`);
    res.status(201).json({ message: 'Registered successfully.' });
  } catch (err) {
    next(err);
  }
};

// ================== VERIFY EMAIL ==================
// exports.verifyEmail = async (req, res, next) => {
//   try {
//     const { token } = req.params;
//     const pendingUser = await PendingUser.findOne({ verificationToken: token });
//     if (!pendingUser) return res.status(400).json({ message: 'Invalid or expired token' });

//     const { fullName, email, mobile, passwordHash, role } = pendingUser;
//     const user = new User({
//       fullName,
//       email,
//       mobile,
//       passwordHash,
//       role,
//       isVerified: true,
//     });

//     await user.save();
//     await pendingUser.remove();

//     res.json({ message: 'Email verified successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// ================== LOGIN ==================
const handleFailedLogin = require('../utils/handleFailedLogin');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Account lockout check
    if (user.lockUntil && user.lockUntil > Date.now()) 
      return res.status(403).json({ message: 'Account locked. Try again later.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await handleFailedLogin(user); // use helper here
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Email verification check
    // if (!user.isVerified) 
    //   return res.status(403).json({ message: 'Please verify your email first.' });

    // reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = generateToken(user);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    const userSafe = { ...user.toObject() };
    delete userSafe.passwordHash;

    // Return token as well so SPA can store and send Authorization header
    res.json({ token, user: userSafe });
  } catch (err) {
    next(err);
  }
};


// ================== GET CURRENT USER ==================
exports.me = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

// ================== LOGOUT ==================
exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
