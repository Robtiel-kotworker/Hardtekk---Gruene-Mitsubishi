// ============================================================================
// STATE – zentraler Spielzustand, Speichern & Laden
// ============================================================================

import { PLAYER_START } from "./map.js";
import { isSupabaseConfigured, saveGameToCloud, loadGameFromCloud } from "./auth.js";

const LOCAL_KEY = "hardtekk-gruene-mitsubishi-save-v1";

function freshState() {
  return {
    playerName: "Trainer",
    position: { ...PLAYER_START },
    direction: "down",
    team: [{ speciesId: "kickstoff_klaus", level: 5, exp: 0, currentHp: null }],
    storage: [], // Recordbank
    samples: 5, // "Sample"-Fangkarten (Ersatz für Pokébälle)
    gigsWon: [],
    playtimeSeconds: 0,
  };
}

export class GameState {
  constructor() {
    this.data = freshState();
    this.userId = null; // gesetzt nach Login, null = Gastmodus
  }

  async load(userId) {
    this.userId = userId;
    if (userId && isSupabaseConfigured) {
      const { data, error } = await loadGameFromCloud(userId);
      if (!error && data) {
        this.data = { ...freshState(), ...data };
        return "cloud";
      }
    }
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      try {
        this.data = { ...freshState(), ...JSON.parse(raw) };
        return "local";
      } catch {
        this.data = freshState();
      }
    }
    return "new";
  }

  async save() {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(this.data));
    if (this.userId && isSupabaseConfigured) {
      await saveGameToCloud(this.userId, this.data);
    }
  }

  activeBeat() {
    return this.data.team.find((b) => b.currentHp === null || b.currentHp > 0) ?? this.data.team[0];
  }

  hasUsableBeat() {
    return this.data.team.some((b) => b.currentHp === null || b.currentHp > 0);
  }
}
