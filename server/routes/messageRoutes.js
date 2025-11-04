const express = require('express');
const router = express.Router();
const { createMessage, getConversations, getMessagesForConversation } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createMessage);
router.route('/conversations').get(protect, getConversations);
router.route('/conversations/:conversationId').get(protect, getMessagesForConversation);

module.exports = router;
