/**
 * LeaderboardMenu.jsx
 * High score display screen showing rankings from local database storage.
 */

import { LEVEL_NAMES } from '../hooks/useGameEngine';

export default function LeaderboardMenu({ leaderboard, onClose }) {
  return (
    <div className="upgrade-terminal-overlay" role="dialog" aria-modal="true" aria-label="Leaderboard Rankings">
      <div className="upgrade-terminal">
        {/* Terminal Header */}
        <header className="terminal-header">
          <div className="terminal-title">
            <span className="terminal-prompt">aiki@terminal:~#</span> ./fetch_scores.sh
          </div>
          <div className="terminal-subtitle">■ NETWORK CORE HIGH RUNS</div>
        </header>

        {/* Scores Table list */}
        <main className="leaderboard-body" style={{ minHeight: 250, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leaderboard.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--neon-pink)', fontSize: 11, letterSpacing: '0.1em' }}>
              ⚠️ NO INTRUSION RECORDS LOCATED IN DATA-CACHE
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.map((item, index) => {
                let rankColor = 'rgba(255,255,255,0.7)';
                let glow = '';
                if (index === 0) { rankColor = 'var(--neon-yellow)'; glow = '0 0 10px rgba(255,230,0,0.5)'; }
                else if (index === 1) { rankColor = 'var(--neon-cyan)'; glow = '0 0 10px rgba(0,245,255,0.4)'; }
                else if (index === 2) { rankColor = 'var(--neon-orange)'; glow = '0 0 10px rgba(255,107,0,0.4)'; }

                return (
                  <div
                    key={index}
                    className="leaderboard-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid',
                      borderColor: index === 0 ? 'rgba(255, 230, 0, 0.2)' : 'rgba(255,255,255,0.05)',
                      borderRadius: 6,
                      padding: '10px 16px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Rank Node */}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        fontSize: 14,
                        color: rankColor,
                        width: 30,
                        textAlign: 'left',
                        textShadow: glow,
                      }}
                    >
                      #{index + 1}
                    </span>

                    {/* Player Name */}
                    <span
                      style={{
                        fontFamily: 'var(--font-game)',
                        fontSize: 12,
                        color: rankColor,
                        fontWeight: 700,
                        width: 70,
                        textAlign: 'left',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {item.name}
                    </span>

                    {/* Level details */}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        color: 'var(--text-secondary)',
                        opacity: 0.8,
                        flex: 1,
                        textAlign: 'left',
                      }}
                    >
                      LEVEL {item.level}: {LEVEL_NAMES[item.level] || 'UNKNOWN'}
                    </span>

                    {/* Date */}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 8,
                        color: 'var(--text-secondary)',
                        opacity: 0.5,
                        width: 100,
                        textAlign: 'right',
                        marginRight: 16,
                      }}
                    >
                      {item.date ? new Date(item.date).toLocaleDateString() : 'UNKNOWN'}
                    </span>

                    {/* Score */}
                    <span
                      style={{
                        fontFamily: 'var(--font-game)',
                        fontSize: 14,
                        color: index === 0 ? 'var(--neon-yellow)' : 'var(--text-primary)',
                        textShadow: index === 0 ? '0 0 6px rgba(255,230,0,0.3)' : '',
                        fontWeight: 700,
                        width: 90,
                        textAlign: 'right',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {String(item.score).padStart(6, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Footer close */}
        <footer className="terminal-footer">
          <button className="terminal-close-btn" onClick={onClose}>
            [ DISCONNECT DATABASE ]
          </button>
        </footer>
      </div>
    </div>
  );
}
