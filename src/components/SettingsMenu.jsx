/**
 * SettingsMenu.jsx
 * Audio levels sliders, particle constraints, and glitch style toggles.
 */

export default function SettingsMenu({ settings, onChangeSettings, onClose }) {
  const updateSetting = (key, val) => {
    onChangeSettings({
      ...settings,
      [key]: val,
    });
  };

  return (
    <div className="upgrade-terminal-overlay" role="dialog" aria-modal="true" aria-label="Settings Menu">
      <div className="upgrade-terminal">
        {/* Header */}
        <header className="terminal-header">
          <div className="terminal-title">
            <span className="terminal-prompt">aiki@terminal:~#</span> ./set_config.exe
          </div>
          <div className="terminal-subtitle">■ SYSTEM OPTIONS PANEL</div>
        </header>

        {/* Configurations Form */}
        <main className="settings-body" style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'left', padding: '10px 0' }}>
          
          {/* BGM Volume Slider */}
          <div className="settings-row" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="setting-header" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-game)', fontSize: 11, letterSpacing: '0.05em' }}>
              <span>BACKGROUND MUSIC</span>
              <span style={{ color: 'var(--neon-yellow)' }}>{Math.round(settings.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.bgmVolume}
              onChange={e => updateSetting('bgmVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--neon-yellow)', cursor: 'pointer' }}
              aria-label="Background music volume"
            />
          </div>

          {/* SFX Volume Slider */}
          <div className="settings-row" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="setting-header" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-game)', fontSize: 11, letterSpacing: '0.05em' }}>
              <span>SOUND EFFECTS (SFX)</span>
              <span style={{ color: 'var(--neon-cyan)' }}>{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={e => updateSetting('sfxVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--neon-cyan)', cursor: 'pointer' }}
              aria-label="Sound effects volume"
            />
          </div>

          {/* Particles Density Tab Group */}
          <div className="settings-row" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="setting-label" style={{ fontFamily: 'var(--font-game)', fontSize: 11, letterSpacing: '0.05em' }}>
              PARTICLE EMISSIONS
            </label>
            <div className="density-tabs" style={{ display: 'flex', gap: 10 }}>
              {['low', 'medium', 'high'].map(d => (
                <button
                  key={d}
                  onClick={() => updateSetting('particlesDensity', d)}
                  className={`density-tab-btn ${settings.particlesDensity === d ? 'is-active' : ''}`}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: settings.particlesDensity === d ? 'rgba(0, 245, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid',
                    borderColor: settings.particlesDensity === d ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)',
                    color: settings.particlesDensity === d ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Glitch Effects Toggle */}
          <div className="settings-row" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }} onClick={() => updateSetting('glitchEffects', !settings.glitchEffects)}>
            <input
              type="checkbox"
              checked={settings.glitchEffects}
              readOnly
              style={{ accentColor: 'var(--neon-pink)', cursor: 'pointer', width: 16, height: 16 }}
              aria-label="Toggle camera glitches and screen shake"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-game)', fontSize: 11, letterSpacing: '0.05em' }}>CAMERA GLITCHES & SHAKES</span>
              <span style={{ fontSize: 8, color: 'var(--text-secondary)', opacity: 0.6 }}>Bypasses chromatic aberrations and viewport distortions for reduced motion.</span>
            </div>
          </div>

        </main>

        {/* Save/Close footer */}
        <footer className="terminal-footer">
          <button className="terminal-close-btn" onClick={onClose}>
            [ SAVE CONFIGURATION ]
          </button>
        </footer>
      </div>
    </div>
  );
}
