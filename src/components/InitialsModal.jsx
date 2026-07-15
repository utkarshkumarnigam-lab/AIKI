/**
 * InitialsModal.jsx
 * Sub-panel post-run if the player qualifies for the local leaderboards.
 * Prompts them to log their 3-letter signature.
 */

import { useState } from 'react';

export default function InitialsModal({ score, onSubmit }) {
  const [initials, setInitials] = useState('');

  const handleChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3);
    setInitials(val);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (initials.length === 3) {
      onSubmit(initials);
    }
  };

  return (
    <div className="upgrade-terminal-overlay" style={{ zIndex: 105 }} role="dialog" aria-modal="true" aria-label="Enter Leaderboard Initials">
      <div className="upgrade-terminal" style={{ maxWidth: 360 }}>
        {/* Header */}
        <header className="terminal-header">
          <div className="terminal-title" style={{ color: 'var(--neon-yellow)' }}>
            ■ DATABASE INTRUSION DETECTED
          </div>
          <div className="terminal-subtitle">SYSTEM LOG ID PROTOCOL</div>
        </header>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '10px 0' }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textAlign: 'center' }}>
            YOUR ESCAPE INTRUSION SCORE OF <span style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>{score}</span> QUALIFIES FOR THE SECTOR HIGH RUNS LIST.
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <label htmlFor="initials-input" style={{ fontFamily: 'var(--font-game)', fontSize: 10, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              ENTER LOG ID (3 CHARS)
            </label>
            <input
              id="initials-input"
              type="text"
              value={initials}
              onChange={handleChange}
              placeholder="SYS"
              autoFocus
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '2px solid var(--neon-cyan)',
                borderRadius: 4,
                width: 100,
                padding: '8px',
                color: '#fff',
                fontFamily: 'var(--font-game)',
                fontSize: 18,
                textAlign: 'center',
                letterSpacing: '0.2em',
                outline: 'none',
                boxShadow: '0 0 10px rgba(0, 245, 255, 0.15)',
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={initials.length !== 3}
            className={`upgrade-btn ${initials.length === 3 ? 'btn-purchase' : 'btn-blocked'}`}
            style={{
              fontFamily: 'var(--font-game)',
              fontSize: 10,
              padding: '10px 0',
              cursor: initials.length === 3 ? 'pointer' : 'not-allowed',
              border: initials.length === 3 ? '1px solid var(--neon-cyan)' : '',
              boxShadow: initials.length === 3 ? '0 0 10px rgba(0, 245, 255, 0.25)' : '',
              color: initials.length === 3 ? 'var(--neon-cyan)' : '',
            }}
          >
            UPLOAD INTRUSION RECORD
          </button>
        </form>
      </div>
    </div>
  );
}
