/**
 * ProfileMenu.jsx
 * Displays player stats (playtime, total runs, data collected) and achievements.
 */

import { ACHIEVEMENTS } from '../hooks/useGameEngine';

export default function ProfileMenu({ stats, unlockedAchievements, onClose }) {
  // Format playtime into human readable minutes and seconds
  const formatPlaytime = (seconds) => {
    if (!seconds || seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // Determine ranking title based on high score
  const getRankTitle = (highScore) => {
    if (highScore >= 2000) return { title: 'QUANTUM ARCH-DAEMON', color: 'var(--neon-pink)' };
    if (highScore >= 1200) return { title: 'CYBER SHADOW GHOST', color: 'var(--neon-purple)' };
    if (highScore >= 700)  return { title: 'SYSTEM INFILTRATOR', color: 'var(--neon-yellow)' };
    if (highScore >= 300)  return { title: 'NETWORK INTRUDER', color: 'var(--neon-cyan)' };
    return { title: 'D-CLASS ROGUE UNIT', color: 'rgba(255,255,255,0.4)' };
  };

  const rank = getRankTitle(stats.highestScore || 0);

  return (
    <div className="upgrade-terminal-overlay" role="dialog" aria-modal="true" aria-label="Player Profile and Achievements">
      <div className="upgrade-terminal" style={{ maxWidth: 740 }}>
        {/* Terminal Header */}
        <header className="terminal-header">
          <div className="terminal-title">
            <span className="terminal-prompt">aiki@terminal:~#</span> ./profile_dump.sh
          </div>
          <div className="terminal-subtitle">■ NETWORK CORE PROTOCOL STATUS</div>
        </header>

        {/* Combined Layout Grid */}
        <main className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 20 }}>
          
          {/* Left Column: Player Stats Info */}
          <section className="profile-stats-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            <h2 style={{ fontFamily: 'var(--font-game)', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6, margin: 0, color: 'var(--neon-cyan)' }}>
              CORE INTEGRATION
            </h2>

            {/* Rank Callout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 8, color: 'var(--text-secondary)', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>NODE SECURITY CLEARANCE</span>
              <span style={{ fontFamily: 'var(--font-game)', fontSize: 13, fontWeight: 700, color: rank.color, textShadow: `0 0 10px ${rank.color}35` }}>
                {rank.title}
              </span>
            </div>

            {/* Stat Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255,255,255,0.04)', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>TOTAL ESCAPES:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{stats.totalRuns || 0} Runs</span>
              </div>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255,255,255,0.04)', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>GRID CONNECTION TIME:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{formatPlaytime(stats.totalPlaytime)}</span>
              </div>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255,255,255,0.04)', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>EXTRACTED FRAGMENTS:</span>
                <span style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>{stats.totalDataCollected || 0} ❖</span>
              </div>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255,255,255,0.04)', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>DECRYPTED KEYS:</span>
                <span style={{ color: 'var(--neon-yellow)', fontWeight: 700 }}>{stats.totalKeysCollected || 0} 🔑</span>
              </div>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>MAX INTENSITY SCORE:</span>
                <span style={{ color: 'var(--neon-pink)', fontWeight: 700 }}>{stats.highestScore || 0}</span>
              </div>
            </div>
          </section>

          {/* Right Column: Achievements Scroll Block */}
          <section className="profile-achievements-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ fontFamily: 'var(--font-game)', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6, margin: 0, color: 'var(--neon-cyan)', textAlign: 'left' }}>
              UNLOCKED RECOVERY ARCHIVES ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
            </h2>

            {/* Scrollable Achievements list */}
            <div className="achievements-scroll-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, maxHeight: 250, overflowY: 'auto', paddingRight: 6 }}>
              {ACHIEVEMENTS.map(ach => {
                const isUnlocked = unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`achievement-item ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 10,
                      background: isUnlocked ? 'rgba(0, 245, 255, 0.03)' : 'rgba(255,255,255,0.01)',
                      border: '1px solid',
                      borderColor: isUnlocked ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                      borderRadius: 6,
                      opacity: isUnlocked ? 1 : 0.45,
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Badge Icon */}
                    <div
                      style={{
                        fontSize: 18,
                        width: 36,
                        height: 36,
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifycontent: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.05)',
                        color: isUnlocked ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                      }}
                    >
                      {isUnlocked ? ach.icon : '🔒'}
                    </div>

                    {/* Meta info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                      <span style={{ fontFamily: 'var(--font-game)', fontSize: 10, fontWeight: 700, color: isUnlocked ? 'var(--neon-cyan)' : 'var(--text-primary)' }}>
                        {ach.title}
                      </span>
                      <span style={{ fontSize: 8, color: 'var(--text-secondary)' }}>
                        {ach.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </main>

        {/* Footer close */}
        <footer className="terminal-footer">
          <button className="terminal-close-btn" onClick={onClose}>
            [ CLOSE ARCHIVES ]
          </button>
        </footer>
      </div>
    </div>
  );
}
