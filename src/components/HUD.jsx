/**
 * HUD.jsx
 * Heads-Up Display: live status updates, scoring, collectibles.
 */

import { LEVEL_NAMES } from '../hooks/useGameEngine';

export default function HUD({
  score,
  highScore,
  energy,
  maxEnergy,
  keysCount,
  dataCount,
  level = 1,
}) {
  const pct        = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));
  const isCritical = pct <= 25;
  const isLow      = pct <= 50;

  const barColor = isCritical
    ? 'var(--neon-pink)'
    : isLow
    ? 'var(--neon-yellow)'
    : 'var(--neon-green)';

  return (
    <>
      <header className="hud" role="banner">
        {/* Left Column: Title & Level Indicator */}
        <div className="hud-left">
          <div className="hud-title" aria-label="Game title">
            AIKI ESCAPE
            <span className="hud-level-name">
              LEVEL {level}: {LEVEL_NAMES[level] || 'UNKNOWN PROTOCOL'}
            </span>
          </div>
          <div className="hud-best-score">
            <span className="best-label">BEST </span>
            <span className="best-val">{String(highScore).padStart(6, '0')}</span>
          </div>
        </div>

        {/* Center Column: Energy Bar */}
        <div
          className={`hud-energy ${isCritical ? 'hud-energy--critical' : ''}`}
          aria-label={`Energy: ${energy}`}
        >
          <div className="hud-energy-label">
            <span>SYSTEM INTEGRITY</span>
            <span className="hud-energy-value" style={{ color: barColor }}>
              {Math.ceil(energy)}%
            </span>
          </div>
          <div className="hud-energy-track" aria-hidden="true">
            <div
              className="hud-energy-fill"
              style={{
                width:      `${pct}%`,
                background: barColor,
                boxShadow:  `0 0 10px ${barColor}, 0 0 20px ${barColor}55`,
              }}
            />
            {[25, 50, 75].map(t => (
              <div
                key={t}
                className="hud-energy-tick"
                style={{ left: `${t}%` }}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Score & Collectibles Counters */}
        <div className="hud-right">
          {/* Score Counter */}
          <div className="hud-score" aria-live="polite" aria-label={`Score: ${score}`}>
            <div className="hud-score-label">score</div>
            <div className="hud-score-value">{String(score).padStart(6, '0')}</div>
          </div>

          {/* Collectibles Row */}
          <div className="hud-collectibles">
            <div className="collectible-stat stat-data" title="Data Fragments">
              <span className="stat-icon">❖</span>
              <span className="stat-label">DATA</span>
              <span className="stat-count">{dataCount}</span>
            </div>
            <div className="collectible-stat stat-key" title="Encryption Keys">
              <span className="stat-icon">🔑</span>
              <span className="stat-label">KEYS</span>
              <span className="stat-count">{keysCount}</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
