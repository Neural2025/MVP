const express = require('express');
const analysisController = require('../controllers/analysisController');
const { optionalAuth, authenticateToken, userRateLimit } = require('../middleware/auth');
const fileUploadService = require('../services/fileUploadService');

const router = express.Router();

// Apply optional authentication to all routes
router.use(optionalAuth);

// Apply user-specific rate limiting
router.use(userRateLimit(50, 15 * 60 * 1000)); // 50 requests per 15 minutes per user

// Configure multer for file uploads
const upload = fileUploadService.getMulterConfig();

// POST /api/analyze - Analyze code for security, performance, optimization, and functionality
router.post('/analyze', upload.array('files', 10), analysisController.analyzeCode);

// POST /api/generate-tests - Generate test cases and fixes
router.post('/generate-tests', upload.array('files', 10), analysisController.generateTests);

// History routes (require authentication)
router.get('/history/analysis', authenticateToken, analysisController.getAnalysisHistory);
router.get('/history/tests', authenticateToken, analysisController.getTestHistory);

module.exports = router;
