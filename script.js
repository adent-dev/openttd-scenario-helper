const APP_VERSION = "v0.05";

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
    const bounds = map.getBounds();

    // Aspect ratio corrected for latitude (longitude degrees shrink by cos(lat))
    const latCorrection = Math.cos(center.lat * Math.PI / 180);
    const desiredAspect = (widthTiles / heightTiles) * latCorrection;

    // Viewport size in degrees
    const latDiff = bounds.getNorth() - bounds.getSouth();
    const lngDiff = bounds.getEast() - bounds.getWest();

    // Viewport aspect ratio (longitude / latitude)
    const viewportAspect = lngDiff / latDiff;

    let boxLatDiff, boxLngDiff;

    if (viewportAspect > desiredAspect) {
        // Viewport wider than desired → limit box height
        boxLatDiff = latDiff;
        boxLngDiff = boxLatDiff * desiredAspect;
    } else {
        // Viewport taller than desired → limit box width
        boxLngDiff = lngDiff;
        boxLatDiff = boxLngDiff / desiredAspect;
    }

    const south = center.lat - boxLatDiff / 2;
    const north = center.lat + boxLatDiff / 2;
    const west = center.lng - boxLngDiff / 2;
    const east = center.lng + boxLngDiff / 2;

    const boxBounds = L.latLngBounds([south, west], [north, east]);

    if (selectionRect) map.removeLayer(selectionRect);
    selectionRect = L.rectangle(boxBounds, {color: "#ff7800", weight: 2});
    selectionRect.addTo(map);
}

// Redraw on changes
document.getElementById('mapWidth').addEventListener('change', drawSelectionBox);
document.getElementById('mapHeight').addEventListener('change', drawSelectionBox);
map.on('moveend', drawSelectionBox);
map.on('zoomend', drawSelectionBox);

// Initial draw
drawSelectionBox();
