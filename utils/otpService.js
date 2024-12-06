const crypto = require('crypto');
const admin = require('firebase-admin');

exports.generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};