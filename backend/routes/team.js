// routes/team.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

router.post('/', teamController.createTeam); // Create team
router.get('/', teamController.getTeams); // Get teams for user
router.post('/add-member', teamController.addMember); // Add member
router.post('/remove-member', teamController.removeMember); // Remove member

module.exports = router;
