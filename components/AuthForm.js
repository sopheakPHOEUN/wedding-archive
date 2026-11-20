// AuthForm.js - Reusable login/sign-up form.
// Class-based styling from components/auth.css, so the small focus/hover
// states stay consistent with the rest of the archive's forms.
"use client";

import React from "react";
import { useLanguage } from "./LanguageProvider.js";
import "./auth.css";

export default function AuthForm({ type, onSubmit, error, isLoading }) {
  const { t } = useLanguage();
  const isSignup = type === "signup";
  const buttonText = isSignup ? t("nav.signup") : t("nav.login");
  const linkText = isSignup ? t("auth.switchToLogin") : t("auth.switchToSignup");
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
          placeholder={t("auth.email")}
          aria-label={t("auth.emailAria")}
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
          placeholder={t("auth.password")}
          aria-label={t("auth.passwordAria")}
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={6}
          required
          disabled={isLoading}
        />
      </div>

      <button type="submit" className="auth-button" disabled={isLoading}>
        {isLoading ? t("auth.loading") : buttonText}
      </button>

      <p className="auth-switch">
        <a href={linkHref}>{linkText}</a>
      </p>
    </form>
  );
}