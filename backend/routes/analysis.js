const express = require('express');
const analysisController = require('../controllers/analysisController');
const { optionalAuth, userRateLimit } = require('../middleware/auth');

const router = express.Router();

// Apply optional authentication to all routes
router.use(optionalAuth);

// Apply user-specific rate limiting
router.use(userRateLimit(50, 15 * 60 * 1000)); // 50 requests per 15 minutes per user

// POST /api/analyze - Analyze code for security, performance, optimization, and functionality
router.post('/analyze', analysisController.analyzeCode);

// POST /api/generate-tests - Generate test cases and fixes
router.post('/generate-tests', analysisController.generateTests);

module.exports = router;
