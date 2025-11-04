const RFQ = require('../models/RFQ');
const Bid = require('../models/Bid');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog'); // Import AuditLog model
const asyncHandler = require('../middleware/asyncHandler');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const { sendEmail } = require('../utils/sendEmail'); // Assuming this utility exists
const { uploadFileToFirebase } = require('../utils/firebaseUpload'); // Import Firebase upload utility

// Helper function to generate RFQ ID
const generateRFQId = (regionCode = 'UNK') => { // Default to 'UNK' if regionCode is not provided
  const year = new Date().getFullYear();
  const uniqueHash = uuidv4().substring(0, 8).toUpperCase(); // Short unique hash
  // TODO: Dynamically fetch regionCode based on buyer's location or profile
  return `RFQ-${year}${regionCode}-${uniqueHash}`;
};

// @desc    Create a new RFQ
// @route   POST /api/rfq
// @access  Private/Business
const createRFQ = asyncHandler(async (req, res) => {
  const { product, category, quantity, unit, deliveryDeadline, additionalNotes, type, region, invitedFarmers } = req.body;

  // Basic validation (more detailed schema validation with Yup/Zod would be on frontend/middleware)
  if (!product || !category || !quantity || !unit || !deliveryDeadline || !region) {
    res.status(400);
    throw new Error('Please fill in all required RFQ fields');
  }

  if (type === 'private') {
    if (!invitedFarmers || !Array.isArray(invitedFarmers) || invitedFarmers.length === 0) {
      res.status(400);
      throw new Error('Private RFQs require at least one invited farmer.');
    }
    // TODO: Add validation to ensure invitedFarmers are valid User IDs and are farmers
  } else if (type === 'public' && invitedFarmers && invitedFarmers.length > 0) {
    res.status(400);
    throw new Error('Public RFQs cannot have invited farmers.');
  }

  const rfqId = generateRFQId(region); // Pass region to generate RFQ ID

  let attachments = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadFileToFirebase(file));
    attachments = await Promise.all(uploadPromises);
  }

  const rfq = new RFQ({
    rfqId,
    buyerId: req.user._id,
    product,
    category,
    quantity,
    unit,
    deliveryDeadline,
    additionalNotes,
    attachments, // Store uploaded file URLs
    type,
    region, // Include region in the RFQ object
    invitedFarmers: type === 'private' ? invitedFarmers : [], // Store invited farmers for private RFQs
    status: 'open',
  });

  const createdRFQ = await rfq.save();

  // Create AuditLog entry for RFQ creation
  await AuditLog.create({
    entityType: 'RFQ',
    entityId: createdRFQ._id,
    eventType: 'rfq_created',
    userId: req.user._id,
    details: { product: createdRFQ.product, type: createdRFQ.type, attachments: createdRFQ.attachments },
  });

  // Notify relevant farmers (if public RFQ) or specific farmers (if private)
  const io = req.app.get('socketio');
  io.emit('newRFQ', createdRFQ); // Real-time notification

  // TODO: Implement email/SMS notification for relevant farmers
  // For public RFQs, this would involve fetching all relevant farmer emails.
  // For private RFQs, it would involve fetching invited farmer emails.
  // await sendEmail({ to: 'farmer@example.com', subject: 'New RFQ Posted', text: `A new RFQ for ${product} has been posted.` });

  res.status(201).json(createdRFQ);
});

