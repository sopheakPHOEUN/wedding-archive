// app/entries/[id]/edit/page.js - Edit one of your own entries.
// Uses the same form as /contribute (components/ContributeForm.js),
// pre-filled with the entry's current values and the same validation rules.
// Saving goes through lib/entries.js -> supabase-js. The photo is optional:
// no new photo means the old one is kept.
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { createBrowserSupabaseClient } from "../../../../lib/supabase-browser.js";
import { updateEntry } from "../../../../lib/entries.js";
import ContributeForm from "../../../../components/ContributeForm.js";
import "../../../../components/contribute.css";

export default function EditEntryPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [entry, setEntry] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    async function loadUser() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!cancelled) setUser(data?.user || null);
      } catch (error) {
        console.error("Error getting user:", error);
        if (!cancelled) setUser(null);
      }
    }

    async function loadEntry() {
      try {
        const { data, error } = await supabase
          .from("entries")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (!cancelled && !error) setEntry(data);
      } catch (error) {
        console.error("Error fetching entry:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) {
      loadUser();
      loadEntry();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  // updateEntry does the validation, the optional photo change, and the
  // update. On success we tell the shared form where to go afterwards.
  const handleUpdate = async ({ values, imageFile }) => {
    const supabase = createBrowserSupabaseClient();
    const result = await updateEntry({
      supabase,
      id,
      values,
      imageFile,
      originalImage: entry?.image || "",
    });
    if (result.ok) {
      return { ok: true, redirectTo: `/entries/${id}` };
    }
    return result;
  };

  const isOwner = Boolean(user && entry && entry.owner === user.id);

  return (
    <main className="contribute-wrap">
      <p className="contribute-kicker">KHMER LIVING ARCHIVE</p>
      <h1 className="contribute-title">Edit Entry</h1>
      <p className="contribute-subtitle">
        Fix what needs fixing, then save your changes.
      </p>

      {loading ? (
        <p className="contribute-status">Loading entry…</p>
      ) : !entry ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            We couldn't find that entry. It may have been deleted.
          </p>
        </div>
      ) : !user ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            Editing works only for the person who contributed the entry. Log
            in or create an account, then come back here to make changes.
          </p>
          <div className="contribute-gate-links">
            <a className="contribute-gate-link" href="/login">
              Log In
            </a>
            <a className="contribute-gate-link" href="/signup">
              Sign Up
            </a>
          </div>
        </div>
      ) : !isOwner ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            You can only edit your own entries.
          </p>
        </div>
      ) : (
        <div className="contribute-card">
          <ContributeForm
            initialValues={{
              title_khmer: entry.title_khmer || "",
              title_english: entry.title_english || "",
              description: entry.description || "",
              contributor: entry.contributor || "",
              place: entry.place || "",
            }}
            initialImage={entry.image || ""}
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
            submittingLabel="Saving…"
            optionalPhoto
          />
        </div>
      )}

      <a className="contribute-home-link" href={entry ? `/entries/${id}` : "/"}>
        ← Back to {entry ? "this entry" : "the archive"}
      </a>
    </main>
  );
}