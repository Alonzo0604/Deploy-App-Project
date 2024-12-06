const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const refreshTokens = new Map(); // Store refresh tokens globally

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  const refreshToken = uuidv4(); // Generate unique refresh token
  refreshTokens.set(refreshToken, user.id); // Store refresh token with user ID
  return refreshToken;
};

module.exports = { generateAccessToken, generateRefreshToken, refreshTokens };
