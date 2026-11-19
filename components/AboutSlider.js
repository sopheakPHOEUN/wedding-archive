// components/AboutSlider.js
// The framed visual in the "About the collection" section, rebuilt as a
// cinematic 3D coverflow. Once the archive holds photos, three cards float on
// a burgundy stage — one large active card in the centre, two smaller cards
// tucked behind at the sides — and the deck auto-advances and loops forever
// with an elegant shared easing. Visitors can also steer it with the arrows,
// the dots, tapping a side card, or dragging/swiping the deck. Auto-advance
// pauses while the visitor hovers or focuses the gallery, and never runs for
// visitors who prefer reduced motion. Before any photos exist it falls back to
// the engraved crest, so the frame never reads as an empty picture card.
import React from "react";

// Shortest signed distance from `from` to `to` walking around a ring of `n`
// cards, so wrapping from the last card back to the first is one elegant step.
const ringStep = (from, to, n) => {
  const d = ((to - from) % n + n) % n;
  return d > n / 2 ? d - n : d;
};

// Easing used for every coverflow move (matches the site's reveal curve).
const EASE = "0.7s cubic-bezier(0.22, 0.61, 0.36, 1)";

// Auto-play should never run for visitors who prefer reduced motion; the
// arrows, dots, taps and drag all still work for them.
const prefersReducedMotion = () => {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (error) {
    return false;
  }
};

