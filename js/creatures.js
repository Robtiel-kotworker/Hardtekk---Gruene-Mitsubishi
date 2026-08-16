// ============================================================================
// HARDTEKK-TRACKS – Kreaturen-Datenbank
// ============================================================================
// Jede Art hat: id, name, genre (="Typ"), Basiswerte, Movepool, evolvesTo
// (id der nächsten Stufe + Level-Bedingung) und eine Farbpalette, aus der
// das prozedurale Sprite gezeichnet wird (siehe sprites.js).
// ============================================================================

export const GENRES = [
  "Kick",
  "Bass",
  "Schranz",
  "Trance",
  "Noise",
  "Dub",
];

// Einfache Effektivitäts-Matrix (Angriffs-Genre -> Ziel-Genre -> Multiplikator)
export const GENRE_CHART = {
  Kick: { Bass: 1.5, Trance: 0.5 },
  Bass: { Schranz: 1.5, Kick: 0.5 },
  Schranz: { Noise: 1.5, Bass: 0.5 },
  Trance: { Dub: 1.5, Noise: 0.5 },
  Noise: { Kick: 1.5, Schranz: 0.5 },
  Dub: { Trance: 1.5, Dub: 0.5 },
};

export function typeMultiplier(moveGenre, targetGenre) {
  return GENRE_CHART[moveGenre]?.[targetGenre] ?? 1;
}

