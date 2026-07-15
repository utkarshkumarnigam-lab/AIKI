/**
 * Game.jsx
 * Top-level game component. Assembles all game sub-components
 * and wires them to the game engine hook.
 */

import { useCallback, useState } from 'react';
import { useGameEngine, GAME_STATE } from '../hooks/useGameEngine';
import Background     from './Background';
import Ground         from './Ground';
import Player         from './Player';
import Obstacle       from './Obstacle';
import Collectible    from './Collectible';
import Particles      from './Particles';
import Popups         from './Popups';
import HUD            from './HUD';
import GameOverScreen from './GameOverScreen';
import UpgradeMenu    from './UpgradeMenu';
import LoadingScreen  from './LoadingScreen';
import MainMenu       from './MainMenu';
import SettingsMenu   from './SettingsMenu';
import LeaderboardMenu from './LeaderboardMenu';
import ProfileMenu    from './ProfileMenu';
import InitialsModal  from './InitialsModal';
import { startBGM }   from '../utils/audioManager';

export default function Game() {
  const [showLoading, setShowLoading] = useState(true);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const {
    gameState,
    score,
    highScore,
    energy,
    maxEnergy,
    playerBottom,
    isOnGround,
    isInvincible,
    hitFlash,
    obstacles,
    collectibles,
    particles,
    popups,
    keysCount,
    dataCount,
    level,
    isSliding,
    isTransitioning,
    abilitiesState,
    activateAbility,
    upgrades,
    totalData,
    purchaseUpgrade,
    settings,
    setSettings,
    leaderboard,
    stats,
    unlockedAchievements,
    leaderboardQualifyScore,
    submitLeaderboardInitials,
    jump,
    startGame,
    goHome,
    GAME_WIDTH,
    GAME_HEIGHT,
    GROUND_HEIGHT,
    PLAYER_X,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
  } = useGameEngine();

  const handleInteract = useCallback(() => {
    if (gameState === GAME_STATE.RUNNING) {
      jump();
    } else if (gameState === GAME_STATE.DEAD) {
      startGame();
    }
  }, [gameState, jump, startGame]);

  const isRunning = gameState === GAME_STATE.RUNNING;
  const isDead    = gameState === GAME_STATE.DEAD;
  const isStart   = gameState === GAME_STATE.START;

  return (
    <div className="app-container">
      <div
        id="game-wrapper"
        className={`game-wrapper ${hitFlash && settings.glitchEffects ? 'game-wrapper--hit screen-shake' : ''} ${isTransitioning && settings.glitchEffects ? 'glitch-active screen-shake' : ''}`}
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onPointerDown={handleInteract}
        role="application"
        aria-label="AIKI ESCAPE: CYBER BREAK game"
      >
        {/* Chromatic glitch distortion overlay */}
        {settings.glitchEffects && <div className="glitch-overlay" />}

        {/* ── Scrolling background layers ── */}
        <Background
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          groundHeight={GROUND_HEIGHT}
          gameSpeed={isRunning ? 5 : 0}
          level={level}
          density={settings.particlesDensity}
        />

        {/* ── Ground platform ── */}
        <Ground height={GROUND_HEIGHT} speed={isRunning ? 5 : 0} level={level} />

        {/* ── AIKI Player ── */}
        {!isStart && (
          <Player
            x={PLAYER_X}
            bottom={playerBottom}
            isOnGround={isOnGround}
            isDead={isDead}
            isInvincible={isInvincible}
            isSliding={isSliding}
            width={PLAYER_WIDTH}
            height={PLAYER_HEIGHT}
            abilitiesState={abilitiesState}
          />
        )}

        {/* ── Collectibles ── */}
        {collectibles.map(col => (
          <Collectible
            key={col.id}
            x={col.x}
            width={col.width}
            height={col.height}
            variant={col.variant}
            bottomOffset={col.bottomOffset}
          />
        ))}

        {/* ── Obstacles ── */}
        {obstacles.map(obs => (
          <Obstacle
            key={obs.id}
            x={obs.x}
            width={obs.width}
            height={obs.height}
            variant={obs.variant}
            bottomOffset={obs.bottomOffset}
          />
        ))}

        {/* ── Particles ── */}
        <Particles particles={particles} />

        {/* ── Floating Popups ── */}
        <Popups popups={popups} />

        {/* ── HUD ── */}
        {!isStart && (
          <HUD
            score={score}
            highScore={highScore}
            energy={energy}
            maxEnergy={maxEnergy}
            keysCount={keysCount}
            dataCount={dataCount}
            level={level}
          />
        )}

        {/* ── Level Transition Overlay ── */}
        {isTransitioning && (
          <div className="level-transition-overlay">
            <div className="transition-alert">
              <span className="transition-alert-icon">⚠️</span> ALERT: SYSTEM BREACH
            </div>
            <div className="transition-title glitch-text" data-text={level === 2 ? "FIREWALL FORTRESS" : "AI CORE"}>
              {level === 2 ? "FIREWALL FORTRESS" : "AI CORE"}
            </div>
            <div className="transition-subtitle">
              {level === 2 
                ? "SECURITY SHIELDS BYPASSED // RAMPSPEED PROTOCOL INITIATED" 
                : "CORE QUANTUM DECRYPTED // MAXIMUM DANGER ENGINE INITIATED"}
            </div>
            <div className="transition-bar-loading">
              <div className="transition-bar-fill" />
            </div>
          </div>
        )}

        {/* ── Overlay screens ── */}
        {isStart && !showLoading && (
          <MainMenu
            onStart={startGame}
            onOpenUpgrades={() => setShowUpgrades(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenProfile={() => setShowProfile(true)}
            highScore={highScore}
          />
        )}
        {isDead && (
          <GameOverScreen
            score={score}
            highScore={highScore}
            keysCount={keysCount}
            dataCount={dataCount}
            onRestart={startGame}
            onGoHome={goHome}
            onOpenUpgrades={() => setShowUpgrades(true)}
          />
        )}

        {/* ── Core Upgrade Terminal ── */}
        {showUpgrades && (
          <UpgradeMenu
            upgrades={upgrades}
            totalData={totalData}
            purchaseUpgrade={purchaseUpgrade}
            onClose={() => setShowUpgrades(false)}
          />
        )}

        {/* ── Settings configuration overlay ── */}
        {showSettings && (
          <SettingsMenu
            settings={settings}
            onChangeSettings={setSettings}
            onClose={() => {
              setShowSettings(false);
              try { localStorage.setItem('aiki_settings', JSON.stringify(settings)); } catch {}
            }}
          />
        )}

        {/* ── Leaderboard database overlay ── */}
        {showLeaderboard && (
          <LeaderboardMenu
            leaderboard={leaderboard}
            onClose={() => setShowLeaderboard(false)}
          />
        )}

        {/* ── Player profile & achievements overlay ── */}
        {showProfile && (
          <ProfileMenu
            stats={stats}
            unlockedAchievements={unlockedAchievements}
            onClose={() => setShowProfile(false)}
          />
        )}

        {/* ── Leaderboard Initials qualifying overlay ── */}
        {leaderboardQualifyScore !== null && (
          <InitialsModal
            score={leaderboardQualifyScore}
            onSubmit={submitLeaderboardInitials}
          />
        )}

        {/* ── Loading decryption splash overlay ── */}
        {showLoading && (
          <LoadingScreen
            onEnter={() => {
              setShowLoading(false);
              startBGM();
            }}
          />
        )}
      </div>

      <p style={{
        marginTop: 12,
        fontSize: 10,
        color: 'rgba(224,247,255,0.2)',
        letterSpacing: '0.2em',
        fontFamily: 'var(--font-mono)',
        userSelect: 'none',
      }}>
        AIKI ESCAPE: CYBER BREAK — PHASE 3 · COLLECTIBLES & SCORING
      </p>
    </div>
  );
}
