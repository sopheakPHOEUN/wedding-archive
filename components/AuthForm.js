// AuthForm.js - Reusable login/sign-up form.
// Class-based styling from components/auth.css, so the small focus/hover
// states stay consistent with the rest of the archive's forms.
"use client";

import React from "react";
import "./auth.css";

export default function AuthForm({ type, onSubmit, error, isLoading }) {
  const isSignup = type === "signup";
  const buttonText = isSignup ? "Sign Up" : "Log In";
  const linkText = isSignup
    ? "Already have an account? Log in"
    : "Don't have an account? Sign up";
  const linkHref = isSignup ? "/login" : "/signup";

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    onSubmit(email, password);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error ? (
        <div className="auth-error" role="alert">
          {error}
        </div>
      ) : null}

      <div>
        <input
          className="auth-input"
          type="email"
          name="email"
          placeholder="Email"
          aria-label="Email address"
          autoComplete={isSignup ? "email" : "username"}
          autoCapitalize="none"
          spellCheck="false"
          inputMode="email"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Password"
          aria-label="Password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={6}
          required
          disabled={isLoading}
        />
      </div>

      <button type="submit" className="auth-button" disabled={isLoading}>
        {isLoading ? "Loading…" : buttonText}
      </button>

      <p className="auth-switch">
        <a href={linkHref}>{linkText}</a>
      </p>
    </form>
  );
}