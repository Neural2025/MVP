const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const BugReport = require('../models/BugReport');
const { authenticateToken } = require('../middleware/auth');

// Export a single bug report as PDF
router.post('/pdf', authenticateToken, async (req, res) => {
  try {
    const { bugId } = req.body;
    if (!bugId) {
      return res.status(400).json({ success: false, error: 'Bug ID is required' });
    }
    const bug = await BugReport.findById(bugId);
    if (!bug) {
      return res.status(404).json({ success: false, error: 'Bug report not found' });
    }

    // Create PDF
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="bug_report_${bugId}.pdf"`);
      res.end(pdfData);
    });

    doc.fontSize(18).text('Bug Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Title: ${bug.title}`);
    doc.text(`Description: ${bug.description}`);
    doc.text(`Severity: ${bug.severity}`);
    doc.text(`Status: ${bug.status}`);
    doc.text(`Language: ${bug.language}`);
    doc.text(`Source: ${bug.source}`);
    doc.text(`Created At: ${bug.createdAt}`);
    doc.text(`Updated At: ${bug.updatedAt}`);
    doc.end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
