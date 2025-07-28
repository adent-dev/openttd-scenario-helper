// Initialize map
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let selectionRect = null;
let aspectRatio = 512 / 1024; // default width / height

function updateAspectRatio() {
    const width = parseInt(document.getElementById('mapWidth').value);
    const height = parseInt(document.getElementById('mapHeight').value);
    aspectRatio = width / height;
}
document.getElementById('mapWidth').addEventListener('change', updateAspectRatio);
document.getElementById('mapHeight').addEventListener('change', updateAspectRatio);

// Selection logic
map.on('mousedown', function (e) {
    if (selectionRect) map.removeLayer(selectionRect);
    map.dragging.disable();
    const start = e.latlng;

    function onMouseMove(ev) {
        const dx = ev.latlng.lng - start.lng;
        const dy = ev.latlng.lat - start.lat;
        let newLng = start.lng + dx;
        let newLat = start.lat + (dx / aspectRatio);

        if (Math.abs(dy) > Math.abs(dx / aspectRatio)) {
            newLat = start.lat + dy;
            newLng = start.lng + dy * aspectRatio;
        }

        const bounds = L.latLngBounds(start, L.latLng(newLat, newLng));
        if (selectionRect) map.removeLayer(selectionRect);
        selectionRect = L.rectangle(bounds, {color: "#ff7800", weight: 1});
        selectionRect.addTo(map);
    }

    function onMouseUp() {
        map.dragging.enable();
        map.off('mousemove', onMouseMove);
        map.off('mouseup', onMouseUp);
    }

    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);
});

// Heightmap download (placeholder using random terrain)
document.getElementById('downloadHeightmap').addEventListener('click', () => {
    if (!selectionRect) {
        alert("Select an area first!");
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
        const val = Math.floor(Math.random() * 256); // placeholder: random heights
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

// Towns and industries export
document.getElementById('downloadTowns').addEventListener('click', async () => {
    if (!selectionRect) {
        alert("Select an area first!");
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
