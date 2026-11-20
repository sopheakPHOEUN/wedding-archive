// app/signup/page.js - Sign-up page
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../lib/supabase-browser.js";
import AuthLayout from "../../components/AuthLayout.js";
import AuthForm from "../../components/AuthForm.js";
import { useLanguage } from "../../components/LanguageProvider.js";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleSignup = async (email, password) => {
    setIsLoading(true);
    setError("");
    
    try {
      const supabase = createBrowserSupabaseClient();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        // Show user-friendly message for password policy errors, generic for others
        if (error.message.includes("Password should contain at least one character of each")) {
          setError(t("auth.passwordPolicy"));
        } else {
          setError(t("auth.invalid"));
        }
      } else {
        // Signup successful - redirect to home page
        router.push("/");
      }
    } catch (err) {
      setError(t("auth.invalid"));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthLayout title={t("auth.signupTitle")}>
      <AuthForm
        type="signup"
        onSubmit={handleSignup}
        error={error}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}