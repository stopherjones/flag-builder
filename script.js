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
let currentGameMode = 'daily';

// Dice Draft State
let draftedItems = [];
let isRollingDice = false;

let isDragging = false;
let dragMode = null;
let dragStart = { x: 0, y: 0 };
let layerStart = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 };
let activeGuides = [];

// Multi-touch pinch & rotate state
let isPinching = false;
let pinchStart = {
  dist: 0,
  angle: 0,
  centerX: 0,
  centerY: 0,
  layerX: 0,
  layerY: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0
};

const svg = document.getElementById('flag-svg');

const SHAPE_2D6_TABLE = {
  2: { name: "Crescent", label: "🌙 Crescent" },
  3: { name: "Circle", label: "🔴 Circle" },
  4: { name: "Cross", label: "✝️ Cross" },
  5: { name: "Rectangle", label: "█ Rectangle" },
  6: { name: "Rectangle", label: "█ Rectangle" },
  7: { name: "Rectangle", label: "█ Rectangle" },
  8: { name: "Triangle", label: "🔺 Triangle" },
  9: { name: "Triangle", label: "🔺 Triangle" },
  10: { name: "Star", label: "⭐ Star" },
  11: { name: "Star", label: "⭐ Star" },
  12: { name: "Free Choice", label: "🌟 Free Choice Shape" }
};

const COLOR_1D12_TABLE = {
  1: { name: "Deep red", hex: "#8b0000" },
  2: { name: "Red", hex: "#ce1126" },
  3: { name: "Orange", hex: "#ff8200" },
  4: { name: "Yellow", hex: "#fcd116" },
  5: { name: "Deep green", hex: "#006b3c" },
  6: { name: "Green", hex: "#009a49" },
  7: { name: "Deep blue", hex: "#00247d" },
  8: { name: "Blue", hex: "#0057b7" },
  9: { name: "Light blue", hex: "#5bcefa" },
  10: { name: "White", hex: "#ffffff" },
  11: { name: "Black", hex: "#000000" },
  12: { name: "Free Choice", hex: "#d99b26" }
};

// Complexity tiers for target countries
const HIGH_COMPLEXITY_COUNTRIES = [
  "us", "au", "nz", "br", "mx", "es", "za", "ar", "uy", "ca", "ke", "in", 
  "lk", "eg", "hr", "pt", "kr", "pg", "ec", "py", "bo", "sv", "gt", "hn", 
  "ni", "af", "al", "ad", "ao", "bt", "kh", "dm", "sz", "me", "mz", "ug", "zw"
];

const MEDIUM_COMPLEXITY_COUNTRIES = [
  "se", "no", "dk", "fi", "is", "gr", "ch", "gb", "cz", "cu", "jo", "kw", 
  "jm", "bs", "cl", "tr", "vn", "so", "gh", "sn", "cm", "my", "pk", "dz", 
  "tn", "ly", "sg", "il", "pa", "sr", "ge", "bb", "kn", "vc", "lc"
];

function getCountryComplexity(code, name) {
  const lower = (code || '').toLowerCase();
  if (HIGH_COMPLEXITY_COUNTRIES.includes(lower)) {
    return { level: "Complex", points: 50, badge: "⭐⭐⭐ Complex (50 pts)" };
  }
  if (MEDIUM_COMPLEXITY_COUNTRIES.includes(lower)) {
    return { level: "Medium", points: 35, badge: "⭐⭐ Medium (35 pts)" };
  }
  return { level: "Simple", points: 20, badge: "⭐ Simple (20 pts)" };
}

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

function updateTargetPointsDisplay() {
  const targetSpan = document.getElementById('target-points');
  if (!targetSpan) return;

  if (currentGameMode === 'daily') {
    if (currentTarget) {
      const comp = getCountryComplexity(currentTarget.code, currentTarget.name);
      targetSpan.textContent = `Daily Target: ${comp.badge}`;
    } else {
      targetSpan.textContent = 'Daily Challenge';
    }
  } else if (currentGameMode === 'free') {
    if (currentTarget) {
      const comp = getCountryComplexity(currentTarget.code, currentTarget.name);
      targetSpan.textContent = `Target: ${currentTarget.name} (${comp.badge})`;
    } else {
      targetSpan.textContent = '🎨 Pick a country or build freely';
    }
  } else if (currentGameMode === 'dice-draft') {
    if (currentTarget) {
      const comp = getCountryComplexity(currentTarget.code, currentTarget.name);
      targetSpan.textContent = `Testing: ${currentTarget.name} (${comp.badge})`;
    } else {
      targetSpan.textContent = '🎲 Open Draft Mode';
    }
  }
}

function setGameMode(mode) {
  currentGameMode = mode;
  const dailyButton = document.getElementById('daily-btn');
  const freePlayButton = document.getElementById('free-play-btn');
  const diceDraftButton = document.getElementById('dice-draft-btn');
  const randomButton = document.getElementById('random-country-btn');

  const standardPanel = document.getElementById('standard-builder-panel');
  const dicePanel = document.getElementById('dice-draft-panel');
  const standardTargetBar = document.getElementById('standard-target-options');
  const diceTopBanner = document.getElementById('dice-draft-top-banner');
  const diceBottomTestSection = document.getElementById('dice-draft-country-test-section');
  const searchInput = document.getElementById('country-search');

  if (dailyButton) dailyButton.classList.toggle('primary', mode === 'daily');
  if (freePlayButton) freePlayButton.classList.toggle('primary', mode === 'free');
  if (diceDraftButton) diceDraftButton.classList.toggle('primary', mode === 'dice-draft');

  if (mode === 'daily') {
    if (standardPanel) standardPanel.style.display = 'block';
    if (dicePanel) dicePanel.style.display = 'none';
    if (standardTargetBar) standardTargetBar.style.display = 'flex';
    if (diceTopBanner) diceTopBanner.style.display = 'none';
    if (diceBottomTestSection) diceBottomTestSection.style.display = 'none';
    if (searchInput) {
      searchInput.disabled = true;
      searchInput.placeholder = "Daily Challenge Country";
    }
    if (randomButton) randomButton.disabled = false;
  } else if (mode === 'free') {
    if (standardPanel) standardPanel.style.display = 'block';
    if (dicePanel) dicePanel.style.display = 'none';
    if (standardTargetBar) standardTargetBar.style.display = 'flex';
    if (diceTopBanner) diceTopBanner.style.display = 'none';
    if (diceBottomTestSection) diceBottomTestSection.style.display = 'none';
    if (searchInput) {
      searchInput.disabled = false;
      searchInput.placeholder = "Type/choose country to recreate...";
    }
    if (randomButton) randomButton.disabled = false;
  } else if (mode === 'dice-draft') {
    if (standardPanel) standardPanel.style.display = 'none';
    if (dicePanel) dicePanel.style.display = 'block';
    if (standardTargetBar) standardTargetBar.style.display = 'none';
    if (diceTopBanner) diceTopBanner.style.display = 'block';
    if (diceBottomTestSection) diceBottomTestSection.style.display = 'flex';
    if (searchInput) {
      searchInput.value = '';
    }
    if (randomButton) randomButton.disabled = true;
  }

  updateTargetPointsDisplay();
}

