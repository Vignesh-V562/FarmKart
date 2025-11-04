const asyncHandler = require('../middleware/asyncHandler');
const Invoice = require('../models/Invoice');
const User = require('../models/User');

// @desc    Get all invoices for a business
// @route   GET /api/invoices
// @access  Private/Business
const getInvoices = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const query = { user: req.user._id };

  if (status) {
    query.status = status;
  }

  if (search) {
    const farmerIds = await User.find({ fullName: { $regex: search, $options: 'i' } }).select('_id');
    query.$or = [
      { invoiceId: { $regex: search, $options: 'i' } },
      { farmer: { $in: farmerIds } },
    ];
  }

  const invoices = await Invoice.find(query).populate('farmer', 'fullName');
  res.json(invoices);
});

module.exports = { getInvoices };
