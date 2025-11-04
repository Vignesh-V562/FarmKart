const Quote = require('../models/Quote');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new quote
// @route   POST /api/quotes
// @access  Private/Farmer
const createQuote = asyncHandler(async (req, res) => {
  const { businessRequirementId, price, message } = req.body;

  const quote = new Quote({
    businessRequirement: businessRequirementId,
    farmer: req.user._id,
    price,
    message,
  });

  const createdQuote = await quote.save();
  res.status(201).json(createdQuote);
});

// @desc    Get all quotes for a business requirement
// @route   GET /api/quotes/requirement/:requirementId
// @access  Private/Business
const getQuotesForRequirement = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ businessRequirement: req.params.requirementId }).populate('farmer', 'fullName companyName');
  res.json(quotes);
});

// @desc    Get all quotes for a farmer
// @route   GET /api/quotes/farmer
// @access  Private/Farmer
const getQuotesForFarmer = asyncHandler(async (req, res) => {
  const quotes = await Quote.find({ farmer: req.user._id }).populate('businessRequirement');
  res.json(quotes);
});

// @desc    Update quote status
// @route   PATCH /api/quotes/:quoteId/status
// @access  Private/Business
const updateQuoteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const quote = await Quote.findById(req.params.quoteId);

  if (quote) {
    quote.status = status;
    const updatedQuote = await quote.save();
    res.json(updatedQuote);
  } else {
    res.status(404);
    throw new Error('Quote not found');
  }
});

module.exports = { createQuote, getQuotesForRequirement, getQuotesForFarmer, updateQuoteStatus };
