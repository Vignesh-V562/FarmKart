const express = require('express');
const router = express.Router();
const { getOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect, farmer } = require('../middleware/authMiddleware');

router.route('/:id').get(protect, getOrder);
router.route('/:id/status').put(protect, farmer, updateOrderStatus);

module.exports = router;

