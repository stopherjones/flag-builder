const COLOR_HEX_MAP = {
  "Deep red": "#8b0000",
  "Red": "#ce1126",
  "Orange": "#ff8200",
  "Yellow": "#fcd116",
  "Deep green": "#006b3c",
  "Green": "#009a49",
  "Deep blue": "#00247d",
  "Blue": "#0057b7",
  "Light blue": "#5bcefa",
  "White": "#ffffff",
  "Black": "#000000"
};

let countryList = [];
let currentTarget = { name: "Japan", code: "jp", flagUrl: "https://flagcdn.com/w640/jp.png" };
let layers = [];
let selectedId = null;

let isDragging = false;
let dragMode = null;
let dragStart = { x: 0, y: 0 };
let layerStart = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 };
let activeGuides = [];

const svg = document.getElementById('flag-svg');

const STATIC_COUNTRIES = [
  { name: "Afghanistan", code: "af" },
  { name: "Albania", code: "al" },
  { name: "Algeria", code: "dz" },
  { name: "Andorra", code: "ad" },
  { name: "Angola", code: "ao" },
  { name: "Argentina", code: "ar" },
  { name: "Armenia", code: "am" },
  { name: "Australia", code: "au" },
  { name: "Austria", code: "at" },
  { name: "Azerbaijan", code: "az" },
  { name: "Bahamas", code: "bs" },
  { name: "Bahrain", code: "bh" },
  { name: "Bangladesh", code: "bd" },
  { name: "Barbados", code: "bb" },
  { name: "Belarus", code: "by" },
  { name: "Belgium", code: "be" },
  { name: "Belize", code: "bz" },
  { name: "Benin", code: "bj" },
  { name: "Bhutan", code: "bt" },
  { name: "Bolivia", code: "bo" },
  { name: "Bosnia and Herzegovina", code: "ba" },
  { name: "Botswana", code: "bw" },
  { name: "Brazil", code: "br" },
  { name: "Brunei", code: "bn" },
  { name: "Bulgaria", code: "bg" },
  { name: "Burkina Faso", code: "bf" },
  { name: "Burundi", code: "bi" },
  { name: "Cambodia", code: "kh" },
  { name: "Cameroon", code: "cm" },
  { name: "Canada", code: "ca" },
  { name: "Central African Republic", code: "cf" },
  { name: "Chad", code: "td" },
  { name: "Chile", code: "cl" },
  { name: "China", code: "cn" },
  { name: "Colombia", code: "co" },
  { name: "Costa Rica", code: "cr" },
  { name: "Croatia", code: "hr" },
  { name: "Cuba", code: "cu" },
  { name: "Cyprus", code: "cy" },
  { name: "Czech Republic", code: "cz" },
  { name: "Denmark", code: "dk" },
  { name: "Djibouti", code: "dj" },
  { name: "Dominica", code: "dm" },
  { name: "Dominican Republic", code: "do" },
  { name: "Ecuador", code: "ec" },
  { name: "Egypt", code: "eg" },
  { name: "El Salvador", code: "sv" },
  { name: "Estonia", code: "ee" },
  { name: "Ethiopia", code: "et" },
  { name: "Fiji", code: "fj" },
  { name: "Finland", code: "fi" },
  { name: "France", code: "fr" },
  { name: "Gabon", code: "ga" },
  { name: "Gambia", code: "gm" },
  { name: "Georgia", code: "ge" },
  { name: "Germany", code: "de" },
  { name: "Ghana", code: "gh" },
  { name: "Greece", code: "gr" },
  { name: "Guatemala", code: "gt" },
  { name: "Guinea", code: "gn" },
  { name: "Haiti", code: "ht" },
  { name: "Honduras", code: "hn" },
  { name: "Hungary", code: "hu" },
  { name: "Iceland", code: "is" },
  { name: "India", code: "in" },
  { name: "Indonesia", code: "id" },
  { name: "Iran", code: "ir" },
  { name: "Iraq", code: "iq" },
  { name: "Ireland", code: "ie" },
  { name: "Israel", code: "il" },
  { name: "Italy", code: "it" },
  { name: "Jamaica", code: "jm" },
  { name: "Japan", code: "jp" },
  { name: "Jordan", code: "jo" },
  { name: "Kazakhstan", code: "kz" },
  { name: "Kenya", code: "ke" },
  { name: "Kuwait", code: "kw" },
  { name: "Laos", code: "la" },
  { name: "Latvia", code: "lv" },
  { name: "Lebanon", code: "lb" },
  { name: "Liberia", code: "lr" },
  { name: "Libya", code: "ly" },
  { name: "Lithuania", code: "lt" },
  { name: "Luxembourg", code: "lu" },
  { name: "Madagascar", code: "mg" },
  { name: "Malawi", code: "mw" },
  { name: "Malaysia", code: "my" },
  { name: "Maldives", code: "mv" },
  { name: "Mali", code: "ml" },
  { name: "Malta", code: "mt" },
  { name: "Mauritania", code: "mr" },
  { name: "Mauritius", code: "mu" },
  { name: "Mexico", code: "mx" },
  { name: "Moldova", code: "md" },
  { name: "Monaco", code: "mc" },
  { name: "Mongolia", code: "mn" },
  { name: "Montenegro", code: "me" },
  { name: "Morocco", code: "ma" },
  { name: "Mozambique", code: "mz" },
  { name: "Myanmar", code: "mm" },
  { name: "Namibia", code: "na" },
  { name: "Nepal", code: "np" },
  { name: "Netherlands", code: "nl" },
  { name: "New Zealand", code: "nz" },
  { name: "Nicaragua", code: "ni" },
  { name: "Niger", code: "ne" },
  { name: "Nigeria", code: "ng" },
  { name: "North Korea", code: "kp" },
  { name: "North Macedonia", code: "mk" },
  { name: "Norway", code: "no" },
  { name: "Oman", code: "om" },
  { name: "Pakistan", code: "pk" },
  { name: "Panama", code: "pa" },
  { name: "Papua New Guinea", code: "pg" },
  { name: "Paraguay", code: "py" },
  { name: "Peru", code: "pe" },
  { name: "Philippines", code: "ph" },
  { name: "Poland", code: "pl" },
  { name: "Portugal", code: "pt" },
  { name: "Qatar", code: "qa" },
  { name: "Romania", code: "ro" },
  { name: "Russia", code: "ru" },
  { name: "Rwanda", code: "rw" },
  { name: "Saudi Arabia", code: "sa" },
  { name: "Senegal", code: "sn" },
  { name: "Serbia", code: "rs" },
  { name: "Sierra Leone", code: "sl" },
  { name: "Singapore", code: "sg" },
  { name: "Slovakia", code: "sk" },
  { name: "Slovenia", code: "si" },
  { name: "Somalia", code: "so" },
  { name: "South Africa", code: "za" },
  { name: "South Korea", code: "kr" },
  { name: "Spain", code: "es" },
  { name: "Sri Lanka", code: "lk" },
  { name: "Sudan", code: "sd" },
  { name: "Sweden", code: "se" },
  { name: "Switzerland", code: "ch" },
  { name: "Syria", code: "sy" },
  { name: "Taiwan", code: "tw" },
  { name: "Tanzania", code: "tz" },
  { name: "Thailand", code: "th" },
  { name: "Togo", code: "tg" },
  { name: "Trinidad and Tobago", code: "tt" },
  { name: "Tunisia", code: "tn" },
  { name: "Turkey", code: "tr" },
  { name: "Uganda", code: "ug" },
  { name: "Ukraine", code: "ua" },
  { name: "United Arab Emirates", code: "ae" },
  { name: "United Kingdom", code: "gb" },
  { name: "United States", code: "us" },
  { name: "Uruguay", code: "uy" },
  { name: "Uzbekistan", code: "uz" },
  { name: "Venezuela", code: "ve" },
  { name: "Vietnam", code: "vn" },
  { name: "Yemen", code: "ye" },
  { name: "Zambia", code: "zm" },
  { name: "Zimbabwe", code: "zw" }
];

