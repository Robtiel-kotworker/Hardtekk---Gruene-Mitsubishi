// ============================================================================
// MAIN – Einstiegspunkt, State-Machine & Game-Loop
// ============================================================================

import { GAME_CONFIG } from "./config.js";
import { initInput } from "./input.js";
import { isBlocked, isEncounterTile, isHealTile, gigAt } from "./map.js";
import { renderOverworld, renderBattleScene } from "./renderer.js";
import { showDialog, hideDialog, isDialogVisible, renderHpBar, setNameLevel, showScreen, renderTeamList } from "./ui.js";
import { allWildSpeciesIds } from "./creatures.js";
import { getMove } from "./moves.js";
import { instantiateBeat, createWildEncounter, resolveAttack, determineTurnOrder, attemptCatch, grantExp, expReward } from "./battle.js";
import { getGig } from "./gigs.js";
import { GameState } from "./state.js";
import { isSupabaseConfigured, signIn, signUp, signOut, getCurrentUser } from "./auth.js";

// ----------------------------------------------------------------------------
// Setup
// ----------------------------------------------------------------------------

const canvas = document.getElementById("gbscreen");
const ctx = canvas.getContext("2d");

const state = new GameState();
let phase = "title"; // title | auth | overworld | battle | dialog-lock | team
let heldDirections = new Set();
let dialogQueue = [];
let onDialogDone = null;

const world = {
  player: { col: 9, row: 6, offsetX: 0, offsetY: 0, direction: "down", moving: false, moveStart: 0 },
  npcMarkers: [
    { col: 5, row: 2, color: "#7a4ac9" }, // Tür Gig 1 – Keller-Session
    { col: 14, row: 2, color: "#c94a8f" }, // Tür Gig 2 – Lagerhallen-Rave
    { col: 11, row: 14, color: "#c9884a" }, // Tür Gig 3 – Open-Air-Finale
  ],
};

let battle = null; // { player, enemy, isWild, gigId, gigQueue, locked }

// ----------------------------------------------------------------------------
// Boot
// ----------------------------------------------------------------------------

async function boot() {
  document.getElementById("game-title").textContent = GAME_CONFIG.title;
  document.getElementById("guest-note").classList.toggle("hidden", isSupabaseConfigured);

  initInput(handleAction);
  wireAuthForms();
  wireBattleMenu();
  wireOverlayButtons();

  const existingUser = isSupabaseConfigured ? await getCurrentUser() : null;
  if (existingUser) {
    await startGameForUser(existingUser.id);
  } else {
    showScreen("screen-title");
  }

  requestAnimationFrame(loop);
}

// ----------------------------------------------------------------------------
// Auth-Screen
// ----------------------------------------------------------------------------

function wireAuthForms() {
  document.getElementById("btn-goto-login").addEventListener("click", () => showScreen("screen-auth"));
  document.getElementById("btn-guest").addEventListener("click", async () => {
    await startGameForUser(null);
  });

  document.getElementById("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const mode = document.querySelector('input[name="auth-mode"]:checked').value;
    const errorEl = document.getElementById("auth-error");
    errorEl.textContent = "";

    const result = mode === "signup" ? await signUp(email, password) : await signIn(email, password);
    if (result.error) {
      errorEl.textContent = result.error;
      return;
    }
    if (mode === "signup" && !result.session) {
      errorEl.textContent = "Registrierung erfolgreich – bitte E-Mail bestätigen und dann einloggen.";
      return;
    }
    await startGameForUser(result.user.id);
  });
}

async function startGameForUser(userId) {
  const source = await state.load(userId);
  world.player.col = state.data.position.col;
  world.player.row = state.data.position.row;
  world.player.direction = state.data.direction;
  phase = "overworld";
  showScreen("screen-game");
  const label = userId ? "Cloud-Speicherstand" : "Gastmodus (lokal gespeichert)";
  queueDialog(
    source === "new"
      ? `Willkommen! Dein Abenteuer beginnt jetzt. (${label})`
      : `Willkommen zurück! Speicherstand geladen. (${label})`
  );
}

// ----------------------------------------------------------------------------
// Input-Handling
// ----------------------------------------------------------------------------

function handleAction(action, kind) {
  if (["up", "down", "left", "right"].includes(action)) {
    if (kind === "down") heldDirections.add(action);
    else heldDirections.delete(action);
    return;
  }

  if (kind !== "down") return;

  if (phase === "dialog-lock") {
    advanceDialog();
    return;
  }

  if (phase === "overworld") {
    if (action === "start") {
      openTeamScreen();
    }
    return;
  }

  if (phase === "team") {
    if (action === "b" || action === "start") closeTeamScreen();
    return;
  }

  if (phase === "battle") {
    // Battle-Menü wird über eigene Buttons gesteuert (siehe wireBattleMenu),
    // B bricht ein Untermenü ab.
    if (action === "b") showBattleRoot();
  }
}

