// routes/team.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

router.post('/', teamController.createTeam); // Create team
router.get('/', teamController.getTeams); // Get teams for user
router.get('/:teamId', teamController.getTeamById); // Get team by ID
router.post('/:teamId/invite', teamController.inviteMember); // Invite member (with OTP/team code)
router.patch('/:teamId', teamController.updateTeam); // Update team info (e.g., name)
router.patch('/:teamId/role', teamController.changeMemberRole); // Change member role
router.delete('/:teamId/member/:userId', teamController.removeMember); // Remove member

module.exports = router;
