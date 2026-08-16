// ============================================================================
// UI – DOM-Overlay über dem Canvas (Dialogbox, Menüs, HP-Balken)
// ============================================================================

import { getSpecies } from "./creatures.js";

const dialogEl = () => document.getElementById("dialog-box");
const dialogTextEl = () => document.getElementById("dialog-text");

export function showDialog(text) {
  const box = dialogEl();
  box.classList.remove("hidden");
  dialogTextEl().textContent = text;
}

export function hideDialog() {
  dialogEl().classList.add("hidden");
}

export function isDialogVisible() {
  return !dialogEl().classList.contains("hidden");
}

export function renderHpBar(elId, current, max) {
  const el = document.getElementById(elId);
  if (!el) return;
  const ratio = Math.max(0, Math.min(1, current / max));
  const fill = el.querySelector(".hp-fill");
  fill.style.width = `${ratio * 100}%`;
  fill.classList.toggle("hp-low", ratio <= 0.25);
  fill.classList.toggle("hp-mid", ratio > 0.25 && ratio <= 0.5);
  const label = el.querySelector(".hp-label");
  if (label) label.textContent = `${current}/${max}`;
}

export function setNameLevel(prefix, name, level) {
  const nameEl = document.getElementById(`${prefix}-name`);
  const lvlEl = document.getElementById(`${prefix}-level`);
  if (nameEl) nameEl.textContent = name;
  if (lvlEl) lvlEl.textContent = `Lv. ${level}`;
}

export function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

export function renderTeamList(containerId, team, { selectable = false, onSelect } = {}) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  team.forEach((entry, idx) => {
    const row = document.createElement("button");
    row.className = "team-row";
    row.type = "button";
    const fainted = entry.currentHp === 0;
    const hpText = entry.currentHp === null || entry.currentHp === undefined ? "" : ` – ${entry.currentHp} HP`;
    const speciesName = getSpecies(entry.speciesId).name;
    row.textContent = `${speciesName} Lv.${entry.level}${hpText}${fainted ? " (erschöpft)" : ""}`;
    if (selectable) {
      row.addEventListener("click", () => onSelect?.(idx));
    }
    container.appendChild(row);
  });
}

