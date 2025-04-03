const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for authenticated users
 * @param {Object} user - User object containing id, username, email, and role
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

module.exports = generateToken;
