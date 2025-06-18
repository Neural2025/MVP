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

// POST /api/analyze-bugs - Analyze code for bugs
router.post('/analyze-bugs', upload.array('files', 10), analysisController.analyzeBugs);

// POST /api/generate-tests - Generate test cases and fixes
router.post('/generate-tests', upload.array('files', 10), analysisController.generateTests);

// POST /api/generate-role-tests - Generate role-based test suites
router.post('/generate-role-tests', upload.array('files', 10), analysisController.generateRoleBasedTests);

// POST /api/execute-tests - Execute tests and return detailed report
router.post('/execute-tests', upload.array('files', 10), analysisController.executeTestReport);

// POST /api/test-api-key - Test DeepSeek API key validity
router.post('/test-api-key', analysisController.testApiKey);

// POST /api/github/fetch - Fetch GitHub repository
router.post('/github/fetch', analysisController.fetchGithubRepo);

// POST /api/create-bug-report - Create bug report (Product Manager feature)
router.post('/create-bug-report', authenticateToken, analysisController.createBugReport);

// GET /api/bug-reports - Get user's bug reports
router.get('/bug-reports', authenticateToken, analysisController.getBugReports);

// GET /api/user/stats - Get user statistics
router.get('/user/stats', authenticateToken, analysisController.getUserStats);

// GET /api/test-history - Get user's test history
router.get('/test-history', authenticateToken, analysisController.getTestHistory);

// POST /api/export/pdf - Export data to PDF
router.post('/export/pdf', authenticateToken, analysisController.exportToPDF);

// GET /api/analysis-history - Get user's analysis history
router.get('/analysis-history', authenticateToken, analysisController.getAnalysisHistory);

// History routes (require authentication) - Alternative paths
router.get('/history/analysis', authenticateToken, analysisController.getAnalysisHistory);
router.get('/history/tests', authenticateToken, analysisController.getTestHistory);

module.exports = router;
