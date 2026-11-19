// app/entries/[id]/page.js - One full archive entry.
// Presented as a museum plate: the photo (or an engraved placeholder) in a
// gilded frame beside the bilingual title and the description. Edit and Delete
// appear only when the logged-in user is the entry's owner. Delete asks for
// confirmation first, then runs through lib/entries.js.
// Styles live in components/detail.css.
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../components/Header.js";
import Footer from "../../../components/Footer.js";
import Ornament from "../../../components/Ornament.js";
import Lightbox from "../../../components/Lightbox.js";
import { createBrowserSupabaseClient } from "../../../lib/supabase-browser.js";
import { deleteEntry } from "../../../lib/entries.js";
import "../../../components/detail.css";

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [entry, setEntry] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [viewImage, setViewImage] = React.useState(false);
  // If the visitor arrived from a search, guide them back to it.
  const [backInfo, setBackInfo] = React.useState({
    href: "/",
    label: "Back to the archive",
  });

  React.useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem("kla-search");
      if (saved) {
        setBackInfo({
          href: `/?q=${encodeURIComponent(saved)}#collection`,
          label: "Back to results",
        });
      }
    } catch (error) {
      /* sessionStorage is best-effort */
    }
  }, []);

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

  const handleLogout = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isOwner = Boolean(user && entry && entry.owner === user.id);
  const hasImage =
    typeof entry?.image === "string" && entry.image.trim().length > 0;

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
    <>
      <Header loading={loading} user={user} onLogout={handleLogout} />
      <main id="main" className="detail-wrap">
        <div className="detail-back-bar">
          <a className="detail-back" href={backInfo.href}>
            ← {backInfo.label}
          </a>
        </div>
        <p className="detail-kicker">KHMER LIVING ARCHIVE</p>

        {loading ? (
          <p className="detail-status">Loading entry…</p>
        ) : !entry ? (
          <div className="detail-card">
            <p
              className="detail-description"
              style={{
                gridColumn: "1 / -1",
                color: "var(--brown-soft)",
              }}
            >
              We couldn't find that entry. It may have been deleted.
            </p>
          </div>
        ) : (
          <>
            <h1 className="detail-title">
              {entry.title_khmer || entry.titleKhmer || ""}
            </h1>
            <p className="detail-title-english">
              {entry.title_english || entry.titleEnglish || ""}
            </p>
            <div className="detail-rule" aria-hidden="true" />

            <div className="detail-card">
              <div className="detail-figure">
                {hasImage ? (
                  <button
                    type="button"
                    className="detail-image-btn"
                    onClick={() => setViewImage(true)}
                    aria-label={`View photo full size`}
                  >
                    <img
                      className="detail-image"
                      src={entry.image}
                      alt={
                        entry.title_english ||
                        entry.title_khmer ||
                        "Entry photo"
                      }
                    />
                    <span className="detail-zoom">View full size</span>
                  </button>
                ) : (
                  <div className="detail-placeholder" aria-hidden="true">
                    ◆
                  </div>
                )}
              </div>

              <div>
                <p className="detail-description">{entry.description || ""}</p>
                <Ornament />
                <dl className="detail-meta">
                  <div className="detail-meta-row">
                    <dt>Contributor</dt>
                    <dd>{entry.contributor || "Not provided"}</dd>
                  </div>
                  <div className="detail-meta-row">
                    <dt>Place</dt>
                    <dd>{entry.place || "Not provided"}</dd>
                  </div>
                </dl>

                {isOwner ? (
                  <div className="detail-actions">
                    <a className="detail-edit" href={`/entries/${id}/edit`}>
                      Edit entry
                    </a>
                    <button
                      type="button"
                      className="detail-delete"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                    <p className="detail-owner-note">
                      You contributed this entry. Edits send it back to the
                      review queue.
                    </p>
                  </div>
                ) : null}

                {message ? (
                  <p className="detail-message" role="alert">
                    {message}
                  </p>
                ) : null}
              </div>
            </div>
          </>
        )}

        <a className="detail-back detail-back-bottom" href={backInfo.href}>
          ← {backInfo.label}
        </a>
      </main>

      {hasImage ? (
        <Lightbox
          open={viewImage}
          image={entry.image}
          alt={entry.title_english || entry.title_khmer || "Entry photo"}
          caption={
            entry.title_khmer
              ? `${entry.title_khmer} — ${entry.title_english || ""}`
              : entry.title_english || ""
          }
          onClose={() => setViewImage(false)}
        />
      ) : null}

      <Footer />
    </>
  );
}
