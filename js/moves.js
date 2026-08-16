// ============================================================================
// MOVES – Attacken der Hardtekk-Tracks
// ============================================================================

export const MOVES = {
  tempokick: {
    id: "tempokick",
    name: "Tempokick",
    genre: "Kick",
    power: 40,
    accuracy: 0.95,
    description: "Ein schneller, treibender Kick auf voller BPM-Zahl.",
  },
  reverbschlag: {
    id: "reverbschlag",
    name: "Reverb-Schlag",
    genre: "Kick",
    power: 55,
    accuracy: 0.9,
    description: "Ein hallender Schlag, der noch lange nachklingt.",
  },
  overdrive: {
    id: "overdrive",
    name: "Overdrive",
    genre: "Kick",
    power: 75,
    accuracy: 0.8,
    description: "Volle Übersteuerung – hart, aber nicht immer präzise.",
  },
  bassdrop: {
    id: "bassdrop",
    name: "Bassdrop",
    genre: "Bass",
    power: 60,
    accuracy: 0.9,
    description: "Der Boden fällt buchstäblich weg.",
  },
  subsog: {
    id: "subsog",
    name: "Sub-Sog",
    genre: "Bass",
    power: 45,
    accuracy: 0.95,
    description: "Tiefe Subfrequenzen ziehen den Gegner aus dem Takt.",
  },
  clipschlag: {
    id: "clipschlag",
    name: "Clip-Schlag",
    genre: "Schranz",
    power: 65,
    accuracy: 0.85,
    description: "Übersteuert bis zum digitalen Clipping.",
  },
  distortionwelle: {
    id: "distortionwelle",
    name: "Distortion-Welle",
    genre: "Schranz",
    power: 70,
    accuracy: 0.85,
    description: "Eine grob verzerrte Schallwelle voller Kanten.",
  },
  loopfalle: {
    id: "loopfalle",
    name: "Loop-Falle",
    genre: "Trance",
    power: 35,
    accuracy: 0.95,
    description: "Fängt den Gegner in einer Endlosschleife, senkt sein Tempo.",
    effect: { stat: "spd", stages: -1, chance: 0.6 },
  },
  samplezauber: {
    id: "samplezauber",
    name: "Sample-Zauber",
    genre: "Trance",
    power: 65,
    accuracy: 0.9,
    description: "Ein hypnotisierender, wiederkehrender Sample-Loop.",
  },
  feedbackschrei: {
    id: "feedbackschrei",
    name: "Feedback-Schrei",
    genre: "Noise",
    power: 50,
    accuracy: 0.9,
    description: "Schrilles Mikrofon-Feedback direkt ins Ohr.",
  },
};

export function getMove(id) {
  const m = MOVES[id];
  if (!m) throw new Error(`Unbekannte Attacke: ${id}`);
  return m;
}
