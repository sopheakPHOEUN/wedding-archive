// app/signup/page.js - Sign-up page
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../lib/supabase-browser.js";
import AuthLayout from "../../components/AuthLayout.js";
import AuthForm from "../../components/AuthForm.js";

export default function SignupPage() {
  const router = useRouter();
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
        // For security, show only a generic error message
        setError("Invalid email or password");
        console.error("Signup error:", error.message);
      } else {
        // Signup successful - redirect to home page
        router.push("/");
      }
    } catch (err) {
      setError("Invalid email or password");
      console.error("Signup error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthLayout title="Create an account to contribute">
      <AuthForm
        type="signup"
        onSubmit={handleSignup}
        error={error}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}