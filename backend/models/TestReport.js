// TestReport.js
const mongoose = require('mongoose');

const TestReportSchema = new mongoose.Schema({
  testSuiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSuite', required: true },
  runBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  results: [{
    testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
    passed: Boolean,
    details: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('TestReport', TestReportSchema);
