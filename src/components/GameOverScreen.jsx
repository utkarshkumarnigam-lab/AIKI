/**
 * GameOverScreen.jsx
 * Shown when AIKI's energy is depleted. Displays final score, high score,
 * collected items, restart, and a back-to-home button.
 */

export default function GameOverScreen({ score, highScore, keysCount, dataCount, onRestart, onGoHome, onOpenUpgrades }) {
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div
      className="game-over-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Game Over"
    >
      <div className="game-over-panel">
        <h1 className="game-over-glitch">ENERGY DEPLETED</h1>
        <p className="game-over-sub">
          {isNewRecord ? '★ NEW RECORD — SYSTEM ESCAPED ★' : 'AIKI.EXE TERMINATED'}
        </p>

        {/* Primary Stats Grid */}
        <div className="game-over-stats">
          <div className="stat-block">
            <div className="stat-label">Score</div>
            <div className="stat-value" id="game-over-score">
              {String(score).padStart(6, '0')}
            </div>
          </div>
          <div className="stat-block">
            <div className="stat-label">Best</div>
            <div className="stat-value" id="game-over-highscore">
              {String(highScore).padStart(6, '0')}
            </div>
          </div>
        </div>

        {/* Collected Items Summary */}
        <div className="game-over-collectibles-summary">
          <div className="summary-title">RUN ANALYTICS</div>
          <div className="summary-row">
            <span className="summary-item">
              <span style={{ color: 'var(--neon-cyan)', marginRight: 6 }}>❖</span>
              DATA FRAGMENTS
            </span>
            <span className="summary-value cyan-glow">+{dataCount}</span>
          </div>
          <div className="summary-row">
            <span className="summary-item">
              <span style={{ color: 'var(--neon-yellow)', marginRight: 6 }}>🔑</span>
              ENCRYPTION KEYS
            </span>
            <span className="summary-value yellow-glow">{keysCount}</span>
          </div>
        </div>

        {/* Final energy bar (empty) */}
        <div className="game-over-energy-bar" aria-hidden="true">
          <div className="game-over-energy-track">
            <div className="game-over-energy-fill" style={{ width: '0%' }} />
          </div>
          <span style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--neon-pink)' }}>
            ■ CRITICAL FAILURE
          </span>
        </div>

        {/* Action Buttons */}
        <div className="game-over-actions" style={{ display: 'flex', gap: 14, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            id="restart-btn"
            className="restart-btn"
            onClick={onRestart}
            aria-label="Restart game"
          >
            <span>⟳</span>
            REBOOT AIKI
          </button>

          <button
            id="home-btn"
            className="game-over-upgrade-btn"
            onClick={onGoHome}
            aria-label="Back to main menu"
            style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(180,74,255,0.08))',
              borderColor: 'var(--neon-cyan)',
              color: 'var(--neon-cyan)',
            }}
          >
            <span>⌂</span>
            HOME
          </button>

          <button
            className="game-over-upgrade-btn"
            onClick={onOpenUpgrades}
            aria-label="Open upgrades menu"
          >
            <span>⚙</span>
            CORE UPGRADES
          </button>
        </div>

        <p style={{
          marginTop: 16,
          fontSize: 10,
          color: 'rgba(224,247,255,0.3)',
          letterSpacing: '0.15em',
        }}>
          SPACE · ↑ · TAP TO RESTART
        </p>
      </div>
    </div>
  );
}
