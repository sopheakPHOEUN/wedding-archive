// app/review/page.js - The reviewer's queue of pending entries, at /review.
//
// Authorization is decided on the server before anything renders:
//   1. The session is read from the request cookies through the server
//      Supabase client, then supabase.rpc("is_reviewer") runs server-side. If
//      there is no user, the RPC errors, or it does not return exactly true,
//      this page renders only a bilingual "Access Denied" card — no entries
//      and no admin links are ever shown to a non-reviewer.
//   2. Authorized reviewers only get the pending rows fetched, ordered by
//      submission date (created_at) oldest first. The query runs inside the
//      request so RLS applies to the reviewer's own cookie.
//
// The queue itself (the Publish / Return buttons) lives in
// components/ReviewQueue.js, a client component that calls the review_entry RPC
// and only removes an entry from the list after the RPC came back error-free
// with exactly true.
import { createClient } from "../../lib/supabase.js";
import { cookies } from "next/headers";
import { resolveLang, translate } from "../../lib/i18n.js";
import Footer from "../../components/Footer.js";
import SessionHeader from "../../components/SessionHeader.js";
import ReviewQueue from "../../components/ReviewQueue.js";
import "../../components/contribute.css";
import "../../components/review.css";
import "../../components/archive.css";

// The page must re-render for each request: authorization depends on the
// visitor's cookie, so it must never be prerendered into static HTML.
export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const lang = resolveLang((await cookies()).get("kla-lang")?.value);
  const t = (key, vars) => translate(lang, key, vars);
  const supabase = await createClient();

  let isReviewer = false;
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user || null;
    if (user) {
      const { data, error } = await supabase.rpc("is_reviewer");
      if (error) {
        console.error("is_reviewer RPC error:", error);
      } else {
        isReviewer = data === true;
      }
    }
  } catch (error) {
    console.error("Error checking review access:", error);
  }

  // Non-reviewers see only the Access Denied message in the active language.
  if (!isReviewer) {
    return (
      <>
        <SessionHeader />
        <main id="main" className="contribute-wrap">
          <div className="contribute-card">
            <p className="contribute-gate-text">{t("review.accessDenied")}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Authorized reviewers only. Oldest submissions wait the longest, so the
  // queue lists them first. The reviewer never needs the contributor's name or
  // ID, so those columns are not even requested.
  let entries = [];
  let loadError = "";
  try {
    const { data, error } = await supabase
      .from("entries")
      .select(
        "id, title_khmer, title_english, description, description_khmer, image, place, place_khmer, wedding_day, screen_order, created_at"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (error) throw error;
    entries = data || [];
  } catch (error) {
    console.error("Error fetching pending entries:", error);
    loadError = t("review.loadError");
  }

  return (
    <>
      <SessionHeader />
      <main id="main" className="contribute-wrap">
        <p className="contribute-kicker">{t("common.kicker")}</p>
        <h1 className="contribute-title">{t("review.title")}</h1>
        <p className="contribute-subtitle">
          {t("review.subtitle")}
        </p>
        <div className="contribute-head-rule" aria-hidden="true" />

        <ReviewQueue entries={entries} loadError={loadError} />

        <a className="contribute-home-link" href="/">
          {t("common.backToArchive")}
        </a>
      </main>
      <Footer />
    </>
  );
}