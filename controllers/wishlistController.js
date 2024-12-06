const { db } = require('../config/firebase');
const { param, body, validationResult } = require('express-validator');
const createError = require('http-errors');
const { v4: uuidv4 } = require('uuid');

// GET /wishlist
exports.getWishlist = [
  param('userId').notEmpty().withMessage('User ID is required'),
  async (req, res, next) => {
    const { userId } = req.params;

    try {
      const snapshot = await db.collection('wishlists').where('userId', '==', userId).get();
      const wishlist = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.status(200).json(wishlist);
    } catch (error) {
      next(createError(500, 'Error fetching wishlist', { error: error.message }));
    }
  },
];

// POST /wishlist
exports.addWishlist = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('destinationId').notEmpty().withMessage('Destination ID is required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, 'Validation failed', { details: errors.array() }));
    }

    const { userId, destinationId } = req.body;

    try {
      const wishlistId = uuidv4();
      await db.collection('wishlists').doc(wishlistId).set({
        id: wishlistId,
        userId,
        destinationId,
        addedAt: new Date(),
      });

      res.status(201).json({ message: 'Wishlist added successfully', wishlistId });
    } catch (error) {
      next(createError(500, 'Error adding to wishlist', { error: error.message }));
    }
  },
];

// DELETE /wishlist/:id
exports.removeWishlist = [
  param('id').notEmpty().withMessage('Wishlist ID is required'),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const docRef = db.collection('wishlists').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw createError(404, 'Wishlist item not found');
      }

      await docRef.delete();
      res.status(200).json({ message: 'Wishlist item removed successfully' });
    } catch (error) {
      next(error);
    }
  },
];