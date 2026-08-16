// ============================================================================
// GIGS – Boss-Herausforderungen (Ersatz für Arenaorden)
// ============================================================================

export const GIGS = {
  gig1: {
    id: "gig1",
    name: "Keller-Session",
    bossName: "Resident-Rico",
    team: [{ speciesId: "kickstoff_klaus", level: 10 }],
    reward: "Keller-Gig-Pass",
    introText: "Resident-Rico blockiert den Eingang: „Willst du hier rein? Dann zeig mir erst deinen Sound!“",
    winText: "Resident-Rico nickt anerkennend: „Alter, das saß. Der Keller-Gig-Pass gehört dir.“",
  },
  gig2: {
    id: "gig2",
    name: "Lagerhallen-Rave",
    bossName: "MC Dauerschicht",
    team: [
      { speciesId: "bassdruck_bernd", level: 14 },
      { speciesId: "tinnitus_timo", level: 13 },
    ],
    reward: "Lagerhallen-Gig-Pass",
    introText: "MC Dauerschicht grinst: „Zwei Sets, ein Gewinner. Bereit für die Halle?“",
    winText: "MC Dauerschicht reicht dir den Lagerhallen-Gig-Pass: „Respekt. Nächstes Mal buch ich dich.“",
  },
  gig3: {
    id: "gig3",
    name: "Open-Air-Finale",
    bossName: "DJ Dauerregen",
    team: [
      { speciesId: "schranzhammer_schorsch", level: 20 },
      { speciesId: "hallenrave_hilde_maxx", level: 19 },
      { speciesId: "droehnfeld_doreen", level: 20 },
    ],
    reward: "Open-Air-Gig-Pass",
    introText: "DJ Dauerregen legt die Kopfhörer ab: „Letzter Slot heute. Zeig, was du drauf hast.“",
    winText: "DJ Dauerregen verbeugt sich: „Das Finale gehört dir. Der Open-Air-Gig-Pass ist verdient.“",
  },
};

export function getGig(id) {
  const g = GIGS[id];
  if (!g) throw new Error(`Unbekannter Gig: ${id}`);
  return g;
}