function getDailyCountry(countries) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  
  const seed = parseInt(`${year}${month}${day}`, 10);
  const x = Math.sin(seed) * 10000;
  const pseudoRandomFloat = x - Math.floor(x);
  
  const dailyIndex = Math.floor(pseudoRandomFloat * countries.length);
  return countries[dailyIndex];
}

function loadDailyChallenge() {
  const searchInput = document.getElementById('country-search');
  const dailyCountry = getDailyCountry(countryList);
  if (dailyCountry) {
    setGameMode('daily');
    currentTarget = dailyCountry;
    if (searchInput) searchInput.value = dailyCountry.name;
    const targetSpan = document.getElementById('target-points');
    if (targetSpan) {
      targetSpan.textContent = 'Max 20 pts';
    }
    clearCanvas();
  }
}

function setGameMode(mode) {
  const dailyButton = document.getElementById('daily-btn');
  const freePlayButton = document.getElementById('free-play-btn');
  const isDaily = mode === 'daily';

  dailyButton.classList.toggle('primary', isDaily);
  freePlayButton.classList.toggle('primary', !isDaily);
  dailyButton.setAttribute('aria-pressed', String(isDaily));
  freePlayButton.setAttribute('aria-pressed', String(!isDaily));
}

function setFreePlay() {
  setGameMode('free');
  const searchInput = document.getElementById('country-search');
  if (searchInput) searchInput.value = '';
  const targetSpan = document.getElementById('target-points');
  if (targetSpan) targetSpan.textContent = 'Max 20 pts';
}

