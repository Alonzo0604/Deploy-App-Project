const { saveDestinations, saveHotels } = require('../services/firebaseService');

async function uploadDestinations(req, res) {
    try {
        const data = req.body; // Ambil data JSON langsung dari body request
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Invalid data format. Expected an array of destinations.' });
        }
        const result = await saveDestinations(data);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in uploadDestinations:', error);
        res.status(500).json({ error: error.message });
    }
}

async function uploadHotels(req, res) {
    try {
        const data = req.body; // Ambil data JSON langsung dari body request
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Invalid data format. Expected an array of hotels.' });
        }
        const result = await saveHotels(data);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in uploadHotels:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { uploadDestinations, uploadHotels };
