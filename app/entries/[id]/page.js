// app/entries/[id]/page.js - One full archive entry.
// Edit and Delete appear only when the logged-in user is the entry's owner.
// Delete asks for confirmation first, then runs through lib/entries.js.
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../../lib/supabase-browser.js";
import { deleteEntry } from "../../../lib/entries.js";

const styles = {
  wrap: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "80px 24px",
  },
  kicker: {
    fontFamily: "'Courier New', monospace",
    color: "#2EE6A8",
    fontSize: 14,
    letterSpacing: 1,
    margin: 0,
  },
  title: {
    fontFamily:
      "'Noto Sans Khmer', 'Khmer OS Battambang', 'Khmer UI', Arial, sans-serif",
    fontSize: 40,
    lineHeight: 1.4,
    margin: "16px 0 4px",
    color: "#E8EDF2",
  },
  titleEnglish: {
    fontSize: 22,
    color: "#97A1B3",
    fontWeight: 600,
    margin: "0 0 8px",
  },
  card: {
    marginTop: 24,
    padding: 24,
    backgroundColor: "#1C222C",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#2E3644",
    borderRadius: 10,
  },
  image: {
    display: "block",
    maxWidth: "100%",
    maxHeight: 420,
    objectFit: "contain",
    borderRadius: 8,
    margin: "0 auto 20px",
  },
  description: {
    fontFamily:
      "'Noto Sans Khmer', 'Khmer OS Battambang', 'Khmer UI', Arial, sans-serif",
    fontSize: 17,
    lineHeight: 1.8,
    color: "#E8EDF2",
    margin: 0,
  },
  meta: {
    fontFamily: "'Courier New', monospace",
    fontSize: 13,
    lineHeight: 1.7,
    color: "#97A1B3",
    margin: "20px 0 0",
  },
  actions: {
    display: "flex",
    gap: 12,
    marginTop: 24,
  },
  editLink: {
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    color: "#1C222C",
    backgroundColor: "#2EE6A8",
    border: "none",
    borderRadius: 6,
    textDecoration: "none",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    color: "#FF4B4B",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#FF4B4B",
    borderRadius: 6,
    cursor: "pointer",
  },
  deleteButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  message: {
    marginTop: 16,
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
  status: {
    marginTop: 32,
    color: "#97A1B3",
    textAlign: "center",
  },
  backLink: {
    display: "inline-block",
    marginTop: 24,
    fontSize: 14,
    color: "#2EE6A8",
    textDecoration: "none",
  },
};

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [entry, setEntry] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

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

  const isOwner = Boolean(user && entry && entry.owner === user.id);

  const handleDelete = async () => {
    if (deleting) return;
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(true);
    setMessage("");
    try {
      const supabase = createBrowserSupabaseClient();
      const result = await deleteEntry({ supabase, id });
      if (result.ok) {
        router.push("/");
        return;
      }
      setMessage(result.message || "That change wasn't saved");
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("That change wasn't saved");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main style={styles.wrap}>
      <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>

      {loading ? (
        <p style={styles.status}>Loading entry…</p>
      ) : !entry ? (
        <div style={styles.card}>
          <p style={styles.description}>
            We couldn't find that entry. It may have been deleted.
          </p>
        </div>
      ) : (
        <>
          <h1 style={styles.title}>{entry.title_khmer || entry.titleKhmer || ""}</h1>
          <p style={styles.titleEnglish}>
            {entry.title_english || entry.titleEnglish || ""}
          </p>

          <div style={styles.card}>
            {entry.image ? (
              <img
                src={entry.image}
                alt={entry.title_english || entry.title_khmer || "Entry photo"}
                style={styles.image}
              />
            ) : null}
            <p style={styles.description}>{entry.description || ""}</p>
            <p style={styles.meta}>
              CONTRIBUTED BY {(entry.contributor || "").toUpperCase()} —{" "}
              {entry.place || ""}
            </p>
          </div>

          {isOwner ? (
            <div style={styles.actions}>
              <a href={`/entries/${id}/edit`} style={styles.editLink}>
                Edit
              </a>
              <button
                type="button"
                style={{
                  ...styles.deleteButton,
                  ...(deleting ? styles.deleteButtonDisabled : {}),
                }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          ) : null}

          {message ? (
            <p style={styles.message} role="alert">
              {message}
            </p>
          ) : null}
        </>
      )}

      <a href="/" style={styles.backLink}>
        ← Back to the archive
      </a>
    </main>
  );
}