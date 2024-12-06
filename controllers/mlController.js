const { recommendDestinations } = require('../services/mlService');
const { getDestinations, getHotels } = require('../services/firebaseService');

async function handleRecommendDestinations(req, res) {
    try {
        const preferences = req.body.preferences; // Input dari frontend
        const modelPredictions = await recommendDestinations(preferences);

        // Ambil ID destinasi/hotel dari prediksi model
        const predictedDestinationIds = modelPredictions[0].map(prediction => String(prediction[0])); // Pastikan ID dalam bentuk string
        const predictedHotelIds = modelPredictions[1].map(prediction => String(prediction[0])); // Pastikan ID dalam bentuk string

        // Ambil detail data dari Firebase
        const destinations = await getDestinations(predictedDestinationIds);
        const hotels = await getHotels(predictedHotelIds);

        console.log(predictedDestinationIds);
        console.log(predictedHotelIds);
        res.json({ destinations, hotels });
    } catch (error) {
        console.error('Error in handleRecommendDestinations:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    handleRecommendDestinations,
};