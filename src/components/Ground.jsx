/**
 * Ground.jsx
 * The neon ground platform/road with scrolling grid patterns matching the current level.
 */

import { useRef, useEffect } from 'react';

export default function Ground({ height, speed = 5, level = 1 }) {
  const containerRef = useRef(null);
  const xRef    = useRef(0);
  const rafRef  = useRef(null);

  useEffect(() => {
    const grids = containerRef.current?.querySelectorAll('.ground-grid');
    if (!grids || grids.length === 0) return;

    const tick = () => {
      xRef.current -= speed;
      grids.forEach(grid => {
        grid.style.backgroundPositionX = `${xRef.current}px`;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed]);

  return (
    <div className={`ground ground--level-${level}`} style={{ height }}>
      {/* Glowing top edge */}
      <div className="ground-surface" />

      {/* Ground body containing synchronized scrolling grids */}
      <div className="ground-body" ref={containerRef}>
        <div className="ground-grid ground-grid--1" style={{ opacity: level === 1 ? 1 : 0 }} />
        <div className="ground-grid ground-grid--2" style={{ opacity: level === 2 ? 1 : 0 }} />
        <div className="ground-grid ground-grid--3" style={{ opacity: level === 3 ? 1 : 0 }} />
      </div>
    </div>
  );
}
