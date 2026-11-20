// app/entries/[id]/edit/page.js - Edit one of your own entries.
// Uses the same form as /contribute (components/ContributeForm.js),
// pre-filled with the entry's current values and the same validation rules.
// Saving goes through lib/entries.js -> supabase-js. The photo is optional:
// no new photo means the old one is kept. Only the owner may use this page,
// and only while the entry is waiting for review or was returned to them;
// published entries are not editable here (only the review_entry RPC moves
// an entry out of published). updateEntry also enforces ownership and sends
// the entry back to 'pending' so it is reviewed again.
"use client";

import React from "react";
import { useParams } from "next/navigation";
import Header from "../../../../components/Header.js";
import Footer from "../../../../components/Footer.js";
import { createBrowserSupabaseClient } from "../../../../lib/supabase-browser.js";
import { updateEntry } from "../../../../lib/entries.js";
import ContributeForm from "../../../../components/ContributeForm.js";
import { useLanguage } from "../../../../components/LanguageProvider.js";
import "../../../../components/contribute.css";

export default function EditEntryPage() {
  const params = useParams();
  const { t } = useLanguage();
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
  // Contributors may edit an entry while it waits for review or after the
  // reviewer returned it. Published entries are not editable here; only the
  // review_entry RPC changes a published entry.
  const canEdit =
    isOwner &&
    entry &&
    (entry.status === "pending" || entry.status === "returned");

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
    <>
      <Header loading={loading} user={user} onLogout={handleLogout} />
      <main id="main" className="contribute-wrap">
        <p className="contribute-kicker">{t("common.kicker")}</p>
        <h1 className="contribute-title">{t("edit.title")}</h1>
        <p className="contribute-subtitle">
          {t("edit.subtitle")}
        </p>
        <div className="contribute-head-rule" aria-hidden="true" />

      {loading ? (
        <p className="contribute-status">{t("entry.loading")}</p>
      ) : !entry ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            {t("entry.notFound")}
          </p>
        </div>
      ) : !user ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            {t("edit.gateText")}
          </p>
          <div className="contribute-gate-links">
            <a className="contribute-gate-link" href="/login">
              {t("nav.login")}
            </a>
            <a className="contribute-gate-link" href="/signup">
              {t("nav.signup")}
            </a>
          </div>
        </div>
      ) : !isOwner ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            {t("edit.notOwner")}
          </p>
        </div>
      ) : !canEdit ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            {t("edit.published")}
          </p>
        </div>
      ) : (
        <div className="contribute-card">
          <ContributeForm
            initialValues={{
              title_khmer: entry.title_khmer || "",
              title_english: entry.title_english || "",
              description: entry.description || "",
              description_khmer: entry.description_khmer || "",
              contributor: entry.contributor || "",
              contributor_khmer: entry.contributor_khmer || "",
              place: entry.place || "",
              place_khmer: entry.place_khmer || "",
            }}
            initialImage={entry.image || ""}
            onSubmit={handleUpdate}
            submitLabel={t("form.saveChanges")}
            submittingLabel={t("form.saving")}
            optionalPhoto
          />
        </div>
      )}

        <a className="contribute-home-link" href={entry ? `/entries/${id}` : "/"}>
          {entry ? t("edit.backToEntry") : t("common.backToArchive")}
        </a>
      </main>
      <Footer />
    </>
  );
}