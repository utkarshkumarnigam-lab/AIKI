/**
 * audioManager.js
 * Procedural Audio Synthesizer utilizing HTML5 Web Audio API.
 * Synthesizes classic retro/cyberpunk BGM and SFX dynamically in the browser.
 */

let audioCtx = null;
let volumeSFX = 0.5;
let volumeBGM = 0.3;
let isBgmPlaying = false;

// BGM Scheduler state
let schedulerInterval = null;
let currentStep = 0;
let nextNoteTime = 0.0;
const tempo = 120; // Beats Per Minute
const tickTime = 60 / tempo / 4; // 16th note step duration (~0.125s)

/**
 * Initializes the audio context (must be called upon user interaction).
 */
export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

/**
 * Updates current BGM and SFX volume levels.
 */
export function setVolumes(sfxVal, bgmVal) {
  volumeSFX = Math.max(0, Math.min(1, sfxVal));
  volumeBGM = Math.max(0, Math.min(1, bgmVal));
}

/**
 * Synthesizes game SFX by oscillator type.
 */
export function playSFX(type) {
  if (!audioCtx || audioCtx.state === 'suspended') return;
  const now = audioCtx.currentTime;

  switch (type) {
    case 'jump': {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.14);
      
      gain.gain.setValueAtTime(volumeSFX * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
      break;
    }
    case 'hit': {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(35, now + 0.3);
      
      gain.gain.setValueAtTime(volumeSFX * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
    case 'collect': {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(783.99, now + 0.08); // G5
      
      gain.gain.setValueAtTime(volumeSFX * 0.22, now);
      gain.gain.setValueAtTime(volumeSFX * 0.22, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
      break;
    }
    case 'upgrade': {
      [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(volumeSFX * 0.18, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.2);
      });
      break;
    }
    case 'transition': {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 1.8);
      
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volumeSFX * 0.3, now + 0.8);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.8);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.8);
      break;
    }
    case 'gameover': {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.7);
      
      gain.gain.setValueAtTime(volumeSFX * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
      break;
    }
    case 'achievement': {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(volumeSFX * 0.16, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.16);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.16);
      });
      break;
    }
    default:
      break;
  }
}

/**
 * Synthesizes hi-hat noises.
 */
function playHiHat(time) {
  if (volumeBGM <= 0) return;
  const bufferSize = audioCtx.sampleRate * 0.02;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(8000, time);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(volumeBGM * 0.15, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start(time);
  noise.stop(time + 0.02);
}

/**
 * Synthesizes repeating bass progression notes.
 */
function playBassNote(freq, time, duration) {
  if (volumeBGM <= 0) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, time);

  gain.gain.setValueAtTime(volumeBGM * 0.45, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(time);
  osc.stop(time + duration);
}

/**
 * Synthesizes top lead arp chimes.
 */
function playLeadNote(freq, time, duration = 0.18) {
  if (volumeBGM <= 0) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);

  gain.gain.setValueAtTime(volumeBGM * 0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(time);
  osc.stop(time + duration);
}

/**
 * Scheduler ticks loop.
 */
function scheduleBGM() {
  while (nextNoteTime < audioCtx.currentTime + 0.15) {
    const time = nextNoteTime;

    // Cyberpunk bassline pattern (16 beats loop)
    const bassPattern = [
      65.41, 0, 65.41, 65.41, // C2, -, C2, C2
      77.78, 0, 77.78, 77.78, // Eb2, -, Eb2, Eb2
      87.31, 0, 87.31, 87.31, // F2, -, F2, F2
      65.41, 77.78, 87.31, 98.00 // C2, Eb2, F2, G2
    ];

    const freq = bassPattern[currentStep % 16];
    if (freq > 0) {
      playBassNote(freq, time, 0.15);
    }

    // Hi-hat ticks on off-beats
    if (currentStep % 4 === 2) {
      playHiHat(time);
    }

    // Cyber chimes melody overlay
    if (currentStep % 32 === 0) playLeadNote(261.63, time); // C4
    if (currentStep % 32 === 6) playLeadNote(311.13, time); // Eb4
    if (currentStep % 32 === 12) playLeadNote(349.23, time); // F4
    if (currentStep % 32 === 18) playLeadNote(392.00, time); // G4
    if (currentStep % 32 === 24) playLeadNote(466.16, time); // Bb4

    nextNoteTime += tickTime;
    currentStep++;
  }
}

/**
 * Starts the procedural BGM synthesizer scheduler loop.
 */
export function startBGM() {
  if (isBgmPlaying) return;
  initAudio();
  if (!audioCtx) return;

  isBgmPlaying = true;
  nextNoteTime = audioCtx.currentTime;
  currentStep = 0;
  
  schedulerInterval = setInterval(() => {
    if (audioCtx.state === 'running') {
      scheduleBGM();
    }
  }, 35);
}

/**
 * Terminates BGM synthesis.
 */
export function stopBGM() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
  isBgmPlaying = false;
}
