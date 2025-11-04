console.log('Executing auditRoutes.js');
const express = require('express');
const router = express.Router();
const { getAuditLogs, getRFQHistory, exportAuditLogsToCSV } = require('../controllers/auditController');
const { protect, admin, business, farmer } = require('../middleware/authMiddleware');

// @desc    Get all audit logs (Admin only)
// @route   GET /api/audit
// @access  Private/Admin
router.route('/').get(protect, admin, getAuditLogs);

// @desc    Export all audit logs to CSV (Admin only)
// @route   GET /api/audit/export/csv
// @access  Private/Admin
router.route('/export/csv').get(protect, admin, exportAuditLogsToCSV);

// @desc    Get audit history for a specific RFQ (Business/Farmer who owns/bids on RFQ)
// @route   GET /api/rfq/:id/history
// @access  Private/Business or Private/Farmer
router.route('/rfq/:id/history').get(protect, getRFQHistory);

module.exports = router;