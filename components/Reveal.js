// components/Reveal.js - A tiny scroll-reveal wrapper.
// Uses the browser's IntersectionObserver (no libraries) to add the
// "is-visible" class once the element enters the viewport, which fades and
// lifts it in (see .reveal in theme.css). The effect always falls back to
// visible when the browser lacks the observer, and prefers-reduced-motion is
// respected in CSS, so this never breaks readability or accessibility.
"use client";

import React from "react";

export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}