function loadDailyChallenge() {
  const searchInput = document.getElementById('country-search');
  const dailyCountry = getDailyCountry(countryList);
  if (dailyCountry) {
    setGameMode('daily');
    currentTarget = dailyCountry;
    if (searchInput) searchInput.value = dailyCountry.name;
    updateTargetPointsDisplay();
    clearCanvas();
  }
}

function setFreePlay() {
  setGameMode('free');
  currentTarget = null;
  const searchInput = document.getElementById('country-search');
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  updateTargetPointsDisplay();
}

function startDiceDraftMode() {
  setGameMode('dice-draft');
  currentTarget = null;
  const draftSearchInput = document.getElementById('draft-country-select');
  if (draftSearchInput) draftSearchInput.value = '';
  const draftBadge = document.getElementById('draft-target-badge');
  if (draftBadge) draftBadge.textContent = 'Pick country to see points & complexity';
  const searchInput = document.getElementById('country-search');
  if (searchInput) searchInput.value = '';
  resetDiceDraftGame();
}

function loadRandomCountry() {
  if (!countryList.length) return;

  const randomIndex = Math.floor(Math.random() * countryList.length);
  const randomCountry = countryList[randomIndex];
  currentTarget = randomCountry;

  setGameMode('free');
  const searchInput = document.getElementById('country-search');
  if (searchInput) searchInput.value = randomCountry.name;

  updateTargetPointsDisplay();
  clearCanvas();
}

function handleDraftCountrySelect(val) {
  const found = countryList.find(c => c.name.toLowerCase() === (val || '').trim().toLowerCase());
  const draftBadge = document.getElementById('draft-target-badge');
  const draftInput = document.getElementById('draft-country-select');
  if (draftInput) draftInput.classList.remove('highlight-prompt');

  if (found) {
    currentTarget = found;
    const comp = getCountryComplexity(found.code, found.name);
    if (draftBadge) draftBadge.textContent = `${found.name}: ${comp.badge}`;
    updateTargetPointsDisplay();
  } else {
    currentTarget = null;
    if (draftBadge) draftBadge.textContent = 'Pick country to see points & complexity';
    updateTargetPointsDisplay();
  }
}

function loadRandomDraftCountry() {
  if (!countryList.length) return;
  const randomIndex = Math.floor(Math.random() * countryList.length);
  const randomCountry = countryList[randomIndex];
  const draftInput = document.getElementById('draft-country-select');
  if (draftInput) {
    draftInput.value = randomCountry.name;
    handleDraftCountrySelect(randomCountry.name);
  }
}

// ==========================================
// Dice & Draft Gameplay Logic (One-by-One)
// ==========================================

function roll2D6() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const sum = d1 + d2;
  const shapeDef = SHAPE_2D6_TABLE[sum] || { name: "Rectangle", label: "█ Rectangle" };
  return { d1, d2, sum, shape: shapeDef.name, label: shapeDef.label };
}

function roll1D12() {
  const d12 = Math.floor(Math.random() * 12) + 1;
  const colorDef = COLOR_1D12_TABLE[d12] || { name: "Red", hex: "#ce1126" };
  return { d12, color: colorDef.name, hex: colorDef.hex };
}

function createDraftItemFromRoll(rollShape, rollColor) {
  return {
    id: Date.now() + Math.floor(Math.random() * 100000),
    roll2d6: rollShape.sum,
    die1: rollShape.d1,
    die2: rollShape.d2,
    shapeType: rollShape.shape,
    selectedShape: (rollShape.shape === 'Free Choice' ? 'Rectangle' : rollShape.shape),
    roll1d12: rollColor.d12,
    colorName: rollColor.color,
    selectedColor: (rollColor.color === 'Free Choice' ? 'Red' : rollColor.color),
    starPoints: 5,
    crossStyle: 'regular',
    crossThickness: 35,
    layerId: null
  };
}

function animateDiceUI(d1, d2, d12, callback) {
  const die1El = document.getElementById('die-1');
  const die2El = document.getElementById('die-2');
  const dieD12El = document.getElementById('die-d12');

  const shapeText = document.getElementById('shape-roll-result');
  const colorText = document.getElementById('color-roll-result');

  if (die1El && die2El && dieD12El) {
    die1El.classList.add('rolling');
    die2El.classList.add('rolling');
    dieD12El.classList.add('rolling');

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      die1El.textContent = Math.floor(Math.random() * 6) + 1;
      die2El.textContent = Math.floor(Math.random() * 6) + 1;
      dieD12El.textContent = Math.floor(Math.random() * 12) + 1;
      if (counter > 8) {
        clearInterval(interval);
        die1El.textContent = d1;
        die2El.textContent = d2;
        dieD12El.textContent = d12;
        die1El.classList.remove('rolling');
        die2El.classList.remove('rolling');
        dieD12El.classList.remove('rolling');

        const sum = d1 + d2;
        const shapeDef = SHAPE_2D6_TABLE[sum];
        const colorDef = COLOR_1D12_TABLE[d12];

        if (shapeText) shapeText.textContent = `${sum} ➔ ${shapeDef.label}`;
        if (colorText) colorText.textContent = `${d12} ➔ ${colorDef.name}`;

        if (callback) callback();
      }
    }, 50);
  } else {
    if (callback) callback();
  }
}

