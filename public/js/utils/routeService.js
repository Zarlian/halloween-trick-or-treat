require('dotenv').config();
const axios = require('axios');

function decodePolyline(encoded) {
    let index = 0, lat = 0, lng = 0, coordinates = [];

    while (index < encoded.length) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += deltaLat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += deltaLng;

        coordinates.push([lat / 1e5, lng / 1e5]);
    }

    return coordinates.map(([lat, lng]) => [lng, lat]); 
}

async function getWalkingRoute(coordinates) {
    try {
        const response = await axios.post(
            'https://api.openrouteservice.org/v2/directions/foot-walking',
            { coordinates },
            {
                headers: {
                    'Authorization': process.env.ORS_API_KEY,
                    'Content-Type': 'application/json',
                }
            }
        );

        const encoded = response.data.routes[0].geometry;
        const decoded =  decodePolyline(encoded);
        return decoded.map(([lng, lat]) => [lat, lng]);
    } catch (error) {
        console.error('Error fetching walking route:', error.response?.data || error.message);
        throw new Error('Route service failed');
    }
}

module.exports = {
    getWalkingRoute
};
