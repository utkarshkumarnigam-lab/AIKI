/**
 * Obstacle.jsx
 * Renders one of three cyberpunk hazard variants:
 *   - 'block'  → Digital corruption block
 *   - 'laser'  → Laser barrier column
 *   - 'drone'  → AI security drone (airborne)
 */

import { memo } from 'react';

// ── Digital Block ────────────────────────────────────────────────────────────
function DigitalBlock({ width, height }) {
  return (
    <div className="obs-block" style={{ width, height }}>
      <div className="obs-block-inner">
        <div className="obs-block-grid" />
        <div className="obs-block-glyph">01</div>
        <div className="obs-block-scan" />
      </div>
    </div>
  );
}

// ── Laser Barrier ────────────────────────────────────────────────────────────
function LaserBarrier({ width, height }) {
  return (
    <div className="obs-laser" style={{ width, height }}>
      {/* Emitter top */}
      <div className="obs-laser-emitter obs-laser-emitter--top" />
      {/* Beam */}
      <div className="obs-laser-beam" />
      {/* Emitter bottom */}
      <div className="obs-laser-emitter obs-laser-emitter--bot" />
      {/* Flare */}
      <div className="obs-laser-flare" />
    </div>
  );
}

// ── AI Security Drone ────────────────────────────────────────────────────────
function SecurityDrone({ width, height }) {
  return (
    <div className="obs-drone" style={{ width, height }}>
      {/* Body */}
      <div className="obs-drone-body">
        {/* Eye */}
        <div className="obs-drone-eye" />
        {/* Scanline */}
        <div className="obs-drone-scan" />
      </div>
      {/* Rotors */}
      <div className="obs-drone-rotor obs-drone-rotor--l" />
      <div className="obs-drone-rotor obs-drone-rotor--r" />
      {/* Underbelly light */}
      <div className="obs-drone-light" />
      {/* Hover thruster trails */}
      <div className="obs-drone-thrust obs-drone-thrust--l" />
      <div className="obs-drone-thrust obs-drone-thrust--r" />
    </div>
  );
}

// ── Exported Obstacle component ──────────────────────────────────────────────
const Obstacle = memo(function Obstacle({ x, width, height, variant, bottomOffset }) {
  return (
    <div
      className={`obstacle obstacle--${variant}`}
      style={{
        left:   x,
        bottom: bottomOffset,
        width,
        height,
      }}
      aria-hidden="true"
    >
      {variant === 'block' && <DigitalBlock width={width} height={height} />}
      {variant === 'laser' && <LaserBarrier width={width} height={height} />}
      {variant === 'drone' && <SecurityDrone width={width} height={height} />}
    </div>
  );
});

export default Obstacle;
