# Hardtekk-Grüne Mitsubishi

Ein rundenbasiertes Browser-RPG im Look eines klassischen Handheld-Konsolen-Gehäuses
(D-Pad, A/B, Start/Select – alles im Bild), stark angelehnt an das Genre der
90er/00er-Monster-Sammel-RPGs. Statt Monster fängt und trainiert man **Hardtekk-Tracks**:
Hardtechno-/Hardstyle-Tracks mit völlig durchgeknallten Namen, die man in freier
Wildbahn samplet, trainiert und bei drei **Gigs** gegen schrullige DJ-Bosse
antreten lässt.

Reines Frontend-Projekt (kein Build-Schritt nötig – Vanilla JS/HTML/CSS + ES-Module),
Login läuft über **Supabase Auth**, gehostet z.B. über **Cloudflare Pages**.

## Projektstruktur

```
hardtekk-gruene-mitsubishi/
├── index.html          Gameboy-Gehäuse + alle Screens (Title, Login, Spiel, Team, Kampf)
├── css/style.css        Gesamtes Styling des Gehäuses & der UI
├── js/
│   ├── config.js         Supabase-Konfiguration + Spiel-Konstanten
│   ├── auth.js            Supabase-Auth-Wrapper (Login/Registrierung/Speichern in der Cloud)
│   ├── state.js           Zentraler Spielzustand, Speichern/Laden (Cloud oder lokal)
│   ├── map.js              Overworld-Tilemap
│   ├── creatures.js        Datenbank aller Hardtekk-Tracks
│   ├── moves.js             Attacken-Datenbank
│   ├── gigs.js               Boss-Kämpfe ("Gigs")
│   ├── battle.js              Kampf-Logik (Schaden, EP, Fangchance)
│   ├── sprites.js               Prozedurale Pixel-Sprites (kein Bildmaterial nötig)
│   ├── renderer.js                Canvas-Rendering (Overworld & Kampfszene)
│   ├── ui.js                       DOM-Overlay (Dialogbox, Menüs, HP-Balken)
│   ├── input.js                     Tastatur- & Touch-Steuerung
│   └── main.js                       Einstiegspunkt, State-Machine, Game-Loop
└── supabase/schema.sql   SQL-Schema für Spielstände (Tabelle "saves" + RLS)
```

## 1. Lokal testen

Da ES-Module verwendet werden, muss die Seite über **http(s)**, nicht über
`file://`, geöffnet werden. Am einfachsten mit einem kleinen lokalen Server:

```bash
cd hardtekk-gruene-mitsubishi
python3 -m http.server 8080
# dann im Browser: http://localhost:8080
```

Ohne Supabase-Konfiguration läuft das Spiel sofort im **Gastmodus**
(Speicherstand im Browser-LocalStorage) – perfekt zum Antesten.

## 2. Supabase einrichten

1. Auf [supabase.com](https://supabase.com) ein neues Projekt anlegen.
2. Unter **SQL Editor** den Inhalt von `supabase/schema.sql` einfügen und ausführen.
   Das legt die Tabelle `saves` inkl. Row-Level-Security an (jede:r Nutzer:in
   sieht ausschließlich den eigenen Spielstand).
3. Unter **Authentication → Providers** sicherstellen, dass "Email" aktiviert ist.
   Für den schnellen Start kann man unter **Authentication → Settings** die
   Pflicht zur E-Mail-Bestätigung deaktivieren (optional).
4. Unter **Project Settings → API** die `Project URL` und den `anon public`-Key
   kopieren und in `js/config.js` eintragen:

   ```js
   export const SUPABASE_CONFIG = {
     url: "https://xxxxxxxxxxxx.supabase.co",
     anonKey: "eyJhbGciOi...",
   };
   ```

Sobald diese beiden Werte gesetzt sind, erscheint auf dem Titelbildschirm der
"Anmelden"-Button mit echtem Login/Registrierung, und Spielstände werden
zusätzlich zur lokalen Kopie in der Tabelle `saves` gesichert.

## 3. Deployment über Cloudflare Pages

1. Dieses Verzeichnis (den entpackten Inhalt der ZIP-Datei) in ein neues
   Git-Repository pushen, z.B.:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: Hardtekk-Grüne Mitsubishi"
   git branch -M main
   git remote add origin <DEIN_REPO_URL>
   git push -u origin main
   ```

2. Im [Cloudflare-Dashboard](https://dash.cloudflare.com) → **Workers & Pages
   → Create → Pages → Connect to Git** das Repository auswählen.
3. Build-Einstellungen:
   - **Framework preset:** None
   - **Build command:** (leer lassen)
   - **Build output directory:** `/` (Projekt-Wurzel, da statisches HTML/JS/CSS)
4. Deployen – Cloudflare stellt danach einen Link (`*.pages.dev`) bereit, über
   den das Spiel direkt im Browser spielbar ist.

> Da die Supabase-Keys clientseitig sichtbar sind (das ist bei Supabase so
> vorgesehen), sorgt ausschließlich die Row-Level-Security in
> `supabase/schema.sql` dafür, dass niemand fremde Spielstände lesen/schreiben
> kann.

## Spielprinzip

- **Steuerung:** Pfeiltasten/WASD zum Laufen, `Enter`/`Leertaste` = A,
  `X`/`Backspace` = B, `Escape` = Start (Team/Recordbank), `Shift` = Select.
  Auf Mobilgeräten funktionieren die eingeblendeten Tasten per Touch.
- **Hohes Gras** löst zufällige Begegnungen mit wilden Hardtekk-Tracks aus.
- **Kampf:** rundenbasiert nach Geschwindigkeit, mit Genre-Vorteilen
  (Kick > Bass > Schranz > Noise > Kick, Trance > Dub > Trance ...).
- **Sample nehmen** statt Pokéball werfen – die Fangchance steigt, je niedriger
  die HP des wilden Beats sind.
- **Recordbank** (Symbol `H` auf der Karte) heilt das Team komplett.
- **Gigs** (drei markierte Gebäude) sind Boss-Kämpfe gegen DJ-Charaktere mit
  eigenem Team – als Ersatz für Arenaorden.

## Erweiterungsideen

Das Projekt ist bewusst modular aufgebaut, damit es sich leicht ausbauen lässt:

- Weitere Hardtekk-Tracks in `js/creatures.js` ergänzen (Struktur ist selbsterklärend).
- Größere/mehrere Karten in `js/map.js` (aktuell eine kompakte Beispielkarte).
- Trainer-Kämpfe (NPCs mit eigenem Team) analog zu den Gigs in `js/gigs.js`.
- Echte Pixel-Art statt der prozeduralen Sprites in `js/sprites.js` einbinden,
  sobald eigenes Bildmaterial vorhanden ist.

## Hinweis zu Grafik & Inspiration

Alle Sprites werden zur Laufzeit per Code aus einfachen Pixel-Mustern
gezeichnet (`js/sprites.js`) – es wird kein fremdes Bild- oder Audiomaterial
verwendet. Namen, Charaktere und Texte sind frei erfunden.
