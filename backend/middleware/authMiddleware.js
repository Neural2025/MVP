// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('[authMiddleware] Decoded JWT:', decoded);
    // Accept either decoded.userId or decoded.id for compatibility
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload: missing userId/id' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'Invalid user' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
