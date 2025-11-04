console.log('Executing auditController.js');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middleware/asyncHandler');
const RFQ = require('../models/RFQ');
const { Parser } = require('json2csv'); // Import Parser from json2csv

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        'details.product': { $regex: req.query.keyword, $options: 'i' },
      }
    : {};

  const count = await AuditLog.countDocuments({ ...keyword });
  const auditLogs = await AuditLog.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName email');

  res.json({ auditLogs, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get audit history for a specific RFQ
// @route   GET /api/rfq/:id/history
// @access  Private/Business or Private/Farmer
const getRFQHistory = asyncHandler(async (req, res) => {
  const rfqId = req.params.id;

  const rfq = await RFQ.findById(rfqId);

  if (!rfq) {
    res.status(404);
    throw new Error('RFQ not found');
  }

  // Authorization: Only the RFQ owner (business) or a farmer who has bid on it can view history
  // This logic needs to be refined based on how bids are stored and associated with farmers
  // For now, a simple check if the user is the buyer
  if (req.user.role === 'business' && rfq.buyerId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to view this RFQ's history");
  }
  // TODO: Add authorization for farmers who have bid on this RFQ

  const rfqHistory = await AuditLog.find({ entityType: 'RFQ', entityId: rfq._id })
    .sort({ createdAt: 1 })
    .populate('userId', 'fullName email');

  res.json(rfqHistory);
});

// @desc    Export audit logs to CSV
// @route   GET /api/audit/export/csv
// @access  Private/Admin
const exportAuditLogsToCSV = asyncHandler(async (req, res) => {
  const auditLogs = await AuditLog.find({})
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName email');

  const fields = [
    { label: 'Timestamp', value: 'createdAt' },
    { label: 'User Name', value: 'userId.fullName' },
    { label: 'User Email', value: 'userId.email' },
    { label: 'Entity Type', value: 'entityType' },
    { label: 'Entity ID', value: 'entityId' },
    { label: 'Event Type', value: 'eventType' },
    { label: 'Details', value: (row) => JSON.stringify(row.details) },
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(auditLogs);

  res.header('Content-Type', 'text/csv');
  res.attachment('audit_logs.csv');
  res.send(csv);
});

module.exports = {
  getAuditLogs,
  getRFQHistory,
  exportAuditLogsToCSV,
};