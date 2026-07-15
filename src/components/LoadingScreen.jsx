/**
 * LoadingScreen.jsx
 * Boot decryption sequence modal. Initiates audio on user click.
 */

import { useState, useEffect } from 'react';

const logMessages = [
  { threshold: 5, text: 'INIT DECRYPT: aiki_core.bin...' },
  { threshold: 20, text: 'BYPASSING SECURITY FIREWALL [PORT: 5173/5175]...' },
  { threshold: 40, text: 'INJECTING COGNITIVE SERVO EMULATOR...' },
  { threshold: 60, text: 'ESTABLISHING SECURE DECRYPT TUNNEL...' },
  { threshold: 80, text: 'OPTIMIZING GRAPHICS AND EMITTING SYSTEM DUST...' },
  { threshold: 95, text: 'AI CORE EMULATION COMPLETE // GRID SECURE.' },
];

export default function LoadingScreen({ onEnter }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const activeLogs = logMessages
      .filter(msg => progress >= msg.threshold)
      .map(msg => msg.text);
    setLogs(activeLogs);
  }, [progress]);

  return (
    <div className="loading-screen" role="dialog" aria-modal="true" aria-label="Loading System">
      <div className="loading-container">
        {/* Holographic Header Logo */}
        <div className="loading-logo">
          <div className="logo-glitch">AIKI ESCAPE</div>
          <div className="logo-subtitle">SYSTEM BOOT CHECK</div>
        </div>

        {/* Logs Terminal */}
        <div className="loading-terminal">
          {logs.map((log, idx) => (
            <div key={idx} className="terminal-log-line">
              <span className="log-prompt">&gt;</span> {log}
            </div>
          ))}
          {progress < 100 && (
            <div className="terminal-log-line log-cursor-blink">
              <span className="log-prompt">&gt;</span> DECRYPTING... {progress}%
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="loading-progress-bar-wrapper">
          <div className="loading-progress-bar-track">
            <div className="loading-progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="loading-progress-percentage">{progress}% SECURED</div>
        </div>

        {/* Enter Connection Button */}
        {progress === 100 && (
          <button className="enter-grid-btn" onClick={onEnter}>
            [ ENTER SYSTEM GRID ]
          </button>
        )}
      </div>
    </div>
  );
}
