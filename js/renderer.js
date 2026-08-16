// ============================================================================
// RENDERER – zeichnet Overworld und Kampfszene auf das Canvas
// ============================================================================

import { GAME_CONFIG } from "./config.js";
import { MAP, MAP_WIDTH, MAP_HEIGHT, TILE } from "./map.js";
import { drawPlayerSprite } from "./sprites.js";
import { getSpecies } from "./creatures.js";
import { drawCreatureSprite } from "./sprites.js";

const TILE_COLORS = {
  [TILE.WALL]: "#1f4d2b",
  [TILE.PATH]: "#d8c48a",
  [TILE.GRASS]: "#5fa85f",
  [TILE.TALLGRASS]: "#2e8b3f",
  [TILE.WATER]: "#3a7bd5",
  [TILE.HEAL]: "#f0eada",
  [TILE.GIG1]: "#7a4ac9",
  [TILE.GIG2]: "#c94a8f",
  [TILE.GIG3]: "#c9884a",
};

export function renderOverworld(ctx, world) {
  const { tileSize, screenCols, screenRows } = GAME_CONFIG;
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;
  const scale = canvasW / (screenCols * tileSize);
  const st = scale * tileSize;

  // Kamera zentriert auf den Spieler, an Kartenränder geklemmt.
  const camCol = clamp(world.player.col - Math.floor(screenCols / 2), 0, Math.max(0, MAP_WIDTH - screenCols));
  const camRow = clamp(world.player.row - Math.floor(screenRows / 2), 0, Math.max(0, MAP_HEIGHT - screenRows));

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);

  for (let r = 0; r < screenRows; r++) {
    for (let c = 0; c < screenCols; c++) {
      const mapCol = camCol + c;
      const mapRow = camRow + r;
      const tile = mapRow < MAP_HEIGHT && mapCol < MAP_WIDTH ? MAP[mapRow][mapCol] : TILE.WALL;
      ctx.fillStyle = TILE_COLORS[tile] || "#000";
      ctx.fillRect(c * st, r * st, st, st);
      if (tile === TILE.TALLGRASS) {
        ctx.fillStyle = "#1e6b2c";
        ctx.fillRect(c * st + st * 0.15, r * st + st * 0.15, st * 0.7, st * 0.7);
      }
    }
  }

  // NPCs (Gig-Bosse) als kleine Marker vor ihren Türen
  world.npcMarkers?.forEach((npc) => {
    const sx = (npc.col - camCol) * st;
    const sy = (npc.row - camRow) * st;
    if (sx < -st || sy < -st || sx > canvasW || sy > canvasH) return;
    ctx.fillStyle = npc.color;
    ctx.fillRect(sx + st * 0.2, sy + st * 0.1, st * 0.6, st * 0.8);
  });

  // Spieler (mit Bewegungs-Offset für flüssiges Laufen)
  const px = (world.player.col - camCol) * st + world.player.offsetX * st;
  const py = (world.player.row - camRow) * st + world.player.offsetY * st;
  drawPlayerSprite(ctx, px, py, world.player.direction, st / 8);
}

export function renderBattleScene(ctx, battle) {
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;

  // Hintergrund: schlichte Bühnen-/Club-Kulisse
  const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
  grad.addColorStop(0, "#1a1035");
  grad.addColorStop(1, "#3a2560");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.fillStyle = "#241849";
  ctx.fillRect(0, canvasH * 0.62, canvasW, canvasH * 0.4);

  const scale = canvasW / 160;

  // Wildes / gegnerisches Beat oben rechts
  const enemySpecies = getSpecies(battle.enemy.speciesId);
  drawCreatureSprite(ctx, enemySpecies.id, enemySpecies.palette, canvasW * 0.58, canvasH * 0.12, 8 * scale * 0.55);

  // Eigenes Beat unten links
  const playerSpecies = getSpecies(battle.player.speciesId);
  drawCreatureSprite(ctx, playerSpecies.id, playerSpecies.palette, canvasW * 0.1, canvasH * 0.42, 8 * scale * 0.7);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
