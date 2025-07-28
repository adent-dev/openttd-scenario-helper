const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let selectionRect = null;

function updateSelectionBox() {
    const width = parseInt(document.getElementById('mapWidth').value);
    const height = parseInt(document.getElementById('mapHeight').value);
    const aspectRatio = width / height;

    // Get current map center
    const center = map.getCenter();
    const bounds = map.getBounds();
    const latDiff = Math.abs(bounds.getNorth() - bounds.getSouth());
    const lngDiff = Math.abs(bounds.getEast() - bounds.getWest());

    // We’ll base box size on 60% of the smaller map dimension, scaled by aspect ratio
    let boxLat = latDiff * 0.3;
    let boxLng = boxLat * aspectRatio;

    if (boxLng > lngDiff * 0.6) {
        boxLng = lngDiff * 0.3;
        boxLat = boxLng / aspectRatio;
    }

    const boxBounds = L.latLngBounds(
        [center.lat - boxLat, center.lng - boxLng],
        [center.lat + boxLat, center.lng + boxLng]
    );

    if (selectionRect) {
        map.removeLayer(selectionRect);
    }
    selectionRect = L.rectangle(boxBounds, {color: "#ff7800", weight: 2});
    selectionRect.addTo(map);
}

// Update box on map move or zoom
map.on('move', updateSelectionBox);
map.on('zoom', updateSelectionBox);

// Update box when width/height changes
document.getElementById('mapWidth').addEventListener('change', updateSelectionBox);
document.getElementById('mapHeight').addEventListener('change', updateSelectionBox);

// Initial draw
updateSelectionBox();

// Heightmap download (placeholder)
document.getElementById('downloadHeightmap').addEventListener('click', () => {
    const width = parseInt(document.getElementById('mapWidth').value);
    const height = parseInt(document.getElementById('mapHeight').value);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(width, height);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const val = Math.floor(Math.random() * 256); // placeholder
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
