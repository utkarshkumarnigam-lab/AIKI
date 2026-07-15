/**
 * Particles.jsx
 * CSS-animated death/impact particle burst.
 */

export default function Particles({ particles }) {
  if (!particles.length) return null;

  return (
    <div className="particles-container" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left:             p.x,
            top:              p.y,
            width:            p.size,
            height:           p.size,
            background:       p.color,
            boxShadow:        `0 0 ${p.size * 2}px ${p.color}`,
            '--drift':        p.drift,
            animation:        `particleFloat ${p.duration}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
}
