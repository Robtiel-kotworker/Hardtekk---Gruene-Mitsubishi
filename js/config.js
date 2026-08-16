// ============================================================================
// KONFIGURATION – Hardtekk-Grüne Mitsubishi
// ============================================================================
// Trage hier deine Supabase-Projektdaten ein (Project Settings -> API).
// Diese Werte sind öffentlich (Anon Key ist für den Client gedacht),
// der eigentliche Schutz passiert über Row Level Security in Supabase.
//
// Solange SUPABASE_URL leer bleibt, läuft das Spiel automatisch im
// Gastmodus (Speicherstand landet im Browser-LocalStorage) – praktisch
// zum lokalen Testen, bevor Supabase eingerichtet ist.
// ============================================================================

export const SUPABASE_CONFIG = {
  url: "", // z.B. "https://xxxxxxxxxxxx.supabase.co"
  anonKey: "", // z.B. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};

export const GAME_CONFIG = {
  title: "Hardtekk-Grüne Mitsubishi",
  version: "1.0.0",
  tileSize: 16, // Pixel pro Tile in Original-Auflösung
  screenCols: 10, // sichtbare Spalten (10 * 16 = 160px, GBA-typisch)
  screenRows: 9, // sichtbare Zeilen (9 * 16 = 144px)
  encounterChance: 0.12, // Wahrscheinlichkeit pro Schritt im hohen Gras
  moveIntervalMs: 150, // Dauer einer Schrittanimation
};