function resetDiceDraftGame() {
  clearCanvas();
  draftedItems = [];

  const die1El = document.getElementById('die-1');
  const die2El = document.getElementById('die-2');
  const dieD12El = document.getElementById('die-d12');
  if (die1El) die1El.textContent = '🎲';
  if (die2El) die2El.textContent = '🎲';
  if (dieD12El) dieD12El.textContent = '🎲';

  const shapeText = document.getElementById('shape-roll-result');
  const colorText = document.getElementById('color-roll-result');
  const banner = document.getElementById('latest-roll-banner');

  if (shapeText) shapeText.textContent = 'Ready to roll';
  if (colorText) colorText.textContent = 'Ready to roll';
  if (banner) banner.style.display = 'none';

  renderDraftedTray();
}

function rollNextElement() {
  if (isRollingDice) return;
  isRollingDice = true;

  const rollBtn = document.getElementById('roll-element-btn');
  if (rollBtn) {
    rollBtn.disabled = true;
    rollBtn.textContent = 'Rolling...';
  }

  const rollShape = roll2D6();
  const rollColor = roll1D12();
  const newItem = createDraftItemFromRoll(rollShape, rollColor);
  draftedItems.push(newItem);

  animateDiceUI(rollShape.d1, rollShape.d2, rollColor.d12, () => {
    isRollingDice = false;
    if (rollBtn) {
      rollBtn.disabled = false;
      rollBtn.textContent = '🎲 Roll Next Element';
    }

    const banner = document.getElementById('latest-roll-banner');
    const bannerText = document.getElementById('latest-roll-text');
    if (banner && bannerText) {
      banner.style.display = 'block';
      const shapeLabel = newItem.shapeType === 'Free Choice' ? '🌟 Free Choice Shape' : newItem.shapeType;
      const colorLabel = newItem.colorName === 'Free Choice' ? '🌈 Free Choice Colour' : newItem.colorName;
      bannerText.textContent = `Rolled: ${shapeLabel} (${colorLabel})! Element #${draftedItems.length}`;
    }

    renderDraftedTray();
  });
}

function placeDraftItem(draftId) {
  const item = draftedItems.find(d => d.id === draftId);
  if (!item) return;

  // If already on canvas, select it
  if (item.layerId) {
    const existing = layers.find(l => l.id === item.layerId);
    if (existing) {
      selectLayer(item.layerId);
      return;
    }
  }

  // Otherwise create new canvas layer
  const resolvedShape = item.shapeType === 'Free Choice' ? item.selectedShape : item.shapeType;
  const resolvedColor = item.colorName === 'Free Choice' ? item.selectedColor : item.colorName;
  const hex = COLOR_HEX_MAP[resolvedColor] || "#ffffff";

  const newLayer = {
    id: Date.now(),
    draftItemId: item.id,
    shape: resolvedShape,
    crossStyle: item.crossStyle,
    crossThickness: item.crossThickness,
    pointsCount: item.starPoints,
    color: resolvedColor,
    hex: hex,
    x: 300,
    y: 200,
    scaleX: resolvedShape === 'Rectangle' ? 1.0 : 0.6,
    scaleY: resolvedShape === 'Rectangle' ? 1.0 : 0.6,
    rotation: 0
  };

  layers.push(newLayer);
  item.layerId = newLayer.id;
  selectedId = newLayer.id;

  render();
  renderDraftedTray();
}

function updateDraftOption(draftId, key, value) {
  const item = draftedItems.find(d => d.id === draftId);
  if (!item) return;

  item[key] = value;

  // If already on canvas, update the active layer
  if (item.layerId) {
    const layer = layers.find(l => l.id === item.layerId);
    if (layer) {
      if (key === 'selectedShape') {
        layer.shape = value;
      } else if (key === 'selectedColor') {
        layer.color = value;
        layer.hex = COLOR_HEX_MAP[value] || "#ffffff";
      } else if (key === 'starPoints') {
        layer.pointsCount = parseInt(value, 10);
      } else if (key === 'crossStyle') {
        layer.crossStyle = value;
      } else if (key === 'crossThickness') {
        layer.crossThickness = parseInt(value, 10);
      }
      render();
    }
  }

  renderDraftedTray();
}

