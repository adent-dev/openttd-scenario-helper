// Initialize Leaflet map
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Selection rectangle
let bounds;
map.on('mousedown', function (e) {
    if (bounds) map.removeLayer(bounds);
    map.dragging.disable();
    const start = e.latlng;

    function onMouseMove(ev) {
        if (bounds) map.removeLayer(bounds);
        bounds = L.rectangle(L.latLngBounds(start, ev.latlng), {color: "#ff7800", weight: 1});
        bounds.addTo(map);
    }

    function onMouseUp(ev) {
        map.dragging.enable();
        map.off('mousemove', onMouseMove);
        map.off('mouseup', onMouseUp);
    }

    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);
});

// Download heightmap (placeholder)
document.getElementById('downloadHeightmap').addEventListener('click', async () => {
    if (!bounds) {
        alert("Select an area first!");
        return;
    }

    alert("Heightmap generation is a placeholder in this version.\nIn the next version, we'll fetch real elevation data.");
});

// Download towns and industries
document.getElementById('downloadTowns').addEventListener('click', async () => {
    if (!bounds) {
        alert("Select an area first!");
        return;
    }

    const bbox = bounds.getBounds();
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
