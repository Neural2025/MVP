// TestCase.js
const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  testSuiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSuite', required: true },
  description: { type: String, required: true },
  steps: { type: String },
  expectedResult: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('TestCase', TestCaseSchema);
