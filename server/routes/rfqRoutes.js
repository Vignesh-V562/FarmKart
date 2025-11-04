const express = require('express');
const router = express.Router();
const multer = require('multer'); // Import multer
const { 
    createRFQ, 
    getRFQs, 
    getRFQById, 
    submitBid, 
    getBidsForRFQ, 
    acceptBid,
    getUniqueRegions,
    getTransportMethods 
} = require('../controllers/rfqController');
const { protect, business, farmer } = require('../middleware/authMiddleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Farmer routes
router.route('/browse').get(protect, getRFQs); // List public RFQs for farmers and business users
router.route('/regions').get(protect, getUniqueRegions); // Get unique regions for filtering
router.route('/transport-methods').get(protect, getTransportMethods); // Get transport methods for bid submission
router.route('/:id/bid').post(protect, farmer, submitBid);

// Business routes
router.route('/').post(protect, business, upload.array('attachments', 5), createRFQ).get(protect, business, getRFQs); // Create RFQ and List RFQs for business
router.route('/:id').get(protect, business, getRFQById);
router.route('/:id/bids').get(protect, business, getBidsForRFQ);
router.route('/:id/accept/:bidId').post(protect, business, acceptBid);

module.exports = router;