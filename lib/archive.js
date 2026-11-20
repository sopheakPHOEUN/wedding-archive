// lib/archive.js
// The archive's own description, now bilingual — English and Khmer.
//
// The values live in the Supabase `archive` table (single row, id = 1) so they
// can be edited from the dashboard without a deploy. If the row (or the table)
// is missing, this falls back to collection.config.js, which is still the
// canonical identity of the archive, so the site never breaks.
import { createBrowserSupabaseClient } from "./supabase-browser.js";
import collection from "../collection.config.js";

export function fallbackArchiveDescription() {
  return {
    description: collection.description,
    description_khmer: collection.descriptionKhmer || collection.description,
  };
}

// True when Supabase answers "that table/column does not exist". This is an
// expected state for a brand-new project (the SQL in supabase/archive-khmer.sql
// has not been run yet) and the fallback below handles it, so it is not an
// error worth logging.
function isMissingTableError(error) {
  const code = (error && (error.code || error.error)) || "";
  const message = (error && error.message) || "";
  return (
    code.startsWith("42P01") ||
    code === "PGRST205" ||
    /does not exist|could not find the table/i.test(message)
  );
}

// Fetch the archive description from Supabase. On any failure (network, missing
// table, missing row) it returns the config fallback so the page always renders.
export async function fetchArchiveDescription() {
  try {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from("archive")
      .select("description, description_khmer")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data && (data.description || data.description_khmer)) {
      return {
        description: data.description || collection.description,
        description_khmer:
          data.description_khmer ||
          collection.descriptionKhmer ||
          collection.description,
      };
    }
  } catch (error) {
    // A missing archive table is the designed fallback path, so keep it quiet.
    // Anything else (network, auth, bad schema) is still logged so real
    // problems stay visible while the page keeps rendering from the config.
    if (!isMissingTableError(error)) {
      console.error("Error fetching archive description:", error);
    }
  }
  return fallbackArchiveDescription();
}