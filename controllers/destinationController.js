const { db } = require('../config/firebase');
const createError = require('http-errors');

// GET /destinations
exports.getAllDestinations = async (req, res, next) => {
  try {
    const snapshot = await db.collection('destinations').get();
    const destinations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(destinations);
  } catch (error) {
    next(createError(500, 'Error fetching destinations', { error: error.message }));
  }
};

// GET /destinations/:id
exports.getDestinationById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const docRef = db.collection('destinations').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw createError(404, 'Destination not found');
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
};