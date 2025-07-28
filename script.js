const APP_VERSION = "v0.04.02";

// Set version in UI
document.getElementById("page-title").innerText = `OpenTTD Scenario Helper ${APP_VERSION}`;
document.getElementById("app-header").innerText = `OpenTTD Scenario Helper ${APP_VERSION}`;

const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let selectionRect = null;

function drawSelectionBox() {
    const widthTiles = parseInt(document.getElementById('mapWidth').value);
    const heightTiles = parseInt(document.getElementById('mapHeight').value);
    const center = map.getCenter();

    // Correct aspect ratio: longitude shrinks by cos(latitude)
    const latCorrection = Math.cos(center.lat * Math.PI / 180);
    const aspectRatio = (widthTiles / heightTiles) * latCorrection;

    const scale = 0.5; // controls box size relative to map view
    const halfLat = scale;
    const halfLng = halfLat * aspectRatio;

    const bounds = L.latLngBounds(
        [center.lat - halfLat, center.lng - halfLng],
        [center.lat + halfLat, center.lng + halfLng]
    );

    if (selectionRect) map.removeLayer(selectionRect);
    selectionRect = L.rectangle(bounds, {color: "#ff7800", weight: 2});
    selectionRect.addTo(map);
}

// Redraw on changes
document.getElementById('mapWidth').addEventListener('change', drawSelectionBox);
document.getElementById('mapHeight').addEventListener('change', drawSelectionBox);
map.on('moveend', drawSelectionBox);
map.on('zoomend', drawSelectionBox);

// Initial draw
drawSelectionBox();
