const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = { id: user._id };
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = generateToken;
