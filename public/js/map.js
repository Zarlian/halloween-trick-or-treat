// Initialize map with a darker tile layer for Halloween feel
const map = L.map('map').setView([51.130, 2.750], 16);

// Use a darker map theme for Halloween
L.tileLayer('https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=oP3pxevdwf2yN0quujWuEP8Y42aTk8zrcFVjRY9BUDt5YFJkLxV1F6xBZK1WXbRx', {
    attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create custom Halloween icon for markers
const halloweenIcon = L.divIcon({
    className: 'halloween-marker',
    html: '<div class="marker-content">🏚️</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

// Array to store markers
const markers = [];

console.log('Locations:', locations);
// Add markers for each location
locations.forEach(location => {
    // Use the Halloween icon for markers
    const marker = L.marker([location.lat, location.lon], {
        icon: halloweenIcon
    }).addTo(map);

    // Create popup content with location details and Halloween styling
    let popupContent = `
    <div class="location-popup">
      <h3 class="text-halloween-orange font-['Creepster']">${location.title || 'Spooky House'}</h3>
      <p class="location-address text-white">${location.street} ${location.number}</p>
  `;

    if (location.description) {
        popupContent += `<p class="text-white">${location.description}</p>`;
    }

    if (location.image) {
        popupContent += `
        <div class="image-container">
          <img src="/uploads/${location.image}" alt="${location.title || 'Location image'}" class="border-2 border-halloween-purple">
        </div>`;
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

        // Create a Halloween-themed polyline and add it to the map
        const route = L.polyline(routeCoordinates, {
            color: '#FF6700', // Halloween orange
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1,
            dashArray: '10, 10' // Create a dotted line for spooky effect
        }).addTo(map);
    }
}

// Add some CSS to style the Halloween markers and popups
const style = document.createElement('style');
style.textContent = `
    .halloween-marker {
        filter: drop-shadow(0 0 5px rgba(255, 103, 0, 0.7));
    }
    .marker-content {
        font-size: 24px;
        text-align: center;
    }
    .leaflet-popup-content-wrapper {
        background-color: #191919;
        color: white;
        border: 2px solid #FF6700;
    }
    .leaflet-popup-tip {
        background-color: #FF6700;
    }
    .image-container {
        margin-top: 8px;
        text-align: center;
    }
    .image-container img {
        max-width: 100%;
        border-radius: 4px;
    }
`;
document.head.appendChild(style);