function loadRandomCountry() {
  if (!countryList.length) return;

  const randomIndex = Math.floor(Math.random() * countryList.length);
  const randomCountry = countryList[randomIndex];
  currentTarget = randomCountry;

  setFreePlay();
  const searchInput = document.getElementById('country-search');
  if (searchInput) searchInput.value = randomCountry.name;

  clearCanvas();
}

function initCountryLookup() {
  const searchInput = document.getElementById('country-search');
  const dataList = document.getElementById('country-list');

  countryList = STATIC_COUNTRIES.map(c => ({
    name: c.name,
    code: c.code,
    flagUrl: `https://flagcdn.com/w640/${c.code}.png`
  })).sort((a, b) => a.name.localeCompare(b.name));

  dataList.innerHTML = '';
  countryList.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    dataList.appendChild(opt);
  });

  searchInput.placeholder = "Type country name (e.g. France)...";
  searchInput.disabled = false;
  document.getElementById('random-country-btn').disabled = false;

  loadDailyChallenge();
  loadEmblems();
}

async function loadEmblems() {
  const selectEl = document.getElementById('emblem-select');
  if (!selectEl) return;

  try {
    const response = await fetch('emblems.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const emblemMap = await response.json();
    const items = Object.entries(emblemMap)
      .filter(([name, url]) => name && typeof url === 'string' && url)
      .sort(([nameA], [nameB]) => nameA.localeCompare(nameB));

    selectEl.innerHTML = '<option value="">-- Select National Emblem --</option>';
    items.forEach(([name, url]) => {
      const opt = document.createElement('option');
      opt.value = url;
      opt.textContent = name;
      selectEl.appendChild(opt);
    });

    selectEl.disabled = false;
    const addButton = document.getElementById('add-emblem-btn');
    if (addButton) addButton.disabled = false;
  } catch (err) {
    console.error("Error loading emblems.json:", err);
    selectEl.innerHTML = '<option value="">Unable to load emblems</option>';
    selectEl.disabled = true;
  }
}

async function addSelectedEmblem() {
  const selectEl = document.getElementById('emblem-select');
  const imgUrl = selectEl.value;
  if (!imgUrl) return;

  const addBtn = document.getElementById('add-emblem-btn');
  if (addBtn) {
    addBtn.textContent = 'Loading...';
    addBtn.disabled = true;
  }

  try {
    const response = await fetch(imgUrl);
    const blob = await response.blob();

    const reader = new FileReader();
    reader.onloadend = function() {
      const base64data = reader.result;
      const newLayer = {
        id: Date.now(),
        shape: 'Image',
        imageUrl: base64data,
        color: 'Custom',
        hex: '#ffffff',
        x: 300,
        y: 200,
        scaleX: 0.6,
        scaleY: 0.6,
        rotation: 0
      };
      layers.push(newLayer);
      selectedId = newLayer.id;
      render();

      if (addBtn) {
        addBtn.textContent = '+ Add';
        addBtn.disabled = false;
      }
    };
    reader.readAsDataURL(blob);
  } catch (err) {
    console.error("Failed to load Wikimedia image:", err);
    alert("Could not load the selected emblem image.");
    if (addBtn) {
      addBtn.textContent = '+ Add';
      addBtn.disabled = false;
    }
  }
}

function handleCountrySelect(val) {
  const found = countryList.find(c => c.name.toLowerCase() === val.trim().toLowerCase());
  if (found) {
    setGameMode('free');
    currentTarget = found;
    const targetSpan = document.getElementById('target-points');
    if (targetSpan) {
      targetSpan.textContent = 'Max 20 pts';
    }
    clearCanvas();
  }
}

function toggleShapeSubOptions() {
  const shape = document.getElementById('shape-type').value;
  const starOpts = document.getElementById('star-options');
  const crossOpts = document.getElementById('cross-options');
  starOpts.style.display = (shape === 'Star') ? 'flex' : 'none';
  crossOpts.style.display = (shape === 'Cross') ? 'flex' : 'none';
}

function selectColor(colorName) {
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    const isSelected = swatch.dataset.color === colorName;
    swatch.classList.toggle('selected', isSelected);
    swatch.setAttribute('aria-pressed', String(isSelected));
  });
}

function getSelectedColor() {
  const selectedSwatch = document.querySelector('.color-swatch.selected');
  return selectedSwatch ? selectedSwatch.dataset.color : 'Red';
}

