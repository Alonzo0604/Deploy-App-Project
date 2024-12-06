const multer = require('multer');

// Konfigurasi Multer untuk menerima file JSON
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;