const APP_VERSION = "v0.06";

document.getElementById("page-title").innerText = `OpenTTD Scenario Helper ${APP_VERSION}`;
document.getElementById("app-header").innerText = `OpenTTD Scenario Helper ${APP_VERSION}`;

const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let selectionRect = null;

// Pixels per OpenTTD tile (adjust as needed for box size)
const pixelsPerTile = 10;

function drawSelectionBox() {
    const widthTiles = parseInt(document.getElementById('mapWidth').value);
    const heightTiles = parseInt(document.getElementById('mapHeight').value);
    const center = map.getCenter();

    // Convert center latLng to container pixel coords
    const centerPx = map.latLngToContainerPoint(center);

    // Calculate box half sizes in pixels
    const halfWidthPx = (widthTiles * pixelsPerTile) / 2;
    const halfHeightPx = (heightTiles * pixelsPerTile) / 2;

    // Calculate corner pixels
    const topLeftPx = L.point(centerPx.x - halfWidthPx, centerPx.y - halfHeightPx);
    const bottomRightPx = L.point(centerPx.x + halfWidthPx, centerPx.y + halfHeightPx);

    // Convert pixel coords back to latLng
    const northWest = map.containerPointToLatLng(topLeftPx);
    const southEast = map.containerPointToLatLng(bottomRightPx);

    const bounds = L.latLngBounds(northWest, southEast);

    if (selectionRect) {
        map.removeLayer(selectionRect);
    }

    selectionRect = L.rectangle(bounds, {color: "#ff7800", weight: 2});
    selectionRect.addTo(map);
}

// Redraw on events
document.getElementById('mapWidth').addEventListener('change', drawSelectionBox);
document.getElementById('mapHeight').addEventListener('change', drawSelectionBox);
map.on('moveend', drawSelectionBox);
map.on('zoomend', drawSelectionBox);

// Initial draw
drawSelectionBox();
