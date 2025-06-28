// controllers/testSuiteController.js
const TestSuite = require('../models/TestSuite');
const TestCase = require('../models/TestCase');
const TestReport = require('../models/TestReport');

// Create a new test suite
exports.createTestSuite = async (req, res) => {
  try {
    const { name } = req.body;
    const testSuite = new TestSuite({
      name,
      teamId: req.user.teamId,
      createdBy: req.user._id,
      testCases: []
    });
    await testSuite.save();
    res.status(201).json(testSuite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all test suites for the user's team
exports.getTestSuites = async (req, res) => {
  try {
    const testSuites = await TestSuite.find({ teamId: req.user.teamId }).populate('testCases');
    res.json(testSuites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a test case to a suite
exports.addTestCase = async (req, res) => {
  try {
    const { testSuiteId, description, steps, expectedResult } = req.body;
    const testCase = new TestCase({
      testSuiteId,
      description,
      steps,
      expectedResult,
      createdBy: req.user._id
    });
    await testCase.save();
    await TestSuite.findByIdAndUpdate(testSuiteId, { $push: { testCases: testCase._id } });
    res.status(201).json(testCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a test case
exports.updateTestCase = async (req, res) => {
  try {
    const { testCaseId, description, steps, expectedResult } = req.body;
    const testCase = await TestCase.findByIdAndUpdate(testCaseId, {
      description,
      steps,
      expectedResult
    }, { new: true });
    res.json(testCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a test case
exports.deleteTestCase = async (req, res) => {
  try {
    const { testSuiteId, testCaseId } = req.body;
    await TestCase.findByIdAndDelete(testCaseId);
    await TestSuite.findByIdAndUpdate(testSuiteId, { $pull: { testCases: testCaseId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Run a test suite (stub for now)
exports.runTestSuite = async (req, res) => {
  try {
    const { testSuiteId } = req.body;
    // Simulate running tests
    const testSuite = await TestSuite.findById(testSuiteId).populate('testCases');
    const results = testSuite.testCases.map(tc => ({
      testCaseId: tc._id,
      passed: Math.random() > 0.2, // random pass/fail for demo
      details: 'Simulated result'
    }));
    const testReport = new TestReport({
      testSuiteId,
      runBy: req.user._id,
      results
    });
    await testReport.save();
    res.json(testReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get test reports for a suite
exports.getTestReports = async (req, res) => {
  try {
    const { testSuiteId } = req.params;
    const reports = await TestReport.find({ testSuiteId });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
