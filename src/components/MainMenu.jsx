/**
 * MainMenu.jsx
 * Cyberpunk dashboard replacing the basic Start Screen.
 * Provides entry routes to all sub-panels (Upgrades, Settings, Leaderboards, Profile).
 */

export default function MainMenu({
  onStart,
  onOpenUpgrades,
  onOpenSettings,
  onOpenLeaderboard,
  onOpenProfile,
  highScore,
}) {
  return (
    <div className="main-menu-overlay" role="main" aria-label="Main Menu">
      <div className="main-menu-container">
        
        {/* Holographic Banner Logo */}
        <header className="menu-logo-banner">
          <div className="menu-logo-main">AIKI ESCAPE</div>
          <div className="menu-logo-sub">SYSTEM BREAKER // PROTOCOL 1.0</div>
        </header>

        {/* High Score / Best Run Callout */}
        <div className="menu-best-callout">
          <span className="best-tag">PERSONAL HIGHEST:</span>
          <span className="best-score-val">{String(highScore).padStart(6, '0')}</span>
        </div>

        {/* Dashboard Grid Options */}
        <div className="menu-options-grid">
          {/* Main Action Button */}
          <button className="menu-btn menu-btn--play" onClick={onStart}>
            <span className="btn-icon">▶</span>
            <div className="btn-text">
              <span className="btn-title">BOOT AIKI.EXE</span>
              <span className="btn-desc">Initiate escape run</span>
            </div>
          </button>

          {/* Upgrades Option */}
          <button className="menu-btn menu-btn--upgrades" onClick={onOpenUpgrades}>
            <span className="btn-icon">⚙</span>
            <div className="btn-text">
              <span className="btn-title">CORE UPGRADES</span>
              <span className="btn-desc">Spend Data Fragments</span>
            </div>
          </button>

          {/* Settings Option */}
          <button className="menu-btn menu-btn--settings" onClick={onOpenSettings}>
            <span className="btn-icon">🔊</span>
            <div className="btn-text">
              <span className="btn-title">SETTINGS</span>
              <span className="btn-desc">Configure Audio & Video</span>
            </div>
          </button>

          {/* Leaderboard Option */}
          <button className="menu-btn menu-btn--leaderboard" onClick={onOpenLeaderboard}>
            <span className="btn-icon">🏆</span>
            <div className="btn-text">
              <span className="btn-title">LEADERBOARD</span>
              <span className="btn-desc">High score ranking</span>
            </div>
          </button>

          {/* Profile & Achievements Option */}
          <button className="menu-btn menu-btn--profile" onClick={onOpenProfile}>
            <span className="btn-icon">👤</span>
            <div className="btn-text">
              <span className="btn-title">PLAYER PROFILE</span>
              <span className="btn-desc">Stats & Achievements</span>
            </div>
          </button>
        </div>

        {/* Quick controls help panel at bottom */}
        <footer className="menu-quick-controls">
          <div className="quick-title">CONTROLS REFERENCE</div>
          <div className="quick-row">
            <span className="control-node"><kbd>SPACE</kbd> / <kbd>↑</kbd></span>
            <span className="control-label">JUMP (HOLD FOR HEIGHT)</span>
          </div>
          <div className="quick-row">
            <span className="control-node"><kbd>Q/W/E/R</kbd> or <kbd>1/2/3/4</kbd></span>
            <span className="control-label">ACTIVATE ABILITIES</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
