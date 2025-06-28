// TestSuite.js
const mongoose = require('mongoose');

const TestSuiteSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  testCases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' }],
}, { timestamps: true });

module.exports = mongoose.model('TestSuite', TestSuiteSchema);
