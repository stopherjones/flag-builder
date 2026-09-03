// Flag Charges & Coats of Arms Catalog
// All charges are normalized with clean vector paths on a 0 0 100 100 or 0 0 200 200 viewBox

const FLAG_CHARGES = [
  {
    id: "sol_de_mayo",
    name: "Sun of May",
    country: "Argentina / Uruguay",
    category: "Celestial",
    viewBox: "0 0 100 100",
    defaultWidth: 140,
    defaultHeight: 140,
    defaultColor: "#fcd116",
    svgContent: `
      <!-- Sun of May Rays -->
      <g stroke="#996515" stroke-width="0.8" fill="#fcd116">
        <!-- 16 Straight Rays -->
        <polygon points="50,12 47,32 53,32" />
        <polygon points="50,88 47,68 53,68" />
        <polygon points="12,50 32,47 32,53" />
        <polygon points="88,50 68,47 68,53" />
        <polygon points="23,23 37,33 41,29" />
        <polygon points="77,77 63,67 59,71" />
        <polygon points="77,23 63,33 59,29" />
        <polygon points="23,77 37,67 41,71" />
        <polygon points="36,15 41,33 46,31" />
        <polygon points="64,85 59,67 54,69" />
        <polygon points="15,36 33,41 31,46" />
        <polygon points="85,64 67,59 69,54" />
        <polygon points="64,15 59,33 54,31" />
        <polygon points="36,85 41,67 46,69" />
        <polygon points="85,36 67,41 69,46" />
        <polygon points="15,64 33,59 31,54" />
        <!-- 16 Wavy Flame Rays -->
        <path d="M50,14 Q44,24 50,33 Q56,24 50,14 Z" />
        <path d="M50,86 Q44,76 50,67 Q56,76 50,86 Z" />
        <path d="M14,50 Q24,44 33,50 Q24,56 14,50 Z" />
        <path d="M86,50 Q76,44 67,50 Q76,56 86,50 Z" />
        <path d="M25,25 Q30,34 39,37 Q34,28 25,25 Z" />
        <path d="M75,75 Q70,66 61,63 Q66,72 75,75 Z" />
        <path d="M75,25 Q66,30 63,39 Q72,34 75,25 Z" />
        <path d="M25,75 Q34,70 37,61 Q28,66 25,75 Z" />
      </g>
      <!-- Sun Center Face -->
      <circle cx="50" cy="50" r="18" fill="#fcd116" stroke="#996515" stroke-width="1.2"/>
      <circle cx="43" cy="47" r="2.2" fill="#5c3c0a"/>
      <circle cx="57" cy="47" r="2.2" fill="#5c3c0a"/>
      <path d="M40,43 Q43,40 46,43" fill="none" stroke="#5c3c0a" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M54,43 Q57,40 60,43" fill="none" stroke="#5c3c0a" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M48,47 L47,53 L53,53" fill="none" stroke="#5c3c0a" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M43,58 Q50,64 57,58" fill="none" stroke="#5c3c0a" stroke-width="1.3" stroke-linecap="round"/>
    `
  },
  {
    id: "maple_leaf",
    name: "Maple Leaf",
    country: "Canada",
    category: "Nature",
    viewBox: "0 0 100 100",
    defaultWidth: 150,
    defaultHeight: 150,
    defaultColor: "#ce1126",
    svgContent: `
      <!-- Canadian 11-point Maple Leaf -->
      <path d="M50,8 
               L55,27 L66,21 L65,33 L78,32 L73,43 L88,49 L79,59 L83,64 L67,69 L68,75 L54,74 
               L53,92 L47,92 L46,74 L32,75 L33,69 L17,64 L21,59 L12,49 L27,43 L22,32 L35,33 L34,21 L45,27 Z" 
            fill="currentColor" stroke="rgba(0,0,0,0.15)" stroke-width="0.8" />
    `
  },
  {
    id: "double_headed_eagle",
    name: "Double-Headed Eagle",
    country: "Albania / Montenegro / Serbia",
    category: "Beasts",
    viewBox: "0 0 100 100",
    defaultWidth: 150,
    defaultHeight: 150,
    defaultColor: "#111111",
    svgContent: `
      <!-- Stylized Heraldic Double-Headed Eagle -->
      <g fill="currentColor">
        <!-- Left Head & Beak -->
        <path d="M42,20 C36,15 30,19 28,26 C24,24 22,27 24,30 C30,31 34,27 38,27 C39,30 42,32 44,35 Z" />
        <!-- Right Head & Beak -->
        <path d="M58,20 C64,15 70,19 72,26 C76,24 78,27 76,30 C70,31 66,27 62,27 C61,30 58,32 56,35 Z" />
        <!-- Central Body & Shield Chest -->
        <path d="M44,33 L56,33 L54,58 L50,64 L46,58 Z" />
        <!-- Left Wing Primary & Feathers -->
        <path d="M42,34 C30,31 16,38 10,48 C16,48 24,44 32,46 C18,52 14,60 12,68 C19,65 26,60 35,59 C22,68 20,78 21,85 C28,78 35,71 44,67 Z" />
        <!-- Right Wing Primary & Feathers -->
        <path d="M58,34 C70,31 84,38 90,48 C84,48 76,44 68,46 C82,52 86,60 88,68 C81,65 74,60 65,59 C78,68 80,78 79,85 C72,78 65,71 56,67 Z" />
        <!-- Tail Feathers & Claws -->
        <path d="M45,67 L42,88 L47,84 L50,91 L53,84 L58,88 L55,67 Z" />
        <path d="M37,68 L32,76 L39,74 Z" />
        <path d="M63,68 L68,76 L61,74 Z" />
      </g>
    `
  },
  {
    id: "cedar_tree",
    name: "Lebanese Cedar",
    country: "Lebanon",
    category: "Nature",
    viewBox: "0 0 100 100",
    defaultWidth: 150,
    defaultHeight: 150,
    defaultColor: "#007a3d",
    svgContent: `
      <!-- Lebanese Green Cedar Tree -->
      <g fill="currentColor">
        <!-- Trunk & Base Branches -->
        <path d="M47,78 L45,92 L55,92 L53,78 Z" fill="#5c3c0a"/>
        <!-- Tier 1 Top Crown -->
        <path d="M50,14 L62,28 L56,29 L67,41 L59,42 L72,56 L62,57 L78,74 L22,74 L38,57 L28,56 L41,42 L33,41 L44,29 L38,28 Z" />
      </g>
    `
  },
  {
    id: "ashoka_chakra",
    name: "Ashoka Chakra (24-Spoke Wheel)",
    country: "India",
    category: "Emblems",
    viewBox: "0 0 100 100",
    defaultWidth: 130,
    defaultHeight: 130,
    defaultColor: "#000080",
    svgContent: `
      <!-- Ashoka Chakra 24-Spoke Wheel -->
      <g fill="currentColor" stroke="currentColor">
        <circle cx="50" cy="50" r="44" fill="none" stroke-width="4.5" />
        <circle cx="50" cy="50" r="8" fill="currentColor" />
        <circle cx="50" cy="50" r="3.5" fill="#ffffff" />
        <!-- 24 Spokes -->
        ${Array.from({ length: 24 }).map((_, i) => `
          <line x1="50" y1="50" x2="${(50 + 42 * Math.cos(i * 15 * Math.PI / 180)).toFixed(2)}" y2="${(50 + 42 * Math.sin(i * 15 * Math.PI / 180)).toFixed(2)}" stroke-width="1.8" />
        `).join('')}
      </g>
    `
  },
  {
    id: "laurel_wreath",
    name: "Olive / Laurel Wreath",
    country: "Cyprus / Greece / UN",
    category: "Emblems",
    viewBox: "0 0 100 100",
    defaultWidth: 150,
    defaultHeight: 150,
    defaultColor: "#4d7c0f",
    svgContent: `
      <!-- Laurel Wreath Pair -->
      <g fill="currentColor" stroke="currentColor">
        <!-- Left Branch Stem -->
        <path d="M50,86 C32,84 18,68 18,48 C18,32 28,18 42,12" fill="none" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Right Branch Stem -->
        <path d="M50,86 C68,84 82,68 82,48 C82,32 72,18 58,12" fill="none" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Left Leaves -->
        <ellipse cx="22" cy="66" rx="5" ry="2.5" transform="rotate(-30 22 66)"/>
        <ellipse cx="16" cy="54" rx="5" ry="2.5" transform="rotate(-15 16 54)"/>
        <ellipse cx="16" cy="42" rx="5" ry="2.5" transform="rotate(10 16 42)"/>
        <ellipse cx="22" cy="30" rx="5" ry="2.5" transform="rotate(35 22 30)"/>
        <ellipse cx="32" cy="20" rx="5" ry="2.5" transform="rotate(55 32 20)"/>
        <ellipse cx="44" cy="14" rx="5" ry="2.5" transform="rotate(75 44 14)"/>
        <!-- Right Leaves -->
        <ellipse cx="78" cy="66" rx="5" ry="2.5" transform="rotate(30 78 66)"/>
        <ellipse cx="84" cy="54" rx="5" ry="2.5" transform="rotate(15 84 54)"/>
        <ellipse cx="84" cy="42" rx="5" ry="2.5" transform="rotate(-10 84 42)"/>
        <ellipse cx="78" cy="30" rx="5" ry="2.5" transform="rotate(-35 78 30)"/>
        <ellipse cx="68" cy="20" rx="5" ry="2.5" transform="rotate(-55 68 20)"/>
        <ellipse cx="56" cy="14" rx="5" ry="2.5" transform="rotate(-75 56 14)"/>
        <!-- Bottom Tie Ribbon -->
        <circle cx="50" cy="87" r="3" />
      </g>
    `
  },
  {
    id: "fleur_de_lis",
    name: "Fleur-de-lis",
    country: "France / Quebec / Heraldry",
    category: "Heraldry",
    viewBox: "0 0 100 100",
    defaultWidth: 130,
    defaultHeight: 140,
    defaultColor: "#fcd116",
    svgContent: `
      <!-- Ornate Royal Fleur-de-lis -->
      <g fill="currentColor">
        <!-- Central Spear Petal -->
        <path d="M50,8 C47,20 42,32 38,42 C44,43 56,43 62,42 C58,32 53,20 50,8 Z" />
        <!-- Left Curled Petal -->
        <path d="M36,44 C26,38 14,42 16,58 C18,68 28,68 34,60 C36,54 36,48 36,44 Z" />
        <!-- Right Curled Petal -->
        <path d="M64,44 C74,38 86,42 84,58 C82,68 72,68 66,60 C64,54 64,48 64,44 Z" />
        <!-- Cross Horizontal Tie Bar -->
        <rect x="26" y="58" width="48" height="7" rx="2" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
        <!-- Bottom Stem Root -->
        <path d="M38,68 C40,80 44,92 50,94 C56,92 60,80 62,68 C54,71 46,71 38,68 Z" />
      </g>
    `
  },
  {
    id: "spanish_shield",
    name: "Royal Shield & Crown",
    country: "Spain / Heraldry",
    category: "Heraldry",
    viewBox: "0 0 100 100",
    defaultWidth: 130,
    defaultHeight: 150,
    defaultColor: "#ce1126",
    svgContent: `
      <!-- Royal Crown & Quartered Shield -->
      <g>
        <!-- Top Crown -->
        <path d="M32,24 L36,12 L44,20 L50,10 L56,20 L64,12 L68,24 Z" fill="#fcd116" stroke="#996515" stroke-width="1"/>
        <rect x="30" y="24" width="40" height="5" rx="1" fill="#fcd116" stroke="#996515" stroke-width="0.8"/>
        <circle cx="36" cy="12" r="1.8" fill="#ce1126"/>
        <circle cx="50" cy="10" r="2.2" fill="#ce1126"/>
        <circle cx="64" cy="12" r="1.8" fill="#ce1126"/>
        <!-- Main Shield Body -->
        <path d="M26,32 L74,32 L74,68 C74,84 50,94 50,94 C50,94 26,84 26,68 Z" fill="#ce1126" stroke="#fcd116" stroke-width="2.5"/>
        <!-- Shield Quarters -->
        <path d="M28,34 L50,34 L50,60 L28,60 Z" fill="#ce1126" />
        <path d="M50,34 L72,34 L72,60 L50,60 Z" fill="#ffffff" />
        <path d="M28,60 L50,60 L50,80 C42,76 34,70 28,64 Z" fill="#fcd116" />
        <path d="M50,60 L72,60 L72,64 C66,70 58,76 50,80 Z" fill="#ce1126" />
        <!-- Castle & Lion Silhouettes -->
        <rect x="34" y="40" width="10" height="12" fill="#fcd116"/>
        <path d="M56,42 C60,42 63,45 62,52 L58,52 Z" fill="#ce1126"/>
        <!-- Inescutcheon Center Oval -->
        <ellipse cx="50" cy="60" rx="6" ry="8" fill="#003893" stroke="#fcd116" stroke-width="1.2"/>
        <circle cx="50" cy="60" r="2" fill="#fcd116"/>
      </g>
    `
  },
  {
    id: "sri_lanka_lion",
    name: "Passant Lion with Sword",
    country: "Sri Lanka / Heraldry",
    category: "Beasts",
    viewBox: "0 0 100 100",
    defaultWidth: 150,
    defaultHeight: 140,
    defaultColor: "#fcd116",
    svgContent: `
      <!-- Golden Lion Passant Holding Sword -->
      <g fill="currentColor">
        <!-- Lion Head & Mane -->
        <path d="M68,26 C76,20 84,24 86,32 C82,34 78,35 78,39 C84,40 85,46 80,48 C74,48 70,44 68,38 Z" />
        <!-- Sword held in Right Paw -->
        <path d="M74,18 L88,14 L86,18 L76,22 Z" fill="#fcd116" stroke="#5c3c0a" stroke-width="0.8"/>
        <!-- Body & Chest -->
        <path d="M68,36 C60,34 46,38 38,46 C32,54 36,66 44,68 C54,68 64,62 68,52 Z" />
        <!-- Forelegs -->
        <path d="M68,48 L72,74 L66,75 L62,56 Z" />
        <path d="M60,52 L62,72 L57,73 L54,58 Z" />
        <!-- Hind Legs -->
        <path d="M40,54 L36,76 L30,76 L34,58 Z" />
        <path d="M46,58 L44,74 L39,74 L42,60 Z" />
        <!-- Arched Raised Tail with Tuft -->
        <path d="M38,46 C28,36 24,20 36,16 C38,22 34,28 42,32 C40,36 38,40 38,46 Z" />
        <circle cx="34" cy="16" r="3.5" />
      </g>
    `
  },
  {
    id: "shamrock",
    name: "Shamrock / Trefoil",
    country: "Ireland",
    category: "Nature",
    viewBox: "0 0 100 100",
    defaultWidth: 130,
    defaultHeight: 140,
    defaultColor: "#009a44",
    svgContent: `
      <!-- Irish Shamrock Clover -->
      <g fill="currentColor">
        <!-- Top Leaf Heart -->
        <path d="M50,42 C40,24 24,32 38,46 C44,52 50,52 50,52 C50,52 56,52 62,46 C76,32 60,24 50,42 Z" />
        <!-- Left Leaf Heart -->
        <path d="M42,50 C24,40 32,24 46,38 C52,44 52,50 52,50 C52,50 52,56 46,62 C32,76 24,60 42,50 Z" transform="rotate(-70 50 50)"/>
        <!-- Right Leaf Heart -->
        <path d="M42,50 C24,40 32,24 46,38 C52,44 52,50 52,50 C52,50 52,56 46,62 C32,76 24,60 42,50 Z" transform="rotate(70 50 50)"/>
        <!-- Curved Stem -->
        <path d="M48,52 Q44,78 36,92 Q42,88 52,54 Z" />
      </g>
    `
  },
  {
    id: "scimitar_sword",
    name: "Arabian Scimitar / Sword",
    country: "Saudi Arabia / Heraldry",
    category: "Emblems",
    viewBox: "0 0 100 100",
    defaultWidth: 180,
    defaultHeight: 70,
    defaultColor: "#ffffff",
    svgContent: `
      <!-- Curved Scimitar Sword -->
      <g fill="currentColor">
        <!-- Curved Blade -->
        <path d="M14,52 Q48,46 84,40 Q94,38 88,44 Q62,56 22,58 Z" />
        <!-- Guard / Hilt -->
        <rect x="18" y="44" width="4" height="18" rx="1.5" transform="rotate(-10 20 53)"/>
        <!-- Grip & Pommel -->
        <path d="M19,53 L10,55 C7,56 8,62 12,61 L18,58 Z" />
      </g>
    `
  },
  {
    id: "five_star_cluster",
    name: "Crescent & 5-Star Constellation",
    country: "Singapore / Pakistan / Turkey",
    category: "Celestial",
    viewBox: "0 0 100 100",
    defaultWidth: 140,
    defaultHeight: 140,
    defaultColor: "#ffffff",
    svgContent: `
      <!-- Crescent with 5 Stars Arc -->
      <g fill="currentColor">
        <!-- Sharp Crescent -->
        <path d="M 44,14 A 36,36 0 1 0 44,86 A 28,28 0 1 1 44,14 Z" />
        <!-- 5 Star Pentagon Cluster -->
        <!-- Star 1 Top -->
        <polygon points="56,30 57.5,34.5 62,34.5 58.5,37 60,41.5 56,39 52,41.5 53.5,37 50,34.5 54.5,34.5" />
        <!-- Star 2 Upper Right -->
        <polygon points="70,36 71.5,40.5 76,40.5 72.5,43 74,47.5 70,45 66,47.5 67.5,43 64,40.5 68.5,40.5" />
        <!-- Star 3 Lower Right -->
        <polygon points="70,54 71.5,58.5 76,58.5 72.5,61 74,65.5 70,63 66,65.5 67.5,61 64,58.5 68.5,58.5" />
        <!-- Star 4 Bottom -->
        <polygon points="56,60 57.5,64.5 62,64.5 58.5,67 60,71.5 56,69 52,71.5 53.5,67 50,64.5 54.5,64.5" />
        <!-- Star 5 Center Left -->
        <polygon points="48,45 49.5,49.5 54,49.5 50.5,52 52,56.5 48,54 44,56.5 45.5,52 42,49.5 46.5,49.5" />
      </g>
    `
  }
];

// Helper to look up charge by ID
function getChargeById(id) {
  return FLAG_CHARGES.find(c => c.id === id) || FLAG_CHARGES[0];
}
