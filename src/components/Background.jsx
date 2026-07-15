/**
 * Background.jsx
 * Renders multi-layered parallax cyberpunk scrolling backgrounds:
 * level-specific layers (Neon District, Firewall Fortress, AI Core) with smooth transitions.
 */

import { useRef, useEffect } from 'react';

// ── Star field (canvas-drawn, scrolls slowly) ───────────────────────────────
function StarField({ width, height, speed = 0.3, color = 'rgba(200, 240, 255, ' }) {
  const canvasRef = useRef(null);
  const starsRef  = useRef(null);
  const xRef      = useRef(0);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = width;
    canvas.height = height;

    // Generate stars once
    if (!starsRef.current) {
      starsRef.current = Array.from({ length: 120 }, () => ({
        x: Math.random() * width * 2,
        y: Math.random() * height * 0.75,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
      }));
    }

    let frame = 0;
    const draw = () => {
      frame++;
      xRef.current -= speed;

      ctx.clearRect(0, 0, width, height);

      for (const s of starsRef.current) {
        const x = ((s.x + xRef.current) % (width * 2) + width * 2) % (width * 2);
        if (x > width) continue;
        const tw = Math.sin(s.twinkle + frame * 0.02) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${s.a * tw})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, speed, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
}

// ── City silhouette (Level 1: Mid-speed parallax skyscrapers) ───────────────
function CityLayer({ width, height, groundHeight, speed = 1.8 }) {
  const canvasRef = useRef(null);
  const offsetRef = useRef(0);
  const rafRef    = useRef(null);
  const buildingsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = width * 2;
    canvas.height = height;

    // Generate buildings once
    if (!buildingsRef.current) {
      const buildings = [];
      let x = 0;
      while (x < width * 2) {
        const w  = Math.floor(Math.random() * 60) + 30;
        const h  = Math.floor(Math.random() * (height * 0.5)) + height * 0.1;
        const windows = Math.floor(Math.random() * 8) + 2;
        buildings.push({ x, w, h, windows, color: Math.random() });
        x += w + Math.floor(Math.random() * 8);
      }
      buildingsRef.current = buildings;
    }

    const drawBuildings = (offsetX) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const groundY = canvas.height - groundHeight;

      for (const b of buildingsRef.current) {
        const bx = ((b.x - offsetX) % (width * 2) + width * 2) % (width * 2);

        // Building body
        const grad = ctx.createLinearGradient(bx, groundY - b.h, bx + b.w, groundY);
        grad.addColorStop(0, b.color > 0.5 ? 'rgba(10,8,30,0.85)' : 'rgba(5,15,25,0.85)');
        grad.addColorStop(1, 'rgba(2,4,9,0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(bx, groundY - b.h, b.w, b.h);

        // Edge glow
        ctx.strokeStyle = b.color > 0.5
          ? 'rgba(180,74,255,0.3)'
          : 'rgba(0,245,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, groundY - b.h, b.w, b.h);

        // Windows
        const wSize = 4;
        const cols  = Math.floor(b.w / 10);
        for (let r = 0; r < b.windows; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.random() > 0.4) {
              const wx = bx + c * 10 + 4;
              const wy = groundY - b.h + r * 14 + 8;
              const lit = Math.random() > 0.3;
              if (lit) {
                ctx.fillStyle = b.color > 0.5
                  ? `rgba(180,74,255,${0.4 + Math.random() * 0.4})`
                  : `rgba(0,245,255,${0.3 + Math.random() * 0.4})`;
                ctx.fillRect(wx, wy, wSize, wSize - 1);
              }
            }
          }
        }

        // Antenna
        if (b.w > 40) {
          ctx.strokeStyle = 'rgba(0,245,255,0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bx + b.w / 2, groundY - b.h);
          ctx.lineTo(bx + b.w / 2, groundY - b.h - 18);
          ctx.stroke();

          // Blinking tip
          const blink = Math.sin(Date.now() * 0.003 + b.x) > 0;
          if (blink) {
            ctx.fillStyle = 'rgba(255,45,120,0.9)';
            ctx.beginPath();
            ctx.arc(bx + b.w / 2, groundY - b.h - 18, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const animate = () => {
      offsetRef.current += speed;
      drawBuildings(offsetRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, groundHeight, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '80%',
        imageRendering: 'pixelated',
      }}
    />
  );
}

// ── Fortress silhouette (Level 2: Jagged bastions + sweeping searchlights) ──
function FortressLayer({ width, height, groundHeight, speed = 2.2 }) {
  const canvasRef = useRef(null);
  const offsetRef = useRef(0);
  const rafRef    = useRef(null);
  const elementsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = width * 2;
    canvas.height = height;

    if (!elementsRef.current) {
      const elements = [];
      let x = 0;
      while (x < width * 2) {
        const w  = Math.floor(Math.random() * 80) + 40;
        const h  = Math.floor(Math.random() * (height * 0.45)) + height * 0.15;
        elements.push({ x, w, h, hasSearchlight: Math.random() > 0.45, blinkPhase: Math.random() * Math.PI });
        x += w + Math.floor(Math.random() * 15) + 5;
      }
      elementsRef.current = elements;
    }

    const drawFortress = (offsetX, frame) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const groundY = canvas.height - groundHeight;

      // 1. Draw searchlights in background
      for (const el of elementsRef.current) {
        const bx = ((el.x - offsetX) % (width * 2) + width * 2) % (width * 2);
        if (el.hasSearchlight) {
          const sx = bx + el.w / 2;
          const sy = groundY - el.h;
          
          const angle = Math.sin(frame * 0.015 + el.blinkPhase) * 0.45 - Math.PI / 2;
          const len = height * 1.4;
          const tx = sx + Math.cos(angle) * len;
          const ty = sy + Math.sin(angle) * len;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          const coneWidth = 45;
          ctx.lineTo(tx - Math.sin(angle) * coneWidth, ty + Math.cos(angle) * coneWidth);
          ctx.lineTo(tx + Math.sin(angle) * coneWidth, ty - Math.cos(angle) * coneWidth);
          ctx.closePath();

          const grad = ctx.createLinearGradient(sx, sy, tx, ty);
          grad.addColorStop(0, 'rgba(255, 45, 120, 0.22)');
          grad.addColorStop(1, 'rgba(255, 45, 120, 0.0)');
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
        }
      }

      // 2. Draw tower bodies
      for (const el of elementsRef.current) {
        const bx = ((el.x - offsetX) % (width * 2) + width * 2) % (width * 2);

        const grad = ctx.createLinearGradient(bx, groundY - el.h, bx + el.w, groundY);
        grad.addColorStop(0, 'rgba(24, 6, 6, 0.96)');
        grad.addColorStop(1, 'rgba(6, 1, 1, 0.98)');
        ctx.fillStyle = grad;
        ctx.fillRect(bx, groundY - el.h, el.w, el.h);

        // Security grid border lines
        ctx.strokeStyle = 'rgba(255, 45, 120, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, groundY - el.h, el.w, el.h);

        // Sweeping scanner grid line
        ctx.save();
        ctx.beginPath();
        ctx.rect(bx, groundY - el.h, el.w, el.h);
        ctx.clip();
        
        const scannerY = groundY - el.h + ((frame * 2.2 + el.x) % el.h);
        ctx.strokeStyle = 'rgba(255, 45, 120, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, scannerY);
        ctx.lineTo(bx + el.w, scannerY);
        ctx.stroke();
        ctx.restore();

        // Tip blinking warning dot
        const isBlinking = Math.sin(frame * 0.05 + el.blinkPhase) > 0;
        if (isBlinking) {
          ctx.fillStyle = 'rgba(255, 45, 120, 1)';
          ctx.beginPath();
          ctx.arc(bx + el.w / 2, groundY - el.h, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    let frame = 0;
    const animate = () => {
      frame++;
      offsetRef.current += speed;
      drawFortress(offsetRef.current, frame);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, groundHeight, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '80%',
        imageRendering: 'pixelated',
      }}
    />
  );
}

// ── AI Central Core (Level 3: Pulser, concentric rings & wireframes) ─────────
function CoreLayer({ width, height, groundHeight, speed = 2.5 }) {
  const canvasRef = useRef(null);
  const offsetRef = useRef(0);
  const rafRef    = useRef(null);
  const nodesRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = width;
    canvas.height = height;

    if (!nodesRef.current) {
      const nodes = [];
      for (let i = 0; i < 8; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.4) + height * 0.1,
          w: Math.random() * 60 + 30,
          h: Math.random() * 100 + 50,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulsePhase: Math.random() * Math.PI,
        });
      }
      nodesRef.current = nodes;
    }

    const drawCore = (frame) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Central AI Core Orb
      const centerX = width * 0.5;
      const centerY = height * 0.35;
      const baseRadius = 55;
      const pulse = Math.sin(frame * 0.04) * 8;
      const r = baseRadius + pulse;

      const grad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, '#39ff14'); // emerald glow
      grad.addColorStop(0.6, 'rgba(0, 245, 255, 0.45)'); // cyan outer rim
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Outer Rings
      ctx.lineWidth = 1.5;

      ctx.strokeStyle = 'rgba(57, 255, 20, 0.4)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 20, -frame * 0.01, -frame * 0.01 + Math.PI * 1.4);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 245, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 35, frame * 0.015, frame * 0.015 + Math.PI * 1.1);
      ctx.stroke();

      // Expanding Grid Pulse
      const gridRadius = (frame * 0.8) % 150 + baseRadius;
      ctx.strokeStyle = `rgba(0, 245, 255, ${Math.max(0, 1 - (gridRadius - baseRadius) / 150) * 0.25})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, gridRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Circuit paths connecting to Core
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - baseRadius, centerY);
      ctx.lineTo(centerX - baseRadius - 60, centerY);
      ctx.lineTo(centerX - baseRadius - 100, centerY - 45);
      ctx.lineTo(0, centerY - 45);

      ctx.moveTo(centerX + baseRadius, centerY);
      ctx.lineTo(centerX + baseRadius + 60, centerY);
      ctx.lineTo(centerX + baseRadius + 100, centerY + 45);
      ctx.lineTo(width, centerY + 45);
      ctx.stroke();

      // 3. Scrolling Wireframe Server Blocks
      for (const node of nodesRef.current) {
        const nx = ((node.x - offsetRef.current) % (width + 100) + (width + 100)) % (width + 100) - 50;

        ctx.strokeStyle = 'rgba(0, 245, 255, 0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(nx, node.y, node.w, node.h);

        const segments = 4;
        const segmentH = node.h / segments;
        for (let sIdx = 0; sIdx < segments; sIdx++) {
          const sy = node.y + sIdx * segmentH;
          ctx.strokeRect(nx + 4, sy + 2, node.w - 8, segmentH - 4);
          
          const pulseAlpha = Math.sin(frame * node.pulseSpeed + node.pulsePhase + sIdx) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(57, 255, 20, ${pulseAlpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(nx + node.w - 10, sy + segmentH / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    let frame = 0;
    const animate = () => {
      frame++;
      offsetRef.current += speed * 0.4;
      drawCore(frame);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, groundHeight, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
      }}
    />
  );
}

// ── Matrix Rain Code Streams (Level 3 exclusive) ────────────────────────────
function MatrixRain({ width, height }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = width;
    canvas.height = height;

    const fontSize = 14;
    const columns = Math.ceil(width / fontSize);
    const drops = Array(columns).fill(1);
    const chars = "0101010101ABCDEFUXYZ<>/*-+".split("");

    let lastTime = 0;
    const interval = 30; // Limit frame rate for stylized retro feel

    const draw = (timestamp) => {
      rafRef.current = requestAnimationFrame(draw);
      
      if (timestamp - lastTime < interval) return;
      lastTime = timestamp;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Bright green head, slightly faded tails
        if (Math.random() > 0.98) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = 'rgba(57, 255, 20, 0.85)';
        }

        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.35,
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Ground grid (CSS, fast scroll background overlay) ───────────────────────
function GroundGrid({ speed, color = 'rgba(0, 245, 255, 0.06)' }) {
  const ref = useRef(null);
  const xRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tick = () => {
      xRef.current -= speed;
      el.style.backgroundPositionX = `${xRef.current}px`;
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: [
          `linear-gradient(${color} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        ].join(','),
        backgroundSize: '40px 40px',
      }}
    />
  );
}

