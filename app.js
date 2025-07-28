const VERSION = '0.05';

const mapDiv = document.getElementById('map');
const bboxDiv = document.getElementById('bbox');
const toggleBoxBtn = document.getElementById('toggleBox');
const mapWidthSelect = document.getElementById('mapWidth');
const mapHeightSelect = document.getElementById('mapHeight');
const versionSpan = document.getElementById('version');

let boxVisible = false;

// Common OpenTTD map sizes
const sizes = [64, 128, 256, 512, 1024, 2048, 4096];

// Populate width and height selects with same options
function populateSelects() {
  sizes.forEach(size => {
    const optionW = document.createElement('option');
    optionW.value = size;
    optionW.textContent = size;
    mapWidthSelect.appendChild(optionW);

    const optionH = document.createElement('option');
    optionH.value = size;
    optionH.textContent = size;
    mapHeightSelect.appendChild(optionH);
  });

  // Default selection
  mapWidthSelect.value = '512';
  mapHeightSelect.value = '512';
}

// Initialize Leaflet map with OpenStreetMap tiles
const map = L.map('map').setView([40, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Update bounding box size and position
function updateBoundingBox() {
  if (!boxVisible) {
    bboxDiv.style.display = 'none';
    return;
  }

  bboxDiv.style.display = 'block';

  const mapRect = mapDiv.getBoundingClientRect();

  const w = parseInt(mapWidthSelect.value, 10);
  const h = parseInt(mapHeightSelect.value, 10);

  // Max size 80% of map container size
  const maxW = mapRect.width * 0.8;
  const maxH = mapRect.height * 0.8;

  // Calculate scale to fit bounding box within max size, preserving aspect ratio
  const scale = Math.min(maxW / w, maxH / h);

  const boxWidth = w * scale;
  const boxHeight = h * scale;

  // Center bounding box inside the map container
  bboxDiv.style.width = `${boxWidth}px`;
  bboxDiv.style.height = `${boxHeight}px`;
  bboxDiv.style.left = `${(mapRect.width - boxWidth) / 2}px`;
  bboxDiv.style.top = `${(mapRect.height - boxHeight) / 2}px`;
}

function toggleBoundingBox() {
  boxVisible = !boxVisible;
  updateBoundingBox();
  toggleBoxBtn.textContent = boxVisible ? 'Hide Heightmap Selection' : 'Select Heightmap';
}

function onResize() {
  updateBoundingBox();
}

// Initialize UI and event handlers
function init() {
  populateSelects();

  toggleBoxBtn.addEventListener('click', toggleBoundingBox);

  mapWidthSelect.addEventListener('change', updateBoundingBox);
  mapHeightSelect.addEventListener('change', updateBoundingBox);

  window.addEventListener('resize', onResize);
  map.on('resize', onResize);
  map.on('moveend', () => {
    // Bounding box is static overlay, no reposition needed on map pan/zoom
  });

  // Show version
  versionSpan.textContent = `v${VERSION}`;
}

init();
