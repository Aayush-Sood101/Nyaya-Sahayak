const express = require('express');
const { processQuery, searchDocuments } = require('../controllers/legalController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route POST /api/legal/query
 * @desc Process a legal query and generate a response
 * @access Private
 */
router.post('/query', processQuery);

/**
 * @route GET /api/legal/search
 * @desc Search for legal documents
 * @access Private
 */
router.get('/search', searchDocuments);

module.exports = router;
