const COLOR_HEX_MAP = {
  "Black": "#000000",
  "Blue": "#00247d",
  "Green": "#009a49",
  "Orange": "#ff8200",
  "Red": "#ce1126",
  "White": "#ffffff",
  "Yellow": "#fcd116"
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

// Static country array to avoid API limitations and rate limits
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

// Deterministic algorithm for daily country selection based on UTC YYYYMMDD
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
    currentTarget = dailyCountry;
    if (searchInput) searchInput.value = dailyCountry.name;
    const targetSpan = document.getElementById('target-points');
    if (targetSpan) {
      targetSpan.textContent = `Daily Challenge: ${dailyCountry.name} [Max 20 pts]`;
    }
    clearCanvas();
  }
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

  // Load UTC Daily Challenge by default on start
  loadDailyChallenge();
}

function handleCountrySelect(val) {
  const found = countryList.find(c => c.name.toLowerCase() === val.trim().toLowerCase());
  if (found) {
    currentTarget = found;
    const targetSpan = document.getElementById('target-points');
    if (targetSpan) {
      targetSpan.textContent = `Target: ${found.name} [Max 20 pts]`;
    }
    clearCanvas();
  }
}

function getShapeBaseDimensions(shape) {
  if (shape === 'Rectangle') return { w: 200, h: 400 };
  if (shape === 'Circle') return { w: 200, h: 200 };
  if (shape === 'Triangle') return { w: 240, h: 240 };
  if (shape === 'Star') return { w: 200, h: 200 };
  if (shape === 'Cross') return { w: 200, h: 200 };
  return { w: 200, h: 200 };
}

function addElement() {
  const shape = document.getElementById('shape-type').value;
  const colorName = document.getElementById('shape-color').value;

  const newLayer = {
    id: Date.now(),
    shape: shape,
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
      star.setAttribute('points', '0,-100 30,-30 100,-30 40,15 60,90 0,45 -60,90 -40,15 -100,-30 -30,-30');
      star.setAttribute('fill', layer.hex);
      elemGroup.appendChild(star);
    } else if (layer.shape === 'Cross') {
      const crossG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      crossG.setAttribute('fill', layer.hex);
      const v = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      v.setAttribute('x', -25); v.setAttribute('y', -100); v.setAttribute('width', 50); v.setAttribute('height', 200);
      const h = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      h.setAttribute('x', -100); h.setAttribute('y', -25); h.setAttribute('width', 200); h.setAttribute('height', 50);
      crossG.appendChild(v); crossG.appendChild(h);
      elemGroup.appendChild(crossG);
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

    item.innerHTML = `
      <div style="display:flex; align-items:center;">
        <span class="layer-preview" style="background-color:${layer.hex};"></span>
        <span style="font-size:0.85rem;">${layer.shape} (${Math.round(layer.rotation)}°)</span>
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
    const rad = -activeLayer.rotation * (Math.PI / 180);
    const dxGlobal = pt.x - activeLayer.x;
    const dyGlobal = pt.y - activeLayer.y;

    const localX = dxGlobal * Math.cos(rad) - dyGlobal * Math.sin(rad);
    const localY = dxGlobal * Math.sin(rad) + dyGlobal * Math.cos(rad);

    const base = getShapeBaseDimensions(activeLayer.shape);
    const isCorner = ['nw', 'ne', 'se', 'sw'].includes(dragMode);

    if (isCorner) {
      const startAspect = layerStart.scaleX / layerStart.scaleY;
      const scaleXCandidate = Math.abs(localX) / (base.w / 2);
      const scaleYCandidate = Math.abs(localY) / (base.h / 2);

      const targetScaleX = Math.max(0.1, Math.max(scaleXCandidate, scaleYCandidate * startAspect));
      
      activeLayer.scaleX = targetScaleX;
      activeLayer.scaleY = Math.max(0.1, targetScaleX / startAspect);
    } else {
      if (dragMode === 'e' || dragMode === 'w') {
        const newHw = Math.abs(localX);
        activeLayer.scaleX = Math.max(0.1, (newHw * 2) / base.w);
      } else if (dragMode === 'n' || dragMode === 's') {
        const newHh = Math.abs(localY);
        activeLayer.scaleY = Math.max(0.1, (newHh * 2) / base.h);
      }
    }
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
      ctxUser.fillStyle = "#000000";
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

initCountryLookup();
