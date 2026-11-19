// app/layout.js - The root layout for the whole site.
//
// Royal Khmer Elegance redesign: the ivory page background, dark brown body
// text, and Inter/Noto Sans Khmer font stack are set here for every page, and
// components/theme.css defines the shared design tokens (palette, type, shape)
// as CSS variables that every other stylesheet uses.
//
// The five Google fonts are loaded with plain <link> tags so the build never
// depends on reaching font servers; if they are offline the site falls back to
// Georgia/System Khmer fonts. Khmer titles use Kantumruy Pro, Khmer body copy
// falls back to Noto Sans Khmer, italic English subtitles use Cormorant
// Garamond, and Latin UI/body text keeps Inter. Noto Sans Khmer is last in each
// stack so Khmer glyphs always render while Latin text keeps its typeface.
import "./../components/theme.css";
import collection from "../collection.config.js";

export const metadata = {
  title: `${collection.name} — Khmer Living Archive`,
  description: collection.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,500;1,600&family=Inter:wght@400;500;600;700&family=Kantumruy+Pro:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          backgroundColor: "var(--ivory)",
          color: "var(--brown)",
          fontFamily: "var(--font-sans)",
          minHeight: "100vh",
        }}
      >
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
