const VERSION = '0.05';

const sizes = [64, 128, 256, 512, 1024, 2048, 4096];

const mapDiv = document.getElementById('map');
const bboxDiv = document.getElementById('bbox');
const toggleBoxBtn = document.getElementById('toggleBox');
const mapWidthSelect = document.getElementById('mapWidth');
const mapHeightSelect = document.getElementById('mapHeight');
const versionSpan = document.getElementById('version');

let boxVisible = false;

function populateSelect(select) {
  sizes.forEach((size) => {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = size;
    select.appendChild(option);
  });
}

// Initialize dropdowns
populateSelect(mapWidthSelect);
populateSelect(mapHeightSelect);
mapWidthSelect.value = '512';
mapHeightSelect.value = '512';

const map = L.map('map').setView([40, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

function updateBoundingBox() {
  if (!boxVisible) {
    bboxDiv.style.display = 'none';
    return;
  }
  bboxDiv.style.display = 'block';

  const w = parseInt(mapWidthSelect.value, 10);
  const h = parseInt(mapHeightSelect.value, 10);

  // Get map container size
  const mapRect = mapDiv.getBoundingClientRect();

  // Max bounding box 80% of map size
  const maxWidth = mapRect.width * 0.8;
  const maxHeight = mapRect.height * 0.8;

  // Calculate scale to fit bounding box inside map container preserving aspect ratio
  const scale = Math.min(maxWidth / w, maxHeight / h);

  const boxWidth = w * scale;
  const boxHeight = h * scale;

  // Position bbox centered inside map container
  bboxDiv.style.width = `${boxWidth}px`;
  bboxDiv.style.height = `${boxHeight}px`;
  bboxDiv.style.left = `${(mapRect.width - boxWidth) / 2}px`;
  bboxDiv.style.top = `${(mapRect.height - boxHeight) / 2}px`;
}

function toggleBoundingBox() {
  boxVisible = !boxVisible;
  toggleBoxBtn.textContent = boxVisible ? 'Hide Heightmap Selection' : 'Show Heightmap Selection';
  updateBoundingBox();
}

function onResize() {
  updateBoundingBox();
}

toggleBoxBtn.addEventListener('click', toggleBoundingBox);
mapWidthSelect.addEventListener('change', updateBoundingBox);
mapHeightSelect.addEventListener('change', updateBoundingBox);
window.addEventListener('resize', onResize);
map.on('resize', onResize);

// Display version
versionSpan.textContent = `v${VERSION}`;
