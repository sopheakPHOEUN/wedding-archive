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
        // Show user-friendly message for password policy errors, generic for others
        if (error.message.includes("Password should contain at least one character of each")) {
          setError("Password must contain at least a letter and number");
        } else {
          setError("Invalid email or password");
        }
      } else {
        // Signup successful - redirect to home page
        router.push("/");
      }
    } catch (err) {
      setError("Invalid email or password");
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