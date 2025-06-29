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

// Get team by ID
exports.getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('members', 'name email role');
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Invite a member to a team (generate OTP + send invite)
exports.inviteMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, role } = req.body;
    // Generate OTP (6-digit) and temp password
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tempPassword = Math.random().toString(36).slice(-8);

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user with temp password, role, and OTP
    user = new User({
      name: email.split('@')[0],
      email: email.toLowerCase(),
      password: tempPassword,
      role,
      emailVerified: false,
      otp
    });
    await user.save();

    // Add user to team
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    team.members.push(user._id);
    await team.save();

    // Log invite details (for admin to share)
    console.log(`[Invite] User invited: ${email}, OTP: ${otp}, Temp Password: ${tempPassword}, Team Code: ${team.code}`);

    // Return invite details in response (for now)
    res.json({
      success: true,
      message: `Invite sent to ${email}`,
      invite: {
        email,
        otp,
        tempPassword,
        teamCode: team.code
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update team info (e.g., name)
exports.updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    team.name = name.trim();
    await team.save();
    res.json({ success: true, message: 'Team name updated', team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change a member's role
exports.changeMemberRole = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, newRole } = req.body;
    const team = await Team.findById(teamId).populate('members');
    if (!team) return res.status(404).json({ error: 'Team not found' });
    const member = team.members.find(m => m._id.toString() === userId);
    if (!member) return res.status(404).json({ error: 'User not found in team' });
    member.role = newRole;
    await member.save();
    res.json({ success: true, message: 'Role updated', member });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a member from a team (by route params)
exports.removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    team.members = team.members.filter(id => id.toString() !== userId);
    await team.save();
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