// ── Ambient cyber particles canvas (tailored per level) ──────────────────────
function AmbientParticles({ width, height, speed, level, density = 'high' }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = width;
    canvas.height = height;

    const particleCount = density === 'low' ? 8 : density === 'medium' ? 18 : 35;
    if (particlesRef.current.length !== particleCount) {
      particlesRef.current = Array.from({ length: particleCount }, () => createParticle(width, height, level, true));
    }

    function createParticle(w, h, lvl, randomY = false) {
      const y = randomY ? Math.random() * h : (lvl === 2 ? h + 10 : Math.random() * h);
      const x = randomY ? Math.random() * w : (lvl === 2 ? Math.random() * w : w + 10);
      
      let color = '#00f5ff';
      let size = Math.random() * 2 + 1;
      let vx = -Math.random() * 1.5 - 0.5;
      let vy = (Math.random() - 0.5) * 0.4;
      let type = 'dot';
      let char = '';

      if (lvl === 1) {
        color = Math.random() > 0.5 ? '#00f5ff' : '#ff2d78';
        size = Math.random() * 2.5 + 1.2;
      } else if (lvl === 2) {
        color = Math.random() > 0.35 ? '#ff2d78' : '#ffe600';
        size = Math.random() * 4 + 2;
        vx = (Math.random() - 0.5) * 0.8;
        vy = -Math.random() * 2.0 - 0.5; // rising firewall sparks
        type = Math.random() > 0.75 ? 'hex' : 'dot';
      } else if (lvl === 3) {
        color = Math.random() > 0.45 ? '#39ff14' : '#00f5ff';
        size = 11;
        vx = -Math.random() * 2.5 - 1.2;
        vy = (Math.random() - 0.5) * 0.3;
        type = 'binary';
        char = Math.random() > 0.5 ? '0' : '1';
      }

      return { x, y, size, vx, vy, color, type, char, alpha: Math.random() * 0.45 + 0.3 };
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx * (speed * 0.15 + 0.6);
        p.y += p.vy;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.type === 'dot') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'hex') {
          ctx.beginPath();
          const side = p.size;
          for (let sIdx = 0; sIdx < 6; sIdx++) {
            const angle = (sIdx * Math.PI) / 3;
            const hx = p.x + side * Math.cos(angle);
            const hy = p.y + side * Math.sin(angle);
            if (sIdx === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'binary') {
          ctx.font = `${p.size}px monospace`;
          ctx.fillText(p.char, p.x, p.y);
        }
        ctx.restore();

        const isOffscreen = level === 2
          ? p.y < -15 || p.x < -15 || p.x > width + 15
          : p.x < -15 || p.y < -15 || p.y > height + 15;

        if (isOffscreen) {
          particlesRef.current[idx] = createParticle(width, height, level, false);
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, speed, level, density]);

  useEffect(() => {
    particlesRef.current = [];
  }, [level]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12 }} />;
}

