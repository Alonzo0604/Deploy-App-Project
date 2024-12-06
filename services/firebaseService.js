const { db } = require('../config/firebase'); // Import db dengan destructuring

// Fungsi untuk mengambil detail destinasi wisata
async function getDestinations(predictedDestinationIds) {
    try {
        const destinations = [];
        for (const id of predictedDestinationIds) {
            const snapshot = await db.collection('destinations').doc(id).get(); // Ambil dokumen berdasarkan ID
            if (snapshot.exists) {
                destinations.push(snapshot.data());
            }
        }
        return destinations;
    } catch (error) {
        console.error('Error fetching destinations:', error);
        throw error;
    }
}

// Fungsi untuk mengambil detail hotel
async function getHotels(predictedHotelIds) {
    try {
        const hotels = [];
        for (const id of predictedHotelIds) {
            const snapshot = await db.collection('hotel').doc(id).get(); // Ambil dokumen berdasarkan ID
            if (snapshot.exists) {
                hotels.push(snapshot.data());
            }
        }
        return hotels;
    } catch (error) {
        console.error('Error fetching hotels:', error);
        throw error;
    }
}

// Fungsi untuk menyimpan data destinasi wisata ke Firestore
async function saveDestinations(data) {
    try {
        for (const destinasi of data) {
            const id = destinasi.destinasi_wisata_id || db.collection('destinasi_wisata').doc().id; // Gunakan ID atau buat baru
            await db.collection('destinations').doc(id).set(destinasi);
        }
        return { message: 'Destinations uploaded successfully!' };
    } catch (error) {
        console.error('Error saving destinations:', error);
        throw error;
    }
}

// Fungsi untuk menyimpan data hotel ke Firestore
async function saveHotels(data) {
    try {
        for (const hotel of data) {
            const id = hotel.hotel_id || db.collection('hotel').doc().id; // Gunakan ID atau buat baru
            await db.collection('hotel').doc(id).set(hotel);
        }
        return { message: 'Hotels uploaded successfully!' };
    } catch (error) {
        console.error('Error saving hotels:', error);
        throw error;
    }
}

module.exports = {
    getDestinations,
    getHotels,
    saveDestinations,
    saveHotels 
};