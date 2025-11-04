const express = require('express');
const router = express.Router();
const { getBidsForFarmer } = require('../controllers/bidController');
const { protect, farmer } = require('../middleware/authMiddleware');

// @desc    Get all bids for a specific farmer
// @route   GET /api/bids/mybids
// @access  Private (Farmers)
router.route('/mybids').get(protect, farmer, getBidsForFarmer);

module.exports = router;
