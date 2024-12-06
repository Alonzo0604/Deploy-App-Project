const { db } = require('../config/firebase');

// POST /assessment
async function submitAssessment(req, res) {
  try {
      const { userId, kabupaten, jenis_wisata, range_harga } = req.body;

      if (!userId || !kabupaten || !jenis_wisata || !range_harga) {
          return res.status(400).json({ error: 'Incomplete assessment data' });
      }

      await db.collection('user_assessments').doc(userId).set({
          kabupaten,
          jenis_wisata,
          range_harga,
          submittedAt: new Date(),
      });

      res.status(200).json({ message: 'Assessment submitted successfully!' });
  } catch (error) {
      console.error('Error in submitAssessment:', error);
      res.status(500).json({ error: error.message });
  }
}

module.exports = { submitAssessment };