const { db } = require('../config/firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const createError = require('http-errors');
const { generateAccessToken, generateRefreshToken, refreshTokens } = require('../utils/tokenService');
const { v4: uuidv4 } = require('uuid');

// register
exports.register = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, 'Validation failed', { details: errors.array() }));
    }

    const { email, password, username } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      const userRef = db.collection('users').doc(userId);

      await userRef.set({
        id: userId,
        email,
        username,
        password: hashedPassword,
        createdAt: new Date(),
      });

      res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
      next(createError(500, 'Error registering user', { error: error.message }));
    }
  },
];

// Login
exports.login = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, 'Validation failed', { details: errors.array() }));
    }

    const { email, password } = req.body;

    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('email', '==', email).limit(1).get();

      if (snapshot.empty) {
        throw createError(404, 'User does not exist');
      }

      const userDoc = snapshot.docs[0];
      const user = userDoc.data();

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw createError(401, 'Invalid password');
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      refreshTokens.set(refreshToken, user.email);

      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  },
];

// Google Sign-In
exports.googleSignIn = async (req, res, next) => {
  const { idToken } = req.body;

  if (!idToken) {
    return next(createError(400, 'ID Token is required'));
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name } = decodedToken;

    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email,
        username: name || 'Google User',
        provider: 'google',
      });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    next(createError(500, 'Error with Google Sign-In', { error: error.message }));
  }
};

// Logout
exports.logout = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return next(createError(403, 'Invalid refresh token'));
  }

  try {
    refreshTokens.delete(refreshToken);
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(createError(500, 'Error during logout', { error: error.message }));
  }
};

// Refresh Token
exports.refreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return next(createError(403, 'Invalid refresh token'));
  }

  const email = refreshTokens.get(refreshToken);
  const userRef = db.collection('users').doc(email);

  userRef
    .get()
    .then((doc) => {
      if (!doc.exists) {
        throw createError(404, 'User not found');
      }

      const user = doc.data();
      const accessToken = generateAccessToken(user);

      res.status(200).json({ accessToken });
    })
    .catch((error) => {
      next(createError(500, 'Error refreshing token', { error: error.message }));
    });
};