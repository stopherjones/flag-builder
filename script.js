const CORE_FLAG_COLORS = {
  "White": { name: "White", hex: "#ffffff", h: 0, s: 0, l: 100 },
  "Black": { name: "Black", hex: "#000000", h: 0, s: 0, l: 0 },
  "Red": { name: "Red", hex: "#ce1126", h: 353, s: 85, l: 47 },
  "Blue": { name: "Blue", hex: "#0057b7", h: 211, s: 100, l: 36 },
  "Green": { name: "Green", hex: "#009a49", h: 149, s: 100, l: 30 },
  "Yellow": { name: "Yellow", hex: "#fcd116", h: 49, s: 97, l: 54 },
  "Orange": { name: "Orange", hex: "#ff8200", h: 31, s: 100, l: 50 }
};

const COLOR_HEX_MAP = {
  "White": "#ffffff",
  "Black": "#000000",
  "Red": "#ce1126",
  "Blue": "#0057b7",
  "Green": "#009a49",
  "Yellow": "#fcd116",
  "Orange": "#ff8200",
  // Legacy aliases for backward compatibility
  "Deep red": "#8b0000",
  "Deep green": "#006b3c",
  "Deep blue": "#00247d",
  "Light blue": "#5bcefa"
};

// Color Utility Functions
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = val => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsl(hex) {
  if (!hex) return { h: 0, s: 0, l: 100 };
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return { h: 0, s: 0, l: 100 };
  const num = parseInt(c, 16);
  let r = (num >> 16) / 255;
  let g = ((num >> 8) & 255) / 255;
  let b = (num & 255) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

let currentPickerColor = {
  name: "Red",
  h: 353,
  s: 85,
  l: 47,
  hex: "#ce1126"
};
let isHueLockedInDraft = false;
let lockedColorName = "Red";

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

// 1D8 Colour Table with 8 = Free Choice
const COLOR_1D8_TABLE = {
  1: { name: "White", hex: "#ffffff", h: 0, s: 0, l: 100 },
  2: { name: "Black", hex: "#000000", h: 0, s: 0, l: 0 },
  3: { name: "Red", hex: "#ce1126", h: 353, s: 85, l: 47 },
  4: { name: "Blue", hex: "#0057b7", h: 211, s: 100, l: 36 },
  5: { name: "Green", hex: "#009a49", h: 149, s: 100, l: 30 },
  6: { name: "Yellow", hex: "#fcd116", h: 49, s: 97, l: 54 },
  7: { name: "Orange", hex: "#ff8200", h: 31, s: 100, l: 50 },
  8: { name: "Free Choice", hex: "#d99b26", h: 40, s: 80, l: 50 }
};

// Backward-compatibility alias
const COLOR_1D12_TABLE = COLOR_1D8_TABLE;

// Complexity tiers for target countries
const HIGH_COMPLEXITY_COUNTRIES = [
  "us", "au", "nz", "br", "mx", "es", "za", "ar", "uy", "ca", "ke", "in", 
  "lk", "eg", "hr", "pt", "kr", "pg", "ec", "py", "bo", "sv", "gt", "hn", 
  "ni", "af", "al", "ad", "ao", "bt", "kh", "dm", "sz", "me", "mz", "ug", "zw",
  "ki", "vu", "tv", "sm", "va", "gq", "ss", "tm", "gd"
];

const MEDIUM_COMPLEXITY_COUNTRIES = [
  "se", "no", "dk", "fi", "is", "gr", "ch", "gb", "cz", "cu", "jo", "kw", 
  "jm", "bs", "cl", "tr", "vn", "so", "gh", "sn", "cm", "my", "pk", "dz", 
  "tn", "ly", "sg", "il", "pa", "sr", "ge", "bb", "kn", "vc", "lc",
  "mh", "nr", "ag", "cv", "km", "sb", "sc", "st", "ws", "gy", "ls", "gw",
  "er", "tl", "cd", "kg", "tj", "li", "xk", "ps"
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
  { name: "Antigua and Barbuda", code: "ag" },
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
  { name: "Cabo Verde", code: "cv" },
  { name: "Cambodia", code: "kh" },
  { name: "Cameroon", code: "cm" },
  { name: "Canada", code: "ca" },
  { name: "Central African Republic", code: "cf" },
  { name: "Chad", code: "td" },
  { name: "Chile", code: "cl" },
  { name: "China", code: "cn" },
  { name: "Colombia", code: "co" },
  { name: "Comoros", code: "km" },
  { name: "Costa Rica", code: "cr" },
  { name: "Croatia", code: "hr" },
  { name: "Cuba", code: "cu" },
  { name: "Cyprus", code: "cy" },
  { name: "Czech Republic", code: "cz" },
  { name: "Democratic Republic of the Congo", code: "cd" },
  { name: "Denmark", code: "dk" },
  { name: "Djibouti", code: "dj" },
  { name: "Dominica", code: "dm" },
  { name: "Dominican Republic", code: "do" },
  { name: "Ecuador", code: "ec" },
  { name: "Egypt", code: "eg" },
  { name: "El Salvador", code: "sv" },
  { name: "Equatorial Guinea", code: "gq" },
  { name: "Eritrea", code: "er" },
  { name: "Estonia", code: "ee" },
  { name: "Eswatini", code: "sz" },
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
  { name: "Grenada", code: "gd" },
  { name: "Guatemala", code: "gt" },
  { name: "Guinea", code: "gn" },
  { name: "Guinea-Bissau", code: "gw" },
  { name: "Guyana", code: "gy" },
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
  { name: "Ivory Coast", code: "ci" },
  { name: "Jamaica", code: "jm" },
  { name: "Japan", code: "jp" },
  { name: "Jordan", code: "jo" },
  { name: "Kazakhstan", code: "kz" },
  { name: "Kenya", code: "ke" },
  { name: "Kiribati", code: "ki" },
  { name: "Kosovo", code: "xk" },
  { name: "Kuwait", code: "kw" },
  { name: "Kyrgyzstan", code: "kg" },
  { name: "Laos", code: "la" },
  { name: "Latvia", code: "lv" },
  { name: "Lebanon", code: "lb" },
  { name: "Lesotho", code: "ls" },
  { name: "Liberia", code: "lr" },
  { name: "Libya", code: "ly" },
  { name: "Liechtenstein", code: "li" },
  { name: "Lithuania", code: "lt" },
  { name: "Luxembourg", code: "lu" },
  { name: "Madagascar", code: "mg" },
  { name: "Malawi", code: "mw" },
  { name: "Malaysia", code: "my" },
  { name: "Maldives", code: "mv" },
  { name: "Mali", code: "ml" },
  { name: "Malta", code: "mt" },
  { name: "Marshall Islands", code: "mh" },
  { name: "Mauritania", code: "mr" },
  { name: "Mauritius", code: "mu" },
  { name: "Mexico", code: "mx" },
  { name: "Micronesia", code: "fm" },
  { name: "Moldova", code: "md" },
  { name: "Monaco", code: "mc" },
  { name: "Mongolia", code: "mn" },
  { name: "Montenegro", code: "me" },
  { name: "Morocco", code: "ma" },
  { name: "Mozambique", code: "mz" },
  { name: "Myanmar", code: "mm" },
  { name: "Namibia", code: "na" },
  { name: "Nauru", code: "nr" },
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
  { name: "Palau", code: "pw" },
  { name: "Palestine", code: "ps" },
  { name: "Panama", code: "pa" },
  { name: "Papua New Guinea", code: "pg" },
  { name: "Paraguay", code: "py" },
  { name: "Peru", code: "pe" },
  { name: "Philippines", code: "ph" },
  { name: "Poland", code: "pl" },
  { name: "Portugal", code: "pt" },
  { name: "Qatar", code: "qa" },
  { name: "Republic of the Congo", code: "cg" },
  { name: "Romania", code: "ro" },
  { name: "Russia", code: "ru" },
  { name: "Rwanda", code: "rw" },
  { name: "Saint Kitts and Nevis", code: "kn" },
  { name: "Saint Lucia", code: "lc" },
  { name: "Saint Vincent and the Grenadines", code: "vc" },
  { name: "Samoa", code: "ws" },
  { name: "San Marino", code: "sm" },
  { name: "Sao Tome and Principe", code: "st" },
  { name: "Saudi Arabia", code: "sa" },
  { name: "Senegal", code: "sn" },
  { name: "Serbia", code: "rs" },
  { name: "Seychelles", code: "sc" },
  { name: "Sierra Leone", code: "sl" },
  { name: "Singapore", code: "sg" },
  { name: "Slovakia", code: "sk" },
  { name: "Slovenia", code: "si" },
  { name: "Solomon Islands", code: "sb" },
  { name: "Somalia", code: "so" },
  { name: "South Africa", code: "za" },
  { name: "South Korea", code: "kr" },
  { name: "South Sudan", code: "ss" },
  { name: "Spain", code: "es" },
  { name: "Sri Lanka", code: "lk" },
  { name: "Sudan", code: "sd" },
  { name: "Suriname", code: "sr" },
  { name: "Sweden", code: "se" },
  { name: "Switzerland", code: "ch" },
  { name: "Syria", code: "sy" },
  { name: "Taiwan", code: "tw" },
  { name: "Tajikistan", code: "tj" },
  { name: "Tanzania", code: "tz" },
  { name: "Thailand", code: "th" },
  { name: "Timor-Leste", code: "tl" },
  { name: "Togo", code: "tg" },
  { name: "Tonga", code: "to" },
  { name: "Trinidad and Tobago", code: "tt" },
  { name: "Tunisia", code: "tn" },
  { name: "Turkey", code: "tr" },
  { name: "Turkmenistan", code: "tm" },
  { name: "Tuvalu", code: "tv" },
  { name: "Uganda", code: "ug" },
  { name: "Ukraine", code: "ua" },
  { name: "United Arab Emirates", code: "ae" },
  { name: "United Kingdom", code: "gb" },
  { name: "United States", code: "us" },
  { name: "Uruguay", code: "uy" },
  { name: "Uzbekistan", code: "uz" },
  { name: "Vanuatu", code: "vu" },
  { name: "Vatican City", code: "va" },
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
    isHueLockedInDraft = false;
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
    isHueLockedInDraft = false;
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
    isHueLockedInDraft = true;
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

  const dupBtn = document.getElementById('trans-duplicate-btn');
  if (dupBtn) {
    dupBtn.style.display = (mode === 'dice-draft') ? 'none' : 'inline-block';
  }

  updateColorPickerLockState();
  updateTargetPointsDisplay();
  renderLayerList();
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

function roll1D8() {
  const d8 = Math.floor(Math.random() * 8) + 1;
  const colorDef = COLOR_1D8_TABLE[d8] || COLOR_1D8_TABLE[3];
  return {
    d8,
    color: colorDef.name,
    hex: colorDef.hex,
    h: colorDef.h,
    s: colorDef.s,
    l: colorDef.l
  };
}

// Backward-compatibility alias
function roll1D12() {
  return roll1D8();
}

function createDraftItemFromRoll(rollShape, rollColor) {
  const isFreeChoice = (rollColor.d8 === 8 || rollColor.color === 'Free Choice');
  const baseHue = rollColor.h !== undefined ? rollColor.h : 353;
  const baseSat = rollColor.s !== undefined ? rollColor.s : 85;
  const baseLight = rollColor.l !== undefined ? rollColor.l : 47;
  const baseHex = rollColor.hex || hslToHex(baseHue, baseSat, baseLight);

  return {
    id: Date.now() + Math.floor(Math.random() * 100000),
    roll2d6: rollShape.sum,
    die1: rollShape.d1,
    die2: rollShape.d2,
    shapeType: rollShape.shape,
    selectedShape: (rollShape.shape === 'Free Choice' ? 'Rectangle' : rollShape.shape),
    roll1d8: rollColor.d8,
    colorName: rollColor.color,
    selectedColor: (isFreeChoice ? 'Red' : rollColor.color),
    hue: baseHue,
    saturation: baseSat,
    lightness: baseLight,
    hex: baseHex,
    isHueLocked: !isFreeChoice,
    starPoints: 5,
    crossStyle: 'regular',
    crossThickness: 35,
    chargeId: 'ar',
    layerId: null
  };
}

let isStartingBasePending = true;

function animateStartingRectangleRoll(d8, callback) {
  const die1El = document.getElementById('die-1');
  const die2El = document.getElementById('die-2');
  const dieD8El = document.getElementById('die-d8') || document.getElementById('die-d12');

  const shapeText = document.getElementById('shape-roll-result');
  const colorText = document.getElementById('color-roll-result');

  if (die1El) die1El.textContent = '█';
  if (die2El) die2El.textContent = '█';
  if (shapeText) shapeText.textContent = '█ Base Rectangle (Fixed)';

  if (dieD8El) {
    dieD8El.classList.add('rolling');
    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      dieD8El.textContent = Math.floor(Math.random() * 8) + 1;
      if (counter > 8) {
        clearInterval(interval);
        dieD8El.textContent = d8;
        dieD8El.classList.remove('rolling');

        const colorDef = COLOR_1D8_TABLE[d8];
        if (colorText) {
          if (d8 === 8) {
            colorText.textContent = `8 ➔ 🌟 Free Choice!`;
          } else if (colorDef.name === 'White' || colorDef.name === 'Black') {
            colorText.textContent = `${d8} ➔ ${colorDef.name} (Pure tone)`;
          } else {
            colorText.textContent = `${d8} ➔ ${colorDef.name} (Light/Sat)`;
          }
        }

        if (callback) callback();
      }
    }, 50);
  } else {
    if (callback) callback();
  }
}