function generateStarPointsSVG(numPoints, outerR = 100, innerR = 40) {
  const pts = [];
  const step = Math.PI / numPoints;
  for (let i = 0; i < 2 * numPoints; i++) {
    const r = (i % 2 === 0) ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = Math.round(r * Math.cos(angle) * 100) / 100;
    const y = Math.round(r * Math.sin(angle) * 100) / 100;
    pts.push(`${x},${y}`);
  }
  return pts.join(' ');
}

function getShapeBaseDimensions(shape) {
  if (shape === 'Rectangle') return { w: 200, h: 400 };
  if (shape === 'Circle') return { w: 200, h: 200 };
  if (shape === 'Triangle') return { w: 240, h: 240 };
  if (shape === 'Star') return { w: 200, h: 200 };
  if (shape === 'Crescent') return { w: 200, h: 200 };
  if (shape === 'Cross') return { w: 200, h: 200 };
  if (shape === 'Sun') return { w: 200, h: 200 };
  if (shape === 'Shield' || shape === 'Image') return { w: 180, h: 220 };
  return { w: 200, h: 200 };
}

function addElement() {
  const shape = document.getElementById('shape-type').value;
  const colorName = getSelectedColor();
  const starPoints = parseInt(document.getElementById('star-points').value, 10) || 5;
  const crossStyle = document.getElementById('cross-style').value;
  const crossThickness = parseInt(document.getElementById('cross-thickness').value, 10) || 35;

  const newLayer = {
    id: Date.now(),
    shape: shape,
    crossStyle: crossStyle,
    crossThickness: crossThickness,
    pointsCount: starPoints,
    color: colorName,
    hex: COLOR_HEX_MAP[colorName] || "#ffffff",
    x: 300,
    y: 200,
    scaleX: shape === 'Rectangle' ? 1.0 : 0.6,
    scaleY: shape === 'Rectangle' ? 1.0 : 0.6,
    rotation: 0
  };

  layers.push(newLayer);
  selectedId = newLayer.id;
  render();
}

function addSunElement() {
  const colorName = getSelectedColor();
  const newLayer = {
    id: Date.now(),
    shape: 'Sun',
    color: colorName,
    hex: COLOR_HEX_MAP[colorName] || "#fcd116",
    x: 300,
    y: 200,
    scaleX: 0.6,
    scaleY: 0.6,
    rotation: 0
  };
  layers.push(newLayer);
  selectedId = newLayer.id;
  render();
}

function addCoatOfArmsPreset() {
  const colorName = getSelectedColor();
  const newLayer = {
    id: Date.now(),
    shape: 'Shield',
    color: colorName,
    hex: COLOR_HEX_MAP[colorName] || "#ce1126",
    x: 300,
    y: 200,
    scaleX: 0.6,
    scaleY: 0.6,
    rotation: 0
  };
  layers.push(newLayer);
  selectedId = newLayer.id;
  render();
}

function selectLayer(id) {
  selectedId = id;
  render();
}

function deleteLayer(id, e) {
  if (e) e.stopPropagation();
  layers = layers.filter(l => l.id !== id);
  if (selectedId === id) selectedId = layers.length ? layers[layers.length - 1].id : null;
  render();
}

function moveLayer(id, dir, e) {
  if (e) e.stopPropagation();
  const idx = layers.findIndex(l => l.id === id);
  if (idx < 0) return;
  const targetIdx = idx + dir;
  if (targetIdx >= 0 && targetIdx < layers.length) {
    const temp = layers[idx];
    layers[idx] = layers[targetIdx];
    layers[targetIdx] = temp;
    render();
  }
}

function clearCanvas() {
  layers = [];
  selectedId = null;
  activeGuides = [];
  render();
}

function render() {
  renderLayers();
  renderGuides();
  renderHandles();
  renderLayerList();
}

