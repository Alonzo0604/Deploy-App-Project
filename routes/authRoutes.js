const express = require('express');
const { register, login, googleSignIn, logout, refreshToken } = require('../controllers/authController');
const { updateProfilePicture,  updateUsername, resetPassword, getUserById } = require('../controllers/updateData_Controller');
const { submitAssessment } = require('../controllers/assessmentController');
const { getAllDestinations, getDestinationById } = require('../controllers/destinationController');
const { getWishlist, addWishlist, removeWishlist } = require('../controllers/wishlistController');
const { getStories, addStory } = require('../controllers/storyController');
const { handleRecommendDestinations } = require('../controllers/mlController');
const passport = require('passport');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateRevokeToken } = require('../middleware/revokeMiddleware');

const upload = require('../middleware/uploadMiddleware');
const { uploadDestinations, uploadHotels } = require('../controllers/uploadController');

const router = express.Router();

// Registrasi (email + password)
router.post('/register', register);

// Login
router.post('/login', login);

// Regis/login with Google
router.post('/google-signin', googleSignIn);

// Logout
router.post('/logout', validateRevokeToken, logout);

// Refresh Token
router.post('/refresh-token', refreshToken);

// Redirect user to Google's OAuth 2.0 consent screen
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Handle Google OAuth 2.0 callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    res.status(200).json({ message: 'Login successful', user: req.user });
  }
);

router.get('/login-failed', (req, res) => {
  res.status(401).json({ message: 'Google Login failed' });
});

// Get user by ID
router.get('/user/:id', verifyToken, getUserById);

// Update foto profil
router.put('/user/:id/profile-picture', verifyToken, updateProfilePicture);

// Ganti username
router.put('/user/:id/username', verifyToken, updateUsername);

// Reset password
router.put('/user/:id/password', verifyToken, resetPassword);

// user assessment
router.post('/assessment', verifyToken, submitAssessment);

// data destinasi
router.get('/destinations', getAllDestinations);

// detail data destinasi
router.get('/destinations/:id', getDestinationById);

// Get wishlist user tertentu
router.get('/wishlist/:userId', verifyToken, getWishlist);

// menambahkan wishlist
router.post('/wishlist', verifyToken, addWishlist);

// menghapus wishlist
router.delete('/wishlist/:id', verifyToken, removeWishlist);

// mendapatkan seluruh stories user
router.get('/stories', getStories);

// menambahkan stories dari user tertentu
router.post('/stories', verifyToken, addStory);

// rekomendasi destinasi
router.post('/recommend-destinations', handleRecommendDestinations);

router.post('/upload/destinations', uploadDestinations);

router.post('/upload/hotels', uploadHotels);

// router.post('/recommend-destinations', async (req, res, next) => {
//   try {
//     const recommendations = await recommendDestinations(req.body);
//     res.status(200).json({ recommendations });
//   } catch (error) {
//     next(error);
//   }
// });

// router.post('/recommend-hotels', async (req, res, next) => {
//   try {
//     const recommendations = await recommendHotels(req.body.location);
//     res.status(200).json({ recommendations });
//   } catch (error) {
//     next(error);
//   }
// });

// router.post('/preferences-prediction', async (req, res, next) => {
//   try {
//     const preferences = await predictPreferences(req.body);
//     res.status(200).json({ preferences });
//   } catch (error) {
//     next(error);
//   }
// });



module.exports = router;