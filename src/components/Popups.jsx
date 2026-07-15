/**
 * Popups.jsx
 * Floating score/energy text animation when item is collected.
 */

export default function Popups({ popups }) {
  if (!popups.length) return null;

  return (
    <div className="popups-container" aria-hidden="true">
      {popups.map(p => (
        <div
          key={p.id}
          className="collection-popup"
          style={{
            left: p.x,
            top: p.y,
            color: p.color,
            textShadow: `0 0 8px ${p.color}`,
          }}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
}