function renderLayers() {
  const g = document.getElementById('layer-group');
  g.innerHTML = '';

  layers.forEach(layer => {
    const elemGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const sx = layer.scaleX !== undefined ? layer.scaleX : layer.scale;
    const sy = layer.scaleY !== undefined ? layer.scaleY : layer.scale;
    
    elemGroup.setAttribute('transform', `translate(${layer.x}, ${layer.y}) rotate(${layer.rotation}) scale(${sx}, ${sy})`);
    elemGroup.style.cursor = 'move';
    elemGroup.onmousedown = (e) => {
      e.stopPropagation();
      selectLayer(layer.id);
      startDrag(e, 'translate');
    };

    if (layer.shape === 'Rectangle') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', -100); rect.setAttribute('y', -200);
      rect.setAttribute('width', 200); rect.setAttribute('height', 400);
      rect.setAttribute('fill', layer.hex);
      elemGroup.appendChild(rect);
    } else if (layer.shape === 'Circle') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', 100);
      circle.setAttribute('fill', layer.hex);
      elemGroup.appendChild(circle);
    } else if (layer.shape === 'Triangle') {
      const tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      tri.setAttribute('points', '0,-120 120,120 -120,120');
      tri.setAttribute('fill', layer.hex);
      elemGroup.appendChild(tri);
    } else if (layer.shape === 'Star') {
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const pts = generateStarPointsSVG(layer.pointsCount || 5, 100, 40);
      star.setAttribute('points', pts);
      star.setAttribute('fill', layer.hex);
      elemGroup.appendChild(star);
    } else if (layer.shape === 'Crescent') {
      const crescent = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      crescent.setAttribute('d', 'M 0,-100 A 100,100 0 1,0 0,100 A 75,75 0 1,1 0,-100 Z');
      crescent.setAttribute('fill', layer.hex);
      elemGroup.appendChild(crescent);
    } else if (layer.shape === 'Cross') {
      const crossG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      crossG.setAttribute('fill', layer.hex);
      const crossStyle = layer.crossStyle || 'regular';
      const crossThickness = layer.crossThickness || 35;

      if (crossStyle === 'saltaire') {
        const diagonal = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        diagonal.setAttribute('d', 'M -100,-100 L 100,100 M 100,-100 L -100,100');
        diagonal.setAttribute('fill', 'none');
        diagonal.setAttribute('stroke', layer.hex);
        diagonal.setAttribute('stroke-width', crossThickness);
        diagonal.setAttribute('stroke-linecap', 'butt');
        crossG.appendChild(diagonal);
      } else if (crossStyle === 'nordic') {
        const vertical = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        vertical.setAttribute('x', -50); vertical.setAttribute('y', -100); vertical.setAttribute('width', crossThickness); vertical.setAttribute('height', 200);
        const horizontal = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        horizontal.setAttribute('x', -100); horizontal.setAttribute('y', -crossThickness / 2); horizontal.setAttribute('width', 200); horizontal.setAttribute('height', crossThickness);
        crossG.appendChild(vertical); crossG.appendChild(horizontal);
      } else {
        const vertical = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        vertical.setAttribute('x', -crossThickness / 2); vertical.setAttribute('y', -100); vertical.setAttribute('width', crossThickness); vertical.setAttribute('height', 200);
        const horizontal = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        horizontal.setAttribute('x', -100); horizontal.setAttribute('y', -crossThickness / 2); horizontal.setAttribute('width', 200); horizontal.setAttribute('height', crossThickness);
        crossG.appendChild(vertical); crossG.appendChild(horizontal);
      }
      elemGroup.appendChild(crossG);
    } else if (layer.shape === 'Sun') {
      const sunG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      sunG.setAttribute('fill', layer.hex);
      
      const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      core.setAttribute('r', 45);
      sunG.appendChild(core);

      const numRays = 16;
      for (let i = 0; i < numRays; i++) {
        const ray = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        ray.setAttribute('points', '-10,-50 0,-100 10,-50');
        ray.setAttribute('transform', `rotate(${(i * 360) / numRays})`);
        sunG.appendChild(ray);
      }
      elemGroup.appendChild(sunG);
    } else if (layer.shape === 'Shield') {
      const shield = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      shield.setAttribute('d', 'M -80,-100 L 80,-100 L 80,10 C 80,70 0,110 0,110 C 0,110 -80,70 -80,10 Z');
      shield.setAttribute('fill', layer.hex);
      shield.setAttribute('stroke', '#ffffff');
      shield.setAttribute('stroke-width', '4');
      elemGroup.appendChild(shield);
    } else if (layer.shape === 'Image') {
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttribute('href', layer.imageUrl);
      img.setAttribute('x', -90);
      img.setAttribute('y', -110);
      img.setAttribute('width', 180);
      img.setAttribute('height', 220);
      elemGroup.appendChild(img);
    }

    g.appendChild(elemGroup);
  });
}

function renderGuides() {
  const gg = document.getElementById('guide-group');
  gg.innerHTML = '';

  activeGuides.forEach(guide => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'snap-guide');
    if (guide.type === 'v') {
      line.setAttribute('x1', guide.pos); line.setAttribute('y1', 0);
      line.setAttribute('x2', guide.pos); line.setAttribute('y2', 400);
    } else {
      line.setAttribute('x1', 0); line.setAttribute('y1', guide.pos);
      line.setAttribute('x2', 600); line.setAttribute('y2', guide.pos);
    }
    gg.appendChild(line);
  });
}

