const asyncHandler = require('../middleware/asyncHandler');
const Bid = require('../models/Bid');
const RFQ = require('../models/RFQ');
const User = require('../models/User');
const crypto = require('crypto');
const { calculateBidScore } = require('../utils/bidEvaluation');

// @desc    Submit a new bid for an RFQ
// @route   POST /api/rfq/:id/bid
// @access  Private (Farmers)
const submitBid = asyncHandler(async (req, res) => {
  const { id: rfqId } = req.params;
  const { pricePerUnit, deliveryWindow, transportMethod, remarks } = req.body;

  const farmerId = req.user._id;

  const rfq = await RFQ.findById(rfqId);
  if (!rfq) {
    res.status(404);
    throw new Error('RFQ not found');
  }
  if (rfq.status !== 'open') {
    res.status(400);
    throw new Error('Cannot submit bid for a closed or accepted RFQ');
  }

  if (new Date(deliveryWindow.end) > new Date(rfq.deliveryDeadline)) {
    res.status(400);
    throw new Error("Delivery window cannot exceed RFQ's deadline");
  }

  const existingBid = await Bid.findOne({ rfqId, farmerId });
  if (existingBid) {
    res.status(400);
    throw new Error('You have already submitted a bid for this RFQ. You can only submit one bid per RFQ.');
  }

  const year = new Date().getFullYear();
  const uniqueHash = crypto.randomBytes(3).toString('hex').toUpperCase();
  const bidId = `BID-${year}-${uniqueHash}`;

  const farmerRating = 4.0; // Placeholder farmer rating
  const score = calculateBidScore({ pricePerUnit }, rfq, farmerRating);

  const bid = new Bid({
    bidId,
    rfqId,
    farmerId,
    pricePerUnit,
    deliveryWindow,
    transportMethod,
    remarks,
    score,
    status: 'submitted',
  });

  const createdBid = await bid.save();

  // Notify buyer in real-time
  const io = req.app.get('socketio');
  io.to(rfq.buyerId.toString()).emit('newBid', {
    message: `New bid placed on your RFQ "${rfq.product}" by ${req.user.name}.`,
    rfqId: rfq._id,
    bidId: createdBid._id,
  });

  res.status(201).json(createdBid);
});

// @desc    Get all bids for a specific RFQ
// @route   GET /api/rfq/:id/bids
// @access  Private (Business users - RFQ owner)
const getBidsForRFQ = asyncHandler(async (req, res) => {
  const { id: rfqId } = req.params;

  const rfq = await RFQ.findById(rfqId);
  if (!rfq) {
    res.status(404);
    throw new Error('RFQ not found');
  }

  if (rfq.buyerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view bids for this RFQ');
  }

  const bids = await Bid.find({ rfqId })
    .populate('farmerId', 'name')
    .sort({ score: -1 });

  res.json(bids);
});

// @desc    Accept a bid for an RFQ
// @route   POST /api/rfq/:rfqId/accept/:bidId
// @access  Private (Business users - RFQ owner)
const acceptBid = asyncHandler(async (req, res) => {
  const { rfqId, bidId } = req.params;

  const rfq = await RFQ.findById(rfqId);
  if (!rfq) {
    res.status(404);
    throw new Error('RFQ not found');
  }

  if (rfq.buyerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to accept bids for this RFQ');
  }

  const acceptedBid = await Bid.findById(bidId);
  if (!acceptedBid) {
    res.status(404);
    throw new Error('Bid not found');
  }

  if (acceptedBid.rfqId.toString() !== rfqId) {
    res.status(400);
    throw new Error('Bid does not belong to this RFQ');
  }

  if (rfq.status !== 'open') {
    res.status(400);
    throw new Error('RFQ is not open for bid acceptance');
  }

  acceptedBid.status = 'accepted';
  await acceptedBid.save();

  await Bid.updateMany(
    { rfqId, _id: { $ne: bidId } },
    { status: 'rejected' }
  );

  rfq.status = 'closed';
  await rfq.save();

  const io = req.app.get('socketio');

  // Notify accepted farmer
  io.to(acceptedBid.farmerId.toString()).emit('bidAccepted', {
    message: `Your bid for RFQ "${rfq.product}" has been accepted!`,
    rfqId: rfq._id,
    bidId: acceptedBid._id,
  });

  // Notify other farmers whose bids were rejected
  const rejectedBids = await Bid.find({ rfqId, _id: { $ne: bidId } });
  rejectedBids.forEach(bid => {
    io.to(bid.farmerId.toString()).emit('bidRejected', {
      message: `Your bid for RFQ "${rfq.product}" was rejected.`,
      rfqId: rfq._id,
      bidId: bid._id,
    });
  });

  res.json({ message: 'Bid accepted successfully', acceptedBid });
});

// @desc    Get all bids for a specific farmer
// @route   GET /api/bids/mybids
// @access  Private (Farmers)
const getBidsForFarmer = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ farmerId: req.user._id })
    .populate('rfqId', 'product rfqId') // Populate the rfqId with product and rfqId
    .sort({ createdAt: -1 });

  res.json(bids);
});


module.exports = {
  submitBid,
  getBidsForRFQ,
  acceptBid,
  getBidsForFarmer,
};
