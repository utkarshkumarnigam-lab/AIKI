/**
 * Collectible.jsx
 * Renders collectibles (Data, Key) and power-up pods (Shield, Overclock).
 */

import { memo } from 'react';

function DataFragment() {
  return (
    <div className="collectible-data">
      <div className="data-diamond" />
      <div className="data-orbit" />
      <div className="data-sparkle" />
    </div>
  );
}

function EncryptionKey() {
  return (
    <div className="collectible-key">
      <div className="key-base">
        <div className="key-teeth" />
      </div>
      <div className="key-glow" />
      <div className="key-brackets" />
    </div>
  );
}

function ShieldPod() {
  return (
    <div className="powerup-pod pod--shield">
      <div className="pod-core">🛡️</div>
      <div className="pod-halo" />
    </div>
  );
}

function OverclockPod() {
  return (
    <div className="powerup-pod pod--overclock">
      <div className="pod-core">⚡</div>
      <div className="pod-halo" />
    </div>
  );
}

const Collectible = memo(function Collectible({ x, width, height, variant, bottomOffset }) {
  return (
    <div
      className={`collectible-wrapper collectible--${variant}`}
      style={{
        left: x,
        bottom: bottomOffset,
        width,
        height,
      }}
      aria-hidden="true"
    >
      {variant === 'data' && <DataFragment />}
      {variant === 'key' && <EncryptionKey />}
      {variant === 'shield' && <ShieldPod />}
      {variant === 'overclock' && <OverclockPod />}
    </div>
  );
});

export default Collectible;