// ----------------------------------------------------------------------------
// Dialog-System
// ----------------------------------------------------------------------------

function queueDialog(text, onDone) {
  dialogQueue.push(text);
  onDialogDone = onDone ?? onDialogDone;
  if (phase !== "dialog-lock") {
    phase = "dialog-lock";
    advanceDialog();
  }
}

function advanceDialog() {
  if (dialogQueue.length === 0) {
    hideDialog();
    const cb = onDialogDone;
    onDialogDone = null;
    phase = battle ? "battle" : "overworld";
    cb?.();
    return;
  }
  showDialog(dialogQueue.shift());
}

// ----------------------------------------------------------------------------
// Overworld / Bewegung
// ----------------------------------------------------------------------------

function tryStartMove(now) {
  if (world.player.moving) return;
  const dir = [...heldDirections][0];
  if (!dir) return;

  const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
  world.player.direction = dir;
  const targetCol = world.player.col + delta[0];
  const targetRow = world.player.row + delta[1];

  if (isBlocked(targetCol, targetRow)) return;

  world.player.moving = true;
  world.player.moveStart = now;
  world.player.fromCol = world.player.col;
  world.player.fromRow = world.player.row;
  world.player.toCol = targetCol;
  world.player.toRow = targetRow;
}

function updateMovement(now) {
  if (!world.player.moving) return;
  const t = Math.min(1, (now - world.player.moveStart) / GAME_CONFIG.moveIntervalMs);
  world.player.offsetX = (world.player.toCol - world.player.fromCol) * (t - 1);
  world.player.offsetY = (world.player.toRow - world.player.fromRow) * (t - 1);

  if (t >= 1) {
    world.player.col = world.player.toCol;
    world.player.row = world.player.toRow;
    world.player.offsetX = 0;
    world.player.offsetY = 0;
    world.player.moving = false;
    onArriveAtTile();
  }
}

async function onArriveAtTile() {
  state.data.position = { col: world.player.col, row: world.player.row };
  state.data.direction = world.player.direction;
  await state.save();

  const gigId = gigAt(world.player.col, world.player.row);
  if (gigId) {
    startGigBattle(gigId);
    return;
  }

  if (isHealTile(world.player.col, world.player.row)) {
    healTeam();
    return;
  }

  if (isEncounterTile(world.player.col, world.player.row) && Math.random() < GAME_CONFIG.encounterChance) {
    startWildEncounter();
  }
}

function healTeam() {
  const wasHurt = state.data.team.some((b) => b.currentHp !== null && b.currentHp < 999 && b.currentHp !== 0);
  state.data.team = state.data.team.map((b) => ({ ...b, currentHp: null }));
  state.save();
  if (wasHurt) queueDialog("An der Recordbank: Dein Team ist wieder voll aufgeladen!");
}

// ----------------------------------------------------------------------------
// Team-/Recordbank-Screen
// ----------------------------------------------------------------------------

function openTeamScreen() {
  phase = "team";
  showScreen("screen-team");
  renderTeamList("team-list", state.data.team);
  document.getElementById("team-samples").textContent = `Samples: ${state.data.samples}`;
  document.getElementById("team-gigs").textContent = `Gigs gewonnen: ${state.data.gigsWon.length}/3`;
}

function closeTeamScreen() {
  phase = "overworld";
  showScreen("screen-game");
}

function wireOverlayButtons() {
  document.getElementById("btn-close-team").addEventListener("click", closeTeamScreen);
  document.getElementById("btn-logout").addEventListener("click", async () => {
    await signOut();
    location.reload();
  });
}

// ----------------------------------------------------------------------------
// Kampf-Flow
// ----------------------------------------------------------------------------

function pickWildSpecies() {
  const ids = allWildSpeciesIds();
  return ids[Math.floor(Math.random() * ids.length)];
}

