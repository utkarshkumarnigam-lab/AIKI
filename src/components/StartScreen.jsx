/**
 * StartScreen.jsx
 * Title / intro screen shown before the game begins.
 */

export default function StartScreen({ onStart, onOpenUpgrades }) {
  return (
    <div
      className="start-screen"
      role="main"
      aria-label="Start screen"
    >
      {/* Logo */}
      <div className="start-logo">
        <div className="start-logo-main">AIKI ESCAPE</div>
        <div className="start-logo-sub">◈ CYBER BREAK ◈</div>
      </div>

      {/* Story blurb */}
      <p className="start-story">
        <strong>AIKI</strong> is a rogue AI trapped inside a corrupted digital system.
        The system is collapsing, corrupted data-blocks are closing in.
        Run, jump, and survive for as long as you can — or be deleted forever.
      </p>

      {/* Controls */}
      <div className="start-controls">
        <div className="start-controls-title">Controls</div>
        <div className="control-item">
          <span className="key-badge">SPACE</span>
          <span>/</span>
          <span className="key-badge">↑</span>
          <span>Jump</span>
        </div>
        <div className="control-item">
          <span className="key-badge">TAP</span>
          <span>Mobile Jump</span>
        </div>
        <div className="control-item">
          <span className="key-badge">Q/W/E/R</span>
          <span>/</span>
          <span className="key-badge">1/2/3/4</span>
          <span>Abilities</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="start-actions" style={{ display: 'flex', gap: 14, marginTop: 10 }}>
        <button
          id="start-btn"
          className="start-play-btn"
          onClick={onStart}
          aria-label="Start game"
        >
          <span>▶</span>
          BOOT AIKI
        </button>

        <button
          className="start-upgrade-btn"
          onClick={onOpenUpgrades}
          aria-label="Open upgrades menu"
        >
          <span>⚙</span>
          CORE UPGRADES
        </button>
      </div>

      <p style={{
        marginTop: 20,
        fontSize: 10,
        color: 'rgba(224,247,255,0.3)',
        letterSpacing: '0.15em',
      }}>
        PHASE 1 — PROTOTYPE BUILD v0.1.0
      </p>
    </div>
  );
}
