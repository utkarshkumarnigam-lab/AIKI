# AIKI — Cyberpunk Runner Game

> A fast-paced, cyberpunk-themed endless runner built entirely with React and the Web Audio API — no game engine, no canvas, no dependencies beyond React itself.

---

## 🎮 What is AIKI?

AIKI is a browser-based endless runner where you play as a rogue AI escaping through neon-lit digital environments. Dodge obstacles, collect data fragments, unlock upgrades, and climb the leaderboard across three escalating levels.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 8](https://vitejs.dev/) |
| Styling | Vanilla CSS (custom properties, animations) |
| Game Loop | `requestAnimationFrame` (no canvas, pure DOM) |
| Audio | HTML5 Web Audio API (procedural synthesis — no audio files) |
| Linting | [Oxlint](https://oxc.rs/docs/guide/usage/linter) |
| Persistence | `localStorage` (scores, upgrades, settings, achievements) |

> **Zero runtime dependencies** beyond React and React DOM. No game engine, no physics library, no audio files.

---

## 🏗️ How It Works

### Game Loop (`useGameEngine.js`)

The entire game logic lives in a single custom React hook — `useGameEngine`. It drives the game via `requestAnimationFrame`, running at ~60 fps:

1. **Physics** — Gravity is applied every frame to the player's vertical velocity (`vy`). Jumping sets `vy` to a negative value (upward force). The player lands when `playerBottom` reaches `GROUND_Y`.
2. **Speed Ramp** — The game world scrolls faster over time. Each level has its own `baseSpeed`, `maxSpeed`, and `speedIncrement` values. Speed is capped and increased incrementally each frame.
3. **Obstacle Spawning** — Obstacles spawn off-screen right and scroll left. Three types exist: `block` (ground), `laser` (tall, ground), and `drone` (airborne). Spawn timing is controlled by `nextObstacleAt` distance thresholds.
4. **Collectible Spawning** — Data Fragments, Encryption Keys, Shield pods, and Overclock pods are spawned similarly and collected via AABB collision detection.
5. **Collision Detection** — Uses simple rectangle overlap (`rectsOverlap`) with a configurable padding for fair hitboxes. The slide move reduces the player hitbox height.
6. **State Sync** — `useRef` objects hold the hot game state (avoiding re-render overhead per frame), while `useState` is called only when React needs to re-render the UI.

### Rendering (DOM-based, not Canvas)

Every game object — player, obstacles, collectibles, particles — is a **positioned `<div>`** styled with CSS. Positions are updated each frame by setting React state. CSS handles all visual styling, animations, and effects.

### Procedural Audio (`audioManager.js`)

All BGM and SFX are **synthesized in real time** using the Web Audio API — there are no audio files in the project:

- **BGM** — A cyberpunk bassline, hi-hat pattern, and lead chime melody are scheduled using a 16th-note tick scheduler running on `setInterval`. Notes are generated using `OscillatorNode` with triangle/sawtooth/sine wave types and filtered through `BiquadFilterNode`.
- **SFX** — Each sound effect (jump, hit, collect, upgrade, transition, game over, achievement) is synthesized on demand using short oscillator bursts with frequency envelopes via `linearRampToValueAtTime` / `exponentialRampToValueAtTime`.

### Levels

| Level | Name | Score Trigger | Obstacle Types |
|---|---|---|---|
| 1 | NEON DISTRICT | Start | Blocks, Lasers |
| 2 | FIREWALL FORTRESS | 500 pts | Blocks, Lasers, Drones |
| 3 | AI CORE | 1200 pts | Blocks, Lasers, Drones (densest) |

Level transitions play a sweep SFX, push obstacle spawns out temporarily, and smoothly interpolate game speed to the new level's base speed.

### Abilities

| Ability | Key | Effect |
|---|---|---|
| Cyber Shield | `Q` / `1` | Absorbs one obstacle hit |
| Overclock | `W` / `2` | Boosts speed + triples score multiplier for 5s |

Abilities can also be activated by picking up their corresponding collectible pods mid-run.

### Upgrade System

Data Fragments collected during runs are stored persistently. Between runs, the player can spend them on two upgrades (up to level 5 each):

- **Speed Core** — Increases base run speed by 5% per level.
- **Shield Core** — Extends Cyber Shield duration by 1.5s per level.

### Achievements

| ID | Title | Condition |
|---|---|---|
| `first_run` | SYSTEM ACCESS | Complete your first run |
| `level_2` | SECURITY BYPASS | Reach Level 2 |
| `level_3` | QUANTUM OVERRIDE | Reach Level 3 |
| `data_50` | DATA GLUTTON | Collect 50 Data Fragments in one run |
| `upgrade_max` | CORE UPGRADED | Max out any upgrade |
| `high_score_1000` | LEGEND RUNNER | Score 1000+ points |

### Persistence (`localStorage`)

All progress is saved locally in the browser:

| Key | Data |
|---|---|
| `aiki_hs` | All-time high score |
| `aiki_upgrades` | Purchased upgrade levels |
| `aiki_total_data` | Cumulative data fragments |
| `aiki_leaderboard` | Top 5 run records |
| `aiki_achievements` | Unlocked achievement IDs |
| `aiki_profile_stats` | Total runs, playtime, items collected |
| `aiki_settings` | BGM/SFX volume, particle density, glitch effects |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Game.jsx            # Main game canvas container
│   ├── Player.jsx          # Player character rendering
│   ├── Obstacle.jsx        # Obstacle rendering (block/laser/drone)
│   ├── Collectible.jsx     # Collectible rendering
│   ├── Background.jsx      # Parallax cyberpunk background layers
│   ├── Ground.jsx          # Ground strip rendering
│   ├── HUD.jsx             # In-game heads-up display (score, energy, abilities)
│   ├── Particles.jsx       # Particle burst effects
│   ├── Popups.jsx          # Floating score/event popups
│   ├── MainMenu.jsx        # Main menu screen
│   ├── StartScreen.jsx     # In-game start prompt overlay
│   ├── GameOverScreen.jsx  # Game over + stats screen
│   ├── LoadingScreen.jsx   # Initial loading screen
│   ├── InitialsModal.jsx   # Leaderboard initials entry
│   ├── LeaderboardMenu.jsx # Top 5 leaderboard view
│   ├── UpgradeMenu.jsx     # Upgrade shop UI
│   ├── ProfileMenu.jsx     # Player stats & achievements
│   └── SettingsMenu.jsx    # Audio & visual settings
├── hooks/
│   └── useGameEngine.js    # Core game loop, physics, state machine
├── utils/
│   └── audioManager.js     # Procedural Web Audio API synthesizer
├── App.jsx                 # Root component & menu routing
├── main.jsx                # React entry point
└── index.css               # Global styles & design tokens
```

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Controls

| Action | Key |
|---|---|
| Jump | `Space` / `↑` |
| Slide | `↓` / `S` |
| Cyber Shield | `Q` / `1` |
| Overclock | `W` / `2` |
| Restart (after death) | `Space` |

---

## 📜 License

MIT