function renderHandles() {
  const hg = document.getElementById('handle-group');
  hg.innerHTML = '';

  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;

  const base = getShapeBaseDimensions(activeLayer.shape);
  const sx = activeLayer.scaleX !== undefined ? activeLayer.scaleX : activeLayer.scale;
  const sy = activeLayer.scaleY !== undefined ? activeLayer.scaleY : activeLayer.scale;
  
  const hw = (base.w / 2) * sx;
  const hh = (base.h / 2) * sy;

  const handleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  handleGroup.setAttribute('transform', `translate(${activeLayer.x}, ${activeLayer.y}) rotate(${activeLayer.rotation})`);

  const bbox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bbox.setAttribute('class', 'handle-bbox');
  bbox.setAttribute('x', -hw); bbox.setAttribute('y', -hh);
  bbox.setAttribute('width', hw * 2); bbox.setAttribute('height', hh * 2);
  handleGroup.appendChild(bbox);

  const nodes = [
    { id: 'nw', x: -hw, y: -hh, cursor: 'nwse-resize' },
    { id: 'n',  x: 0,   y: -hh, cursor: 'ns-resize' },
    { id: 'ne', x: hw,  y: -hh, cursor: 'nesw-resize' },
    { id: 'e',  x: hw,  y: 0,   cursor: 'ew-resize' },
    { id: 'se', x: hw,  y: hh,  cursor: 'nwse-resize' },
    { id: 's',  x: 0,   y: hh,  cursor: 'ns-resize' },
    { id: 'sw', x: -hw, y: hh,  cursor: 'nesw-resize' },
    { id: 'w',  x: -hw, y: 0,   cursor: 'ew-resize' }
  ];

  nodes.forEach(node => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'handle-node');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', 5);
    circle.style.cursor = node.cursor;
    circle.onmousedown = (e) => startDrag(e, node.id);
    handleGroup.appendChild(circle);
  });

  const stemHeight = 28;
  const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  stem.setAttribute('class', 'handle-rotate-stem');
  stem.setAttribute('x1', 0); stem.setAttribute('y1', -hh);
  stem.setAttribute('x2', 0); stem.setAttribute('y2', -hh - stemHeight);
  handleGroup.appendChild(stem);

  const rotateG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  rotateG.setAttribute('transform', `translate(0, ${-hh - stemHeight})`);
  rotateG.style.cursor = 'grab';

  const rotCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  rotCircle.setAttribute('class', 'handle-node');
  rotCircle.setAttribute('cx', 0); rotCircle.setAttribute('cy', 0);
  rotCircle.setAttribute('r', 9);

  const rotIcon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  rotIcon.setAttribute('d', 'M -4,1 A 4.5,4.5 0 1,1 4,1 M 1.5,-2 L 4.5,1 L 5.5,-2');
  rotIcon.setAttribute('fill', 'none');
  rotIcon.setAttribute('stroke', '#444444');
  rotIcon.setAttribute('stroke-width', '1.3');
  rotIcon.setAttribute('stroke-linecap', 'round');
  rotIcon.setAttribute('stroke-linejoin', 'round');

  rotateG.appendChild(rotCircle);
  rotateG.appendChild(rotIcon);
  rotateG.onmousedown = (e) => startDrag(e, 'rotate');
  handleGroup.appendChild(rotateG);

  hg.appendChild(handleGroup);
}

function renderLayerList() {
  const listEl = document.getElementById('layer-list');
  listEl.innerHTML = '';

  if (layers.length === 0) {
    listEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem;">No shapes added.</div>';
    return;
  }

  layers.forEach((layer, idx) => {
    const item = document.createElement('div');
    item.className = `layer-item ${layer.id === selectedId ? 'active' : ''}`;
    item.onclick = () => selectLayer(layer.id);

    let labelName = layer.shape;
    if (layer.shape === 'Star') labelName = `Star (${layer.pointsCount} pt)`;
    if (layer.shape === 'Cross') {
      const crossLabels = { regular: 'Regular cross', saltaire: 'Saltaire', nordic: 'Nordic cross' };
      labelName = crossLabels[layer.crossStyle] || 'Regular cross';
    }

    item.innerHTML = `
      <div style="display:flex; align-items:center;">
        <span class="layer-preview" style="background-color:${layer.hex};"></span>
        <span style="font-size:0.85rem;">${labelName} (${Math.round(layer.rotation)}°)</span>
      </div>
      <div class="layer-controls">
        <button onclick="moveLayer(${layer.id}, -1, event)" ${idx === 0 ? 'disabled' : ''}>▲</button>
        <button onclick="moveLayer(${layer.id}, 1, event)" ${idx === layers.length - 1 ? 'disabled' : ''}>▼</button>
        <button class="danger" onclick="deleteLayer(${layer.id}, event)">✕</button>
      </div>
    `;
    listEl.appendChild(item);
  });
}

