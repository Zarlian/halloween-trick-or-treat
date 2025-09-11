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

// Add markers for story pins (no routing)
if (typeof storyPins !== 'undefined' && Array.isArray(storyPins)) {
    const storyIcon = L.divIcon({
        className: 'halloween-marker story-marker',
        html: '<div class="marker-content">📜</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    });

    storyPins.forEach(pin => {
        if (pin.lat != null && pin.lon != null) {
            const marker = L.marker([pin.lat, pin.lon], { icon: storyIcon }).addTo(map);
            const popupContent = `
            <div class="location-popup">
              <h3 class="text-halloween-orange font-['Creepster']">${pin.title || 'Story'}</h3>
              <p class="text-white"><a href="/stories/part/${pin.id}">Open story</a></p>
            </div>`;
            marker.bindPopup(popupContent);
            markers.push(marker);
        }
    });
}

// If we have markers, fit the map to show all of them
if (markers.length > 0) {
    const bounds = L.featureGroup(markers).getBounds();
    map.fitBounds(bounds, { padding: [50, 50] });

    console.log('Route coordinates:', route); // Debugging line
        L.polyline(route, {
            color: '#FF6700', // Halloween orange
            weight: 4,
            opacity: 0.9,
            smoothFactor: 1,
        }).addTo(map);
    // }
}

// Add GPS functionality
let userMarker = null;
let followingLocation = false;

function startLocationTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                console.log('User location:', lat, lng, 'Accuracy:', accuracy);

                // Update user's marker or create a new one
                if (userMarker === null) {
                    // Create a pumpkin icon for the user's location marker
                    userMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'user-location-marker',
                            html: '<div class="marker-content">🎃</div>',
                            iconSize: [45, 45],
                            iconAnchor: [16, 16]
                        })
                    }).addTo(map);

                    // Add accuracy circle
                    L.circle([lat, lng], {
                        radius: accuracy,
                        weight: 1,
                        color: '#ff6c00',
                        fillColor: '#ff6c00',
                        fillOpacity: 0.15
                    }).addTo(map);

                } else {
                    userMarker.setLatLng([lat, lng]);

                    if (followingLocation) {
                        map.panTo([lat, lng]);
                    }
                }
            },
            function (error) {
                const errorMessages = {
                    1: "Location access denied. Please enable location services for this site.",
                    2: "Location information unavailable.",
                    3: "Location request timed out.",
                    0: "An unknown error occurred."
                };

                // Create a toast notification instead of an alert
                createToast(errorMessages[error.code] || errorMessages[0], 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 5000
            }
        );
    } else {
        createToast("Geolocation is not supported by this browser.", 'error');
    }
}

map.on('dragstart', function () {
    followingLocation = false;
});

// Create a toast notification function
function createToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 5000);
}

const followButton = L.control({ position: 'bottomright' });
followButton.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = '<a href="#" id="follow-toggle" title="Toggle auto-follow" role="button" aria-label="Toggle auto-follow" class="leaflet-control-follow active"><i class="fas fa-crosshairs"></i></a>';

    div.onclick = function () {
        followingLocation = !followingLocation;
        const btn = document.getElementById('follow-toggle');

        if (followingLocation) {
            btn.classList.add('active');
            if (userMarker) {
                map.panTo(userMarker.getLatLng());
            }
        } else {
            btn.classList.remove('active');
        }

        return false;
    };

    return div;
};

followButton.addTo(map);


const locateControl = L.control({ position: 'bottomright' });

locateControl.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = '<a href="#" title="Center on my location" role="button" aria-label="Center on my location" class="leaflet-control-locate"><i class="fas fa-location-arrow"></i></a>';

    div.onclick = function () {
        followingLocation = true;
        if (userMarker) {
            map.setView(userMarker.getLatLng(), 16);
        } else {
            startLocationTracking();
        }
        return false;
    };

    return div;
};

locateControl.addTo(map);

// Start location tracking when the page loads
startLocationTracking();

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
    .story-marker .marker-content {
        font-size: 22px;
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