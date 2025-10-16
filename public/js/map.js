// Initialize map with a darker tile layer for Halloween feel
const map = L.map('map').setView([51.131555245129945, 2.75600749310408], 20);

// Use a darker map theme for Halloween
L.tileLayer('https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=oP3pxevdwf2yN0quujWuEP8Y42aTk8zrcFVjRY9BUDt5YFJkLxV1F6xBZK1WXbRx', {
    attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const unlockedParts = JSON.parse(localStorage.getItem('unlockedStoryParts') || '[]');

// Create custom Halloween icon for markers
const halloweenIcon = L.divIcon({
    className: 'halloween-marker',
    html: '<div class="marker-content">🏚️</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

const storyIcon = L.divIcon({
    className: 'halloween-marker story-marker',
    html: '<div class="marker-content"><img src="/images/icons/purple_scroll.svg" alt="Scroll icon"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
});

const markers = [];

const startMarker = L.marker([51.131555245129945, 2.75600749310408], {
    icon: L.divIcon({
        className: 'start-marker',
        html: `<div class="marker-content"><img src="/images/icons/route_start.svg" alt="Start icon"><p class="font-['Creepster']">Start</p></div>`,
        iconSize: [70, 70],
        iconAnchor: [35, 70],
        popupAnchor: [0, -70]
    })
}).addTo(map);

const endMarker = L.marker([51.12943916488878, 2.7542615875210785], {
    icon: L.divIcon({
        className: 'start-marker',
        html: `<div class="marker-content"><img src="/images/icons/route_end.svg" alt="End icon"><p class="font-['Creepster']">Einde</p></div>`,
        iconSize: [70, 70],
        iconAnchor: [35, 70],
        popupAnchor: [0, -70]
    })
}).addTo(map);

locations.forEach((location, index) => {
    // Create a custom icon with the number displayed
    const numberedIcon = L.divIcon({
        className: 'halloween-marker',
        html: `<div class="marker-content ">
                <div class="marker-number">${index + 1}</div>
                🏚️
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    const marker = L.marker([location.lat, location.lon], {
        icon: numberedIcon
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
    popupContent += '</div>';
    marker.bindPopup(popupContent);
    markers.push(marker);
});

// Add markers for story pins (no routing)
if (typeof storyPins !== 'undefined' && Array.isArray(storyPins)) {

    storyPins.forEach((pin, index) => {
        if (pin.lat != null && pin.lon != null) {

            // Create a numbered story icon
            const numberedStoryIcon = L.divIcon({
                className: 'halloween-marker story-marker',
                html: `<div class="marker-content">
                        <div class="marker-number story-number">${index + 1}</div>
                        <img src="/images/icons/purple_scroll.svg" alt="Scroll icon">
                       </div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
                popupAnchor: [0, -14]
            });

            const marker = L.marker([pin.lat, pin.lon], { icon: numberedStoryIcon }).addTo(map);

            // const popupContent = `
            // <div class="location-popup">
            //   <h3 class="text-halloween-white font-['Creepster']">${pin.title || 'Story'}</h3>
            //   <p class="text-white"><a href="/stories/part/${pin.id}">Open story</a></p>
            // </div>`;
            // marker.bindPopup(popupContent, { className: 'story-popup' });
            // markers.push(marker);

            // Check if this story part is unlocked
            const isUnlocked = unlockedParts.includes(pin.id);

            let popupContent = `
            <div class="location-popup">
              <h3 class="text-halloween-white font-['Creepster']">${pin.title || 'Story'}</h3>`;

            // Only add the link if the story is unlocked
            if (isUnlocked) {
                popupContent += `<p class="text-white"><a href="/stories/part/${pin.id}">Open story</a></p>`;
            }

            popupContent += `</div>`;

            marker.bindPopup(popupContent, { className: 'story-popup' });
            markers.push(marker);

            // Add circle around story pin (radius in meters)
            L.circle([pin.lat, pin.lon], {
                radius: 13,
                weight: 1,
                color: '#a906f5',
                fillColor: '#a906f5',
                fillOpacity: 0.1
            }).addTo(map);
        }
    });
}

if (markers.length > 0) {

    L.polyline(route, {
        color: '#FF6700',
        weight: 4,
        opacity: 0.9,
        smoothFactor: 1,
    }).addTo(map);
}

let userMarker = null;
let followingLocation = false;

function startLocationTracking() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                if (userMarker === null) {
                    userMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'user-location-marker',
                            html: '<div class="marker-content">🎃</div>',
                            iconSize: [45, 45],
                            iconAnchor: [16, 16]
                        })
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
            map.setView(userMarker.getLatLng(), 20);
        } else {
            startLocationTracking();
        }
        return false;
    };

    return div;
};

locateControl.addTo(map);

startLocationTracking();

const style = document.createElement('style');
style.textContent = `
    .halloween-marker {
        filter: drop-shadow(0 0 5px rgba(255, 103, 0, 0.7));
    }

    .story-marker {
        filter: drop-shadow(0 0 5px rgba(65, 15, 121, 0.7));
    }

    .start-marker {
        filter: drop-shadow(0 0 5px rgba(2, 17, 2, 0.7));
    }

    .start-marker .marker-content p{
    color: #ff6700;
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

    .story-popup .leaflet-popup-content-wrapper  {
        background-color: #191919;
        color: white;
        border: 2px solid #c300ffff;
    }
    .story-popup .leaflet-popup-tip {
        background-color: #c300ffff;
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

    .marker-number {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: #FF6700;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .marker-number.story-number {
            background-color: #a906f5;
    }
`;
document.head.appendChild(style);