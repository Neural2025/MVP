// Team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // Unique team code
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);
