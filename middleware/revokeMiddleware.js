const { refreshTokens } = require('../utils/tokenService');

exports.validateRevokeToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }

  next();
};