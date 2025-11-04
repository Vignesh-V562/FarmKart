const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getBuyerProfiles, getFarmers } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProfile).put(protect, updateProfile);
router.route('/change-password').put(protect, changePassword);
router.route('/buyers').get(getBuyerProfiles);
router.route('/farmers').get(protect, getFarmers);

module.exports = router;