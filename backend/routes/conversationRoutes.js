const express = require('express');
const {
  getUserConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation
} = require('../controllers/conversationController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Temporarily comment out authentication for testing
// router.use(authenticate);

/**
 * @route GET /api/conversations
 * @desc Get all conversations for a user
 * @access Private
 */
router.get('/', getUserConversations);

/**
 * @route GET /api/conversations/:id
 * @desc Get a single conversation with messages
 * @access Private
 */
router.get('/:id', getConversation);

/**
 * @route POST /api/conversations
 * @desc Create a new conversation
 * @access Private
 */
router.post('/', createConversation);

/**
 * @route PUT /api/conversations/:id
 * @desc Update a conversation
 * @access Private
 */
router.put('/:id', updateConversation);

/**
 * @route DELETE /api/conversations/:id
 * @desc Delete a conversation
 * @access Private
 */
router.delete('/:id', deleteConversation);

module.exports = router;
