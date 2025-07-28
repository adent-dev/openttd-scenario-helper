const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let selectionRect = null;

function drawSelectionBox() {
    const widthTiles = parseInt(document.getElementById('mapWidth').value);
    const heightTiles = parseInt(document.getElementById('mapHeight').value);
    const aspectRatio = widthTiles / heightTiles;

    const center = map.getCenter();

    // Use zoom level to determine box size in degrees (approximation)
    const scale = 0.05; // smaller value = larger box; tweak if needed
    let halfLat = scale;
    let halfLng = halfLat * aspectRatio;

    const bounds = L.latLngBounds(
        [center.lat - halfLat, center.lng - halfLng],
        [center.lat + halfLat, center.lng + halfLng]
    );

    if (selectionRect) map.removeLayer(selectionRect);
    selectionRect = L.rectangle(bounds, {color: "#ff7800", weight: 2});
    selectionRect.addTo(map);
}

// Redraw when width/height changes
document.getElementById('mapWidth').addEventListener('change', drawSelectionBox);
document.getElementById('mapHeight').addEventListener('change', drawSelectionBox);

// Redraw when map moves or zooms, keeping box centered
map.on('moveend', () => {
    drawSelectionBox();
});
map.on('zoomend', () => {
    drawSelectionBox();
});

// Initial draw
drawSelectionBox();

// Heightmap download (placeholder)
document.getElementById('downloadHeightmap').addEventListener('click', () => {
    if (!selectionRect) {
        alert("No selection box!");
        return;
    }
    const width = parseInt(document.getElementById('mapWidth').value);
    const height = parseInt(document.getElementById('mapHeight').value);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(width, height);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const val = Math.floor(Math.random() * 256); // placeholder terrain
        imgData.data[i] = val;
        imgData.data[i + 1] = val;
        imgData.data[i + 2] = val;
        imgData.data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    canvas.toBlob(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "heightmap.png";
        a.click();
        URL.revokeObjectURL(a.href);
    });
});

// Towns & industries export
document.getElementById('downloadTowns').addEventListener('click', async () => {
    if (!selectionRect) {
        alert("No selection box!");
        return;
    }

    const bbox = selectionRect.getBounds();
    const query = `
        [out:json];
        (
          node["place"~"city|town"](${bbox.getSouth()},${bbox.getWest()},${bbox.getNorth()},${bbox.getEast()});
          way["place"~"city|town"](${bbox.getSouth()},${bbox.getWest()},${bbox.getNorth()},${bbox.getEast()});
        );
        out center;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
    });
    const data = await response.json();

    const towns = data.elements.map(e => ({
        name: e.tags.name || "Unnamed",
        lat: e.lat || e.center?.lat,
        lon: e.lon || e.center?.lon
    }));

    const blob = new Blob([JSON.stringify(towns, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "towns_and_industries.json";
    a.click();
    URL.revokeObjectURL(url);
});