function startWildEncounter() {
  const speciesId = pickWildSpecies();
  const level = 3 + Math.floor(Math.random() * 6);
  const enemy = createWildEncounter(speciesId, level);
  const activeEntry = state.data.team.find((b) => b.currentHp === null || b.currentHp > 0);
  if (!activeEntry) {
    queueDialog("Dein Team ist erschöpft – schnell zur Recordbank!");
    return;
  }
  battle = {
    player: instantiateBeat(activeEntry),
    playerEntryIndex: state.data.team.indexOf(activeEntry),
    enemy,
    isWild: true,
    gigId: null,
    gigQueue: [],
  };
  enterBattleScreen(`Ein wildes ${enemy.name} (Lv. ${enemy.level}) taucht auf!`);
}

function startGigBattle(gigId) {
  if (state.data.gigsWon.includes(gigId)) {
    queueDialog("Diesen Gig hast du bereits gerockt. Weiter geht's!");
    return;
  }
  const gig = getGig(gigId);
  const activeEntry = state.data.team.find((b) => b.currentHp === null || b.currentHp > 0);
  if (!activeEntry) {
    queueDialog("Dein Team ist erschöpft – erst zur Recordbank, dann zum Gig!");
    return;
  }
  const queue = gig.team.slice(1).map((t) => createWildEncounter(t.speciesId, t.level));
  battle = {
    player: instantiateBeat(activeEntry),
    playerEntryIndex: state.data.team.indexOf(activeEntry),
    enemy: createWildEncounter(gig.team[0].speciesId, gig.team[0].level),
    isWild: false,
    gigId,
    gigQueue: queue,
  };
  enterBattleScreen(gig.introText);
}

function enterBattleScreen(introText) {
  showScreen("screen-battle");
  phase = "battle";
  document.getElementById("btn-catch").classList.toggle("hidden", !battle.isWild);
  document.getElementById("btn-run").classList.toggle("hidden", !battle.isWild);
  refreshBattleUI();
  showBattleRoot();
  queueDialog(introText);
}

function refreshBattleUI() {
  setNameLevel("battle-player", battle.player.name, battle.player.level);
  setNameLevel("battle-enemy", battle.enemy.name, battle.enemy.level);
  renderHpBar("battle-player-hp", battle.player.currentHp, battle.player.maxHp);
  renderHpBar("battle-enemy-hp", battle.enemy.currentHp, battle.enemy.maxHp);
  const movesContainer = document.getElementById("move-buttons");
  movesContainer.innerHTML = "";
  battle.player.moves.forEach((moveId) => {
    const move = getMove(moveId);
    const btn = document.createElement("button");
    btn.className = "gb-menu-btn";
    btn.type = "button";
    btn.textContent = move.name;
    btn.addEventListener("click", () => playerTurn(moveId));
    movesContainer.appendChild(btn);
  });
}

function wireBattleMenu() {
  document.getElementById("btn-fight").addEventListener("click", () => {
    document.getElementById("battle-root-menu").classList.add("hidden");
    document.getElementById("move-buttons").classList.remove("hidden");
  });
  document.getElementById("btn-catch").addEventListener("click", () => tryCatch());
  document.getElementById("btn-run").addEventListener("click", () => tryRun());
  document.getElementById("btn-battle-team").addEventListener("click", () => openBattleTeamSwitch());
}

function showBattleRoot() {
  document.getElementById("battle-root-menu").classList.remove("hidden");
  document.getElementById("move-buttons").classList.add("hidden");
  document.getElementById("battle-team-switch").classList.add("hidden");
}

function playerTurn(moveId) {
  if (isDialogVisible() || !battle) return;
  const [first, second] = determineTurnOrder(battle.player, battle.enemy);
  const firstIsPlayer = first === battle.player;

  const firstLog = resolveAttack(first, second, firstIsPlayer ? moveId : chooseEnemyMove());
  const lines = [describeAttack(firstIsPlayer ? "Du" : battle.enemy.name, firstLog)];

  refreshBattleUI();

  if (second.currentHp > 0) {
    const secondLog = resolveAttack(second, first, firstIsPlayer ? chooseEnemyMove() : moveId);
    lines.push(describeAttack(firstIsPlayer ? battle.enemy.name : "Du", secondLog));
  }

  queueDialog(lines.join(" "), () => afterTurnCheck());
  refreshBattleUI();
}

function chooseEnemyMove() {
  const moves = battle.enemy.moves;
  return moves[Math.floor(Math.random() * moves.length)];
}

function describeAttack(actorLabel, log) {
  if (!log.hit) return `${actorLabel} setzt ${log.moveName} ein – daneben!`;
  let text = `${actorLabel} setzt ${log.moveName} ein: ${log.damage} Schaden.`;
  if (log.multiplier > 1) text += " Sehr effektiv!";
  if (log.multiplier < 1) text += " Nicht sehr effektiv...";
  if (log.fainted) text += " K.o.!";
  return text;
}

