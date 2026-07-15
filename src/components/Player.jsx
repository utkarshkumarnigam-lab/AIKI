/**
 * Player.jsx
 * AIKI — The player character.
 * States: running, jumping, dead, invincible (flickering), shield active, overclocked, ghosted, sliding.
 */

import { PLAYER_SLIDE_HEIGHT, PLAYER_HEIGHT } from '../hooks/useGameEngine';

export default function Player({ bottom, isOnGround, isDead, isInvincible, isSliding, x, width, height, abilitiesState = {} }) {
  const isShieldActive    = abilitiesState.shield?.active;
  const isOverclockActive = abilitiesState.overclock?.active;
  const isGhostActive     = abilitiesState.ghost?.active;

  const classes = [
    'player',
    !isOnGround      ? 'is-jumping'    : '',
    isDead           ? 'is-dead'       : '',
    isInvincible     ? 'is-invincible' : '',
    isGhostActive    ? 'is-ghost'      : '',
    isOverclockActive ? 'is-overclocked' : '',
    isSliding        ? 'is-sliding'    : '',
  ].filter(Boolean).join(' ');

  // Visually shrink to slide height when sliding
  const displayHeight = isSliding ? PLAYER_SLIDE_HEIGHT : PLAYER_HEIGHT;

  return (
    <div
      id="player-aiki"
      className={classes}
      style={{ left: x, bottom, width, height: displayHeight }}
    >
      <div className="player-body">
        {/* Cyber Shield Grid Bubble */}
        {isShieldActive && <div className="player-shield-bubble" />}

        {/* Overclock Speed Exhaust Trails */}
        {isOverclockActive && <div className="overclock-speed-lines" />}

        {/* Data stream trail */}
        <div className="player-trail" />

        {/* Arm */}
        <div className="player-arm" />

        {/* Head */}
        <div className="player-head" />

        {/* Torso */}
        <div className="player-torso" />

        {/* Legs */}
        <div className="player-leg-l" />
        <div className="player-leg-r" />

        {/* Slide dash streak */}
        {isSliding && (
          <div style={{
            position: 'absolute',
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 48,
            height: 6,
            background: 'linear-gradient(to left, rgba(0,245,255,0.9), transparent)',
            borderRadius: 4,
            filter: 'blur(1px)',
          }} />
        )}
      </div>

      {/* Jump thrust glow */}
      {!isOnGround && !isSliding && (
        <div style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 20,
          height: 14,
          background: 'radial-gradient(ellipse at top, rgba(0,245,255,0.7) 0%, transparent 70%)',
          filter: 'blur(2px)',
        }} />
      )}
    </div>
  );
}
