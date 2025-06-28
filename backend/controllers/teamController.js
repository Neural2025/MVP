// controllers/teamController.js
const Team = require('../models/Team');
const User = require('../models/User');

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const team = new Team({ name, members: [req.user._id] });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all teams for the logged-in user
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user._id }).populate('members', 'name email role');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a member to a team
exports.addMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (!team.members.includes(userId)) {
      team.members.push(userId);
      await team.save();
    }
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a member from a team
exports.removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.body;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    team.members = team.members.filter(id => id.toString() !== userId);
    await team.save();
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
