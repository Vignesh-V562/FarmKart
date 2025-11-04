const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check authentication
const protect = async (req, res, next) => {
  // Prefer Authorization: Bearer <token>; fall back to signed cookie `jwt`
  let token = null;

  const authHeader = req.headers && req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring('Bearer '.length).trim();
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Middleware to check role authorization
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Convenience alias for admin-only routes
const admin = authorize('admin');

const farmer = (req, res, next) => {
  if (req.user && req.user.role === 'farmer') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a farmer' });
  }
};

const business = (req, res, next) => {
  if (req.user && req.user.role === 'business') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as a business' });
  }
};

module.exports = { protect, authorize, admin, farmer, business };
