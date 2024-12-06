const tf = require('@tensorflow/tfjs-node');

// Load model once during server startup
let destinationModel;
(async () => {
    destinationModel = await tf.loadLayersModel('https://storage.googleapis.com/travelmate-backend.firebasestorage.app/destination-model/model.json');
})();

async function recommendDestinations(preferences) {
  try {
      // Pisahkan preferences menjadi 5 array berbeda
      const [kabupaten, jenis, price, rating, reviews] = preferences;

      // Normalisasi/Preprocessing Data (sesuaikan skala jika diperlukan)
      const normalizedPrice = price.map(p => p / 10000); // Contoh normalisasi
      const normalizedRating = rating.map(r => r / 5);   // Contoh normalisasi
      const normalizedReviews = reviews.map(r => r / 1000); // Contoh normalisasi

      // Konversi setiap input menjadi tensor
      const kabupatenTensor = tf.tensor2d(kabupaten, [kabupaten.length, 1]);
      const jenisTensor = tf.tensor2d(jenis, [jenis.length, 1]);
      const priceTensor = tf.tensor2d(normalizedPrice, [normalizedPrice.length, 1]);
      const ratingTensor = tf.tensor2d(normalizedRating, [normalizedRating.length, 1]);
      const reviewsTensor = tf.tensor2d(normalizedReviews, [normalizedReviews.length, 1]);

      // Lakukan prediksi
      const predictions = destinationModel.predict([kabupatenTensor, jenisTensor, priceTensor, ratingTensor, reviewsTensor]);

      // Bersihkan tensor untuk menghindari kebocoran memori
      kabupatenTensor.dispose();
      jenisTensor.dispose();
      priceTensor.dispose();
      ratingTensor.dispose();
      reviewsTensor.dispose();

      // Konversi prediksi ke array
      let results;
      if (Array.isArray(predictions)) {
          results = predictions.map(pred => pred.arraySync());
      } else {
          results = await predictions.array();
      }

      return results;
  } catch (error) {
      console.error('Error in recommendDestinations:', error);
      throw { status: 500, message: error.message };
  }
}

module.exports = {
    recommendDestinations
};