function getSVGPoint(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function startDrag(e, mode) {
  e.stopPropagation();
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;

  isDragging = true;
  dragMode = mode;
  const pt = getSVGPoint(e);
  dragStart = { x: pt.x, y: pt.y };
  layerStart = { 
    x: activeLayer.x, 
    y: activeLayer.y, 
    scaleX: activeLayer.scaleX !== undefined ? activeLayer.scaleX : activeLayer.scale, 
    scaleY: activeLayer.scaleY !== undefined ? activeLayer.scaleY : activeLayer.scale, 
    rotation: activeLayer.rotation 
  };
  activeGuides = [];
}

window.onmousemove = (e) => {
  if (!isDragging) return;
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;

  const pt = getSVGPoint(e);
  activeGuides = [];

  if (dragMode === 'translate') {
    let newX = layerStart.x + (pt.x - dragStart.x);
    let newY = layerStart.y + (pt.y - dragStart.y);

    const base = getShapeBaseDimensions(activeLayer.shape);
    const hw = (base.w / 2) * activeLayer.scaleX;
    const hh = (base.h / 2) * activeLayer.scaleY;

    const xTargets = [0, 300, 600];
    const yTargets = [0, 200, 400];
    const snapThreshold = 8;

    const xCandidates = [
      { val: newX - hw, offset: -hw },
      { val: newX, offset: 0 },
      { val: newX + hw, offset: hw }
    ];

    for (let cand of xCandidates) {
      for (let target of xTargets) {
        if (Math.abs(cand.val - target) <= snapThreshold) {
          newX = target - cand.offset;
          activeGuides.push({ type: 'v', pos: target });
          break;
        }
      }
      if (activeGuides.some(g => g.type === 'v')) break;
    }

    const yCandidates = [
      { val: newY - hh, offset: -hh },
      { val: newY, offset: 0 },
      { val: newY + hh, offset: hh }
    ];

    for (let cand of yCandidates) {
      for (let target of yTargets) {
        if (Math.abs(cand.val - target) <= snapThreshold) {
          newY = target - cand.offset;
          activeGuides.push({ type: 'h', pos: target });
          break;
        }
      }
      if (activeGuides.some(g => g.type === 'h')) break;
    }

    activeLayer.x = newX;
    activeLayer.y = newY;

  } else if (dragMode === 'rotate') {
    const angleRad = Math.atan2(pt.y - activeLayer.y, pt.x - activeLayer.x);
    let rawAngle = angleRad * (180 / Math.PI) + 90;
    rawAngle = (rawAngle + 360) % 360;

    const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
    const angleThreshold = 5;
    let finalAngle = rawAngle;

    for (let snapAngle of snapAngles) {
      if (Math.abs(rawAngle - snapAngle) <= angleThreshold || Math.abs(rawAngle - snapAngle - 360) <= angleThreshold) {
        finalAngle = snapAngle % 360;
        break;
      }
    }
    activeLayer.rotation = finalAngle;

  } else {
    const rotation = activeLayer.rotation * (Math.PI / 180);
    const inverseRotation = -rotation;
    const dxGlobal = pt.x - layerStart.x;
    const dyGlobal = pt.y - layerStart.y;
    const localX = dxGlobal * Math.cos(inverseRotation) - dyGlobal * Math.sin(inverseRotation);
    const localY = dxGlobal * Math.sin(inverseRotation) + dyGlobal * Math.cos(inverseRotation);

    const base = getShapeBaseDimensions(activeLayer.shape);
    const startHalfWidth = (base.w / 2) * layerStart.scaleX;
    const startHalfHeight = (base.h / 2) * layerStart.scaleY;
    const isEast = ['e', 'ne', 'se'].includes(dragMode);
    const isSouth = ['s', 'se', 'sw'].includes(dragMode);
    const isCorner = ['nw', 'ne', 'se', 'sw'].includes(dragMode);
    let centerX = 0;
    let centerY = 0;

    if (isCorner) {
      const anchorX = isEast ? -startHalfWidth : startHalfWidth;
      const anchorY = isSouth ? -startHalfHeight : startHalfHeight;
      const width = Math.max(base.w * 0.1, isEast ? localX - anchorX : anchorX - localX);
      const height = Math.max(base.h * 0.1, isSouth ? localY - anchorY : anchorY - localY);

      activeLayer.scaleX = width / base.w;
      activeLayer.scaleY = height / base.h;
      centerX = anchorX + (isEast ? width : -width) / 2;
      centerY = anchorY + (isSouth ? height : -height) / 2;
    } else if (dragMode === 'e' || dragMode === 'w') {
      const anchorX = dragMode === 'e' ? -startHalfWidth : startHalfWidth;
      const width = Math.max(base.w * 0.1, dragMode === 'e' ? localX - anchorX : anchorX - localX);

      activeLayer.scaleX = width / base.w;
      centerX = anchorX + (dragMode === 'e' ? width : -width) / 2;
    } else if (dragMode === 'n' || dragMode === 's') {
      const anchorY = dragMode === 's' ? -startHalfHeight : startHalfHeight;
      const height = Math.max(base.h * 0.1, dragMode === 's' ? localY - anchorY : anchorY - localY);

      activeLayer.scaleY = height / base.h;
      centerY = anchorY + (dragMode === 's' ? height : -height) / 2;
    }

    const centerOffsetX = centerX * Math.cos(rotation) - centerY * Math.sin(rotation);
    const centerOffsetY = centerX * Math.sin(rotation) + centerY * Math.cos(rotation);
    activeLayer.x = layerStart.x + centerOffsetX;
    activeLayer.y = layerStart.y + centerOffsetY;
  }

  render();
};

window.onmouseup = () => {
  isDragging = false;
  dragMode = null;
  activeGuides = [];
  renderGuides();
};

function evaluateSubmission() {
  const w = 300, h = 200;

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.textContent = 'Evaluating...';
  submitBtn.disabled = true;

  const officialImg = new Image();
  officialImg.crossOrigin = "anonymous";

  officialImg.onload = function() {
    const canvasOfficial = document.createElement('canvas');
    canvasOfficial.width = w; canvasOfficial.height = h;
    const ctxOfficial = canvasOfficial.getContext('2d');
    ctxOfficial.drawImage(officialImg, 0, 0, w, h);

    const canvasUser = document.createElement('canvas');
    canvasUser.width = w; canvasUser.height = h;
    const ctxUser = canvasUser.getContext('2d');

    document.getElementById('handle-group').style.display = 'none';
    document.getElementById('guide-group').style.display = 'none';
    const svgData = new XMLSerializer().serializeToString(svg);
    document.getElementById('handle-group').style.display = 'block';
    document.getElementById('guide-group').style.display = 'block';

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const userImg = new Image();
    userImg.onload = function() {
      ctxUser.fillStyle = "#808080";
      ctxUser.fillRect(0, 0, w, h);
      ctxUser.drawImage(userImg, 0, 0, w, h);
      URL.revokeObjectURL(blobURL);

      const imgDataOfficial = ctxOfficial.getImageData(0, 0, w, h).data;
      const imgDataUser = ctxUser.getImageData(0, 0, w, h).data;

      let totalDiff = 0;
      const maxDiff = w * h * 3 * 255;

      for (let i = 0; i < imgDataOfficial.length; i += 4) {
        totalDiff += Math.abs(imgDataOfficial[i] - imgDataUser[i]);
        totalDiff += Math.abs(imgDataOfficial[i+1] - imgDataUser[i+1]);
        totalDiff += Math.abs(imgDataOfficial[i+2] - imgDataUser[i+2]);
      }

      const similarityPct = Math.max(0, Math.round((1 - (totalDiff / maxDiff)) * 100));
      const maxPoints = 20;
      const earnedPoints = Math.round((similarityPct / 100) * maxPoints);

      submitBtn.textContent = 'Submit & Score';
      submitBtn.disabled = false;

      showComparisonModal(canvasUser, canvasOfficial, similarityPct, earnedPoints, maxPoints);
    };
    userImg.src = blobURL;
  };

  officialImg.onerror = function() {
    alert("Failed to load reference flag image. Please check network connection.");
    submitBtn.textContent = 'Submit & Score';
    submitBtn.disabled = false;
  };

  officialImg.src = currentTarget.flagUrl;
}

function showComparisonModal(userCanvas, officialCanvas, scorePct, points, maxPoints) {
  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>Submission Results: ${currentTarget.name}</h2>
        <div class="score-badge">${scorePct}% Match</div>
        <p>You earned <strong>${points} / ${maxPoints}</strong> points.</p>
        
        <div class="comparison-grid">
          <div class="comparison-box">
            <label><strong>Your Submission</strong></label>
            <div id="user-canvas-container"></div>
          </div>
          <div class="comparison-box">
            <label><strong>Official Reference</strong></label>
            <div id="official-canvas-container"></div>
          </div>
        </div>

        <button class="primary" style="margin-top: 1rem;" onclick="closeModal()">Try Again / Continue</button>
      </div>
    </div>
  `;

  document.getElementById('user-canvas-container').appendChild(userCanvas);
  document.getElementById('official-canvas-container').appendChild(officialCanvas);
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}

document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => selectColor(swatch.dataset.color));
});
selectColor('Red');
initCountryLookup();