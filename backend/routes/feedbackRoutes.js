const express = require('express');
const { submitFeedback, getResponseFeedback } = require('../controllers/feedbackController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route POST /api/feedback
 * @desc Submit feedback for a response
 * @access Private
 */
router.post('/', submitFeedback);

/**
 * @route GET /api/feedback/response/:responseId
 * @desc Get feedback for a response
 * @access Private
 */
router.get('/response/:responseId', getResponseFeedback);

module.exports = router;
