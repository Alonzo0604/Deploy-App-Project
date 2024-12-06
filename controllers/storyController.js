const { db, admin } = require('../config/firebase');
const { body, validationResult } = require('express-validator');
const createError = require('http-errors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Konfigurasi Multer untuk menangani unggahan file
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET /stories
exports.getStories = async (req, res, next) => {
  try {
    const snapshot = await db.collection('stories').orderBy('createdAt', 'desc').get();
    const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(stories);
  } catch (error) {
    next(createError(500, 'Error fetching stories', { error: error.message }));
  }
};

// POST /stories
exports.addStory = [
  upload.single('photo'), // Middleware untuk file unggahan
  body('userId').notEmpty().withMessage('User ID is required'),
  body('destinationId').notEmpty().withMessage('Destination ID is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(createError(400, 'Validation failed', { details: errors.array() }));
    }

    const { userId, destinationId, content, rating } = req.body;
    const file = req.file;

    if (!file) {
      return next(createError(400, 'Photo is required'));
    }

    try {
      // Generate unique file path for the uploaded photo
      const bucket = admin.storage().bucket();
      const filePath = `story-photos/${uuidv4()}-${Date.now()}.${file.mimetype.split('/')[1]}`;

      // Create a write stream for the file
      const blob = bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.on('error', (error) => {
        throw createError(500, 'Error uploading file', { error });
      });

      blobStream.on('finish', async () => {
        const imageURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        const storyId = uuidv4();

        // Save story to Firestore
        await db.collection('stories').doc(storyId).set({
          id: storyId,
          userId,
          destinationId,
          content,
          rating: parseFloat(rating),
          imageURL,
          createdAt: new Date(),
        });

        res.status(201).json({ message: 'Story added successfully', storyId, imageURL });
      });

      // End the stream
      blobStream.end(file.buffer);
    } catch (error) {
      next(createError(500, 'Error adding story', { error: error.message }));
    }
  },
];