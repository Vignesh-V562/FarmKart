const express = require('express');
const router = express.Router();
const { getInvoices } = require('../controllers/invoiceController');
const { protect, business } = require('../middleware/authMiddleware');

router.route('/').get(protect, business, getInvoices);

module.exports = router;
