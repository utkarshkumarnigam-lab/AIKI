/**
 * useGameEngine.js
 * Core game loop and physics engine using requestAnimationFrame.
 * Handles: player physics, obstacle spawning/collision, collectible spawning/collection,
 * energy system, score, and game state.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { setVolumes, playSFX } from '../utils/audioManager';

export const ACHIEVEMENTS = [
  { id: 'first_run', title: 'SYSTEM ACCESS', desc: 'Initiate your first escape run.', icon: '🔌' },
  { id: 'level_2', title: 'SECURITY BYPASS', desc: 'Reach Level 2 (Firewall Fortress).', icon: '🔒' },
  { id: 'level_3', title: 'QUANTUM OVERRIDE', desc: 'Reach Level 3 (AI Core).', icon: '🔓' },
  { id: 'data_50', title: 'DATA GLUTTON', desc: 'Collect 50 Data Fragments in a single run.', icon: '💾' },
  { id: 'upgrade_max', title: 'CORE UPGRADED', desc: 'Max out any Core Upgrade.', icon: '⚙️' },
  { id: 'high_score_1000', title: 'LEGEND RUNNER', desc: 'Achieve a score of 1000 or more.', icon: '🏆' },
];

// ── Constants ──────────────────────────────────────────────────────────────
export const GAME_WIDTH       = 900;
export const GAME_HEIGHT      = 520;
export const GROUND_HEIGHT    = 64;
export const GROUND_Y         = GROUND_HEIGHT;

export const PLAYER_WIDTH        = 48;
export const PLAYER_HEIGHT       = 64;
export const PLAYER_SLIDE_HEIGHT = 28;   // crouched hitbox height
export const PLAYER_X            = 90;

const GRAVITY          = 0.55;
const JUMP_FORCE       = -13.5;
const MAX_FALL_SPEED   = 16;

const SCORE_PER_FRAME  = 0.08;

const SLIDE_DURATION   = 39;  // frames (~0.65s at 60fps)
const SLIDE_COOLDOWN   = 72;  // frames (~1.2s cooldown)

export const LEVEL_NAMES = {
  1: 'NEON DISTRICT',
  2: 'FIREWALL FORTRESS',
  3: 'AI CORE',
};

export const LEVEL_CONFIGS = {
  1: {
    baseSpeed: 5,
    maxSpeed: 20,        // much higher ceiling — keeps accelerating
    speedIncrement: 0.004, // ~8x faster ramping than before
    obstacleMinGap: 1000,
    obstacleMaxGap: 1800,
    collectibleMinGap: 400,
    collectibleMaxGap: 700,
  },
  2: {
    baseSpeed: 7.5,
    maxSpeed: 28,
    speedIncrement: 0.007,
    obstacleMinGap: 800,
    obstacleMaxGap: 1400,
    collectibleMinGap: 350,
    collectibleMaxGap: 600,
  },
  3: {
    baseSpeed: 10.5,
    maxSpeed: 40,
    speedIncrement: 0.012,
    obstacleMinGap: 600,
    obstacleMaxGap: 1000,
    collectibleMinGap: 300,
    collectibleMaxGap: 500,
  }
};

// Energy system
const ENERGY_DAMAGE_BLOCK    = 25;   // digital block hit
const ENERGY_DAMAGE_LASER    = 20;   // laser barrier hit
const ENERGY_DAMAGE_DRONE    = 30;   // security drone hit
const INVINCIBILITY_FRAMES   = 90;   // ~1.5s of invincibility after a hit

// Obstacle variant definitions
export const OBSTACLE_VARIANTS = {
  BLOCK:  'block',
  LASER:  'laser',
  DRONE:  'drone',
};

const OBSTACLE_POOLS = {
  1: [OBSTACLE_VARIANTS.BLOCK, OBSTACLE_VARIANTS.BLOCK, OBSTACLE_VARIANTS.LASER],
  2: [OBSTACLE_VARIANTS.BLOCK, OBSTACLE_VARIANTS.LASER, OBSTACLE_VARIANTS.DRONE, OBSTACLE_VARIANTS.DRONE],
  3: [OBSTACLE_VARIANTS.BLOCK, OBSTACLE_VARIANTS.LASER, OBSTACLE_VARIANTS.LASER, OBSTACLE_VARIANTS.DRONE, OBSTACLE_VARIANTS.DRONE],
};

// Collectible variant definitions
export const COLLECTIBLE_VARIANTS = {
  DATA:      'data',      // Data Fragment
  KEY:       'key',       // Encryption Key
  SHIELD:    'shield',    // Cyber Shield Pod
  OVERCLOCK: 'overclock', // Overclock Mode Pod
};

export const ABILITY_CONFIGS = {
  shield: {
    duration: 8,
    cooldown: 18,
  },
  overclock: {
    duration: 5,
    cooldown: 22,
  },
};

const OBSTACLE_CONFIGS = {
  [OBSTACLE_VARIANTS.BLOCK]: {
    minW: 32, maxW: 52,
    minH: 40, maxH: 80,
    damage: ENERGY_DAMAGE_BLOCK,
    groundBased: true,
  },
  [OBSTACLE_VARIANTS.LASER]: {
    minW: 12, maxW: 18,
    minH: 80, maxH: 130,
    damage: ENERGY_DAMAGE_LASER,
    groundBased: true,
  },
  [OBSTACLE_VARIANTS.DRONE]: {
    minW: 44, maxW: 56,
    minH: 36, maxH: 44,
    damage: ENERGY_DAMAGE_DRONE,
    groundBased: false,
    floatMinY: 34,
    floatMaxY: 40,
  },
};

const COLLECTIBLE_POOL = [
  COLLECTIBLE_VARIANTS.DATA,
  COLLECTIBLE_VARIANTS.DATA,
  COLLECTIBLE_VARIANTS.DATA,
  COLLECTIBLE_VARIANTS.DATA,
  COLLECTIBLE_VARIANTS.DATA,
  COLLECTIBLE_VARIANTS.DATA,
  COLLECTIBLE_VARIANTS.KEY,
  COLLECTIBLE_VARIANTS.KEY,
];

// Game state machine
export const GAME_STATE = {
  START:   'START',
  RUNNING: 'RUNNING',
  DEAD:    'DEAD',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randCollectible() {
  return COLLECTIBLE_POOL[Math.floor(Math.random() * COLLECTIBLE_POOL.length)];
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh, pad = 6) {
  return (
    ax + pad < bx + bw - pad &&
    ax + aw  - pad > bx + pad &&
    ay + pad < by + bh - pad &&
    ay + ah  - pad > by + pad
  );
}

// Upgrade system constants
export const UPGRADE_COSTS = [5, 10, 20, 35, 55];
export const MAX_UPGRADE_LEVEL = 5;

function getSavedUpgrades() {
  try {
    const saved = localStorage.getItem('aiki_upgrades');
    return saved ? JSON.parse(saved) : { speed: 0, shield: 0 };
  } catch {
    return { speed: 0, shield: 0 };
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useGameEngine() {
  const [gameState,   setGameState]   = useState(GAME_STATE.START);
  const [score,       setScore]       = useState(0);

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('aiki_settings');
      return saved ? JSON.parse(saved) : { bgmVolume: 0.5, sfxVolume: 0.6, particlesDensity: 'high', glitchEffects: true };
    } catch {
      return { bgmVolume: 0.5, sfxVolume: 0.6, particlesDensity: 'high', glitchEffects: true };
    }
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      const saved = localStorage.getItem('aiki_leaderboard');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('aiki_profile_stats');
      return saved ? JSON.parse(saved) : { totalRuns: 0, totalPlaytime: 0, totalDataCollected: 0, totalKeysCollected: 0, highestScore: 0 };
    } catch {
      return { totalRuns: 0, totalPlaytime: 0, totalDataCollected: 0, totalKeysCollected: 0, highestScore: 0 };
    }
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    try {
      const saved = localStorage.getItem('aiki_achievements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [leaderboardQualifyScore, setLeaderboardQualifyScore] = useState(null);

  useEffect(() => {
    setVolumes(settings.sfxVolume, settings.bgmVolume);
  }, [settings.sfxVolume, settings.bgmVolume]);

  const [upgrades, setUpgrades] = useState(getSavedUpgrades);
  const [totalData, setTotalData] = useState(() => {
    try { return parseInt(localStorage.getItem('aiki_total_data') || '0', 10); }
    catch { return 0; }
  });

  const initialUpgrades = getSavedUpgrades();
  const initialMaxEnergy = 100;

  const [energy,      setEnergy]      = useState(initialMaxEnergy);
  const [highScore,   setHighScore]   = useState(() => {
    try { return parseInt(localStorage.getItem('aiki_hs') || '0', 10); }
    catch { return 0; }
  });
  const [obstacles,    setObstacles]    = useState([]);
  const [collectibles, setCollectibles] = useState([]);
  const [playerBottom, setPlayerBottom] = useState(GROUND_Y);
  const [isOnGround,   setIsOnGround]   = useState(true);
  const [particles,    setParticles]    = useState([]);
  const [popups,       setPopups]       = useState([]);
  const [hitFlash,     setHitFlash]     = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  const [level,           setLevel]           = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [abilitiesState, setAbilitiesState]   = useState({
    shield: { active: false, durationLeft: 0, cooldownLeft: 0 },
    overclock: { active: false, durationLeft: 0, cooldownLeft: 0 },
  });

  // Stats collected in the run
  const [keysCount, setKeysCount] = useState(0);
  const [dataCount, setDataCount] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  const rafRef            = useRef(null);
  const obstaclesRef      = useRef([]);
  const collectiblesRef   = useRef([]);
  const obstacleIdCounter = useRef(0);
  const collectibleIdCounter = useRef(0);
  const particleIdCounter = useRef(0);
  const popupIdCounter    = useRef(0);

  const stateRef          = useRef({
    vy:               0,
    playerBottom:     GROUND_Y,
    isOnGround:       true,
    speed:            LEVEL_CONFIGS[1].baseSpeed * (1 + initialUpgrades.speed * 0.05),
    rawScore:         0,
    nextObstacleAt:   LEVEL_CONFIGS[1].obstacleMinGap,
    nextCollectibleAt: LEVEL_CONFIGS[1].collectibleMinGap,
    distanceTraveled: 0,
    persistentSpeedBoost: 0,
    dead:             false,
    energy:           initialMaxEnergy,
    invincFrames:     0,
    keysCollected:    0,
    dataCollected:    0,
    level:            1,
    levelTransitioning: false,
    transitionLevelTarget: 1,
    playtime:         0,
    jumpsCount:       0,
    slideFrames:      0,   // >0 = currently sliding
    slideCooldown:    0,   // >0 = on cooldown
    abilities: {
      shield: { active: false, durationLeft: 0, cooldownLeft: 0 },
      overclock: { active: false, durationLeft: 0, cooldownLeft: 0 },
    }
  });

  // ── Popups helper ──────────────────────────────────────────────────────────
  const spawnPopup = useCallback((x, y, text, color) => {
    const id = popupIdCounter.current++;
    const newPopup = { id, x, y: GAME_HEIGHT - y - 30, text, color };
    setPopups(prev => [...prev, newPopup]);
    // remove popup after animation completes
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 800);
  }, []);

  const unlockAchievement = useCallback((id) => {
    setUnlockedAchievements(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try { localStorage.setItem('aiki_achievements', JSON.stringify(next)); } catch {}
      
      playSFX('achievement');
      
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        // Spawn a popup at center screen
        spawnPopup(GAME_WIDTH / 2, GROUND_Y + 140, `🏆 UNLOCKED: ${ach.title}`, 'var(--neon-yellow)');
      }
      return next;
    });
  }, [spawnPopup]);

  // ── Jump ──────────────────────────────────────────────────────────────────
  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.isOnGround && !s.dead) {
      s.vy = JUMP_FORCE;
      s.isOnGround = false;
      setIsOnGround(false);
      s.jumpsCount += 1;
      playSFX('jump');
    }
  }, []);

  // ── Slide ─────────────────────────────────────────────────────────────────
  const slide = useCallback(() => {
    const s = stateRef.current;
    if (s.isOnGround && !s.dead && s.slideFrames === 0 && s.slideCooldown === 0) {
      s.slideFrames = SLIDE_DURATION;
      s.slideCooldown = SLIDE_COOLDOWN;
      setIsSliding(true);
      playSFX('jump'); // reuse jump sfx as slide dash sound
    }
  }, []);

  // ── Particle helpers ───────────────────────────────────────────────────────
  const spawnParticles = useCallback((x, y, count, colors, maxDrift = 40) => {
    const ps = Array.from({ length: count }, (_, i) => ({
      id: particleIdCounter.current++,
      x,
      y,
      color: colors[i % colors.length],
      size: rand(3, 10),
      drift: `${rand(-maxDrift, maxDrift)}px`,
      duration: rand(0.35, 0.85),
    }));
    setParticles(prev => [...prev, ...ps]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !ps.find(sp => sp.id === p.id)));
    }, 900);
  }, []);

  const spawnDeathParticles = useCallback((x, y) => {
    spawnParticles(
      x + PLAYER_WIDTH / 2,
      GAME_HEIGHT - y - PLAYER_HEIGHT / 2,
      28,
      ['#00f5ff', '#ff2d78', '#b44aff', '#ffe600'],
      55,
    );
  }, [spawnParticles]);

  const spawnHitParticles = useCallback((x, y) => {
    spawnParticles(
      x + PLAYER_WIDTH / 2,
      GAME_HEIGHT - y - PLAYER_HEIGHT / 2,
      12,
      ['#ff2d78', '#ffe600', '#ff6b00'],
      30,
    );
  }, [spawnParticles]);

  const spawnCollectionParticles = useCallback((x, y, variant) => {
    let colors = ['#00f5ff', '#b44aff'];
    if (variant === 'key') colors = ['#ffe600', '#ff2d78'];

    spawnParticles(x, GAME_HEIGHT - y, 10, colors, 25);
  }, [spawnParticles]);

  const activateAbility = useCallback((key) => {
    const s = stateRef.current;
    if (s.dead || gameState !== GAME_STATE.RUNNING) return;

    const ab = s.abilities[key];
    if (!ab || ab.active || ab.cooldownLeft > 0) return;

    // Trigger activation
    ab.active = true;
    ab.durationLeft = key === 'shield'
      ? 8.0 + upgrades.shield * 1.5
      : ABILITY_CONFIGS[key].duration;
    ab.cooldownLeft = ABILITY_CONFIGS[key].cooldown;

    // Apply immediate activation effects
    if (key === 'shield') {
      spawnPopup(PLAYER_X + 24, s.playerBottom + 64, 'SHIELD ACTIVE', 'var(--neon-cyan)');
    } else if (key === 'overclock') {
      s.speed += 4.5;
      spawnPopup(PLAYER_X + 24, s.playerBottom + 64, 'OVERCLOCK ACTIVE', 'var(--neon-yellow)');
    }

    setAbilitiesState({
      shield: { ...s.abilities.shield },
      overclock: { ...s.abilities.overclock },
    });
  }, [gameState, spawnPopup, upgrades.shield]);

  const triggerPowerUpCollect = useCallback((key) => {
    const s = stateRef.current;
    if (s.dead) return;

    const ab = s.abilities[key];
    
    // Refresh/Activate overclock speed increase
    if (key === 'overclock' && !ab.active) {
      s.speed += 4.5;
    }

    ab.active = true;
    ab.durationLeft = key === 'shield'
      ? 8.0 + upgrades.shield * 1.5
      : ABILITY_CONFIGS[key].duration;
    ab.cooldownLeft = ABILITY_CONFIGS[key].cooldown; // Enters cooldown loop after active ends

    spawnPopup(PLAYER_X + 24, s.playerBottom + 64, `${key.toUpperCase()} POWERUP!`, 'var(--neon-yellow)');

    setAbilitiesState({
      shield: { ...s.abilities.shield },
      overclock: { ...s.abilities.overclock },
    });
  }, [spawnPopup, upgrades.shield]);

  const triggerLevelTransition = useCallback((targetLevel) => {
    const s = stateRef.current;
    s.levelTransitioning = true;
    s.transitionLevelTarget = targetLevel;
    setIsTransitioning(true);

    playSFX('transition');

    if (targetLevel === 2) {
      unlockAchievement('level_2');
    } else if (targetLevel === 3) {
      unlockAchievement('level_3');
    }

    // Push spawns out during transition
    s.nextObstacleAt = s.distanceTraveled + 1200;
    s.nextCollectibleAt = s.distanceTraveled + 1000;

    // Show a pop-up
    spawnPopup(GAME_WIDTH / 2, GROUND_Y + 120, `INITIATING LEVEL ${targetLevel} PROTOCOL`, 'var(--neon-yellow)');

    setTimeout(() => {
      s.level = targetLevel;
      s.levelTransitioning = false;
      setLevel(targetLevel);
      setIsTransitioning(false);
    }, 2500);
  }, [spawnPopup, unlockAchievement]);

  // ── Go Home (back to main menu from Game Over) ────────────────────────────
  const goHome = useCallback(() => {
    const s = stateRef.current;
    s.dead = false;
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    setObstacles([]);
    setCollectibles([]);
    setParticles([]);
    setPopups([]);
    setHitFlash(false);
    setIsInvincible(false);
    setLevel(1);
    setIsTransitioning(false);
    setAbilitiesState({
      shield: { active: false, durationLeft: 0, cooldownLeft: 0 },
      overclock: { active: false, durationLeft: 0, cooldownLeft: 0 },
    });
    s.persistentSpeedBoost = 0;
    setGameState(GAME_STATE.START);
  }, []);

  // ── Start / Restart ────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const s = stateRef.current;
    const speedMult = 1 + upgrades.speed * 0.05;
    const maxEnergyCap = 100;

    s.vy               = 0;
    s.playerBottom     = GROUND_Y;
    s.isOnGround       = true;
    s.speed            = LEVEL_CONFIGS[1].baseSpeed * speedMult;
    s.rawScore         = 0;
    s.nextObstacleAt   = LEVEL_CONFIGS[1].obstacleMinGap;
    s.nextCollectibleAt = LEVEL_CONFIGS[1].collectibleMinGap;
    s.distanceTraveled = 0;
    s.persistentSpeedBoost = 0;
    s.dead             = false;
    s.energy           = maxEnergyCap;
    s.invincFrames     = 0;
    s.keysCollected    = 0;
    s.dataCollected    = 0;
    s.level            = 1;
    s.levelTransitioning = false;
    s.transitionLevelTarget = 1;
    s.playtime         = 0;
    s.jumpsCount       = 0;
    s.slideFrames      = 0;
    s.slideCooldown    = 0;
    s.abilities = {
      shield: { active: false, durationLeft: 0, cooldownLeft: 0 },
      overclock: { active: false, durationLeft: 0, cooldownLeft: 0 },
    };

    obstaclesRef.current = [];
    collectiblesRef.current = [];
    setObstacles([]);
    setCollectibles([]);
    setPlayerBottom(GROUND_Y);
    setIsOnGround(true);
    setScore(0);
    setEnergy(maxEnergyCap);
    setKeysCount(0);
    setDataCount(0);
    setParticles([]);
    setPopups([]);
    setHitFlash(false);
    setIsInvincible(false);
    setLevel(1);
    setIsTransitioning(false);
    setAbilitiesState({
      shield: { active: false, durationLeft: 0, cooldownLeft: 0 },
      overclock: { active: false, durationLeft: 0, cooldownLeft: 0 },
    });

    // Profile run stats increment
    setStats(prev => {
      const next = { ...prev, totalRuns: (prev.totalRuns || 0) + 1 };
      try { localStorage.setItem('aiki_profile_stats', JSON.stringify(next)); } catch {}
      return next;
    });

    unlockAchievement('first_run');

    setGameState(GAME_STATE.RUNNING);
  }, [upgrades, unlockAchievement]);

  // ── Main Game Loop ─────────────────────────────────────────────────────────
  const gameLoop = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) return;

    // Update active ability duration and cooldown timers (dt = 1/60s)
    const dt = 1 / 60;
    s.playtime += dt;
    let abilitiesChanged = false;
    const nextAbilities = { ...s.abilities };

    for (const key of ['shield', 'overclock']) {
      const ab = nextAbilities[key];
      if (ab.active) {
        ab.durationLeft = Math.max(0, ab.durationLeft - dt);
        if (ab.durationLeft === 0) {
          ab.active = false;
          if (key === 'overclock') {
            s.speed = Math.max(0, s.speed - 4.5 * 0.65);
            s.persistentSpeedBoost = (s.persistentSpeedBoost || 0) + (4.5 * 0.35);
          }
        }
        abilitiesChanged = true;
      }
      if (ab.cooldownLeft > 0 && !ab.active) {
        ab.cooldownLeft = Math.max(0, ab.cooldownLeft - dt);
        abilitiesChanged = true;
      }
    }

    if (abilitiesChanged) {
      s.abilities = nextAbilities;
      setAbilitiesState({
        shield: { ...s.abilities.shield },
        overclock: { ...s.abilities.overclock },
      });
    }

    // Physics
    s.vy = Math.min(s.vy + GRAVITY, MAX_FALL_SPEED);
    s.playerBottom -= s.vy;
    if (s.playerBottom <= GROUND_Y) {
      s.playerBottom = GROUND_Y;
      s.vy = 0;
      if (!s.isOnGround) {
        s.isOnGround = true;
        setIsOnGround(true);
      }
    }
    setPlayerBottom(s.playerBottom);

    // Speed ramp (with level configuration and speed upgrades)
    const speedMult = 1 + upgrades.speed * 0.05;
    const cfg = LEVEL_CONFIGS[s.level] || LEVEL_CONFIGS[1];
    let maxSpeed = cfg.maxSpeed * speedMult + (s.persistentSpeedBoost || 0);
    if (s.abilities.overclock.active) {
      maxSpeed += 4.5;
    }

    if (s.levelTransitioning) {
      const targetSpeed = (LEVEL_CONFIGS[s.transitionLevelTarget]?.baseSpeed || 5) * speedMult;
      s.speed += (targetSpeed - s.speed) * 0.02; // smooth acceleration/deceleration
    } else {
      if (s.speed < maxSpeed) {
        s.speed = Math.min(s.speed + cfg.speedIncrement, maxSpeed);
      }
    }

    // Distance & score
    s.distanceTraveled += s.speed;
    const isOverclocked = s.abilities.overclock.active;
    s.rawScore += SCORE_PER_FRAME * (s.speed / LEVEL_CONFIGS[1].baseSpeed) * (isOverclocked ? 3.0 : 1.0);
    const displayScore = Math.floor(s.rawScore);
    setScore(displayScore);

    if (displayScore >= 1000) {
      unlockAchievement('high_score_1000');
    }

    // Level transition check
    if (s.level === 1 && displayScore >= 500 && !s.levelTransitioning) {
      triggerLevelTransition(2);
    } else if (s.level === 2 && displayScore >= 1200 && !s.levelTransitioning) {
      triggerLevelTransition(3);
    }

    // Invincibility countdown
    if (s.invincFrames > 0) {
      s.invincFrames--;
      if (s.invincFrames === 0) {
        setIsInvincible(false);
      }
    }

    // Slide timer countdown
    if (s.slideFrames > 0) {
      s.slideFrames--;
      if (s.slideFrames === 0) {
        setIsSliding(false);
      }
    }
    if (s.slideCooldown > 0 && s.slideFrames === 0) {
      s.slideCooldown--;
    }

    // Obstacle spawning
    if (s.distanceTraveled >= s.nextObstacleAt && !s.levelTransitioning) {
      const pool = OBSTACLE_POOLS[s.level] || OBSTACLE_POOLS[1];
      const variant = pool[Math.floor(Math.random() * pool.length)];
      const oCfg    = OBSTACLE_CONFIGS[variant];
      const w       = Math.floor(rand(oCfg.minW, oCfg.maxW));
      const h       = Math.floor(rand(oCfg.minH, oCfg.maxH));
      const bottomOffset = oCfg.groundBased
        ? GROUND_Y
        : GROUND_Y + rand(oCfg.floatMinY, oCfg.floatMaxY);

      obstaclesRef.current.push({
        id:           obstacleIdCounter.current++,
        x:            GAME_WIDTH + 30,
        width:        w,
        height:       h,
        variant,
        bottomOffset,
        damage:       oCfg.damage,
      });
      const lvlCfg = LEVEL_CONFIGS[s.level] || LEVEL_CONFIGS[1];
      s.nextObstacleAt = s.distanceTraveled + rand(lvlCfg.obstacleMinGap, lvlCfg.obstacleMaxGap);
    }

    // Collectible spawning
    if (s.distanceTraveled >= s.nextCollectibleAt && !s.levelTransitioning) {
      const variant = randCollectible();
      // Collectibles are standard size (24x24 px)
      const w = 24;
      const h = 24;
      // Heights: ground level (30px offset), double jump / jump heights (90px, 150px)
      const floatY = [30, 95, 160][Math.floor(Math.random() * 3)];
      const bottomOffset = GROUND_Y + floatY;

      collectiblesRef.current.push({
        id:           collectibleIdCounter.current++,
        x:            GAME_WIDTH + 30,
        width:        w,
        height:       h,
        variant,
        bottomOffset,
      });
      const lvlCfg = LEVEL_CONFIGS[s.level] || LEVEL_CONFIGS[1];
      s.nextCollectibleAt = s.distanceTraveled + rand(lvlCfg.collectibleMinGap, lvlCfg.collectibleMaxGap);
    }

    // Move & cull obstacles
    obstaclesRef.current = obstaclesRef.current
      .map(o => ({ ...o, x: o.x - s.speed }))
      .filter(o => o.x + o.width > -60);

    // Move & cull collectibles
    collectiblesRef.current = collectiblesRef.current
      .map(c => ({ ...c, x: c.x - s.speed }))
      .filter(c => c.x + c.width > -40);

    // Collision detection — Player bounding box
    const playerX = PLAYER_X;
    const playerY = s.playerBottom;
    // When sliding, use reduced hitbox height
    const effectivePlayerH = s.slideFrames > 0 ? PLAYER_SLIDE_HEIGHT : PLAYER_HEIGHT;

    // 1. Check obstacles collision
    for (const obs of obstaclesRef.current) {
      if (obs.hit) continue;

      const hit = rectsOverlap(
        playerX, playerY, PLAYER_WIDTH, effectivePlayerH,
        obs.x,   obs.bottomOffset, obs.width, obs.height,
      );

      if (hit) {
        // Overclock Mode active bypasses collision
        if (s.abilities.overclock.active) continue;

        // Cyber Shield active absorbs one collision
        if (s.abilities.shield.active) {
          s.abilities.shield.active = false;
          s.abilities.shield.durationLeft = 0;
          obs.hit = true;
          // Spawn cyan shield-break particles
          spawnParticles(obs.x + obs.width / 2, GAME_HEIGHT - obs.bottomOffset - obs.height / 2, 16, ['#00f5ff', '#ffffff'], 30);
          spawnPopup(playerX, playerY + 64, 'SHIELD BROKEN', 'var(--neon-cyan)');
          
          s.invincFrames = 15; // brief invulnerability window
          setIsInvincible(true);

          setAbilitiesState({
            shield: { ...s.abilities.shield },
            overclock: { ...s.abilities.overclock },
          });
          continue;
        }

        if (s.invincFrames === 0) {
          s.energy = Math.max(0, s.energy - obs.damage);
          obs.hit  = true;
          setEnergy(s.energy);

          playSFX('hit');
          spawnHitParticles(playerX, playerY);

          setHitFlash(true);
          setTimeout(() => setHitFlash(false), 180);

          if (s.energy <= 0) {
            s.dead = true;
            playSFX('gameover');

            // Save run stats to profile
            setStats(prev => {
              const nextStats = {
                totalRuns: prev.totalRuns || 0,
                totalPlaytime: (prev.totalPlaytime || 0) + s.playtime,
                totalDataCollected: (prev.totalDataCollected || 0) + s.dataCollected,
                totalKeysCollected: (prev.totalKeysCollected || 0) + s.keysCollected,
                highestScore: Math.max(prev.highestScore || 0, displayScore),
              };
              try { localStorage.setItem('aiki_profile_stats', JSON.stringify(nextStats)); } catch {}
              return nextStats;
            });

            // Add run data fragments to persistent data total
            setTotalData(prev => {
              const nextTotal = prev + s.dataCollected;
              try { localStorage.setItem('aiki_total_data', String(nextTotal)); } catch {}
              return nextTotal;
            });

            setHighScore(prev => {
              const hs = Math.max(prev, displayScore);
              try { localStorage.setItem('aiki_hs', String(hs)); } catch {}
              return hs;
            });

            // Check leaderboard eligibility
            const qualifies = displayScore > 0 && (leaderboard.length < 5 || displayScore > leaderboard[leaderboard.length - 1].score);
            if (qualifies) {
              setLeaderboardQualifyScore(displayScore);
            }

            setGameState(GAME_STATE.DEAD);
            spawnDeathParticles(playerX, playerY);
            return;
          } else {
            s.invincFrames = INVINCIBILITY_FRAMES;
            setIsInvincible(true);
          }
        }
      }
    }

    // 2. Check collectibles collection
    collectiblesRef.current = collectiblesRef.current.filter(c => {
      const collides = rectsOverlap(
        playerX, playerY, PLAYER_WIDTH, PLAYER_HEIGHT,
        c.x, c.bottomOffset, c.width, c.height,
        2 // slightly relaxed padding for collectibles
      );

      if (collides) {
        playSFX('collect');
        // Spark particles at collection position
        spawnCollectionParticles(c.x + c.width / 2, c.bottomOffset + c.height / 2, c.variant);

        // Apply reward logic based on variant
        if (c.variant === COLLECTIBLE_VARIANTS.DATA) {
          // Increase score directly + popup
          s.rawScore += 150;
          s.dataCollected += 1;
          setDataCount(s.dataCollected);
          spawnPopup(c.x, c.bottomOffset, '+150 PTS', 'var(--neon-cyan)');

          if (s.dataCollected >= 50) {
            unlockAchievement('data_50');
          }
        } else if (c.variant === COLLECTIBLE_VARIANTS.KEY) {
          // Increment Encryption Key count + popup
          s.keysCollected += 1;
          setKeysCount(s.keysCollected);
          spawnPopup(c.x, c.bottomOffset, '+1 KEY', 'var(--neon-yellow)');
        } else if (c.variant === COLLECTIBLE_VARIANTS.SHIELD) {
          triggerPowerUpCollect('shield');
        } else if (c.variant === COLLECTIBLE_VARIANTS.OVERCLOCK) {
          triggerPowerUpCollect('overclock');
        }

        return false; // remove from list
      }
      return true; // keep
    });

    setObstacles([...obstaclesRef.current]);
    setCollectibles([...collectiblesRef.current]);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [spawnHitParticles, spawnDeathParticles, spawnCollectionParticles, spawnPopup, triggerLevelTransition, triggerPowerUpCollect, spawnParticles, upgrades, unlockAchievement, leaderboard]);

  // Start/stop loop
  useEffect(() => {
    if (gameState === GAME_STATE.RUNNING) {
      rafRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState, gameLoop]);

  // Keyboard input
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === GAME_STATE.RUNNING) jump();
        else if (gameState === GAME_STATE.DEAD) startGame();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        if (gameState === GAME_STATE.RUNNING) slide();
      } else if (gameState === GAME_STATE.RUNNING) {
        if (e.code === 'KeyQ' || e.code === 'Digit1') {
          activateAbility('shield');
        } else if (e.code === 'KeyW' || e.code === 'Digit2') {
          activateAbility('overclock');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, jump, slide, startGame, activateAbility]);

  const purchaseUpgrade = useCallback((key) => {
    const currentLevel = upgrades[key] || 0;
    if (currentLevel >= MAX_UPGRADE_LEVEL) return false;

    const cost = UPGRADE_COSTS[currentLevel];
    if (totalData < cost) return false;

    const nextLevel = currentLevel + 1;
    const nextUpgrades = { ...upgrades, [key]: nextLevel };

    setUpgrades(nextUpgrades);
    try { localStorage.setItem('aiki_upgrades', JSON.stringify(nextUpgrades)); } catch {}

    const nextData = totalData - cost;
    setTotalData(nextData);
    try { localStorage.setItem('aiki_total_data', String(nextData)); } catch {}

    playSFX('upgrade');

    if (nextLevel === 5) {
      unlockAchievement('upgrade_max');
    }

    spawnPopup(GAME_WIDTH / 2, GROUND_Y + 100, `INJECTED: ${key.toUpperCase()} LVL ${nextLevel}`, 'var(--neon-green)');
    return true;
  }, [upgrades, totalData, spawnPopup, unlockAchievement]);

  const submitLeaderboardInitials = useCallback((initials) => {
    const newRecord = {
      name: initials,
      score: leaderboardQualifyScore,
      level: stateRef.current.level,
      date: Date.now(),
    };
    setLeaderboard(prev => {
      const next = [...prev, newRecord].sort((a, b) => b.score - a.score).slice(0, 5);
      try { localStorage.setItem('aiki_leaderboard', JSON.stringify(next)); } catch {}
      return next;
    });
    setLeaderboardQualifyScore(null);
  }, [leaderboardQualifyScore]);

  const cancelLeaderboardSubmission = useCallback(() => {
    setLeaderboardQualifyScore(null);
    goHome();
  }, [goHome]);

  return {
    gameState,
    score,
    highScore,
    energy,
    maxEnergy: 100,
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
    setLeaderboard,
    stats,
    setStats,
    unlockedAchievements,
    leaderboardQualifyScore,
    submitLeaderboardInitials,
    unlockAchievement,
    jump,
    slide,
    startGame,
    goHome,
    GAME_WIDTH,
    GAME_HEIGHT,
    GROUND_HEIGHT,
    PLAYER_X,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    GROUND_Y,
  };
}