// ── Exported Background component ───────────────────────────────────────────
export default function Background({ width, height, groundHeight, gameSpeed = 5, level = 1, density = 'high' }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#020409',
      }}
    >
      {/* ── LEVEL 1 Layer: NEON DISTRICT ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #020409 0%, #060918 30%, #0d0520 60%, #071212 100%)',
          opacity: level === 1 ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
          zIndex: level === 1 ? 3 : 1,
        }}
      >
        <StarField width={width} height={height} speed={gameSpeed * 0.06} color="rgba(200, 240, 255, " />
        <CityLayer width={width} height={height} groundHeight={groundHeight} speed={gameSpeed * 0.36} />
        <GroundGrid speed={gameSpeed} color="rgba(0, 245, 255, 0.06)" />
      </div>

      {/* ── LEVEL 2 Layer: FIREWALL FORTRESS ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #080202 0%, #1a0505 30%, #2b0808 60%, #150303 100%)',
          opacity: level === 2 ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
          zIndex: level === 2 ? 3 : 1,
        }}
      >
        <StarField width={width} height={height} speed={gameSpeed * 0.08} color="rgba(255, 100, 100, " />
        <FortressLayer width={width} height={height} groundHeight={groundHeight} speed={gameSpeed * 0.45} />
        <GroundGrid speed={gameSpeed} color="rgba(255, 45, 120, 0.05)" />
      </div>

      {/* ── LEVEL 3 Layer: AI CORE ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #010803 0%, #031508 30%, #05260f 60%, #020f06 100%)',
          opacity: level === 3 ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
          zIndex: level === 3 ? 3 : 1,
        }}
      >
        <MatrixRain width={width} height={height} />
        <CoreLayer width={width} height={height} groundHeight={groundHeight} speed={gameSpeed * 0.5} />
        <GroundGrid speed={gameSpeed} color="rgba(57, 255, 20, 0.05)" />
      </div>

      {/* ── Ambient Particles Layer (drawn on top of background features) ── */}
      <AmbientParticles width={width} height={height} speed={gameSpeed} level={level} density={density} />
    </div>
  );
}
