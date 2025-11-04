const express = require('express');
const router = express.Router();
const { getKeyMetrics, getSpendByCategory, getSpendOverTime, getDetailedReport, exportCsv } = require('../controllers/analyticsController');
const { protect, business } = require('../middleware/authMiddleware');

router.route('/metrics').get(protect, business, getKeyMetrics);
router.route('/spend-by-category').get(protect, business, getSpendByCategory);
router.route('/spend-over-time').get(protect, business, getSpendOverTime);
router.route('/detailed-report').get(protect, business, getDetailedReport);
router.route('/export-csv').get(protect, business, exportCsv);


module.exports = router;
