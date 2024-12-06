const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://travelmate-backend.firebaseio.com",
  storageBucket: "travelmate-backend.firebasestorage.app"
});

const db = admin.firestore(); // Inisialisasi Firestore

// Ekspor sebagai objek eksplisit
module.exports = {
  admin,
  db,
};