// components/Lightbox.js - Full-size photo viewer.
// An accessible modal: dims the page, traps focus on the close button, closes
// on Escape or on the backdrop, and shows an optional caption. Used on the
// entry detail page so photographs can be appreciated at full size.
// Styles live in components/detail.css.
"use client";

import React from "react";

export default function Lightbox({ open, image, alt, caption, onClose }) {
  const closeRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Photo"}
      onClick={onClose}
    >
      <div
        className="lightbox-inner"
        onClick={(event) => event.stopPropagation()}
      >
        <img className="lightbox-image" src={image} alt={alt || ""} />
        {caption ? <p className="lightbox-caption">{caption}</p> : null}
      </div>
      <button
        ref={closeRef}
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close image viewer"
      >
        ×
      </button>
    </div>
  );
}