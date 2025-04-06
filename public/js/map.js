// Initialize map
const map = L.map('map').setView([51.130, 2.750], 15);

// Add base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Array to store markers
const markers = [];

// Add markers for each location
locations.forEach(location => {
    const marker = L.marker([location.lat, location.lon]).addTo(map);

    // Create popup content with location details
    let popupContent = `
    <div class="location-popup">
      <h3>${location.title || 'Unnamed Location'}</h3>
      <p class="location-address">${location.street} ${location.number}</p>
  `;

    if (location.description) {
        popupContent += `<p>${location.description}</p>`;
    }

    if (location.image) {
        popupContent += `<img src="/uploads/${location.image}" alt="${location.title || 'Location image'}">`;
    }

    popupContent += '</div>';

    marker.bindPopup(popupContent);
    markers.push(marker);
});

// If we have markers, fit the map to show all of them
if (markers.length > 0) {
    const bounds = L.featureGroup(markers).getBounds();
    map.fitBounds(bounds, { padding: [50, 50] });

    // Create a polyline to show the route between locations
    if (markers.length > 1) {
        // Sort locations by orderIndex if available
        const sortedLocations = [...locations].sort((a, b) => {
            // If both have orderIndex, sort by it
            if (a.orderIndex !== null && b.orderIndex !== null) {
                return a.orderIndex - b.orderIndex;
            }
            // If only one has orderIndex, prioritize it
            if (a.orderIndex !== null) return -1;
            if (b.orderIndex !== null) return 1;
            // If neither has orderIndex, maintain original order
            return 0;
        });

        // Create an array of coordinates for the polyline
        const routeCoordinates = sortedLocations.map(loc => [loc.lat, loc.lon]);

        // Create a polyline and add it to the map
        const route = L.polyline(routeCoordinates, {
            color: '#3388ff',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1
        }).addTo(map);
    }
}
