const express = require('express');
const { protect, farmer } = require('../middleware/authMiddleware');
const { getSummary, getRecent, getAlerts, togglePublish, getOrders, getOrderById, updateOrderStatus, acceptOrder, rejectOrder } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/summary', protect, farmer, getSummary);
router.get('/recent', protect, farmer, getRecent);
router.get('/alerts', protect, farmer, getAlerts);
router.patch('/products/:id/publish', protect, farmer, togglePublish);
router.get('/orders', protect, farmer, getOrders);
router.get('/orders/:orderId', protect, farmer, getOrderById);
router.patch('/orders/:orderId/status', protect, farmer, updateOrderStatus);
router.patch('/orders/:orderId/accept', protect, farmer, acceptOrder);
router.patch('/orders/:orderId/reject', protect, farmer, rejectOrder);

module.exports = router;


