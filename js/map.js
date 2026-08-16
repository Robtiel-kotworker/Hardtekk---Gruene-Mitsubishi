// ============================================================================
// MAP – Overworld-Tilemap
// ============================================================================
// Legende:
//  . = Weg (begehbar)
//  , = Rasen (begehbar)
//  # = Baum/Wand (blockiert)
//  ~ = Wasser (blockiert)
//  " = hohes Gras (begehbar, löst zufällige Begegnungen aus)
//  1/2/3 = Gig-Eingang (begehbar, löst beim Betreten den jeweiligen Gig-Kampf aus)
//  H = Recordbank / Heilstation (begehbar, heilt & speichert das Team)
// ============================================================================

// Wichtig: Gig-Türen (1/2/3) dürfen NICHT von Wänden umschlossen sein –
// mindestens ein Nachbarfeld (hier jeweils Norden/Süden) muss begehbar
// bleiben, sonst wäre die Tür unerreichbar.
const RAW_MAP = [
  "####################",
  "#,,,,,,,,,,,,,,,,,,#",
  "#,,,#1#,,,,,,#2#,,,#",
  "#,,,,,,,,,,,,,,,,,,#",
  '#,,"""",,,,,"""",,,#',
  '#,,"""",,,,,"""",,,#',
  "#,,,,,,,,,,,,,,,,,,#",
  "#,,,,,,....,,,,,,,,#",
  "#,,,,,,.HH.,,,,,,,,#",
  "#,,,,,,....,,,,,,,,#",
  "#,,,,,,,,,,,,,,,,,,#",
  '#,,"""",,,,,"""",,,#',
  '#,,"""",,,,,"""",,,#',
  "#,,,,,,,,,,,,,,,,,,#",
  "#,,,,,,,,,#3#,,,,,,#",
  "#,,,,,,,,,,,,,,,,,,#",
  "#,,,,,,,,,,,,,,,,,,#",
  "####################",
];

export const TILE = {
  WALL: "#",
  PATH: ".",
  GRASS: ",",
  TALLGRASS: '"',
  WATER: "~",
  HEAL: "H",
  GIG1: "1",
  GIG2: "2",
  GIG3: "3",
};

export const MAP = RAW_MAP.map((row) => row.split(""));
export const MAP_HEIGHT = MAP.length;
export const MAP_WIDTH = MAP[0].length;

export const GIG_TILES = {
  [TILE.GIG1]: "gig1",
  [TILE.GIG2]: "gig2",
  [TILE.GIG3]: "gig3",
};

export function tileAt(col, row) {
  if (row < 0 || row >= MAP_HEIGHT || col < 0 || col >= MAP_WIDTH) return TILE.WALL;
  return MAP[row][col];
}

export function isBlocked(col, row) {
  const t = tileAt(col, row);
  return t === TILE.WALL || t === TILE.WATER;
}

export function isEncounterTile(col, row) {
  return tileAt(col, row) === TILE.TALLGRASS;
}

export function isHealTile(col, row) {
  return tileAt(col, row) === TILE.HEAL;
}

export function gigAt(col, row) {
  const t = tileAt(col, row);
  return GIG_TILES[t] || null;
}

export const PLAYER_START = { col: 9, row: 6 };
