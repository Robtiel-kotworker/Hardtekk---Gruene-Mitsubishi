// ============================================================================
// SPRITES – prozedurale Pixel-Art auf Canvas-Basis
// ============================================================================
// Es werden keine externen Bilddateien geladen: alle Sprites (Spieler,
// NPCs, Hardtekk-Tracks) werden per Code aus kleinen Pixel-Masken gezeichnet.
// Das hält das Projekt abhängigkeitsfrei und lizenzsauber.
// ============================================================================

// 8x8-Maske für eine "Beat"-Kreatur: 0 = leer, 1 = Hauptfarbe, 2 = Schattenfarbe,
// 3 = Akzentfarbe (Augen/Highlights). Bewusst simpel & knuffig gehalten,
// wird per Hash-Variation pro Spezies leicht verzerrt (Ohren/Form).
const BASE_MASK = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 3, 1, 1, 3, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 2, 2, 1, 1, 0],
  [0, 1, 2, 0, 0, 2, 1, 0],
  [0, 2, 0, 0, 0, 0, 2, 0],
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Erzeugt eine leicht individualisierte Maske (z.B. "Ohren" je nach Hash),
// damit nicht alle Kreaturen exakt gleich aussehen.
function variantMask(speciesId) {
  const mask = BASE_MASK.map((row) => [...row]);
  const h = hashString(speciesId);
  if (h % 3 === 0) {
    mask[0][1] = 1;
    mask[0][6] = 1;
  }
  if (h % 5 === 0) {
    mask[6][1] = 3;
    mask[6][6] = 3;
  }
  if (h % 7 < 3) {
    mask[5][0] = 1;
    mask[5][7] = 1;
  }
  return mask;
}

/**
 * Zeichnet ein Hardtekk-Track-Sprite in einen Canvas-Context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} speciesId
 * @param {string[]} palette [Hauptfarbe, Schattenfarbe, Akzentfarbe]
 * @param {number} x, y Ziel-Position (px)
 * @param {number} scale Pixelgröße je Maskenzelle
 */
export function drawCreatureSprite(ctx, speciesId, palette, x, y, scale = 6) {
  const mask = variantMask(speciesId);
  const colors = { 1: palette[0], 2: palette[1], 3: palette[2] };
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (let row = 0; row < mask.length; row++) {
    for (let col = 0; col < mask[row].length; col++) {
      const v = mask[row][col];
      if (v === 0) continue;
      ctx.fillStyle = colors[v];
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
  ctx.restore();
}

// Spieler-/NPC-Sprite: simples 8x8-"Trainer"-Männchen, Blickrichtung per Frame.
const PLAYER_MASK = {
  down: [
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 2, 3, 3, 3, 3, 2, 0],
    [0, 2, 3, 4, 4, 3, 2, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 5, 0, 0, 5, 0, 0],
    [0, 0, 5, 0, 0, 5, 0, 0],
  ],
  up: [
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 5, 0, 0, 5, 0, 0],
    [0, 0, 5, 0, 0, 5, 0, 0],
  ],
  side: [
    [0, 0, 2, 2, 2, 0, 0, 0],
    [0, 2, 3, 3, 2, 0, 0, 0],
    [0, 2, 3, 4, 2, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 5, 5, 0, 0, 0, 0],
    [0, 0, 5, 5, 0, 0, 0, 0],
  ],
};

const PLAYER_PALETTE = {
  1: "#2c3c8a", // Jacke
  2: "#f2c48a", // Haut
  3: "#4a2c1a", // Haare
  4: "#1a1a1a", // Augen
  5: "#3a3a3a", // Schuhe
};

export function drawPlayerSprite(ctx, x, y, direction = "down", scale = 6, mirrored = false) {
  const frame = direction === "left" || direction === "right" ? "side" : direction;
  const mask = PLAYER_MASK[frame] || PLAYER_MASK.down;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (mirrored) {
    ctx.translate(x + 8 * scale, y);
    ctx.scale(-1, 1);
    x = 0;
    y = 0;
  } else {
    ctx.translate(0, 0);
  }
  for (let row = 0; row < mask.length; row++) {
    for (let col = 0; col < mask[row].length; col++) {
      const v = mask[row][col];
      if (v === 0) continue;
      ctx.fillStyle = PLAYER_PALETTE[v];
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
  ctx.restore();
}

export function drawNpcSprite(ctx, x, y, palette, scale = 6) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const mask = PLAYER_MASK.down;
  const colors = { 1: palette[0], 2: "#f2c48a", 3: palette[1], 4: "#1a1a1a", 5: "#3a3a3a" };
  for (let row = 0; row < mask.length; row++) {
    for (let col = 0; col < mask[row].length; col++) {
      const v = mask[row][col];
      if (v === 0) continue;
      ctx.fillStyle = colors[v];
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
  ctx.restore();
}