function animateDiceUI(d1, d2, d8, callback) {
  const die1El = document.getElementById('die-1');
  const die2El = document.getElementById('die-2');
  const dieD8El = document.getElementById('die-d8') || document.getElementById('die-d12');

  const shapeText = document.getElementById('shape-roll-result');
  const colorText = document.getElementById('color-roll-result');

  if (die1El && die2El && dieD8El) {
    die1El.classList.add('rolling');
    die2El.classList.add('rolling');
    dieD8El.classList.add('rolling');

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      die1El.textContent = Math.floor(Math.random() * 6) + 1;
      die2El.textContent = Math.floor(Math.random() * 6) + 1;
      dieD8El.textContent = Math.floor(Math.random() * 8) + 1;
      if (counter > 8) {
        clearInterval(interval);
        die1El.textContent = d1;
        die2El.textContent = d2;
        dieD8El.textContent = d8;
        die1El.classList.remove('rolling');
        die2El.classList.remove('rolling');
        dieD8El.classList.remove('rolling');

        const sum = d1 + d2;
        const shapeDef = SHAPE_2D6_TABLE[sum];
        const colorDef = COLOR_1D8_TABLE[d8];

        if (shapeText) shapeText.textContent = `${sum} ➔ ${shapeDef.label}`;
        if (colorText) {
          if (d8 === 8) {
            colorText.textContent = `8 ➔ 🌟 Free Choice!`;
          } else if (colorDef.name === 'White' || colorDef.name === 'Black') {
            colorText.textContent = `${d8} ➔ ${colorDef.name} (Pure tone)`;
          } else {
            colorText.textContent = `${d8} ➔ ${colorDef.name} (Light/Sat)`;
          }
        }

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
  isStartingBasePending = true;

  const die1El = document.getElementById('die-1');
  const die2El = document.getElementById('die-2');
  const dieD8El = document.getElementById('die-d8') || document.getElementById('die-d12');
  if (die1El) die1El.textContent = '█';
  if (die2El) die2El.textContent = '█';
  if (dieD8El) dieD8El.textContent = '🎲';

  const shapeLabel = document.getElementById('shape-dice-label');
  if (shapeLabel) shapeLabel.textContent = 'Shape (Starting Base)';

  const shapeText = document.getElementById('shape-roll-result');
  const colorText = document.getElementById('color-roll-result');
  const banner = document.getElementById('latest-roll-banner');
  const rollBtn = document.getElementById('roll-element-btn');

  if (shapeText) shapeText.textContent = '█ Base Rectangle (Fixed)';
  if (colorText) colorText.textContent = 'Ready to roll colour (1D8)';
  if (banner) banner.style.display = 'none';

  if (rollBtn) {
    rollBtn.disabled = false;
    rollBtn.textContent = '🎲 Roll Colour for Starting Rectangle (1D8)';
  }

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

  if (isStartingBasePending) {
    const rollColor = roll1D8();
    animateStartingRectangleRoll(rollColor.d8, () => {
      isRollingDice = false;
      isStartingBasePending = false;

      const isFreeChoice = (rollColor.d8 === 8 || rollColor.color === 'Free Choice');
      const startItem = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        roll2d6: 12,
        die1: 6,
        die2: 6,
        shapeType: 'Rectangle',
        shapeLabel: '█ Rectangle (Starting Base)',
        selectedShape: 'Rectangle',
        roll1d8: rollColor.d8,
        colorName: rollColor.color,
        selectedColor: (isFreeChoice ? 'Red' : rollColor.color),
        hue: rollColor.h,
        saturation: rollColor.s,
        lightness: rollColor.l,
        hex: rollColor.hex,
        isHueLocked: !isFreeChoice,
        isStartingRectangle: true,
        starPoints: 5,
        crossStyle: 'regular',
        crossThickness: 35,
        chargeId: 'ar',
        layerId: null
      };
      draftedItems.push(startItem);

      // Automatically place the starting rectangle on the canvas as Layer 1
      const baseLayer = {
        id: Date.now(),
        draftItemId: startItem.id,
        shape: 'Rectangle',
        color: startItem.colorName === 'Free Choice' ? startItem.selectedColor : startItem.colorName,
        hue: startItem.hue,
        saturation: startItem.saturation,
        lightness: startItem.lightness,
        hex: startItem.hex,
        isHueLocked: startItem.isHueLocked,
        x: 300,
        y: 200,
        scaleX: 1.0,
        scaleY: 1.0,
        rotation: 0
      };
      layers.push(baseLayer);
      startItem.layerId = baseLayer.id;
      selectedId = baseLayer.id;
      render();

      if (rollBtn) {
        rollBtn.disabled = false;
        rollBtn.textContent = '🎲 Roll Next Element (2D6 + 1D8)';
      }

      const shapeLabel = document.getElementById('shape-dice-label');
      if (shapeLabel) shapeLabel.textContent = 'Shape (2D6)';

      const banner = document.getElementById('latest-roll-banner');
      const bannerText = document.getElementById('latest-roll-text');
      if (banner && bannerText) {
        banner.style.display = 'block';
        const colorLabel = startItem.colorName === 'Free Choice' ? '🌟 Free Choice Colour' : `${startItem.colorName}`;
        bannerText.innerHTML = `Starting Base Placed: <strong>Rectangle (${colorLabel})</strong>! Now roll additional pieces or adjust.`;
      }

      renderDraftedTray();
    });
    return;
  }

  const rollShape = roll2D6();
  const rollColor = roll1D8();
  const newItem = createDraftItemFromRoll(rollShape, rollColor);
  draftedItems.push(newItem);

  animateDiceUI(rollShape.d1, rollShape.d2, rollColor.d8, () => {
    isRollingDice = false;
    if (rollBtn) {
      rollBtn.disabled = false;
      rollBtn.textContent = '🎲 Roll Next Element (2D6 + 1D8)';
    }

    const banner = document.getElementById('latest-roll-banner');
    const bannerText = document.getElementById('latest-roll-text');
    if (banner && bannerText) {
      banner.style.display = 'block';
      const shapeLabel = newItem.shapeType === 'Free Choice' ? '🌟 Free Choice Shape' : newItem.shapeType;
      const colorLabel = newItem.colorName === 'Free Choice' ? '🌈 Free Choice Colour (Unrestricted)' : `${newItem.colorName}`;
      bannerText.innerHTML = `Rolled: <strong>${shapeLabel}</strong> + <strong>${colorLabel}</strong>! Element #${draftedItems.length}`;
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
  const hex = item.hex || hslToHex(item.hue, item.saturation, item.lightness);
  const chargeData = resolvedShape === 'Charge' ? getChargeById(item.chargeId || 'es') : null;

  const newLayer = {
    id: Date.now(),
    draftItemId: item.id,
    shape: resolvedShape,
    chargeId: chargeData ? chargeData.code : null,
    chargeName: chargeData ? chargeData.name : null,
    viewBox: chargeData ? chargeData.viewBox : '0 0 100 100',
    svgInnerContent: '',
    baseWidth: chargeData ? chargeData.defaultWidth : 160,
    baseHeight: chargeData ? chargeData.defaultHeight : 160,
    crossStyle: item.crossStyle,
    crossThickness: item.crossThickness,
    pointsCount: item.starPoints,
    color: resolvedColor,
    hue: item.hue,
    saturation: item.saturation,
    lightness: item.lightness,
    hex: hex,
    isHueLocked: item.isHueLocked,
    x: 300,
    y: 200,
    scaleX: resolvedShape === 'Rectangle' ? 1.0 : 0.6,
    scaleY: resolvedShape === 'Rectangle' ? 1.0 : 0.6,
    rotation: 0
  };

  if (chargeData && typeof loadChargeSvg === 'function') {
    loadChargeSvg(chargeData.code).then(rawSvg => {
      if (rawSvg) {
        const prep = prepareSvgForLayer(rawSvg, newLayer.id);
        newLayer.viewBox = prep.viewBox;
        newLayer.svgInnerContent = prep.inner;
        renderLayers();
      }
    });
  }

  layers.push(newLayer);
  item.layerId = newLayer.id;
  selectedId = newLayer.id;

  render();
  renderDraftedTray();
}

function updateDraftLightness(draftId, val) {
  const item = draftedItems.find(d => d.id === draftId);
  if (!item) return;
  const num = parseInt(val, 10);
  item.lightness = num;
  item.hex = hslToHex(item.hue !== undefined ? item.hue : 0, item.saturation !== undefined ? item.saturation : 85, num);

  const display = document.getElementById(`draft-item-l-${draftId}`);
  if (display) display.textContent = `${num}%`;

  const chip = document.getElementById(`draft-chip-${draftId}`);
  if (chip) chip.style.backgroundColor = item.hex;

  if (item.layerId) {
    const layer = layers.find(l => l.id === item.layerId);
    if (layer) {
      layer.lightness = num;
      layer.hex = item.hex;
      render();
    }
  }
}

function updateDraftSaturation(draftId, val) {
  const item = draftedItems.find(d => d.id === draftId);
  if (!item) return;
  const num = parseInt(val, 10);
  item.saturation = num;
  item.hex = hslToHex(item.hue !== undefined ? item.hue : 0, num, item.lightness !== undefined ? item.lightness : 50);

  const display = document.getElementById(`draft-item-s-${draftId}`);
  if (display) display.textContent = `${num}%`;

  const chip = document.getElementById(`draft-chip-${draftId}`);
  if (chip) chip.style.backgroundColor = item.hex;

  if (item.layerId) {
    const layer = layers.find(l => l.id === item.layerId);
    if (layer) {
      layer.saturation = num;
      layer.hex = item.hex;
      render();
    }
  }
}

function updateDraftOption(draftId, key, value) {
  const item = draftedItems.find(d => d.id === draftId);
  if (!item) return;

  item[key] = value;

  if (key === 'selectedColor') {
    const def = CORE_FLAG_COLORS[value] || { hex: COLOR_HEX_MAP[value] || '#ce1126', h: 353, s: 85, l: 47 };
    item.hue = def.h;
    item.saturation = def.s;
    item.lightness = def.l;
    item.hex = def.hex;
    const chip = document.getElementById(`draft-chip-${draftId}`);
    if (chip) chip.style.backgroundColor = item.hex;
  }

  // If already on canvas, update the active layer
  if (item.layerId) {
    const layer = layers.find(l => l.id === item.layerId);
    if (layer) {
      if (key === 'selectedShape') {
        layer.shape = value;
        if (value === 'Charge') {
          const ch = getChargeById(item.chargeId || 'es');
          layer.chargeId = ch.code;
          layer.chargeName = ch.name;
          layer.baseWidth = ch.defaultWidth;
          layer.baseHeight = ch.defaultHeight;
          layer.viewBox = ch.viewBox;
          layer.svgInnerContent = '';
          if (typeof loadChargeSvg === 'function') {
            loadChargeSvg(ch.code).then(rawSvg => {
              if (rawSvg) {
                const prep = prepareSvgForLayer(rawSvg, layer.id);
                layer.viewBox = prep.viewBox;
                layer.svgInnerContent = prep.inner;
                renderLayers();
              }
            });
          }
        }
      } else if (key === 'chargeId') {
        const ch = getChargeById(value);
        layer.chargeId = ch.code;
        layer.chargeName = ch.name;
        layer.baseWidth = ch.defaultWidth;
        layer.baseHeight = ch.defaultHeight;
        layer.viewBox = ch.viewBox;
        layer.svgInnerContent = '';
        if (typeof loadChargeSvg === 'function') {
          loadChargeSvg(ch.code).then(rawSvg => {
            if (rawSvg) {
              const prep = prepareSvgForLayer(rawSvg, layer.id);
              layer.viewBox = prep.viewBox;
              layer.svgInnerContent = prep.inner;
              renderLayers();
            }
          });
        }
      } else if (key === 'selectedColor') {
        layer.color = value;
        layer.hue = item.hue;
        layer.saturation = item.saturation;
        layer.lightness = item.lightness;
        layer.hex = item.hex;
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
    tray.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); text-align:center;">No elements drafted yet. Roll above!</div>';
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
    const hex = item.hex || hslToHex(item.hue, item.saturation, item.lightness);

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

    // If shape is Charge (or chosen via Free Choice)
    if (effectiveShape === 'Charge') {
      subControls += `
        <div class="draft-controls-row">
          <label style="font-size:0.75rem;">Charge:</label>
          <select onchange="updateDraftOption(${item.id}, 'chargeId', this.value)">
            ${(typeof COUNTRY_CHARGES !== 'undefined' ? COUNTRY_CHARGES : (typeof FLAG_CHARGES !== 'undefined' ? FLAG_CHARGES : [])).map(ch => `
              <option value="${ch.code}" ${item.chargeId === ch.code ? 'selected' : ''}>${ch.name}</option>
            `).join('')}
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
            <option value="Charge" ${item.selectedShape === 'Charge' ? 'selected' : ''}>🎖️ Flag Charge</option>
          </select>
          <div class="mini-dice-group" title="Rolled Double 6 (2D6 = 12) for Free Shape Choice">
            <span class="mini-d6">6</span>
            <span class="mini-d6">6</span>
            <span class="free-choice-label">Double 6</span>
          </div>
        </div>
      `;
    }

    // If color was 8 (Free Choice Colour)
    if (item.colorName === 'Free Choice') {
      subControls += `
        <div class="draft-controls-row">
          <label style="font-size:0.75rem;">Free Colour:</label>
          <select onchange="updateDraftOption(${item.id}, 'selectedColor', this.value)">
            ${Object.keys(CORE_FLAG_COLORS).map(col => `
              <option value="${col}" ${item.selectedColor === col ? 'selected' : ''}>${col}</option>
            `).join('')}
          </select>
          <div class="mini-dice-group" title="Rolled 8 on D8 for Free Colour Choice">
            <span class="mini-d8">8</span>
            <span class="free-choice-label">Die 8 (Free Choice)</span>
          </div>
        </div>
      `;
    }

    // Dedicated Lightness and Saturation Sliders in card (omitted for Black and White)
    const isAchromatic = (effectiveColor === 'Black' || effectiveColor === 'White');
    if (isAchromatic) {
      subControls += `
        <div class="achromatic-badge">
          <span>Fixed tone: Pure ${effectiveColor} (no lightness / saturation sliders)</span>
        </div>
      `;
    } else {
      subControls += `
        <div class="draft-slider-row" style="display:flex; flex-direction:column; gap:0.25rem; margin-top:0.35rem; background:rgba(0,0,0,0.2); padding:0.4rem 0.5rem; border-radius:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem;">
            <span style="color:var(--text-muted);">Lightness:</span>
            <strong id="draft-item-l-${item.id}" style="color:var(--text-main); font-weight:700;">${item.lightness !== undefined ? item.lightness : 50}%</strong>
          </div>
          <input type="range" min="0" max="100" value="${item.lightness !== undefined ? item.lightness : 50}" oninput="updateDraftLightness(${item.id}, this.value)" style="width:100%; height:14px; accent-color:var(--accent);">

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; margin-top:0.15rem;">
            <span style="color:var(--text-muted);">Saturation:</span>
            <strong id="draft-item-s-${item.id}" style="color:var(--text-main); font-weight:700;">${item.saturation !== undefined ? item.saturation : 85}%</strong>
          </div>
          <input type="range" min="0" max="100" value="${item.saturation !== undefined ? item.saturation : 85}" oninput="updateDraftSaturation(${item.id}, this.value)" style="width:100%; height:14px; accent-color:var(--accent);">
        </div>
      `;
    }

    const isCovered = Boolean(isOnCanvas && item.isOccluded);
    card.className = `draft-card ${isOnCanvas ? (isCovered ? 'occluded' : 'on-canvas') : 'unused'}`;

    let statusPillHtml = '';
    if (!isOnCanvas) {
      statusPillHtml = `<span class="draft-status-pill status-unused">⏳ In Tray (-5 pts)</span>`;
    } else if (isCovered) {
      statusPillHtml = `<span class="draft-status-pill status-occluded" title="This shape is completely covered by other layers or off-canvas and counts as unused!">⚠️ Hidden / Covered (-5 pts)</span>`;
    } else {
      statusPillHtml = `<span class="draft-status-pill status-on-canvas">✓ Visible on Flag</span>`;
    }

    const discardBtnHtml = (!item.isStartingRectangle && isOnCanvas) ? `
      <button type="button" class="discard-btn" onclick="discardDraftItem(${item.id})" title="Remove from canvas (-5 pts penalty)">🗑️ Discard</button>
    ` : '';

    card.innerHTML = `
      <div class="draft-card-header">
        <div class="draft-item-info">
          <span id="draft-chip-${item.id}" class="draft-color-chip" style="background-color: ${hex};"></span>
          <span>#${index + 1}: ${shapeDisplayName} (${effectiveColor})</span>
        </div>
        <div style="display:flex; align-items:center; gap:0.25rem;">
          ${discardBtnHtml}
          ${statusPillHtml}
        </div>
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
            <div class="mini-dice-group" title="Rolled 8 on Colour Die: Free Colour Choice">
              <span class="mini-d8">8</span>
              <span>Die 8 Free</span>
            </div>
          ` : `
            <div class="mini-dice-group" title="Rolled ${item.roll1d8} on 1D8: ${item.colorName}">
              <span class="mini-d8">${item.roll1d8}</span>
              <span>${item.colorName}</span>
            </div>
          `}
        </div>
        <button class="draft-action-btn ${isOnCanvas ? 'secondary' : 'primary'}" onclick="placeDraftItem(${item.id})">
          ${isOnCanvas ? '🎯 Select on Canvas' : '+ Place on Canvas'}
        </button>
      </div>
    `;

    tray.appendChild(card);
  });
}

function discardDraftItem(draftId) {
  const item = draftedItems.find(d => d.id === draftId);
  if (!item) return;
  if (item.layerId) {
    const idx = layers.findIndex(l => l.id === item.layerId);
    if (idx >= 0) layers.splice(idx, 1);
    if (selectedId === item.layerId) selectedId = null;
    item.layerId = null;
    item.isOccluded = false;
    render();
  }
  renderDraftedTray();
}

function setupCustomCombobox(config) {
  const { inputId, toggleBtnId, dropdownId, onSelect, getItems } = config;
  const inputEl = document.getElementById(inputId);
  const toggleBtn = document.getElementById(toggleBtnId);
  const dropdownEl = document.getElementById(dropdownId);
  if (!inputEl || !dropdownEl) return;

  let highlightedIndex = -1;
  let currentFilteredList = [];
  const getSourceList = typeof getItems === 'function' ? getItems : () => countryList;

  function renderDropdown(items, query) {
    currentFilteredList = items;
    highlightedIndex = items.length > 0 ? 0 : -1;
    dropdownEl.innerHTML = '';

    if (!items.length) {
      dropdownEl.innerHTML = `<div class="combobox-empty">No countries match "${query || ''}"</div>`;
      dropdownEl.style.display = 'block';
      return;
    }

    const qLower = (query || '').trim().toLowerCase();

    items.forEach((country, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = `combobox-item ${idx === 0 ? 'focused' : ''}`;
      itemEl.setAttribute('role', 'option');

      let nameHtml = country.name;
      if (qLower) {
        const mIdx = country.name.toLowerCase().indexOf(qLower);
        if (mIdx >= 0) {
          nameHtml = country.name.substring(0, mIdx) +
            `<strong>${country.name.substring(mIdx, mIdx + qLower.length)}</strong>` +
            country.name.substring(mIdx + qLower.length);
        }
      }

      itemEl.innerHTML = `
        <span class="combobox-item-name">${nameHtml}</span>
      `;

      const selectAction = (e) => {
        e.preventDefault();
        e.stopPropagation();
        inputEl.value = country.name;
        closeDropdown();
        if (typeof onSelect === 'function') onSelect(country.name, country);
      };

      itemEl.addEventListener('pointerdown', selectAction);
      itemEl.addEventListener('mousedown', selectAction);
      dropdownEl.appendChild(itemEl);
    });

    dropdownEl.style.display = 'block';
  }

  function filterAndShow(query) {
    const sourceList = getSourceList();
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      renderDropdown(sourceList, '');
      return;
    }

    const prefixMatches = [];
    const otherMatches = [];

    // Also support 'st.' or 'st ' prefix matching for 'saint'
    const normQ = q.replace(/^st\.?\s+/i, 'saint ');

    sourceList.forEach(c => {
      const lower = c.name.toLowerCase();
      const normName = lower.replace(/^saint\s+/i, 'st ');
      if (lower.startsWith(q) || lower.startsWith(normQ)) {
        prefixMatches.push(c);
      } else if (lower.includes(q) || lower.includes(normQ) || normName.includes(q)) {
        otherMatches.push(c);
      }
    });

    renderDropdown([...prefixMatches, ...otherMatches], q);
  }

  function closeDropdown() {
    dropdownEl.style.display = 'none';
    highlightedIndex = -1;
  }

  function openDropdown() {
    filterAndShow(inputEl.value);
  }

  if (toggleBtn) {
    const handleToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropdownEl.style.display === 'block') {
        closeDropdown();
      } else {
        inputEl.focus();
        openDropdown();
      }
    };
    toggleBtn.addEventListener('pointerdown', handleToggle);
    toggleBtn.addEventListener('click', handleToggle);
  }

  inputEl.addEventListener('input', () => {
    filterAndShow(inputEl.value);
    if (typeof onSelect === 'function') onSelect(inputEl.value, null);
  });

  inputEl.addEventListener('focus', () => {
    openDropdown();
  });

  inputEl.addEventListener('keydown', (e) => {
    if (dropdownEl.style.display !== 'block') {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        openDropdown();
        e.preventDefault();
      }
      return;
    }

    const items = dropdownEl.querySelectorAll('.combobox-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightedIndex = (highlightedIndex + 1) % items.length;
      updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
      updateHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && currentFilteredList[highlightedIndex]) {
        const sel = currentFilteredList[highlightedIndex];
        inputEl.value = sel.name;
        closeDropdown();
        if (typeof onSelect === 'function') onSelect(sel.name, sel);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  function updateHighlight(items) {
    items.forEach((el, idx) => {
      el.classList.toggle('focused', idx === highlightedIndex);
      if (idx === highlightedIndex) {
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  document.addEventListener('pointerdown', (e) => {
    if (!inputEl.contains(e.target) && !dropdownEl.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
      closeDropdown();
    }
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

  if (dataList) {
    dataList.innerHTML = '';
    countryList.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      dataList.appendChild(opt);
    });
  }

  if (searchInput) {
    searchInput.placeholder = "Type country name (e.g. France)...";
    searchInput.disabled = false;
  }

  const randomBtn = document.getElementById('random-country-btn');
  if (randomBtn) randomBtn.disabled = false;

  // Initialize modern, mobile-friendly touch comboboxes
  setupCustomCombobox({
    inputId: 'country-search',
    toggleBtnId: 'country-search-toggle',
    dropdownId: 'country-search-dropdown',
    onSelect: (val) => handleCountrySelect(val)
  });

  setupCustomCombobox({
    inputId: 'draft-country-select',
    toggleBtnId: 'draft-country-toggle',
    dropdownId: 'draft-country-dropdown',
    onSelect: (val) => handleDraftCountrySelect(val)
  });

  loadDailyChallenge();
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
  if (isHueLockedInDraft && currentGameMode === 'dice-draft') {
    showHueLockNotice();
    return;
  }
  const def = CORE_FLAG_COLORS[colorName];
  if (def) {
    currentPickerColor.name = colorName;
    currentPickerColor.h = def.h;
    currentPickerColor.s = def.s;
    currentPickerColor.l = def.l;
    currentPickerColor.hex = def.hex;
  } else {
    currentPickerColor.name = colorName;
    const hsl = hexToHsl(COLOR_HEX_MAP[colorName] || '#ce1126');
    currentPickerColor.h = hsl.h;
    currentPickerColor.s = hsl.s;
    currentPickerColor.l = hsl.l;
    currentPickerColor.hex = COLOR_HEX_MAP[colorName] || '#ce1126';
  }

  updateColorPickerUI();
  updateChargePreview();
}

function updateColorPickerUI() {
  const hexBadge = document.getElementById('color-hex-badge');
  const nameBadge = document.getElementById('color-name-badge');
  const previewCircle = document.getElementById('color-preview-circle');
  const lightnessSlider = document.getElementById('lightness-slider');
  const lightnessDisplay = document.getElementById('lightness-val-display');
  const saturationSlider = document.getElementById('saturation-slider');
  const saturationDisplay = document.getElementById('saturation-val-display');

  if (hexBadge) hexBadge.textContent = currentPickerColor.hex.toUpperCase();
  if (nameBadge) nameBadge.textContent = currentPickerColor.name || 'Custom';
  if (previewCircle) previewCircle.style.backgroundColor = currentPickerColor.hex;
  if (lightnessSlider) lightnessSlider.value = currentPickerColor.l;
  if (lightnessDisplay) lightnessDisplay.textContent = `${currentPickerColor.l}%`;
  if (saturationSlider) saturationSlider.value = currentPickerColor.s;
  if (saturationDisplay) saturationDisplay.textContent = `${currentPickerColor.s}%`;

  // Highlight selected core swatch
  document.querySelectorAll('#core-color-swatches .color-swatch').forEach(swatch => {
    const isSelected = swatch.dataset.color === currentPickerColor.name;
    swatch.classList.toggle('selected', isSelected);
    swatch.setAttribute('aria-pressed', String(isSelected));
  });

  updateWheelReticle();
}

function updateColorPickerLockState() {
  const wheelContainer = document.getElementById('wheel-container');
  const lockOverlay = document.getElementById('wheel-lock-overlay');
  const lockNotice = document.getElementById('dice-draft-color-rule-notice');
  const lockText = document.getElementById('wheel-lock-text');

  if (isHueLockedInDraft && currentGameMode === 'dice-draft') {
    if (wheelContainer) wheelContainer.classList.add('hue-locked');
    if (lockOverlay) lockOverlay.style.display = 'flex';
    if (lockNotice) lockNotice.style.display = 'block';
    if (lockText) lockText.textContent = `Hue Locked by D8`;

    document.querySelectorAll('#core-color-swatches .color-swatch').forEach(swatch => {
      swatch.classList.add('locked-out');
      swatch.setAttribute('aria-disabled', 'true');
    });
  } else {
    if (wheelContainer) wheelContainer.classList.remove('hue-locked');
    if (lockOverlay) lockOverlay.style.display = 'none';
    if (lockNotice) lockNotice.style.display = 'none';

    document.querySelectorAll('#core-color-swatches .color-swatch').forEach(swatch => {
      swatch.classList.remove('locked-out');
      swatch.removeAttribute('aria-disabled');
    });
  }
}

function showHueLockNotice() {
  const notice = document.getElementById('dice-draft-color-rule-notice');
  if (notice) {
    notice.style.display = 'block';
    notice.style.animation = 'none';
    notice.offsetHeight; // trigger reflow
    notice.style.animation = 'popBadge 0.3s ease';
  }
}

function onMainLightnessInput(val) {
  currentPickerColor.l = parseInt(val, 10);
  currentPickerColor.hex = hslToHex(currentPickerColor.h, currentPickerColor.s, currentPickerColor.l);
  updateColorPickerUI();
  updateChargePreview();
}

function onMainSaturationInput(val) {
  currentPickerColor.s = parseInt(val, 10);
  currentPickerColor.hex = hslToHex(currentPickerColor.h, currentPickerColor.s, currentPickerColor.l);
  updateColorPickerUI();
  updateChargePreview();
}

function initColorWheel() {
  const canvas = document.getElementById('color-wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = cx - 3;

  function drawWheel() {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Conic gradient for 360 degree hue
    const conic = ctx.createConicGradient(0, cx, cy);
    conic.addColorStop(0/6, '#ff0000');
    conic.addColorStop(1/6, '#ffff00');
    conic.addColorStop(2/6, '#00ff00');
    conic.addColorStop(3/6, '#00ffff');
    conic.addColorStop(4/6, '#0000ff');
    conic.addColorStop(5/6, '#ff00ff');
    conic.addColorStop(6/6, '#ff0000');

    ctx.fillStyle = conic;
    ctx.fill();

    // Radial gradient for saturation
    const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    radial.addColorStop(0, 'rgba(255, 255, 255, 1)');
    radial.addColorStop(0.08, 'rgba(255, 255, 255, 0.95)');
    radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = radial;
    ctx.fill();

    ctx.restore();

    // Border
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  drawWheel();

  let isInteracting = false;

  function handleWheelPointer(e) {
    if (isHueLockedInDraft && currentGameMode === 'dice-draft') {
      showHueLockNotice();
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

    const px = clientX - rect.left - (rect.width / 2);
    const py = clientY - rect.top - (rect.height / 2);

    let angleDeg = Math.round((Math.atan2(py, px) * 180) / Math.PI);
    if (angleDeg < 0) angleDeg += 360;

    const dist = Math.sqrt(px * px + py * py);
    const maxRadius = rect.width / 2 - 3;
    const sat = Math.min(100, Math.round((dist / maxRadius) * 100));

    currentPickerColor.h = angleDeg;
    currentPickerColor.s = sat;
    currentPickerColor.hex = hslToHex(currentPickerColor.h, currentPickerColor.s, currentPickerColor.l);
    currentPickerColor.name = "Custom Tone";

    updateColorPickerUI();
    updateChargePreview();
  }

  canvas.addEventListener('mousedown', (e) => {
    isInteracting = true;
    handleWheelPointer(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isInteracting) handleWheelPointer(e);
  });

  window.addEventListener('mouseup', () => {
    isInteracting = false;
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isInteracting = true;
    handleWheelPointer(e);
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (isInteracting) {
      e.preventDefault();
      handleWheelPointer(e);
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    isInteracting = false;
  });

  updateWheelReticle();
}

function updateWheelReticle() {
  const reticle = document.getElementById('wheel-reticle');
  const canvas = document.getElementById('color-wheel-canvas');
  if (!reticle || !canvas) return;

  const w = canvas.offsetWidth || 130;
  const cx = w / 2;
  const cy = w / 2;
  const maxR = cx - 3;

  const satRatio = Math.max(0, Math.min(100, currentPickerColor.s)) / 100;
  const angleRad = (currentPickerColor.h * Math.PI) / 180;
  const dist = satRatio * maxR;

  const rx = cx + dist * Math.cos(angleRad);
  const ry = cy + dist * Math.sin(angleRad);

  reticle.style.left = `${rx}px`;
  reticle.style.top = `${ry}px`;
}

function getSelectedColor() {
  return currentPickerColor.name || 'Red';
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

function getShapeBaseDimensions(shape, layer) {
  if (shape === 'Rectangle') return { w: 400, h: 200 };
  if (shape === 'Circle') return { w: 200, h: 200 };
  if (shape === 'Triangle') return { w: 240, h: 240 };
  if (shape === 'Star') return { w: 200, h: 200 };
  if (shape === 'Crescent') return { w: 200, h: 200 };
  if (shape === 'Cross') return { w: 200, h: 200 };
  if (shape === 'Sun') return { w: 200, h: 200 };
  if (shape === 'Shield' || shape === 'Image') return { w: 180, h: 220 };
  if (shape === 'Charge') {
    return {
      w: (layer && layer.baseWidth) || 150,
      h: (layer && layer.baseHeight) || 150
    };
  }
  return { w: 200, h: 200 };
}

function addElement() {
  const shape = document.getElementById('shape-type').value;
  const starPoints = parseInt(document.getElementById('star-points').value, 10) || 5;
  const crossStyle = document.getElementById('cross-style').value;
  const crossThickness = parseInt(document.getElementById('cross-thickness').value, 10) || 35;

  const newLayer = {
    id: Date.now(),
    shape: shape,
    crossStyle: crossStyle,
    crossThickness: crossThickness,
    pointsCount: starPoints,
    color: currentPickerColor.name || 'Red',
    hue: currentPickerColor.h,
    saturation: currentPickerColor.s,
    lightness: currentPickerColor.l,
    hex: currentPickerColor.hex || '#ce1126',
    isHueLocked: false,
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

// -------------------------------------------------------------
// Country Charges & Unique Flag Elements Handlers
// -------------------------------------------------------------
function initChargeSelector() {
  const input = document.getElementById('charge-country-search');
  if (!input) return;

  const defaultCountry = (typeof COUNTRY_CHARGES !== 'undefined' && COUNTRY_CHARGES.find(c => c.name === 'Spain')) || 
                         (typeof COUNTRY_CHARGES !== 'undefined' ? COUNTRY_CHARGES[0] : null);
  if (defaultCountry && !input.value) {
    input.value = defaultCountry.name;
  }

  setupCustomCombobox({
    inputId: 'charge-country-search',
    toggleBtnId: 'charge-country-toggle',
    dropdownId: 'charge-country-dropdown',
    getItems: () => (typeof COUNTRY_CHARGES !== 'undefined' ? COUNTRY_CHARGES : []),
    onSelect: (name, item) => {
      if (item && item.code && typeof loadChargeSvg === 'function') {
        loadChargeSvg(item.code);
      }
    }
  });

  if (typeof prefetchCountrySvgs === 'function') {
    prefetchCountrySvgs();
  }
}

function updateChargePreview() {
  // Previews removed per design specification
}

async function addSelectedChargeFromPicker() {
  const input = document.getElementById('charge-country-search');
  const val = input ? input.value.trim() : '';
  let charge = null;
  if (val && typeof getChargeById === 'function') {
    charge = getChargeById(val);
  }
  if (!charge && typeof COUNTRY_CHARGES !== 'undefined' && COUNTRY_CHARGES.length > 0) {
    charge = COUNTRY_CHARGES.find(c => c.name === 'Spain') || COUNTRY_CHARGES[0];
    if (input) input.value = charge.name;
  }
  if (!charge) return;

  const addBtn = document.getElementById('add-charge-btn');
  if (addBtn) {
    addBtn.textContent = 'Adding...';
    addBtn.disabled = true;
  }

  try {
    await addChargeByCountry(charge.code);
  } finally {
    if (addBtn) {
      addBtn.textContent = '+ Add Unique Element to Flag';
      addBtn.disabled = false;
    }
  }
}

async function addChargeByCountry(countryCode) {
  const charge = typeof getChargeById === 'function' ? getChargeById(countryCode) : null;
  if (!charge) return;

  let rawSvg = '';
  if (typeof loadChargeSvg === 'function') {
    rawSvg = await loadChargeSvg(charge.code);
  }

  const layerId = Date.now();
  let prepared = { viewBox: charge.viewBox || '0 0 100 100', inner: '' };
  if (typeof prepareSvgForLayer === 'function' && rawSvg) {
    prepared = prepareSvgForLayer(rawSvg, layerId);
  }

  const newLayer = {
    id: layerId,
    shape: 'Charge',
    chargeId: charge.code,
    chargeName: charge.name,
    viewBox: prepared.viewBox,
    svgInnerContent: prepared.inner,
    baseWidth: charge.defaultWidth || 160,
    baseHeight: charge.defaultHeight || 160,
    color: 'Gold',
    hex: '#d99b26',
    x: 300,
    y: 200,
    scaleX: 0.8,
    scaleY: 0.8,
    scale: 0.8,
    rotation: 0
  };

  layers.push(newLayer);
  selectedId = newLayer.id;
  render();
}

function addChargeById(chargeId) {
  addChargeByCountry(chargeId);
}

function addSelectedEmblem() {
  addSelectedChargeFromPicker();
}

function addSunElement() {
  addChargeByCountry('ar');
}

function addCoatOfArmsPreset() {
  addChargeByCountry('es');
}

function selectLayer(id) {
  selectedId = id;
  render();
}

function duplicateLayer(id, e) {
  if (e) e.stopPropagation();
  if (currentGameMode === 'dice-draft') {
    return;
  }
  const sourceLayer = layers.find(l => l.id === id);
  if (!sourceLayer) return;

  const newId = Date.now() + Math.floor(Math.random() * 1000);
  const newLayer = JSON.parse(JSON.stringify(sourceLayer));
  newLayer.id = newId;
  delete newLayer.draftItemId;

  // Offset position slightly so the duplicate is immediately visible and distinguishable
  newLayer.x = Math.round(Math.min(580, Math.max(20, (sourceLayer.x || 300) + 20)));
  newLayer.y = Math.round(Math.min(380, Math.max(20, (sourceLayer.y || 200) + 20)));

  // Re-prefix Charge SVG IDs to avoid id collisions with source layer
  if (newLayer.shape === 'Charge') {
    if (newLayer.svgInnerContent) {
      const oldPrefix = 'ch_' + sourceLayer.id + '_';
      const newPrefix = 'ch_' + newId + '_';
      newLayer.svgInnerContent = newLayer.svgInnerContent.split(oldPrefix).join(newPrefix);
    } else if (newLayer.chargeId && typeof loadChargeSvg === 'function') {
      loadChargeSvg(newLayer.chargeId).then(rawSvg => {
        if (rawSvg) {
          const prep = prepareSvgForLayer(rawSvg, newLayer.id);
          newLayer.viewBox = prep.viewBox;
          newLayer.svgInnerContent = prep.inner;
          renderLayers();
        }
      });
    }
  }

  // Insert immediately above the duplicated layer
  const idx = layers.findIndex(l => l.id === id);
  if (idx !== -1) {
    layers.splice(idx + 1, 0, newLayer);
  } else {
    layers.push(newLayer);
  }

  selectedId = newLayer.id;
  render();
}

function duplicateSelectedLayer() {
  if (currentGameMode === 'dice-draft') return;
  if (selectedId !== null) {
    duplicateLayer(selectedId);
  }
}

function deleteLayer(id, e) {
  if (e) e.stopPropagation();
  const deletedLayer = layers.find(l => l.id === id);
  if (deletedLayer && deletedLayer.draftItemId) {
    const draftItem = draftedItems.find(d => d.id === deletedLayer.draftItemId);
    if (draftItem) {
      draftItem.layerId = null;
      draftItem.isOccluded = false;
    }
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
  draftedItems.forEach(item => { item.layerId = null; item.isOccluded = false; });
  layers = [];
  selectedId = null;
  activeGuides = [];
  render();
  renderDraftedTray();
}

// -------------------------------------------------------------
// Layer Visibility & Occlusion Detection Engine
// -------------------------------------------------------------
function computeLayerVisibilities(callback) {
  if (!layers.length) {
    if (callback) callback({});
    return;
  }

  try {
    const clone = svg.cloneNode(true);
    const guides = clone.querySelector('#guide-group');
    if (guides) guides.remove();
    const handles = clone.querySelector('#handle-group');
    if (handles) handles.remove();

    const layerGroups = clone.querySelectorAll('#layer-group > g');
    if (!layerGroups.length) {
      if (callback) callback({});
      return;
    }

    const indexToLayerId = {};
    layerGroups.forEach((g, idx) => {
      const lid = parseInt(g.getAttribute('data-id'), 10);
      const colorIndex = idx + 1;
      indexToLayerId[colorIndex] = lid;

      const hexColor = '#' + colorIndex.toString(16).padStart(6, '0');

      const allEls = g.querySelectorAll('*');
      allEls.forEach(el => {
        el.removeAttribute('fill-opacity');
        el.removeAttribute('stroke-opacity');
        el.removeAttribute('opacity');
        el.style.opacity = '1';
        el.style.fillOpacity = '1';
        el.style.strokeOpacity = '1';
        if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
          el.setAttribute('fill', hexColor);
        }
        if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
          el.setAttribute('stroke', hexColor);
        }
        const tag = el.tagName.toLowerCase();
        if (['path', 'rect', 'polygon', 'circle', 'ellipse', 'line'].includes(tag)) {
          el.style.fill = hexColor;
        }
      });
      g.style.opacity = '1';
    });

    const svgString = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLObj = window.URL || window.webkitURL || window;
    const blobUrl = URLObj.createObjectURL(blob);

    const testImg = new Image();
    testImg.onload = function() {
      const cvs = document.createElement('canvas');
      cvs.width = 300;
      cvs.height = 200;
      const ctx = cvs.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 300, 200);
      ctx.drawImage(testImg, 0, 0, 300, 200);
      URLObj.revokeObjectURL(blobUrl);

      const imgData = ctx.getImageData(0, 0, 300, 200).data;
      const pixelCounts = {};
      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const colorVal = (r << 16) | (g << 8) | b;
        if (colorVal > 0) {
          pixelCounts[colorVal] = (pixelCounts[colorVal] || 0) + 1;
        }
      }

      const results = {};
      Object.keys(indexToLayerId).forEach(cIdx => {
        const lid = indexToLayerId[cIdx];
        const count = pixelCounts[cIdx] || 0;
        // Total flag area is 300x200 = 60,000 pixels.
        // If a layer has fewer than 25 visible pixels (<0.04%), it is considered occluded/hidden.
        results[lid] = {
          visiblePixels: count,
          isOccluded: count < 25
        };
      });

      if (callback) callback(results);
    };

    testImg.onerror = function() {
      URLObj.revokeObjectURL(blobUrl);
      const fallback = {};
      layers.forEach(l => { fallback[l.id] = { visiblePixels: 100, isOccluded: false }; });
      if (callback) callback(fallback);
    };
    testImg.src = blobUrl;
  } catch (err) {
    const fallback = {};
    layers.forEach(l => { fallback[l.id] = { visiblePixels: 100, isOccluded: false }; });
    if (callback) callback(fallback);
  }
}

let occlusionDebounceTimer = null;
function checkAndRefreshOcclusion() {
  if (currentGameMode !== 'dice-draft' || !draftedItems.length) return;
  if (occlusionDebounceTimer) clearTimeout(occlusionDebounceTimer);
  occlusionDebounceTimer = setTimeout(() => {
    computeLayerVisibilities(visMap => {
      let anyChanged = false;
      draftedItems.forEach(item => {
        if (item.layerId) {
          const vis = visMap[item.layerId];
          const newOccluded = vis ? vis.isOccluded : false;
          if (item.isOccluded !== newOccluded) {
            item.isOccluded = newOccluded;
            anyChanged = true;
          }
        } else {
          item.isOccluded = false;
        }
      });
      if (anyChanged) {
        renderDraftedTray();
        renderLayerList();
      }
    });
  }, 100);
}

function render() {
  renderLayers();
  renderGuides();
  renderHandles();
  renderLayerList();
  renderTransformInspector();
  checkAndRefreshOcclusion();
}

function renderLayers() {
  const g = document.getElementById('layer-group');
  g.innerHTML = '';

  layers.forEach(layer => {
    const elemGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    elemGroup.setAttribute('data-id', layer.id);
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
    } else if (layer.shape === 'Charge') {
      const chargeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      chargeG.setAttribute('data-charge-id', layer.chargeId || '');

      const charge = typeof getChargeById === 'function' ? getChargeById(layer.chargeId) : null;
      const w = layer.baseWidth || (charge && charge.defaultWidth) || 160;
      const h = layer.baseHeight || (charge && charge.defaultHeight) || 160;
      const vb = layer.viewBox || (charge && charge.viewBox) || '0 0 100 100';

      const nestedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      nestedSvg.setAttribute('x', -w / 2);
      nestedSvg.setAttribute('y', -h / 2);
      nestedSvg.setAttribute('width', w);
      nestedSvg.setAttribute('height', h);
      nestedSvg.setAttribute('viewBox', vb);
      nestedSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      if (layer.svgInnerContent) {
        const doc = new DOMParser().parseFromString(
          `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${layer.svgInnerContent}</svg>`,
          'image/svg+xml'
        );
        Array.from(doc.documentElement.childNodes).forEach(n => {
          nestedSvg.appendChild(document.importNode(n, true));
        });
      } else if (layer.chargeId && typeof loadChargeSvg === 'function') {
        loadChargeSvg(layer.chargeId).then(rawSvg => {
          if (rawSvg) {
            const prep = prepareSvgForLayer(rawSvg, layer.id);
            layer.viewBox = prep.viewBox;
            layer.svgInnerContent = prep.inner;
            renderLayers();
          }
        });
      }

      chargeG.appendChild(nestedSvg);
      elemGroup.appendChild(chargeG);
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

  const base = getShapeBaseDimensions(activeLayer.shape, activeLayer);
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
    if (layer.shape === 'Charge') {
      labelName = layer.chargeName || 'Flag Charge';
    }

    const draftItem = draftedItems.find(d => d.layerId === layer.id);
    const isOccludedBadge = (draftItem && draftItem.isOccluded) ? '<span style="color:#f87171; font-size:0.75rem; margin-left:4px; font-weight:700;" title="This shape is covered by other layers or off-canvas and will count as unused!">⚠️ (Hidden)</span>' : '';

    const isDiceDraft = (currentGameMode === 'dice-draft');
    const duplicateButtonHtml = !isDiceDraft 
      ? `<button onclick="duplicateLayer(${layer.id}, event)" title="Duplicate / copy layer">📋</button>`
      : '';

    item.innerHTML = `
      <div style="display:flex; align-items:center;">
        <span class="layer-preview" style="background-color:${layer.hex};"></span>
        <span style="font-size:0.85rem;">${labelName} (${Math.round(layer.rotation)}°)${isOccludedBadge}</span>
      </div>
      <div class="layer-controls">
        <button onclick="moveLayer(${layer.id}, -1, event)" ${idx === 0 ? 'disabled' : ''} title="Move layer up">▲</button>
        <button onclick="moveLayer(${layer.id}, 1, event)" ${idx === layers.length - 1 ? 'disabled' : ''} title="Move layer down">▼</button>
        ${duplicateButtonHtml}
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
  const dupBtn = document.getElementById('trans-duplicate-btn');
  if (dupBtn) dupBtn.style.display = (currentGameMode === 'dice-draft') ? 'none' : 'inline-block';
  if (dotEl) dotEl.style.backgroundColor = activeLayer.hex;
  if (nameEl) nameEl.textContent = activeLayer.shape === 'Charge' ? (activeLayer.chargeName || 'Flag Charge') : activeLayer.shape;
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
  const hexBadge = document.getElementById('inspector-color-hex');
  const lightnessSlider = document.getElementById('inspector-lightness-slider');
  const lightnessDisplay = document.getElementById('inspector-lightness-display');
  const saturationSlider = document.getElementById('inspector-saturation-slider');
  const saturationDisplay = document.getElementById('inspector-saturation-display');
  const hueLockMsg = document.getElementById('inspector-hue-lock-msg');

  if (!activeLayer) return;

  if (activeLayer.hue === undefined || activeLayer.lightness === undefined || activeLayer.saturation === undefined) {
    const hsl = hexToHsl(activeLayer.hex || '#ce1126');
    activeLayer.hue = hsl.h;
    activeLayer.saturation = hsl.s;
    activeLayer.lightness = hsl.l;
  }

  const isAchromatic = (activeLayer.color === 'Black' || activeLayer.color === 'White');
  const slidersContainer = document.getElementById('inspector-color-sliders-container');
  const achromaticNotice = document.getElementById('inspector-achromatic-notice');

  if (slidersContainer) slidersContainer.style.display = isAchromatic ? 'none' : 'block';
  if (achromaticNotice) {
    achromaticNotice.style.display = isAchromatic ? 'block' : 'none';
    if (isAchromatic) {
      achromaticNotice.textContent = `Pure ${activeLayer.color}: Fixed tone (lightness & saturation adjustments disabled).`;
    }
  }

  if (hexBadge) hexBadge.textContent = (activeLayer.hex || '#CE1126').toUpperCase();
  if (lightnessSlider) {
    lightnessSlider.value = activeLayer.lightness;
    lightnessSlider.disabled = isAchromatic;
  }
  if (lightnessDisplay) lightnessDisplay.textContent = `${activeLayer.lightness}%`;
  if (saturationSlider) {
    saturationSlider.value = activeLayer.saturation;
    saturationSlider.disabled = isAchromatic;
  }
  if (saturationDisplay) saturationDisplay.textContent = `${activeLayer.saturation}%`;

  const isLocked = Boolean(activeLayer.draftItemId && activeLayer.isHueLocked);
  if (hueLockMsg) {
    hueLockMsg.style.display = isLocked ? 'block' : 'none';
    if (isLocked) {
      if (isAchromatic) {
        hueLockMsg.innerHTML = `<span>🔒 <em>Hue locked to <strong>${activeLayer.color}</strong> by D8 roll (Fixed pure tone).</em></span>`;
      } else {
        hueLockMsg.innerHTML = `<span>🔒 <em>Hue locked to <strong>${activeLayer.color}</strong> by D8 roll. Adjust Lightness & Saturation sliders!</em></span>`;
      }
    }
  }

  if (!container) return;
  container.innerHTML = '';

  Object.keys(CORE_FLAG_COLORS).forEach(colorName => {
    const def = CORE_FLAG_COLORS[colorName];
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = `color-swatch ${activeLayer.color === colorName ? 'selected' : ''}`;
    swatch.dataset.color = colorName;
    swatch.title = colorName;
    swatch.style.backgroundColor = def.hex;

    if (isLocked && colorName !== activeLayer.color) {
      swatch.classList.add('locked-out');
      swatch.title = `${colorName} (Locked by D8 roll)`;
      swatch.onclick = () => {
        alert(`In Dice Draft mode, this element's hue is locked to ${activeLayer.color}. You can adjust its Lightness and Saturation sliders!`);
      };
    } else {
      swatch.onclick = () => {
        activeLayer.color = colorName;
        activeLayer.hue = def.h;
        activeLayer.saturation = def.s;
        activeLayer.lightness = def.l;
        activeLayer.hex = def.hex;
        renderRecolorPalette(activeLayer);
        render();
      };
    }
    container.appendChild(swatch);
  });
}

function recolorSelectedLayer(colorName, hexVal) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  if (activeLayer.draftItemId && activeLayer.isHueLocked && activeLayer.color !== colorName) {
    alert(`In Dice Draft mode, this element's hue is locked to ${activeLayer.color}. You can adjust its Lightness and Saturation!`);
    return;
  }
  const def = CORE_FLAG_COLORS[colorName] || { hex: hexVal || '#ce1126', h: 353, s: 85, l: 47 };
  activeLayer.color = colorName;
  activeLayer.hue = def.h;
  activeLayer.saturation = def.s;
  activeLayer.lightness = def.l;
  activeLayer.hex = def.hex;
  render();
  renderRecolorPalette(activeLayer);
}

function onInspectorLightnessInput(val) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  const num = parseInt(val, 10);
  activeLayer.lightness = num;
  if (activeLayer.hue === undefined) {
    const hsl = hexToHsl(activeLayer.hex || '#ce1126');
    activeLayer.hue = hsl.h;
    activeLayer.saturation = hsl.s;
  }
  activeLayer.hex = hslToHex(activeLayer.hue, activeLayer.saturation !== undefined ? activeLayer.saturation : 85, num);

  const display = document.getElementById('inspector-lightness-display');
  const hexBadge = document.getElementById('inspector-color-hex');
  if (display) display.textContent = `${num}%`;
  if (hexBadge) hexBadge.textContent = activeLayer.hex.toUpperCase();

  // Also sync draft tray if this came from draft item
  if (activeLayer.draftItemId) {
    const draftItem = draftedItems.find(d => d.id === activeLayer.draftItemId);
    if (draftItem) {
      draftItem.lightness = num;
      draftItem.hex = activeLayer.hex;
      const chip = document.getElementById(`draft-chip-${draftItem.id}`);
      if (chip) chip.style.backgroundColor = draftItem.hex;
      const slider = document.getElementById(`draft-light-${draftItem.id}`);
      if (slider) slider.value = num;
      const valDisp = document.getElementById(`draft-light-val-${draftItem.id}`);
      if (valDisp) valDisp.textContent = `${num}%`;
    }
  }

  render();
}

function onInspectorSaturationInput(val) {
  const activeLayer = layers.find(l => l.id === selectedId);
  if (!activeLayer) return;
  const num = parseInt(val, 10);
  activeLayer.saturation = num;
  if (activeLayer.hue === undefined) {
    const hsl = hexToHsl(activeLayer.hex || '#ce1126');
    activeLayer.hue = hsl.h;
    activeLayer.lightness = hsl.l;
  }
  activeLayer.hex = hslToHex(activeLayer.hue, num, activeLayer.lightness !== undefined ? activeLayer.lightness : 50);

  const display = document.getElementById('inspector-saturation-display');
  const hexBadge = document.getElementById('inspector-color-hex');
  if (display) display.textContent = `${num}%`;
  if (hexBadge) hexBadge.textContent = activeLayer.hex.toUpperCase();

  // Also sync draft tray if this came from draft item
  if (activeLayer.draftItemId) {
    const draftItem = draftedItems.find(d => d.id === activeLayer.draftItemId);
    if (draftItem) {
      draftItem.saturation = num;
      draftItem.hex = activeLayer.hex;
      const chip = document.getElementById(`draft-chip-${draftItem.id}`);
      if (chip) chip.style.backgroundColor = draftItem.hex;
      const slider = document.getElementById(`draft-sat-${draftItem.id}`);
      if (slider) slider.value = num;
      const valDisp = document.getElementById(`draft-sat-val-${draftItem.id}`);
      if (valDisp) valDisp.textContent = `${num}%`;
    }
  }

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

    const base = getShapeBaseDimensions(activeLayer.shape, activeLayer);
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

    const base = getShapeBaseDimensions(activeLayer.shape, activeLayer);
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

        // Run exact pixel occlusion test so hidden layers cannot bypass penalty
        computeLayerVisibilities(visMap => {
          const unusedElements = draftedItems.filter(item => !item.layerId || !layers.some(l => l.id === item.layerId));
          const occludedElements = draftedItems.filter(item => {
            if (!item.layerId || !layers.some(l => l.id === item.layerId)) return false;
            const vis = visMap[item.layerId];
            return vis ? vis.isOccluded : false;
          });

          const unusedCount = unusedElements.length;
          const occludedCount = occludedElements.length;
          const penaltyPerItem = 5;
          const totalPenalty = (unusedCount + occludedCount) * penaltyPerItem;
          earnedPoints = Math.max(0, accuracyPoints - totalPenalty);

          draftDetails = {
            complexity: comp,
            accuracyPoints: accuracyPoints,
            unusedCount: unusedCount,
            occludedCount: occludedCount,
            totalPenalty: totalPenalty,
            totalDrafted: draftedItems.length
          };

          submitBtn.textContent = 'Submit & Score';
          submitBtn.disabled = false;

          showComparisonModal(canvasUser, canvasOfficial, similarityPct, earnedPoints, maxPoints, draftDetails);
        });
        return;
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
    let penaltyItemsHtml = '';
    if (draftDetails.unusedCount > 0) {
      penaltyItemsHtml += `
        <div class="breakdown-row">
          <span>📦 Unused Elements in Tray (${draftDetails.unusedCount}):</span>
          <span style="color:var(--danger, #ce1126); font-weight:700;">-${draftDetails.unusedCount * 5} pts</span>
        </div>
      `;
    }
    if (draftDetails.occludedCount > 0) {
      penaltyItemsHtml += `
        <div class="breakdown-row">
          <span>⚠️ Hidden / Covered Elements (${draftDetails.occludedCount}):</span>
          <span style="color:var(--danger, #ce1126); font-weight:700;">-${draftDetails.occludedCount * 5} pts</span>
        </div>
      `;
    }
    if (draftDetails.unusedCount === 0 && draftDetails.occludedCount === 0) {
      penaltyItemsHtml += `
        <div class="breakdown-row">
          <span>✨ All Drafted Elements Visibly Used:</span>
          <span style="color:#22c55e; font-weight:700;">No Penalties!</span>
        </div>
      `;
    }

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
        ${penaltyItemsHtml}
        <div class="breakdown-row total-row">
          <span>🏆 Total Final Score:</span>
          <strong style="font-size:1.15rem; color:var(--text-main);">${points} / ${maxPoints} pts</strong>
        </div>
        ${draftDetails.occludedCount > 0 ? `
          <div style="font-size:0.75rem; color:#f87171; margin-top:0.4rem; padding:0.4rem; background:rgba(239, 68, 68, 0.1); border-radius:4px; border-left:3px solid #ef4444; line-height:1.35;">
            ⚠️ <strong>Hidden Shape Penalty:</strong> ${draftDetails.occludedCount} element(s) were placed on the canvas but completely hidden behind other layers. In Dice Draft mode, drafted elements must be visibly incorporated into your design to avoid the 5-point penalty!
          </div>
        ` : ''}
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

// Global Keyboard Shortcuts (Ctrl/Cmd + D for Duplicate, Delete for Remove)
window.addEventListener('keydown', (e) => {
  const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) {
    return;
  }

  if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
    if (currentGameMode !== 'dice-draft' && selectedId !== null) {
      e.preventDefault();
      duplicateSelectedLayer();
    }
  } else if (e.key === 'Delete') {
    if (selectedId !== null) {
      e.preventDefault();
      deleteSelectedLayer();
    }
  }
});

document.querySelectorAll('#core-color-swatches .color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => selectColor(swatch.dataset.color));
});
initColorWheel();
selectColor('Red');
initCountryLookup();
initChargeSelector();