async function afterTurnCheck() {
  refreshBattleUI();

  if (battle.player.currentHp <= 0) {
    await onPlayerBeatFainted();
    return;
  }
  if (battle.enemy.currentHp <= 0) {
    await onEnemyBeatFainted();
    return;
  }
  showBattleRoot();
}

async function onPlayerBeatFainted() {
  const nextEntry = state.data.team.find(
    (b, i) => i !== battle.playerEntryIndex && (b.currentHp === null || b.currentHp > 0)
  );
  persistActiveBeatHp();
  if (!nextEntry) {
    queueDialog("Dein ganzes Team ist erschöpft! Du ziehst dich zur Recordbank zurück.", () => {
      endBattle(false);
    });
    return;
  }
  battle.player = instantiateBeat(nextEntry);
  battle.playerEntryIndex = state.data.team.indexOf(nextEntry);
  refreshBattleUI();
  queueDialog(`Los, ${battle.player.name}!`, () => showBattleRoot());
}

async function onEnemyBeatFainted() {
  const reward = expReward(battle.enemy);
  const entry = state.data.team[battle.playerEntryIndex];
  const { updated, leveledUp } = grantExp(entry, reward);
  updated.currentHp = battle.player.currentHp;
  state.data.team[battle.playerEntryIndex] = updated;
  await state.save();

  const lines = [`${battle.enemy.name} ist erschöpft. Du erhältst ${reward} EP.`];
  if (leveledUp) lines.push(`${updated.speciesId} steigt auf Level ${updated.level} auf!`);

  if (battle.gigQueue.length > 0) {
    battle.enemy = battle.gigQueue.shift();
    queueDialog(lines.join(" "), () => {
      refreshBattleUI();
      queueDialog(`Nächster Beat: ${battle.enemy.name}!`, () => showBattleRoot());
    });
    return;
  }

  if (!battle.isWild) {
    const gig = getGig(battle.gigId);
    state.data.gigsWon = [...new Set([...state.data.gigsWon, battle.gigId])];
    await state.save();
    lines.push(gig.winText);
  }

  queueDialog(lines.join(" "), () => endBattle(true));
}

function tryCatch() {
  if (!battle.isWild) return;
  if (state.data.samples <= 0) {
    queueDialog("Keine Samples mehr übrig!");
    return;
  }
  state.data.samples -= 1;
  const success = attemptCatch(battle.enemy);
  if (success) {
    const caught = {
      speciesId: battle.enemy.speciesId,
      level: battle.enemy.level,
      exp: 0,
      currentHp: null,
    };
    if (state.data.team.length < 6) {
      state.data.team.push(caught);
    } else {
      state.data.storage.push(caught);
    }
    persistActiveBeatHp();
    state.save();
    queueDialog(`${battle.enemy.name} wurde gesamplet!`, () => endBattle(true));
  } else {
    queueDialog(`${battle.enemy.name} entkommt dem Sample-Versuch!`, () => showBattleRoot());
  }
}

function tryRun() {
  if (!battle.isWild) return;
  persistActiveBeatHp();
  queueDialog("Du ziehst dich zurück.", () => endBattle(false));
}

function persistActiveBeatHp() {
  if (!battle) return;
  const entry = state.data.team[battle.playerEntryIndex];
  if (entry) entry.currentHp = battle.player.currentHp;
}

function openBattleTeamSwitch() {
  document.getElementById("battle-root-menu").classList.add("hidden");
  const box = document.getElementById("battle-team-switch");
  box.classList.remove("hidden");
  renderTeamList("battle-team-list", state.data.team, {
    selectable: true,
    onSelect: (idx) => {
      const entry = state.data.team[idx];
      if (entry.currentHp === 0) {
        queueDialog("Dieser Beat ist erschöpft.");
        return;
      }
      persistActiveBeatHp();
      battle.player = instantiateBeat(entry);
      battle.playerEntryIndex = idx;
      refreshBattleUI();
      showBattleRoot();
    },
  });
}

function endBattle(won) {
  battle = null;
  phase = "overworld";
  showScreen("screen-game");
}

// ----------------------------------------------------------------------------
// Game-Loop
// ----------------------------------------------------------------------------

function loop(now) {
  if (phase === "overworld") {
    tryStartMove(now);
    updateMovement(now);
    renderOverworld(ctx, world);
  } else if (phase === "battle" && battle) {
    renderBattleScene(ctx, battle);
  }
  requestAnimationFrame(loop);
}

boot();
