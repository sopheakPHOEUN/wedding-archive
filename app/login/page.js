// app/login/page.js - Login page
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../lib/supabase-browser.js";
import AuthLayout from "../../components/AuthLayout.js";
import AuthForm from "../../components/AuthForm.js";
import { useLanguage } from "../../components/LanguageProvider.js";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError("");
    
    try {
      const supabase = createBrowserSupabaseClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // For security, show only a generic error message
        setError(t("auth.invalid"));
        //console.error("Login error:", error.message);
      } else {
        // Login successful - redirect to home page
        router.push("/");
      }
    } catch (err) {
      setError(t("auth.invalid"));
      console.error("Login error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthLayout title={t("auth.loginTitle")} brandImage="/hero.jpg">
      <AuthForm
        type="login"
        onSubmit={handleLogin}
        error={error}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}