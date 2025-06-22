const mongoose = require('mongoose');

const BugReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  language: { type: String },
  source: { type: String }, // 'analysis' or 'test'
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BugReport', BugReportSchema);
