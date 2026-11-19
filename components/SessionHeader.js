// components/SessionHeader.js - Header that resolves its own auth.
// Used on server-rendered pages (like /review) that already vet access
// server-side but still need the shared navigational header. It reads the
// browser session and the is_reviewer RPC the same way app/page.js does, so
// the Review link and account menu appear exactly as on the home page. Fail-
// closed: if the session or RPC can't be read, the header just hides auth.
"use client";

import React from "react";
import Header from "./Header.js";
import { createBrowserSupabaseClient } from "../lib/supabase-browser.js";

export default function SessionHeader() {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [isReviewer, setIsReviewer] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function resolveSession() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getUser();
        const sessionUser = data?.user || null;
        if (cancelled) return;
        setUser(sessionUser);
        if (sessionUser) {
          const { data: reviewerData, error } = await supabase.rpc("is_reviewer");
          if (!error && reviewerData === true) setIsReviewer(true);
        }
      } catch (error) {
        console.error("Error resolving session in header:", error);
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    resolveSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Header
      loading={loading}
      user={user}
      isReviewer={isReviewer}
      onLogout={handleLogout}
    />
  );
}