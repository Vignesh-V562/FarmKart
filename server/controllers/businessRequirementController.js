const BusinessRequirement = require('../models/BusinessRequirement');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new business requirement (RFQ)
// @route   POST /api/business-requirements
// @access  Private/Business
const createBusinessRequirement = asyncHandler(async (req, res) => {
  const { title, description, category, quantity, unit, budget, deadline, isPublic } = req.body;

  const requirement = new BusinessRequirement({
    business: req.user._id,
    title,
    description,
    category,
    quantity,
    unit,
    budget,
    deadline,
    isPublic,
  });

  const createdRequirement = await requirement.save();
  res.status(201).json(createdRequirement);
});

// @desc    Get all public business requirements (for marketplace)
// @route   GET /api/business-requirements
// @access  Private/Authenticated Users
const getBusinessRequirements = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        title: { $regex: req.query.keyword, $options: 'i' },
      }
    : {};

  const requirements = await BusinessRequirement.find({ ...keyword, isPublic: true, status: 'open' })
    .populate('business', 'fullName companyName')
    .sort({ createdAt: -1 });

  res.json(requirements);
});

// @desc    Get RFQs for the logged-in business
// @route   GET /api/business-requirements/my-rfqs
// @access  Private/Business
const getMyRfqs = asyncHandler(async (req, res) => {
    const requirements = await BusinessRequirement.find({ business: req.user._id })
        .populate('bids.farmer', 'fullName companyName averageRating')
        .sort({ createdAt: -1 });

    res.json(requirements);
});

// @desc    Get bids for the logged-in farmer
// @route   GET /api/business-requirements/my-bids
// @access  Private/Farmer
const getMyBids = asyncHandler(async (req, res) => {
    const requirements = await BusinessRequirement.find({ "bids.farmer": req.user._id })
        .select('title status bids')
        .sort({ createdAt: -1 });

    // Filter bids to only show the current farmer's bid for each requirement
    const myBids = requirements.map(req => {
        const myBid = req.bids.find(bid => bid.farmer.toString() === req.user._id.toString());
        return {
            requirementId: req._id,
            requirementTitle: req.title,
            requirementStatus: req.status,
            bid: myBid
        }
    });

    res.json(myBids);
});

// @desc    Get a single business requirement by ID
// @route   GET /api/business-requirements/:id
// @access  Private/Authenticated Users
const getBusinessRequirementById = asyncHandler(async (req, res) => {
  const requirement = await BusinessRequirement.findById(req.params.id)
    .populate('business', 'fullName companyName')
    .populate('bids.farmer', 'fullName companyName averageRating');

  if (requirement) {
    res.json(requirement);
  } else {
    res.status(404);
    throw new Error('Business requirement not found');
  }
});

// @desc    Update a business requirement
// @route   PUT /api/business-requirements/:id
// @access  Private/Business
const updateBusinessRequirement = asyncHandler(async (req, res) => {
  const { title, description, category, quantity, unit, budget, deadline, status, isPublic } = req.body;

  const requirement = await BusinessRequirement.findById(req.params.id);

  if (requirement) {
    if (requirement.business.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this requirement');
    }

    requirement.title = title || requirement.title;
    requirement.description = description || requirement.description;
    requirement.category = category || requirement.category;
    requirement.quantity = quantity || requirement.quantity;
    requirement.unit = unit || requirement.unit;
    requirement.budget = budget || requirement.budget;
    requirement.deadline = deadline || requirement.deadline;
    requirement.status = status || requirement.status;
    requirement.isPublic = isPublic === undefined ? requirement.isPublic : isPublic;

    const updatedRequirement = await requirement.save();
    res.json(updatedRequirement);
  } else {
    res.status(404);
    throw new Error('Business requirement not found');
  }
});

// @desc    Delete a business requirement
// @route   DELETE /api/business-requirements/:id
// @access  Private/Business
const deleteBusinessRequirement = asyncHandler(async (req, res) => {
  const requirement = await BusinessRequirement.findById(req.params.id);

  if (requirement) {
    if (requirement.business.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this requirement');
    }

    await requirement.deleteOne();
    res.json({ message: 'Business requirement removed' });
  } else {
    res.status(404);
    throw new Error('Business requirement not found');
  }
});

// @desc    Submit a bid for an RFQ
// @route   POST /api/business-requirements/:id/bids
// @access  Private/Farmer
const submitBid = asyncHandler(async (req, res) => {
    const { price, message } = req.body;
    const requirement = await BusinessRequirement.findById(req.params.id);

    if (!requirement) {
        res.status(404);
        throw new Error('Requirement not found');
    }

    if (requirement.status !== 'open') {
        res.status(400);
        throw new Error('Bidding is closed for this requirement.');
    }

    const alreadyBid = requirement.bids.find(bid => bid.farmer.toString() === req.user._id.toString());

    if (alreadyBid) {
        res.status(400);
        throw new Error('You have already submitted a bid for this requirement.');
    }

    const bid = {
        farmer: req.user._id,
        price,
        message
    };

    requirement.bids.push(bid);
    await requirement.save();

    res.status(201).json({ message: 'Bid submitted successfully' });
});

// @desc    Accept a bid for an RFQ
// @route   PUT /api/business-requirements/:id/bids/:bidId/accept
// @access  Private/Business
const acceptBid = asyncHandler(async (req, res) => {
    const requirement = await BusinessRequirement.findById(req.params.id);

    if (!requirement) {
        res.status(404);
        throw new Error('Requirement not found');
    }

    if (requirement.business.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to manage this requirement.');
    }

    if (requirement.status !== 'open') {
        res.status(400);
        throw new Error('This requirement is no longer open for bidding.');
    }

    const bidToAccept = requirement.bids.id(req.params.bidId);

    if (!bidToAccept) {
        res.status(404);
        throw new Error('Bid not found');
    }

    // Reject all other bids
    requirement.bids.forEach(bid => {
        if (bid._id.toString() !== req.params.bidId) {
            bid.status = 'rejected';
        }
    });

    bidToAccept.status = 'accepted';
    requirement.acceptedBid = bidToAccept._id;
    requirement.status = 'in-progress'; // Or 'fulfilled' if it's an immediate thing

    await requirement.save();

    // Here you might want to trigger a notification to the winning farmer

    res.json({ message: `Bid from ${bidToAccept.farmer.toString()} accepted.` });
});

module.exports = { 
    createBusinessRequirement, 
    getBusinessRequirements, 
    getBusinessRequirementById, 
    updateBusinessRequirement, 
    deleteBusinessRequirement,
    getMyRfqs,
    getMyBids,
    submitBid,
    acceptBid
};