// @desc    Get all RFQs (for business: their own, for farmer: public or invited)
// @route   GET /api/rfq (business) or /api/rfq/browse (farmer)
// @access  Private/Business or Private/Farmer
const getRFQs = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  let rfqQuery = {};
  let sortCriteria = {};

  if (req.path === '/browse') {
    // For /api/rfq/browse, show all public and open RFQs
    rfqQuery = { type: 'public', status: 'open' };
  } else {
    // For /api/rfq, filter based on user role
    if (req.user.role === 'farmer') {
      rfqQuery = { type: 'public', status: 'open' }; // Farmers see public RFQs
    } else if (req.user.role === 'business') {
      rfqQuery = { buyerId: req.user._id }; // Business users see their own RFQs
    }
  }

  // Keyword search
  if (req.query.keyword) {
    rfqQuery.product = { $regex: req.query.keyword, $options: 'i' };
  }

  // Category filter
  if (req.query.category) {
    rfqQuery.category = req.query.category;
  }

  // Region filter
  if (req.query.region) {
    rfqQuery.region = req.query.region;
  }

  let rfqs;
  let count;

  if (req.query.sort === '-buyerRating') {
    // Aggregation pipeline for sorting by buyerRating
    const aggregationPipeline = [
      { $match: rfqQuery },
      { $lookup: {
          from: 'users',
          localField: 'buyerId',
          foreignField: '_id',
          as: 'buyerInfo'
      }},
      { $unwind: '$buyerInfo' },
      { $sort: { 'buyerInfo.rating': -1 } },
      { $skip: pageSize * (page - 1) },
      { $limit: pageSize },
      { $project: {
          // Project fields to match the original RFQ structure and populate buyerId
          _id: 1,
          rfqId: 1,
          product: 1,
          category: 1,
          quantity: 1,
          unit: 1,
          deliveryDeadline: 1,
          attachments: 1,
          type: 1,
          status: 1,
          additionalNotes: 1,
          region: 1,
          createdAt: 1,
          updatedAt: 1,
          buyerId: { // Manually populate buyerId with selected fields
            _id: '$buyerInfo._id',
            fullName: '$buyerInfo.fullName',
            companyName: '$buyerInfo.companyName',
            rating: '$buyerInfo.rating',
          },
      }},
    ];

    rfqs = await RFQ.aggregate(aggregationPipeline);
    count = await RFQ.countDocuments(rfqQuery); // Count remains the same

  } else {
    // Existing logic for other sorting options or no sorting
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'deliveryDeadline':
          sortCriteria.deliveryDeadline = 1; // Ascending
          break;
        case 'quantity':
          sortCriteria.quantity = 1; // Ascending
          break;
        case '-quantity':
          sortCriteria.quantity = -1; // Descending
          break;
        default:
          sortCriteria.createdAt = -1; // Default to newest first
      }
    } else {
      sortCriteria.createdAt = -1; // Default to newest first if no sort option is provided
    }

    count = await RFQ.countDocuments(rfqQuery);
    rfqs = await RFQ.find(rfqQuery)
      .populate('buyerId', 'fullName companyName rating')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sortCriteria);
  }

  res.json({ rfqs, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get RFQ by ID
// @route   GET /api/rfq/:id
// @access  Private/Business or Private/Farmer (if public/invited)
const getRFQById = asyncHandler(async (req, res) => {
  const rfq = await RFQ.findById(req.params.id).populate('buyerId', 'fullName companyName');

  if (!rfq) {
    res.status(404);
    throw new Error('RFQ not found');
  }

  // Authorization check
  if (req.user.role === 'business' && rfq.buyerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to view this RFQ');
  }
  if (req.user.role === 'farmer' && rfq.type === 'private') {
    // TODO: Implement check if farmer is invited to this private RFQ
    res.status(401);
    throw new Error('Not authorized to view this private RFQ');
  }

  res.json(rfq);
});

// @desc    Submit a bid for an RFQ
// @route   POST /api/rfq/:id/bid
// @access  Private/Farmer
const submitBid = asyncHandler(async (req, res) => {
  const { pricePerUnit, deliveryWindow, transportMethod, remarks } = req.body;
  const rfqId = req.params.id;

  // Basic validation
  if (!pricePerUnit || !deliveryWindow || !deliveryWindow.start || !deliveryWindow.end || !transportMethod) {
    res.status(400);
    throw new Error('Please fill in all required bid fields');
  }

  // Validation: Price per unit must be numeric and positive
  if (typeof pricePerUnit !== 'number' || pricePerUnit <= 0) {
    res.status(400);
    throw new Error('Price per unit must be a positive number');
  }

  const rfq = await RFQ.findById(rfqId);
  if (!rfq) {
    res.status(404);
    throw new Error('RFQ not found');
  }

  // Validation: Delivery window cannot exceed RFQ's deadline
  if (new Date(deliveryWindow.end) > new Date(rfq.deliveryDeadline)) {
    res.status(400);
    throw new Error('Delivery window cannot exceed RFQ\'s deadline');
  }

  const bidId = `BID-${uuidv4().substring(0, 8).toUpperCase()}`;

  const bid = new Bid({
    bidId,
    rfqId: rfq._id,
    farmerId: req.user._id,
    pricePerUnit,
    deliveryWindow,
    transportMethod,
    remarks,
    status: 'submitted',
  });

  // TODO: Implement bid scoring logic here
  // finalScore = (w1 * priceFactor) + (w2 * distanceFactor) + (w3 * farmerRating)

  // Weights (can be made configurable)
  const w1 = 0.5; // Weight for priceFactor
  const w2 = 0.3; // Weight for distanceFactor
  const w3 = 0.2; // Weight for farmerRating

  // 1. Calculate priceFactor (normalized inverse of bid price)
  // Assuming a max price for normalization. This needs to be dynamic based on product/market.
  // For now, a simple inverse with a scaling factor.
  const priceFactor = (1 / pricePerUnit) * 100; // Scale to make it a reasonable number

  // 2. Calculate distanceFactor (placeholder for now, requires Google Maps API integration)
  const distanceFactor = 1; // Placeholder value

  // 3. Get farmerRating
  const farmerRating = req.user.rating || 3.5; // Use user's rating or default to 3.5

  // Calculate finalScore
  const finalScore = (w1 * priceFactor) + (w2 * distanceFactor) + (w3 * farmerRating);

  bid.score = finalScore;

  const createdBid = await bid.save();

  // Create AuditLog entry for bid submission
  await AuditLog.create({
    entityType: 'Bid',
    entityId: createdBid._id,
    eventType: 'bid_submitted',
    userId: req.user._id,
    details: { rfqId: rfq._id, pricePerUnit: createdBid.pricePerUnit },
  });

  // Notify buyer in real-time
  const io = req.app.get('socketio');
  io.to(rfq.buyerId.toString()).emit('newBid', { rfqId: rfq._id, bid: createdBid });

  // Implement email/SMS notification for buyer
  const buyer = await User.findById(rfq.buyerId);
  if (buyer && buyer.email) {
    await sendEmail({ to: buyer.email, subject: 'New Bid on your RFQ', text: `A new bid has been placed on your RFQ for ${rfq.product}.` });
  }
  // TODO: Implement SMS notification for buyer

  res.status(201).json(createdBid);
});

// @desc    Get all bids for a specific RFQ
// @route   GET /api/rfq/:id/bids
// @access  Private/Business (owner of RFQ)
const getBidsForRFQ = asyncHandler(async (req, res) => {
  const rfqId = req.params.id;

  const rfq = await RFQ.findById(rfqId);
  if (!rfq) {
    res.status(404);
    throw new Error('RFQ not found');
  }

  // Authorization: Only the RFQ owner (business) can view bids
  if (rfq.buyerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to view bids for this RFQ');
  }

  const bids = await Bid.find({ rfqId }).populate('farmerId', 'fullName farmName');
  res.json(bids);
});

// @desc    Accept a bid for an RFQ
// @route   POST /api/rfq/:id/accept/:bidId
// @access  Private/Business (owner of RFQ)
const acceptBid = asyncHandler(async (req, res) => {
  const { id: rfqId, bidId } = req.params;

  const rfq = await RFQ.findById(rfqId);
  if (!rfq) {
    res.status(404);
    throw new Error('RFQ not found');
  }

  // Authorization: Only the RFQ owner (business) can accept bids
  if (rfq.buyerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to accept bids for this RFQ');
  }

  const acceptedBid = await Bid.findById(bidId);
  if (!acceptedBid) {
    res.status(404);
    throw new Error('Bid not found');
  }

  if (acceptedBid.rfqId.toString() !== rfq._id.toString()) {
    res.status(400);
    throw new Error('Bid does not belong to this RFQ');
  }

  // Update bid status to 'accepted'
  acceptedBid.status = 'accepted';
  await acceptedBid.save();

  // Create AuditLog entry for bid acceptance
  await AuditLog.create({
    entityType: 'Bid',
    entityId: acceptedBid._id,
    eventType: 'bid_accepted',
    userId: req.user._id,
    details: { rfqId: rfq._id, farmerId: acceptedBid.farmerId, pricePerUnit: acceptedBid.pricePerUnit },
  });

  // Update other bids for this RFQ to 'rejected' and close the RFQ
  const rejectedBids = await Bid.find(
    { rfqId: rfq._id, _id: { $ne: acceptedBid._id } }
  );
  await Bid.updateMany(
    { rfqId: rfq._id, _id: { $ne: acceptedBid._id } },
    { status: 'rejected' }
  );

  // Create AuditLog entries for rejected bids
  for (const bid of rejectedBids) {
    await AuditLog.create({
      entityType: 'Bid',
      entityId: bid._id,
      eventType: 'bid_rejected',
      userId: req.user._id,
      details: { rfqId: rfq._id, farmerId: bid.farmerId },
    });
  }

  rfq.status = 'closed';
  await rfq.save();

  // Create AuditLog entry for RFQ status change
  await AuditLog.create({
    entityType: 'RFQ',
    entityId: rfq._id,
    eventType: 'rfq_status_changed',
    userId: req.user._id,
    details: { oldStatus: 'open', newStatus: 'closed' },
  });

  // Notify farmer whose bid was accepted
  const io = req.app.get('socketio');
  io.to(acceptedBid.farmerId.toString()).emit('bidAccepted', { rfqId: rfq._id, bid: acceptedBid });

  // Implement email/SMS notification for accepted farmer
  const farmer = await User.findById(acceptedBid.farmerId);
  if (farmer && farmer.email) {
    await sendEmail({ to: farmer.email, subject: 'Your Bid Accepted!', text: `Your bid for RFQ ${rfq.rfqId} has been accepted.` });
  }
  // TODO: Implement SMS notification for accepted farmer

  res.json({ message: 'Bid accepted successfully', acceptedBid });
});

// @desc    Get all unique regions from RFQs
// @route   GET /api/rfq/regions
// @access  Private
const getUniqueRegions = asyncHandler(async (req, res) => {
  const regions = await RFQ.distinct('region');
  res.json(regions);
});

// @desc    Get all available transport methods
// @route   GET /api/rfq/transport-methods
// @access  Private
const getTransportMethods = asyncHandler(async (req, res) => {
  const transportMethods = ['Own Vehicle', 'Pickup', 'Third-Party']; // Static list for now
  res.json(transportMethods);
});

module.exports = {
  createRFQ,
  getRFQs,
  getRFQById,
  submitBid,
  getBidsForRFQ,
  acceptBid,
  getUniqueRegions,
  getTransportMethods,
};