function renderDraftedTray() {
  const tray = document.getElementById('drafted-elements-list');
  const countSpan = document.getElementById('draft-count');
  if (!tray) return;

  if (countSpan) countSpan.textContent = draftedItems.length;

  if (draftedItems.length === 0) {
    tray.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); text-align:center;">No elements drafted yet.</div>';
    return;
  }

  tray.innerHTML = '';

  draftedItems.forEach((item, index) => {
    const isOnCanvas = Boolean(item.layerId && layers.some(l => l.id === item.layerId));
    if (!isOnCanvas) item.layerId = null;

    const card = document.createElement('div');
    card.className = `draft-card ${isOnCanvas ? 'on-canvas' : 'unused'}`;

    const effectiveShape = item.shapeType === 'Free Choice' ? item.selectedShape : item.shapeType;
    const effectiveColor = item.colorName === 'Free Choice' ? item.selectedColor : item.colorName;
    const hex = COLOR_HEX_MAP[effectiveColor] || "#ffffff";

    let shapeDisplayName = item.shapeType;
    if (item.shapeType === 'Free Choice') shapeDisplayName = `🌟 Free Choice`;

    let subControls = '';

    // If shape is Star
    if (effectiveShape === 'Star') {
      subControls += `
        <div class="draft-controls-row">
          <label style="font-size:0.75rem;">Points:</label>
          <select onchange="updateDraftOption(${item.id}, 'starPoints', this.value)">
            <option value="4" ${item.starPoints === 4 ? 'selected' : ''}>4-Pt</option>
            <option value="5" ${item.starPoints === 5 ? 'selected' : ''}>5-Pt</option>
            <option value="6" ${item.starPoints === 6 ? 'selected' : ''}>6-Pt</option>
            <option value="7" ${item.starPoints === 7 ? 'selected' : ''}>7-Pt</option>
            <option value="8" ${item.starPoints === 8 ? 'selected' : ''}>8-Pt</option>
            <option value="12" ${item.starPoints === 12 ? 'selected' : ''}>12-Pt</option>
            <option value="24" ${item.starPoints === 24 ? 'selected' : ''}>24-Pt</option>
          </select>
        </div>
      `;
    }

    // If shape is Cross
    if (effectiveShape === 'Cross') {
      subControls += `
        <div class="draft-controls-row">
          <label style="font-size:0.75rem;">Style:</label>
          <select onchange="updateDraftOption(${item.id}, 'crossStyle', this.value)">
            <option value="regular" ${item.crossStyle === 'regular' ? 'selected' : ''}>Regular</option>
            <option value="saltaire" ${item.crossStyle === 'saltaire' ? 'selected' : ''}>Saltaire</option>
            <option value="nordic" ${item.crossStyle === 'nordic' ? 'selected' : ''}>Nordic</option>
          </select>
          <label style="font-size:0.75rem;">Thick:</label>
          <select onchange="updateDraftOption(${item.id}, 'crossThickness', this.value)">
            <option value="20" ${item.crossThickness === 20 ? 'selected' : ''}>Thin</option>
            <option value="35" ${item.crossThickness === 35 ? 'selected' : ''}>Med</option>
            <option value="50" ${item.crossThickness === 50 ? 'selected' : ''}>Thick</option>
            <option value="70" ${item.crossThickness === 70 ? 'selected' : ''}>Extra</option>
          </select>
        </div>
      `;
    }

    // If shape was 12 (Free Choice Shape)
    if (item.shapeType === 'Free Choice') {
      subControls += `
        <div class="draft-controls-row">
          <label style="font-size:0.75rem;">Choose Shape:</label>
          <select onchange="updateDraftOption(${item.id}, 'selectedShape', this.value)">
            <option value="Rectangle" ${item.selectedShape === 'Rectangle' ? 'selected' : ''}>Rectangle</option>
            <option value="Circle" ${item.selectedShape === 'Circle' ? 'selected' : ''}>Circle</option>
            <option value="Triangle" ${item.selectedShape === 'Triangle' ? 'selected' : ''}>Triangle</option>
            <option value="Star" ${item.selectedShape === 'Star' ? 'selected' : ''}>Star</option>
            <option value="Crescent" ${item.selectedShape === 'Crescent' ? 'selected' : ''}>Crescent</option>
            <option value="Cross" ${item.selectedShape === 'Cross' ? 'selected' : ''}>Cross</option>
          </select>
          <div class="mini-dice-group" title="Rolled Double 6 (2D6 = 12) for Free Shape Choice">
            <span class="mini-d6">6</span>
            <span class="mini-d6">6</span>
            <span class="free-choice-label">Double 6</span>
          </div>
        </div>
      `;
    }

    // If color was 12 (Free Choice Colour)
    if (item.colorName === 'Free Choice') {
      subControls += `
        <div class="draft-controls-row">
          <label style="font-size:0.75rem;">Choose Colour:</label>
          <select onchange="updateDraftOption(${item.id}, 'selectedColor', this.value)">
            ${Object.keys(COLOR_HEX_MAP).map(col => `
              <option value="${col}" ${item.selectedColor === col ? 'selected' : ''}>${col}</option>
            `).join('')}
          </select>
          <div class="mini-dice-group" title="Rolled 12 on D12 for Free Colour Choice">
            <span class="mini-d12">12</span>
            <span class="free-choice-label">Die 12</span>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="draft-card-header">
        <div class="draft-item-info">
          <span class="draft-color-chip" style="background-color: ${hex};"></span>
          <span>#${index + 1}: ${shapeDisplayName} (${effectiveColor})</span>
        </div>
        <span class="draft-status-pill ${isOnCanvas ? 'status-on-canvas' : 'status-unused'}">
          ${isOnCanvas ? '✓ On Canvas' : '⏳ In Tray'}
        </span>
      </div>

      ${subControls}

      <div class="draft-card-footer">
        <div class="draft-dice-badges">
          ${item.shapeType === 'Free Choice' ? `
            <div class="mini-dice-group" title="Rolled Double 6: Free Shape Choice">
              <span class="mini-d6">6</span><span class="mini-d6">6</span>
              <span>Double 6</span>
            </div>
          ` : ''}
          ${item.colorName === 'Free Choice' ? `
            <div class="mini-dice-group" title="Rolled 12 on Colour Die: Free Colour Choice">
              <span class="mini-d12">12</span>
              <span>Die 12</span>
            </div>
          ` : ''}
        </div>
        <button class="draft-action-btn ${isOnCanvas ? 'secondary' : 'primary'}" onclick="placeDraftItem(${item.id})">
          ${isOnCanvas ? '🎯 Select on Canvas' : '+ Place on Canvas'}
        </button>
      </div>
    `;

    tray.appendChild(card);
  });
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
  const input = document.getElementById('country-search');
  if (input) input.classList.remove('highlight-prompt');
  const found = countryList.find(c => c.name.toLowerCase() === (val || '').trim().toLowerCase());
  if (found) {
    currentTarget = found;
    updateTargetPointsDisplay();
  } else if (!val || !val.trim()) {
    currentTarget = null;
    updateTargetPointsDisplay();
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
  if (shape === 'Rectangle') return { w: 400, h: 200 };
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

function duplicateLayer(id, e) {
  if (e) e.stopPropagation();
  const sourceLayer = layers.find(l => l.id === id);
  if (!sourceLayer) return;

  const cloned = JSON.parse(JSON.stringify(sourceLayer));
  cloned.id = Date.now() + Math.floor(Math.random() * 1000);
  // Slight offset so the duplicate is immediately noticeable and draggable
  cloned.x = Math.min(570, (cloned.x || 300) + 15);
  cloned.y = Math.min(370, (cloned.y || 200) + 15);
  delete cloned.draftItemId; // Disconnect draft link for free editing

  const idx = layers.findIndex(l => l.id === id);
  if (idx >= 0) {
    layers.splice(idx + 1, 0, cloned);
  } else {
    layers.push(cloned);
  }

  selectedId = cloned.id;
  render();
}

function duplicateSelectedLayer() {
  if (selectedId !== null) {
    duplicateLayer(selectedId);
  }
}

function deleteLayer(id, e) {
  if (e) e.stopPropagation();
  const deletedLayer = layers.find(l => l.id === id);
  if (deletedLayer && deletedLayer.draftItemId) {
    const draftItem = draftedItems.find(d => d.id === deletedLayer.draftItemId);
    if (draftItem) draftItem.layerId = null;
  }

  layers = layers.filter(l => l.id !== id);
  if (selectedId === id) selectedId = layers.length ? layers[layers.length - 1].id : null;
  render();
  renderDraftedTray();
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
  draftedItems.forEach(item => { item.layerId = null; });
  layers = [];
  selectedId = null;
  activeGuides = [];
  render();
  renderDraftedTray();
}

function render() {
  renderLayers();
  renderGuides();
  renderHandles();
  renderLayerList();
  renderTransformInspector();
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
    const onStartTranslate = (e) => {
      // If 2 or more fingers touch, let svg handle the multi-touch gesture
      if (e.touches && e.touches.length >= 2) {
        return;
      }
      e.stopPropagation();
      selectLayer(layer.id);
      startDrag(e, 'translate');
    };
    elemGroup.onmousedown = onStartTranslate;
    elemGroup.ontouchstart = onStartTranslate;

    if (layer.shape === 'Rectangle') {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', -200); rect.setAttribute('y', -100);
      rect.setAttribute('width', 400); rect.setAttribute('height', 200);
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
    { id: 'nw', x: -hw, y: -hh, cursor: 'nwse-resize', isCorner: true },
    { id: 'n',  x: 0,   y: -hh, cursor: 'ns-resize',   isCorner: false },
    { id: 'ne', x: hw,  y: -hh, cursor: 'nesw-resize', isCorner: true },
    { id: 'e',  x: hw,  y: 0,   cursor: 'ew-resize',   isCorner: false },
    { id: 'se', x: hw,  y: hh,  cursor: 'nwse-resize', isCorner: true },
    { id: 's',  x: 0,   y: hh,  cursor: 'ns-resize',   isCorner: false },
    { id: 'sw', x: -hw, y: hh,  cursor: 'nesw-resize', isCorner: true },
    { id: 'w',  x: -hw, y: 0,   cursor: 'ew-resize',   isCorner: false }
  ];

  nodes.forEach(node => {
    const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Invisible larger touch hit area (36px wide for finger taps)
    const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hitArea.setAttribute('class', 'handle-touch-target');
    hitArea.setAttribute('cx', node.x);
    hitArea.setAttribute('cy', node.y);
    hitArea.setAttribute('r', 18);
    hitArea.style.cursor = node.cursor;

    // Visible handle node
    const nodeShape = document.createElementNS('http://www.w3.org/2000/svg', node.isCorner ? 'rect' : 'circle');
    nodeShape.setAttribute('class', 'handle-node');
    if (node.isCorner) {
      nodeShape.setAttribute('x', node.x - 7);
      nodeShape.setAttribute('y', node.y - 7);
      nodeShape.setAttribute('width', 14);
      nodeShape.setAttribute('height', 14);
      nodeShape.setAttribute('rx', 3);
    } else {
      nodeShape.setAttribute('cx', node.x);
      nodeShape.setAttribute('cy', node.y);
      nodeShape.setAttribute('r', 6.5);
    }
    nodeShape.style.cursor = node.cursor;

    const onStartNode = (e) => {
      if (e.touches && e.touches.length >= 2) return;
      e.stopPropagation();
      startDrag(e, node.id);
    };
    nodeG.onmousedown = onStartNode;
    nodeG.ontouchstart = onStartNode;

    nodeG.appendChild(hitArea);
    nodeG.appendChild(nodeShape);
    handleGroup.appendChild(nodeG);
  });

  // Top rotate stem and enlarged button
  const stemHeight = 36;
  const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  stem.setAttribute('class', 'handle-rotate-stem');
  stem.setAttribute('x1', 0); stem.setAttribute('y1', -hh);
  stem.setAttribute('x2', 0); stem.setAttribute('y2', -hh - stemHeight);
  handleGroup.appendChild(stem);

  const rotateG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  rotateG.setAttribute('transform', `translate(0, ${-hh - stemHeight})`);
  rotateG.style.cursor = 'grab';

  // Invisible larger touch target for rotate button
  const rotHit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  rotHit.setAttribute('class', 'handle-touch-target');
  rotHit.setAttribute('cx', 0); rotHit.setAttribute('cy', 0);
  rotHit.setAttribute('r', 22);

  // Visible rotation disc
  const rotCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  rotCircle.setAttribute('class', 'handle-rotate-btn');
  rotCircle.setAttribute('cx', 0); rotCircle.setAttribute('cy', 0);
  rotCircle.setAttribute('r', 14);

  const rotIcon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  rotIcon.setAttribute('d', 'M -6,1 A 6.5,6.5 0 1,1 6,1 M 2,-3 L 6,1 L 7.5,-3');
  rotIcon.setAttribute('fill', 'none');
  rotIcon.setAttribute('stroke', '#111111');
  rotIcon.setAttribute('stroke-width', '2');
  rotIcon.setAttribute('stroke-linecap', 'round');
  rotIcon.setAttribute('stroke-linejoin', 'round');

  rotateG.appendChild(rotHit);
  rotateG.appendChild(rotCircle);
  rotateG.appendChild(rotIcon);
  const onStartRotate = (e) => {
    if (e.touches && e.touches.length >= 2) return;
    e.stopPropagation();
    startDrag(e, 'rotate');
  };
  rotateG.onmousedown = onStartRotate;
  rotateG.ontouchstart = onStartRotate;
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
        <button onclick="duplicateLayer(${layer.id}, event)" title="Duplicate layer">⧉</button>
        <button onclick="moveLayer(${layer.id}, -1, event)" ${idx === 0 ? 'disabled' : ''} title="Move layer up">▲</button>
        <button onclick="moveLayer(${layer.id}, 1, event)" ${idx === layers.length - 1 ? 'disabled' : ''} title="Move layer down">▼</button>
        <button class="danger" onclick="deleteLayer(${layer.id}, event)" title="Delete layer">✕</button>
      </div>
    `;
    listEl.appendChild(item);
  });
}

// -------------------------------------------------------------
// Transform & Precision Inspector State & Methods
// -------------------------------------------------------------
let currentTransformTab = 'rotate';
let currentNudgeStep = 1;

function switchTransformTab(tabName) {
  currentTransformTab = tabName;
  const tabs = ['rotate', 'size', 'position', 'style'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`tab-content-${t}`);
    if (btn) btn.classList.toggle('active', t === tabName);
    if (content) content.style.display = (t === tabName) ? 'flex' : 'none';
  });
}

function renderTransformInspector() {
  const emptyEl = document.getElementById('transform-empty');
  const activeEl = document.getElementById('transform-active');
  if (!emptyEl || !activeEl) return;

  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) {
    emptyEl.style.display = 'block';
    activeEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  activeEl.style.display = 'flex';

  // Update Header
  const dotEl = document.getElementById('trans-color-dot');
  const nameEl = document.getElementById('trans-shape-name');
  const badgeEl = document.getElementById('trans-layer-badge');
  if (dotEl) dotEl.style.backgroundColor = activeLayer.hex;
  if (nameEl) nameEl.textContent = activeLayer.shape;
  if (badgeEl) {
    const layerIdx = layers.indexOf(activeLayer) + 1;
    badgeEl.textContent = `Layer ${layerIdx} of ${layers.length}`;
  }

  // Update Rotation Tab
  const rotSlider = document.getElementById('rot-slider');
  const rotDisplay = document.getElementById('rot-val-display');
  const rot = Math.round(((activeLayer.rotation % 360) + 360) % 360);
  if (rotSlider) rotSlider.value = rot;
  if (rotDisplay) rotDisplay.textContent = `${rot}°`;

  // Update Size & Stretch Tab
  const sx = Math.abs(activeLayer.scaleX !== undefined ? activeLayer.scaleX : 1);
  const sy = Math.abs(activeLayer.scaleY !== undefined ? activeLayer.scaleY : 1);
  const avgScale = (sx + sy) / 2;

  const uniformSlider = document.getElementById('scale-uniform-slider');
  const uniformDisplay = document.getElementById('scale-val-display');
  if (uniformSlider) uniformSlider.value = avgScale.toFixed(2);
  if (uniformDisplay) uniformDisplay.textContent = `${avgScale.toFixed(2)}x`;

  const scaleXSlider = document.getElementById('scale-x-slider');
  const scaleXDisplay = document.getElementById('scale-x-display');
  if (scaleXSlider) scaleXSlider.value = sx.toFixed(2);
  if (scaleXDisplay) scaleXDisplay.textContent = `${sx.toFixed(2)}x`;

  const scaleYSlider = document.getElementById('scale-y-slider');
  const scaleYDisplay = document.getElementById('scale-y-display');
  if (scaleYSlider) scaleYSlider.value = sy.toFixed(2);
  if (scaleYDisplay) scaleYDisplay.textContent = `${sy.toFixed(2)}x`;

  // Shape specific customizations
  const crossAdjustEl = document.getElementById('cross-custom-adjust');
  if (crossAdjustEl) {
    if (activeLayer.shape === 'Cross') {
      crossAdjustEl.style.display = 'flex';
      const thickVal = activeLayer.crossThickness || 35;
      const thickInput = document.getElementById('selected-cross-thickness');
      const thickDisplay = document.getElementById('cross-thick-val');
      if (thickInput) thickInput.value = thickVal;
      if (thickDisplay) thickDisplay.textContent = `${thickVal}px`;
    } else {
      crossAdjustEl.style.display = 'none';
    }
  }

  const starAdjustEl = document.getElementById('star-custom-adjust');
  if (starAdjustEl) {
    if (activeLayer.shape === 'Star') {
      starAdjustEl.style.display = 'flex';
      const starSelect = document.getElementById('selected-star-points');
      if (starSelect) starSelect.value = String(activeLayer.pointsCount || 5);
    } else {
      starAdjustEl.style.display = 'none';
    }
  }

  // Position Tab Readouts
  const posXDisplay = document.getElementById('pos-x-val');
  const posYDisplay = document.getElementById('pos-y-val');
  if (posXDisplay) posXDisplay.textContent = Math.round(activeLayer.x);
  if (posYDisplay) posYDisplay.textContent = Math.round(activeLayer.y);

  // Recolor Swatches in Style Tab
  renderRecolorPalette(activeLayer);
}

function renderRecolorPalette(activeLayer) {
  const container = document.getElementById('recolor-swatches');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(COLOR_HEX_MAP).forEach(([colorName, hexVal]) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = `color-swatch ${activeLayer.color === colorName ? 'selected' : ''}`;
    swatch.style.backgroundColor = hexVal;
    swatch.title = colorName;
    swatch.onclick = () => recolorSelectedLayer(colorName, hexVal);
    container.appendChild(swatch);
  });
}

function recolorSelectedLayer(colorName, hexVal) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  activeLayer.color = colorName;
  activeLayer.hex = hexVal || COLOR_HEX_MAP[colorName] || '#ce1126';
  render();
}

function deleteSelectedLayer() {
  if (selectedId !== null) {
    deleteLayer(selectedId);
  }
}

// Rotation Controllers
function onRotateSliderInput(val) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  activeLayer.rotation = parseFloat(val) || 0;
  render();
}

function setRotationPreset(deg) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  activeLayer.rotation = ((deg % 360) + 360) % 360;
  render();
}

function adjustRotation(delta) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  activeLayer.rotation = ((Math.round(activeLayer.rotation + delta) % 360) + 360) % 360;
  render();
}

function flipHorizontal() {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  activeLayer.scaleX = -(activeLayer.scaleX !== undefined ? activeLayer.scaleX : 1);
  render();
}

function flipVertical() {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  activeLayer.scaleY = -(activeLayer.scaleY !== undefined ? activeLayer.scaleY : 1);
  render();
}

// Size & Scale Controllers
function onUniformScaleSliderInput(val) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  const num = Math.max(0.05, Math.min(5.0, parseFloat(val) || 1.0));
  const signX = Math.sign(activeLayer.scaleX || 1);
  const signY = Math.sign(activeLayer.scaleY || 1);
  activeLayer.scaleX = signX * num;
  activeLayer.scaleY = signY * num;
  render();
}

function adjustUniformScale(delta) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  const curr = Math.abs(activeLayer.scaleX !== undefined ? activeLayer.scaleX : 1);
  const next = Math.max(0.05, Math.min(5.0, curr + delta));
  const signX = Math.sign(activeLayer.scaleX || 1);
  const signY = Math.sign(activeLayer.scaleY || 1);
  activeLayer.scaleX = signX * next;
  activeLayer.scaleY = signY * next;
  render();
}

function onScaleXSliderInput(val) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  const num = Math.max(0.05, Math.min(5.0, parseFloat(val) || 1.0));
  const signX = Math.sign(activeLayer.scaleX || 1);
  activeLayer.scaleX = signX * num;
  render();
}

function onScaleYSliderInput(val) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  const num = Math.max(0.05, Math.min(5.0, parseFloat(val) || 1.0));
  const signY = Math.sign(activeLayer.scaleY || 1);
  activeLayer.scaleY = signY * num;
  render();
}

function onSelectedCrossThicknessInput(val) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer || activeLayer.shape !== 'Cross') return;
  activeLayer.crossThickness = parseInt(val, 10) || 35;
  render();
}

function onSelectedStarPointsChange(val) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer || activeLayer.shape !== 'Star') return;
  activeLayer.pointsCount = parseInt(val, 10) || 5;
  render();
}

// Nudge & Alignment Controllers
function setNudgeStep(step) {
  currentNudgeStep = step;
  [1, 5, 20].forEach(s => {
    const btn = document.getElementById(`nudge-step-${s}`);
    if (btn) btn.classList.toggle('active', s === step);
  });
}

function nudgeShape(dx, dy) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  activeLayer.x += dx * currentNudgeStep;
  activeLayer.y += dy * currentNudgeStep;
  render();
}

function centerSelectedShape() {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  activeLayer.x = 300;
  activeLayer.y = 200;
  render();
}

function fitToFlagWidth() {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  const base = getShapeBaseDimensions(activeLayer.shape);
  activeLayer.scaleX = 600 / base.w;
  activeLayer.x = 300;
  render();
}

function fitToFlagHeight() {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  const base = getShapeBaseDimensions(activeLayer.shape);
  activeLayer.scaleY = 400 / base.h;
  activeLayer.y = 200;
  render();
}

function fillEntireFlag() {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  const base = getShapeBaseDimensions(activeLayer.shape);
  activeLayer.scaleX = 600 / base.w;
  activeLayer.scaleY = 400 / base.h;
  activeLayer.x = 300;
  activeLayer.y = 200;
  activeLayer.rotation = 0;
  render();
}

function alignShape(dir) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  const base = getShapeBaseDimensions(activeLayer.shape);
  const sx = Math.abs(activeLayer.scaleX !== undefined ? activeLayer.scaleX : 1);
  const sy = Math.abs(activeLayer.scaleY !== undefined ? activeLayer.scaleY : 1);
  const hw = (base.w / 2) * sx;
  const hh = (base.h / 2) * sy;

  if (dir === 'left') activeLayer.x = hw;
  if (dir === 'right') activeLayer.x = 600 - hw;
  if (dir === 'top') activeLayer.y = hh;
  if (dir === 'bottom') activeLayer.y = 400 - hh;
  render();
}

function getSVGPointFromCoord(clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function getSVGPoint(e) {
  if (e.touches && e.touches.length > 0) {
    return getSVGPointFromCoord(e.touches[0].clientX, e.touches[0].clientY);
  }
  return getSVGPointFromCoord(e.clientX, e.clientY);
}

function startDrag(e, mode) {
  if (e.stopPropagation) e.stopPropagation();
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

function handlePointerMove(e) {
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
}

function handlePointerUp() {
  isDragging = false;
  isPinching = false;
  dragMode = null;
  activeGuides = [];
  renderGuides();
}

window.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerUp);

// Multi-touch gestures and touch event handling
const stageEl = document.querySelector('.flag-stage') || svg;

function handleTouchStart(e) {
  if (e.touches.length === 2) {
    // Two-finger pinch & rotate on active shape
    const activeLayer = layers.find(l => l.id === selectedId);
    if (!activeLayer) return;

    if (e.cancelable) e.preventDefault();
    isPinching = true;
    isDragging = false;
    dragMode = null;

    const t1 = getSVGPointFromCoord(e.touches[0].clientX, e.touches[0].clientY);
    const t2 = getSVGPointFromCoord(e.touches[1].clientX, e.touches[1].clientY);

    const dist = Math.hypot(t2.x - t1.x, t2.y - t1.y);
    const angle = Math.atan2(t2.y - t1.y, t2.x - t1.x) * (180 / Math.PI);
    const centerX = (t1.x + t2.x) / 2;
    const centerY = (t1.y + t2.y) / 2;

    pinchStart = {
      dist: dist || 1,
      angle: angle,
      centerX: centerX,
      centerY: centerY,
      layerX: activeLayer.x,
      layerY: activeLayer.y,
      scaleX: activeLayer.scaleX !== undefined ? activeLayer.scaleX : 1,
      scaleY: activeLayer.scaleY !== undefined ? activeLayer.scaleY : 1,
      rotation: activeLayer.rotation
    };
  }
}

function handleTouchMove(e) {
  if (isPinching && e.touches.length === 2) {
    if (e.cancelable) e.preventDefault();
    const activeLayer = layers.find(l => l.id === selectedId);
    if (!activeLayer) return;

    const t1 = getSVGPointFromCoord(e.touches[0].clientX, e.touches[0].clientY);
    const t2 = getSVGPointFromCoord(e.touches[1].clientX, e.touches[1].clientY);

    const currDist = Math.hypot(t2.x - t1.x, t2.y - t1.y);
    const currAngle = Math.atan2(t2.y - t1.y, t2.x - t1.x) * (180 / Math.PI);
    const currCenterX = (t1.x + t2.x) / 2;
    const currCenterY = (t1.y + t2.y) / 2;

    const scaleFactor = currDist / (pinchStart.dist || 1);
    const angleDiff = currAngle - pinchStart.angle;

    // Apply scale smoothly
    activeLayer.scaleX = Math.max(0.05, Math.min(5.0, pinchStart.scaleX * scaleFactor));
    activeLayer.scaleY = Math.max(0.05, Math.min(5.0, pinchStart.scaleY * scaleFactor));

    // Apply rotation with snapping near 0, 45, 90, 180, etc.
    let newRot = (pinchStart.rotation + angleDiff) % 360;
    if (newRot < 0) newRot += 360;

    const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
    const snapThresh = 4;
    for (let snap of snapAngles) {
      if (Math.abs(newRot - snap) <= snapThresh || Math.abs(newRot - snap - 360) <= snapThresh) {
        newRot = snap % 360;
        break;
      }
    }
    activeLayer.rotation = newRot;

    // Translation along with center of pinch
    activeLayer.x = pinchStart.layerX + (currCenterX - pinchStart.centerX);
    activeLayer.y = pinchStart.layerY + (currCenterY - pinchStart.centerY);

    render();
  } else if (isDragging && e.touches.length === 1) {
    if (e.cancelable) e.preventDefault();
    handlePointerMove(e);
  }
}

function handleTouchEnd(e) {
  if (e.touches.length < 2) {
    isPinching = false;
  }
  if (e.touches.length === 0) {
    handlePointerUp();
  }
}

stageEl.addEventListener('touchstart', handleTouchStart, { passive: false });
stageEl.addEventListener('touchmove', handleTouchMove, { passive: false });
stageEl.addEventListener('touchend', handleTouchEnd);
stageEl.addEventListener('touchcancel', handleTouchEnd);

window.addEventListener('touchmove', (e) => {
  if (isPinching || isDragging) {
    handleTouchMove(e);
  }
}, { passive: false });
window.addEventListener('touchend', handleTouchEnd);
window.addEventListener('touchcancel', handleTouchEnd);

function evaluateSubmission() {
  if (!currentTarget) {
    if (currentGameMode === 'dice-draft') {
      const draftInput = document.getElementById('draft-country-select');
      if (draftInput) {
        draftInput.classList.add('highlight-prompt');
        draftInput.focus();
        draftInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      alert("Please select which country's flag you built to test against (under the canvas) before submitting!");
    } else {
      const searchInput = document.getElementById('country-search');
      if (searchInput) {
        searchInput.classList.add('highlight-prompt');
        searchInput.focus();
      }
      alert("Please choose a country from the Country Picker at the top before submitting & scoring!");
    }
    return;
  }

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

      let maxPoints = 20;
      let earnedPoints = Math.round((similarityPct / 100) * maxPoints);
      let draftDetails = null;

      if (currentGameMode === 'dice-draft') {
        const comp = getCountryComplexity(currentTarget.code, currentTarget.name);
        maxPoints = comp.points;
        const accuracyPoints = Math.round((similarityPct / 100) * maxPoints);
        const unusedElements = draftedItems.filter(item => !item.layerId || !layers.some(l => l.id === item.layerId));
        const unusedCount = unusedElements.length;
        const penaltyPerUnused = 5;
        const totalPenalty = unusedCount * penaltyPerUnused;
        earnedPoints = Math.max(0, accuracyPoints - totalPenalty);

        draftDetails = {
          complexity: comp,
          accuracyPoints: accuracyPoints,
          unusedCount: unusedCount,
          totalPenalty: totalPenalty,
          totalDrafted: draftedItems.length
        };
      }

      submitBtn.textContent = 'Submit & Score';
      submitBtn.disabled = false;

      showComparisonModal(canvasUser, canvasOfficial, similarityPct, earnedPoints, maxPoints, draftDetails);
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

function showComparisonModal(userCanvas, officialCanvas, scorePct, points, maxPoints, draftDetails) {
  const modalRoot = document.getElementById('modal-root');

  let breakdownHtml = `<p>You earned <strong>${points} / ${maxPoints}</strong> points.</p>`;

  if (draftDetails) {
    breakdownHtml = `
      <div class="score-breakdown-card">
        <div class="breakdown-row">
          <span>🎯 Flag Complexity:</span>
          <strong>${draftDetails.complexity.badge}</strong>
        </div>
        <div class="breakdown-row">
          <span>📐 Visual Accuracy (${scorePct}%):</span>
          <span style="color:var(--primary); font-weight:700;">+${draftDetails.accuracyPoints} pts</span>
        </div>
        <div class="breakdown-row">
          <span>📦 Unused Drafted Elements (${draftDetails.unusedCount}):</span>
          <span style="color:var(--danger, #ce1126); font-weight:700;">-${draftDetails.totalPenalty} pts</span>
        </div>
        <div class="breakdown-row total-row">
          <span>🏆 Total Final Score:</span>
          <strong style="font-size:1.15rem; color:var(--text-main);">${points} / ${maxPoints} pts</strong>
        </div>
      </div>
    `;
  }

  modalRoot.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>Submission Results: ${currentTarget.name}</h2>
        <div class="score-badge">${scorePct}% Match</div>
        ${breakdownHtml}
        
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