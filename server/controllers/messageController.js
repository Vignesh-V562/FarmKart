const asyncHandler = require('../middleware/asyncHandler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Create a new message and conversation
// @route   POST /api/messages
// @access  Private
const createMessage = asyncHandler(async (req, res) => {
  const { recipientId, body } = req.body;
  const senderId = req.user._id;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, recipientId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({ participants: [senderId, recipientId] });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    recipient: recipientId,
    body,
  });

  res.status(201).json(message);
});

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'fullName companyName');
  res.json(conversations);
});

// @desc    Get all messages for a conversation
// @route   GET /api/messages/conversations/:conversationId
// @access  Private
const getMessagesForConversation = asyncHandler(async (req, res) => {
  const messages = await Message.find({ conversation: req.params.conversationId });
  res.json(messages);
});

module.exports = { createMessage, getConversations, getMessagesForConversation };