export default function AboutSlider({ images }) {
  // Keep only entries that actually carry a photo path, so an empty field can
  // never produce a broken <img>.
  const list = React.useMemo(
    () => (Array.isArray(images) ? images.filter((i) => i && i.src) : []),
    [images]
  );
  const count = list.length;

  const [index, setIndex] = React.useState(0);
  const [hover, setHover] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [dragX, setDragX] = React.useState(0);
  // Fixed depth sketch for the first render (both renders match, so there is
  // no hydration mismatch); measured precisely right after mount and on resize.
  const [stageW, setStageW] = React.useState(900);

  const stageRef = React.useRef(null);
  const dragRef = React.useRef({ startX: 0, down: false, moved: false, dx: 0 });
  const suppressTapRef = React.useRef(false);
  const paused = hover || focused || dragging;

  // If the archive shrinks, never let the current index point past the end.
  React.useEffect(() => {
    if (count > 0 && index >= count) setIndex(0);
  }, [count, index]);

  // Measure the stage once and on every resize so card widths, spacing and
  // drag thresholds all scale with the screen.
  React.useEffect(() => {
    const measure = () => {
      if (stageRef.current) {
        setStageW(stageRef.current.getBoundingClientRect().width);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Auto-advance: every 4.5 seconds one card glides forward and the deck loops
  // forever. Pauses on hover/focus/drag (see `paused`) and never runs for
  // reduced-motion visitors.
  React.useEffect(() => {
    if (count < 2 || paused) return undefined;
    if (prefersReducedMotion()) return undefined;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      4500
    );
    return () => window.clearInterval(timer);
  }, [count, paused, index]);

  const goTo = (next) => setIndex(((next % count) + count) % count);

  // Card geometry for the current stage width. Both proportions scale with the
  // measured stage, so the same arc fills a 360px phone or a wide desktop.
  // Compact card geometry (39% / 345px) so the framed stage and background
  // card stay prominent; spacing scales along (20%) so the arc and overlap
  // look identical to the larger sizes.
  const cardW = Math.min(stageW * 0.39, 345);
  const cardH = cardW * (4 / 3);
  const pitch = Math.min(stageW * 0.2, 185);

  // Drag + swipe, unified through Pointer Events. Listeners attach to the
  // window while a gesture is active so a finger (or mouse) can drift off the
  // stage mid-drag and still steer the deck; a small tap keeps its click so
  // tapping a side card moves straight to it.
  const startPointer = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = { startX: e.clientX, down: true, moved: false, dx: 0 };
    suppressTapRef.current = false;
    setDragging(true);
  };

  const movePointer = React.useCallback((e) => {
    const s = dragRef.current;
    if (!s || !s.down) return;
    const dx = e.clientX - s.startX;
    if (!s.moved && Math.abs(dx) < 8) return; // taps stay taps
    s.moved = true;
    s.dx = dx;
    setDragX(dx);
  }, []);

  const endPointer = React.useCallback(() => {
    const s = dragRef.current;
    if (!s || !s.down) return;
    const { dx, moved } = s;
    s.down = false;
    setDragging(false);
    suppressTapRef.current = moved;
    if (moved) {
      if (dx <= -pitch * 0.35) setIndex((current) => (current + 1) % count);
      else if (dx >= pitch * 0.35)
        setIndex((current) => (current - 1 + count) % count);
    }
    setDragX(0);
  }, [pitch, count]);

  React.useEffect(() => {
    if (!dragging) return undefined;
    window.addEventListener("pointermove", movePointer);
    window.addEventListener("pointerup", endPointer);
    window.addEventListener("pointercancel", endPointer);
    return () => {
      window.removeEventListener("pointermove", movePointer);
      window.removeEventListener("pointerup", endPointer);
      window.removeEventListener("pointercancel", endPointer);
    };
  }, [dragging, movePointer, endPointer]);

  // No photos in the archive yet: show the crest so the column keeps its mark.
  // This early return sits below every hook above so the number and order of
  // hooks is identical on every render (Rules of Hooks).
  if (list.length === 0) {
    return (
      <div className="about-plaque">
        <div className="about-plaque-inner">
          <span className="about-plaque-glyph" lang="km">
            អ
          </span>
          <span className="about-plaque-rule" aria-hidden="true" />
          <p className="about-plaque-text" lang="km">
            អាពាហ៍ពិពាហ៍ប្រពៃណីខ្មែរ
          </p>
        </div>
      </div>
    );
  }

  // Snapped cards glide along the shared easing curve; a dragging card tracks
  // the pointer without lag.
  const cardTransition = dragging ? "none" : EASE;

  return (
    <div className="about-carousel">
      <div
        ref={stageRef}
        className={`about-carousel-stage${dragging ? " is-dragging" : ""}`}
        aria-label="Gallery of archive photos"
        onPointerDown={startPointer}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <div
          className="about-carousel-spacer"
          style={{ width: cardW, height: cardH }}
          aria-hidden="true"
        />

        {list.map((img, i) => {
          // Where this card sits in the arc, in steps from the active card.
          // The drag offset nudges the whole deck by a fraction of a step.
          const step = ringStep(index, i, count) + dragX / pitch;
          const m = Math.min(Math.abs(step), 1);
          const x = step * pitch;
          const rot = Math.max(-28, Math.min(28, -step * 28));
          const scale = 1 - 0.24 * m;
          const opacity = Math.abs(step) <= 1 ? 1 - 0.24 * m : 0;
          const hidden = Math.abs(step) > 1.2;
          return (
            <div
              key={`${img.src}-${i}`}
              className={`about-card${step === 0 ? " is-active" : ""}`}
              style={{
                width: cardW,
                height: cardH,
                transform: `translate(-50%, -50%) translateX(${x}px) rotateY(${rot}deg) scale(${scale})`,
                opacity,
                zIndex: Math.round(10 - Math.abs(step)),
                pointerEvents: hidden ? "none" : "auto",
                transition: cardTransition,
              }}
            >

              <button
                type="button"
                className="about-card-btn"
                aria-label={`Show photo: ${img.alt}`}
                aria-hidden={hidden || undefined}
                tabIndex={!hidden && Math.abs(step) === 1 ? 0 : -1}
                onClick={() => {
                  // A released drag fires a synthetic click; ignore it so the
                  // snap decides. Plain taps still jump to the tapped card.
                  if (suppressTapRef.current) {
                    suppressTapRef.current = false;
                    return;
                  }
                  setIndex(i);
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading={i === index ? "eager" : "lazy"}
                  draggable="false"
                />
              </button>
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            className="about-carousel-arrow about-carousel-prev"
            onClick={() => goTo(index - 1)}
            aria-label="Show previous photo"
          >
            ‹
          </button>
          <button
            type="button"
            className="about-carousel-arrow about-carousel-next"
            onClick={() => goTo(index + 1)}
            aria-label="Show next photo"
          >
            ›
          </button>
        </>
      ) : null}

      <div className="about-carousel-meta">
        <p className="about-carousel-caption">{list[index].alt}</p>

        {count > 1 ? (
          <div className="about-carousel-dots">
            {list.map((img, i) => (
              <button
                key={`${img.src}-dot-${i}`}
                type="button"
                className={`about-carousel-dot${i === index ? " is-active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
