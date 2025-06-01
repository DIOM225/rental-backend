const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const verifyToken = require('../middleware/verifyToken');

// ✅ Get all conversations for the current user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    }).sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error('❌ Error loading conversations:', err);
    res.status(500).json({ message: 'Error loading conversations' });
  }
});

// ✅ Create or fetch a conversation between current user and recipient
router.post('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipientId = req.body.recipientId;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({ participants: [userId, recipientId] });
      await conversation.save();
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });

    res.status(200).json({ ...conversation.toObject(), messages });
  } catch (err) {
    console.error('❌ Error creating/fetching conversation:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération de la conversation' });
  }
});

// ✅ Get all messages in a conversation
router.get('/:conversationId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('❌ Error loading messages:', err);
    res.status(500).json({ message: 'Error loading messages' });
  }
});

// ✅ Send a new message in a conversation
router.post('/:conversationId', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      console.warn('⚠️ Missing content in message body');
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Message.create({
      conversationId: req.params.conversationId,
      sender: req.user.id,
      content,
    });

    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      updatedAt: new Date(),
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('❌ Error sending message:', err);
    res.status(500).json({ message: 'Error sending message' });
  }
});

module.exports = router;
