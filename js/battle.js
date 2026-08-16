// ============================================================================
// BATTLE – rundenbasiertes Kampfsystem
// ============================================================================

import { getSpecies, typeMultiplier } from "./creatures.js";
import { getMove } from "./moves.js";

/**
 * Erzeugt eine Kampf-Instanz einer Kreatur aus einem gespeicherten
 * Team-Eintrag ({ speciesId, level, exp, currentHp, ivBoost }).
 */
export function instantiateBeat(entry) {
  const species = getSpecies(entry.speciesId);
  const stats = computeStats(species.baseStats, entry.level);
  return {
    speciesId: entry.speciesId,
    name: species.name,
    genre: species.genre,
    level: entry.level,
    exp: entry.exp ?? 0,
    moves: species.moves,
    maxHp: stats.hp,
    currentHp: entry.currentHp ?? stats.hp,
    atk: stats.atk,
    def: stats.def,
    spd: stats.spd,
    spdStage: 0,
    palette: species.palette,
  };
}

function computeStats(base, level) {
  const growth = 1 + (level - 1) * 0.12;
  return {
    hp: Math.round(base.hp * growth),
    atk: Math.round(base.atk * growth),
    def: Math.round(base.def * growth),
    spd: Math.round(base.spd * growth),
  };
}

export function createWildEncounter(speciesId, level) {
  return instantiateBeat({ speciesId, level, exp: 0 });
}

function effectiveSpeed(beat) {
  const mult = 1 + beat.spdStage * 0.25;
  return Math.max(1, Math.round(beat.spd * mult));
}

/**
 * Führt eine Angriffsaktion aus und gibt ein Log-Objekt zurück.
 */
export function resolveAttack(attacker, defender, moveId) {
  const move = getMove(moveId);
  const log = {
    moveName: move.name,
    hit: false,
    fainted: false,
    damage: 0,
    effectApplied: false,
  };

  const hitRoll = Math.random();
  if (hitRoll > move.accuracy) {
    return log;
  }

  log.hit = true;
  const multiplier = typeMultiplier(move.genre, defender.genre);
  const base =
    ((2 * attacker.level) / 5 + 2) *
      move.power *
      (attacker.atk / Math.max(1, defender.def)) /
      50 +
    2;
  const variance = 0.85 + Math.random() * 0.15;
  const damage = Math.max(1, Math.round(base * multiplier * variance));

  defender.currentHp = Math.max(0, defender.currentHp - damage);
  log.damage = damage;
  log.multiplier = multiplier;
  log.fainted = defender.currentHp === 0;

  if (move.effect && Math.random() < move.effect.chance) {
    if (move.effect.stat === "spd") {
      defender.spdStage = Math.max(
        -2,
        Math.min(2, defender.spdStage + move.effect.stages)
      );
      log.effectApplied = true;
    }
  }

  return log;
}

/** Bestimmt, wer zuerst dran ist. */
export function determineTurnOrder(a, b) {
  return effectiveSpeed(a) >= effectiveSpeed(b) ? [a, b] : [b, a];
}

/**
 * Fangversuch ("Sample nehmen"): Erfolgschance sinkt mit HP-Anteil des
 * Ziels und steigt, je niedriger dessen aktuelle HP sind.
 */
export function attemptCatch(target) {
  const hpRatio = target.currentHp / target.maxHp;
  const baseChance = 0.35;
  const chance = Math.min(0.95, baseChance + (1 - hpRatio) * 0.6);
  return Math.random() < chance;
}

const EXP_PER_LEVEL = 45;

export function grantExp(entry, amount) {
  const updated = { ...entry, exp: (entry.exp ?? 0) + amount };
  let leveledUp = false;

  while (
    updated.exp >= EXP_PER_LEVEL * updated.level &&
    updated.level < 60
  ) {
    updated.exp -= EXP_PER_LEVEL * updated.level;
    updated.level += 1;
    leveledUp = true;
  }

  return { updated, leveledUp };
}

export function expReward(defeatedBeat) {
  return Math.max(8, Math.round(defeatedBeat.level * 6));
}
