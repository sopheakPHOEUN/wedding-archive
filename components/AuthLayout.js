// AuthLayout.js - Layout wrapper for authentication pages
"use client";

import React from "react";
import collection from "../collection.config.js";

export default function AuthLayout({ title, children }) {
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#14181F",
      color: "#E8EDF2",
      padding: "24px",
    },
    wrapper: {
      maxWidth: 400,
      width: "100%",
    },
    header: {
      textAlign: "center",
      marginBottom: 40,
    },
    kicker: {
      fontFamily: "'Courier New', monospace",
      color: "#2EE6A8",
      fontSize: 14,
      letterSpacing: 1,
      margin: 0,
    },
    title: {
      fontSize: 32,
      fontWeight: 700,
      margin: "16px 0 12px",
      lineHeight: 1.1,
    },
    subtitle: {
      fontSize: 16,
      color: "#97A1B3",
      lineHeight: 1.5,
      margin: 0,
    },
    card: {
      padding: 32,
      backgroundColor: "#1C222C",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#2E3644",
      borderRadius: 10,
    },
    archiveInfo: {
      marginTop: 32,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopStyle: "solid",
      borderTopColor: "#2E3644",
      fontSize: 13,
      color: "#5A6373",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
          <h1 style={styles.title}>{collection.name}</h1>
          <p style={styles.subtitle}>{title}</p>
        </header>
        
        <div style={styles.card}>
          {children}
        </div>
        
        <footer style={styles.archiveInfo}>
          <p>
            Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall 2026.
          </p>
          <p style={{ marginTop: 8 }}>
            This archive is under construction all semester. Come back in December.
          </p>
        </footer>
      </div>
    </div>
  );
}