export const SPECIES = {
  kickstoff_klaus: {
    id: "kickstoff_klaus",
    name: "Kickstoff-Klaus",
    genre: "Kick",
    baseStats: { hp: 42, atk: 52, def: 40, spd: 58 },
    moves: ["tempokick", "reverbschlag"],
    palette: ["#e2523c", "#7a1d10", "#f5c04a"],
    evolvesTo: { id: "kickwerk_klaus", atLevel: 16 },
    flavor: "Läuft seit drei Tagen ohne Pause auf 150 BPM. Niemand weiß, wovon er sich ernährt.",
  },
  kickwerk_klaus: {
    id: "kickwerk_klaus",
    name: "Kickwerk-Klaus",
    genre: "Kick",
    baseStats: { hp: 68, atk: 78, def: 60, spd: 74 },
    moves: ["tempokick", "reverbschlag", "overdrive"],
    palette: ["#c92f1c", "#4a0d06", "#f5c04a"],
    evolvesTo: null,
    flavor: "Seine Kickdrum hat schon zwei Subwoofer zerlegt und einen Nachbarn zum Umzug bewegt.",
  },

  bassdruck_bernd: {
    id: "bassdruck_bernd",
    name: "Bassdruck-Bernd",
    genre: "Bass",
    baseStats: { hp: 50, atk: 46, def: 48, spd: 40 },
    moves: ["bassdrop", "subsog"],
    palette: ["#2c5f8a", "#12283b", "#7fd1c9"],
    evolvesTo: { id: "bassmolekuel_bernd", atLevel: 18 },
    flavor: "Sein Bass ist so tief, dass Fische im Baggersee nebenan die Orientierung verlieren.",
  },
  bassmolekuel_bernd: {
    id: "bassmolekuel_bernd",
    name: "Bassmolekül-Bernd",
    genre: "Bass",
    baseStats: { hp: 82, atk: 66, def: 70, spd: 52 },
    moves: ["bassdrop", "subsog", "clipschlag"],
    palette: ["#1c3f61", "#08151f", "#7fd1c9"],
    evolvesTo: null,
    flavor: "Wird als seismische Aktivität in der Nähe von Industriegebieten gemeldet.",
  },

  schranz_schorsch: {
    id: "schranz_schorsch",
    name: "Schranz-Schorsch",
    genre: "Schranz",
    baseStats: { hp: 46, atk: 60, def: 34, spd: 62 },
    moves: ["distortionwelle", "clipschlag"],
    palette: ["#8a2c8a", "#33103a", "#d9a3ff"],
    evolvesTo: { id: "schranzhammer_schorsch", atLevel: 20 },
    flavor: "Hört ausschließlich 200 BPM aufwärts. Bei 199 BPM wird er unruhig.",
  },
  schranzhammer_schorsch: {
    id: "schranzhammer_schorsch",
    name: "Schranzhammer-Schorsch",
    genre: "Schranz",
    baseStats: { hp: 74, atk: 92, def: 54, spd: 80 },
    moves: ["distortionwelle", "clipschlag", "overdrive"],
    palette: ["#6b1f6b", "#20081f", "#d9a3ff"],
    evolvesTo: null,
    flavor: "Legende besagt, er hat einmal einen Kirchturm zum Vibrieren gebracht.",
  },

  hallenrave_hilde: {
    id: "hallenrave_hilde",
    name: "Hallenrave-Hilde",
    genre: "Trance",
    baseStats: { hp: 54, atk: 44, def: 44, spd: 56 },
    moves: ["loopfalle", "reverbschlag"],
    palette: ["#f2a33c", "#7a4a0f", "#fff1c9"],
    evolvesTo: { id: "hallenrave_hilde_maxx", atLevel: 19 },
    flavor: "Tanzt seit 1997 durch, mit kurzen Unterbrechungen für Elektrolyte.",
  },
  hallenrave_hilde_maxx: {
    id: "hallenrave_hilde_maxx",
    name: "Hallenrave-Hilde MAXX",
    genre: "Trance",
    baseStats: { hp: 86, atk: 62, def: 64, spd: 78 },
    moves: ["loopfalle", "reverbschlag", "samplezauber"],
    palette: ["#d9821f", "#4a2c06", "#fff1c9"],
    evolvesTo: null,
    flavor: "Ihre Lichtshow ist von Weltraum aus sichtbar, sagen die, die es wissen wollen.",
  },

  tinnitus_timo: {
    id: "tinnitus_timo",
    name: "Tinnitus-Timo",
    genre: "Noise",
    baseStats: { hp: 38, atk: 58, def: 30, spd: 66 },
    moves: ["feedbackschrei", "clipschlag"],
    palette: ["#3c9c4a", "#123a1a", "#c8f5b0"],
    evolvesTo: { id: "tinnitustitan_timo", atLevel: 17 },
    flavor: "Pfeift permanent auf 12 kHz. Hunde im Umkreis von 500m sind not amused.",
  },
  tinnitustitan_timo: {
    id: "tinnitustitan_timo",
    name: "Tinnitus-Titan-Timo",
    genre: "Noise",
    baseStats: { hp: 60, atk: 88, def: 46, spd: 84 },
    moves: ["feedbackschrei", "clipschlag", "distortionwelle"],
    palette: ["#207a2c", "#0a2410", "#c8f5b0"],
    evolvesTo: null,
    flavor: "Sein Feedback-Schrei hat schon drei Mischpulte in den Ruhestand geschickt.",
  },

  droehn_doreen: {
    id: "droehn_doreen",
    name: "Dröhn-Doreen",
    genre: "Dub",
    baseStats: { hp: 48, atk: 40, def: 52, spd: 38 },
    moves: ["subsog", "loopfalle"],
    palette: ["#4a3c8a", "#160f33", "#b3a3ff"],
    evolvesTo: { id: "droehnfeld_doreen", atLevel: 18 },
    flavor: "Redet nur in Echo. In. Echo. Echo. Echo.",
  },
  droehnfeld_doreen: {
    id: "droehnfeld_doreen",
    name: "Dröhnfeld-Doreen",
    genre: "Dub",
    baseStats: { hp: 78, atk: 58, def: 76, spd: 50 },
    moves: ["subsog", "loopfalle", "samplezauber"],
    palette: ["#372a6b", "#0f0a24", "#b3a3ff"],
    evolvesTo: null,
    flavor: "Ihre Delays sind so lang, dass ihr letzter Satz erst nächste Woche ankommt.",
  },
};

export function getSpecies(id) {
  const s = SPECIES[id];
  if (!s) throw new Error(`Unbekannte Spezies: ${id}`);
  return s;
}

export function allWildSpeciesIds() {
  // Nur Basis-Formen tauchen wild auf, Entwicklungen sind seltener/im Gig-Kontext.
  return Object.values(SPECIES)
    .filter((s) => !s.wildExclude)
    .map((s) => s.id);
}
