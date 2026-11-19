// components/Ornament.js - A small gold ornament divider.
//
// Decoration only: three diamonds (a lotus-like center flanked by two small
// gems) connected by fading hairlines, echoing the carved motifs of Khmer
// temple and textile patterns without pretending to be a real historical
// artefact. Color is inherited from the surrounding text via currentColor, so
// on dark burgundy it renders gold-bright and on ivory it renders a softer
// gold. aria-hidden and role="presentation" keep screen readers on the real
// content.
export default function Ornament() {
  return (
    <svg
      className="royal-ornament"
      viewBox="0 0 240 24"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="4" y1="12" x2="88" y2="12" stroke="currentColor" strokeWidth="1" />
      <line
        x1="152"
        y1="12"
        x2="236"
        y2="12"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="98" cy="12" r="1.6" fill="currentColor" />
      <path d="M 104 12 L 108 8 L 112 12 L 108 16 Z" fill="currentColor" />
      <circle cx="114" cy="12" r="1.4" fill="currentColor" opacity="0.7" />
      <path d="M 120 12 L 127 5 L 134 12 L 127 19 Z" fill="currentColor" />
      <circle cx="126" cy="12" r="1.4" fill="currentColor" opacity="0.7" />
      <path d="M 136 12 L 140 8 L 144 12 L 140 16 Z" fill="currentColor" />
      <circle cx="142" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}
