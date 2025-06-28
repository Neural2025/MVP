// routes/testSuite.js
const express = require('express');
const router = express.Router();
const testSuiteController = require('../controllers/testSuiteController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

// Test suite CRUD
router.post('/', testSuiteController.createTestSuite);
router.get('/', testSuiteController.getTestSuites);

// Test case CRUD
router.post('/add-testcase', testSuiteController.addTestCase);
router.put('/update-testcase', testSuiteController.updateTestCase);
router.delete('/delete-testcase', testSuiteController.deleteTestCase);

// Run suite & reports
router.post('/run', testSuiteController.runTestSuite);
router.get('/:testSuiteId/reports', testSuiteController.getTestReports);

module.exports = router;
