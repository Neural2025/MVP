const express = require('express');
const router = express.Router();
const BugReport = require('../models/BugReport');
const { authenticateToken } = require('../middleware/auth');

// Create a new bug report
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, severity, status, language, source } = req.body;
    const createdBy = req.user ? req.user._id : null;
    const bug = new BugReport({
      title,
      description,
      severity,
      status,
      language,
      source,
      createdBy
    });
    await bug.save();
    res.status(201).json({ success: true, bug });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all bug reports (filtered by user role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role;
    let bugs;
    if (role === 'developer') {
      // Developers see all bugs from code analysis (source: 'analysis') and their own
      bugs = await BugReport.find({ $or: [ { source: 'analysis' }, { createdBy: req.user._id } ] }).sort({ createdAt: -1 });
    } else if (role === 'tester') {
      // Testers see bugs from test suites (source: 'test') and their own
      bugs = await BugReport.find({ $or: [ { source: 'test' }, { createdBy: req.user._id } ] }).sort({ createdAt: -1 });
    } else if (role === 'po' || role === 'product owner' || role === 'product manager') {
      // Product Owners/Managers see nothing for now (can be changed later)
      bugs = [];
    } else {
      // Default: show nothing
      bugs = [];
    }
    res.json({ success: true, bugs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
