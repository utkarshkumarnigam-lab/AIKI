/**
 * UpgradeMenu.jsx
 * Holographic Terminal for Core System modifications and upgrades.
 */

import { UPGRADE_COSTS, MAX_UPGRADE_LEVEL } from '../hooks/useGameEngine';

export default function UpgradeMenu({ upgrades, totalData, purchaseUpgrade, onClose }) {
  const categories = [
    {
      key: 'speed',
      title: 'TACTICAL ACCELERATOR',
      desc: 'Overclocks chassis servos to increase base and max speed by +5% per rank.',
      icon: '⚡',
      color: 'var(--neon-yellow)',
    },
    {
      key: 'shield',
      title: 'SHIELD COLLISION MODULATOR',
      desc: 'Strengthens particle shielding to extend protection duration by +1.5s per rank.',
      icon: '🛡️',
      color: 'var(--neon-cyan)',
    },
  ];

  return (
    <div className="upgrade-terminal-overlay" role="dialog" aria-modal="true" aria-label="System Upgrades Menu">
      <div className="upgrade-terminal">
        {/* Terminal Header */}
        <header className="terminal-header">
          <div className="terminal-title">
            <span className="terminal-prompt">aiki@terminal:~#</span> ./inject_system.exe
          </div>
          <div className="terminal-subtitle">■ SYSTEM UPGRADE UTILITY v4.0.2</div>
        </header>

        {/* Currency Display */}
        <div className="terminal-currency">
          <span className="currency-label">❖ DATA BALANCE : </span>
          <span className="currency-value">{totalData} FRAGMENTS</span>
        </div>

        {/* Upgrade Cards Grid */}
        <main className="upgrade-grid">
          {categories.map(cat => {
            const level = upgrades[cat.key] || 0;
            const isMaxed = level >= MAX_UPGRADE_LEVEL;
            const cost = isMaxed ? 0 : UPGRADE_COSTS[level];
            const canAfford = totalData >= cost;

            return (
              <section key={cat.key} className="upgrade-card" style={{ borderColor: `${cat.color}25` }}>
                <div className="card-top">
                  <span className="card-icon" style={{ textShadow: `0 0 10px ${cat.color}` }}>
                    {cat.icon}
                  </span>
                  <div className="card-meta">
                    <h2 className="card-title" style={{ color: cat.color }}>{cat.title}</h2>
                    <div className="node-bar">
                      {Array.from({ length: MAX_UPGRADE_LEVEL }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`node-cell ${idx < level ? 'node-cell--active' : ''}`}
                          style={{
                            background: idx < level ? cat.color : '',
                            boxShadow: idx < level ? `0 0 6px ${cat.color}` : '',
                          }}
                        />
                      ))}
                      <span className="node-level-text">
                        RANK {level}/{MAX_UPGRADE_LEVEL}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="card-desc">{cat.desc}</p>

                <div className="card-action">
                  <div className="cost-info">
                    {isMaxed ? (
                      <span className="cost-max">RANK MAXED</span>
                    ) : (
                      <>
                        <span className="cost-label">REQUIRED:</span>
                        <span className={`cost-val ${canAfford ? 'can-afford' : 'cannot-afford'}`}>
                          {cost} ❖
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    className={`upgrade-btn ${isMaxed ? 'btn-maxed' : canAfford ? 'btn-purchase' : 'btn-blocked'}`}
                    disabled={isMaxed || !canAfford}
                    onClick={() => purchaseUpgrade(cat.key)}
                    style={{
                      borderColor: !isMaxed && canAfford ? cat.color : '',
                      boxShadow: !isMaxed && canAfford ? `0 0 8px ${cat.color}35` : '',
                    }}
                  >
                    {isMaxed ? 'MAXED' : 'INJECT MOD'}
                  </button>
                </div>
              </section>
            );
          })}
        </main>

        {/* Exit Button */}
        <footer className="terminal-footer">
          <button className="terminal-close-btn" onClick={onClose}>
            [ CLOSE CONNECTION ]
          </button>
        </footer>
      </div>
    </div>
  );
}
