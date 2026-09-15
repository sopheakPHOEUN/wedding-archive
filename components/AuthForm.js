// AuthForm.js - Reusable authentication form component
"use client";

import React from "react";

export default function AuthForm({ type, onSubmit, error, isLoading }) {
  const isSignup = type === "signup";
  const title = isSignup ? "Create an Account" : "Log In";
  const buttonText = isSignup ? "Sign Up" : "Log In";
  const linkText = isSignup ? "Already have an account? Log in" : "Don't have an account? Sign up";
  const linkHref = isSignup ? "/login" : "/signup";
  
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [buttonHovered, setButtonHovered] = React.useState(false);

  const styles = {
    form: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      width: "100%",
    },
    input: {
      padding: 12,
      fontSize: 16,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#2E3644",
      borderRadius: 6,
      backgroundColor: "#1C222C",
      color: "#E8EDF2",
      outline: "none",
      width: "100%",
      transition: "border-color 0.2s",
    },
    inputFocus: {
      borderColor: "#2EE6A8",
    },
    button: {
      padding: 12,
      fontSize: 16,
      fontWeight: 600,
      backgroundColor: "#2EE6A8",
      color: "#1C222C",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    buttonDisabled: {
      backgroundColor: "#1A5C46",
      cursor: "not-allowed",
    },
    buttonHover: {
      backgroundColor: "#1CFFB0",
    },
    error: {
      padding: 12,
      backgroundColor: "rgba(255, 75, 75, 0.1)",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "rgba(255, 75, 75, 0.3)",
      borderRadius: 6,
      color: "#FF4B4B",
      fontSize: 14,
      textAlign: "center",
    },
    link: {
      color: "#2EE6A8",
      textDecoration: "none",
      fontSize: 14,
      textAlign: "center",
      display: "block",
      marginTop: 8,
    },
    linkHover: {
      textDecoration: "underline",
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    onSubmit(email, password);
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}
      
      <div>
        <input
          style={{
            ...styles.input,
            ...(emailFocused ? styles.inputFocus : {})
          }}
          type="email"
          name="email"
          placeholder="Email"
          required
          disabled={isLoading}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
      </div>
      
      <div>
        <input
          style={{
            ...styles.input,
            ...(passwordFocused ? styles.inputFocus : {})
          }}
          type="password"
          name="password"
          placeholder="Password"
          required
          minLength={6}
          disabled={isLoading}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
      </div>
      
      <button
        type="submit"
        style={{
          ...styles.button,
          ...(isLoading ? styles.buttonDisabled : {}),
          ...(!isLoading && buttonHovered ? styles.buttonHover : {})
        }}
        disabled={isLoading}
        onMouseEnter={() => !isLoading && setButtonHovered(true)}
        onMouseLeave={() => !isLoading && setButtonHovered(false)}
      >
        {isLoading ? "Loading..." : buttonText}
      </button>
      
      <a href={linkHref} style={styles.link}>
        {linkText}
      </a>
    </form>
  );
}