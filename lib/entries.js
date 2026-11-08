// lib/entries.js
// Update and delete helpers for the entry detail and edit pages.
//
// Both helpers follow the same rule from the task brief: after the write,
// call .select() and only claim success when a row actually came back. If
// none does, the change did not land, so we tell the user "That change
// wasn't saved" and log the details with console.error.
//
// Ownership is enforced twice: by the Supabase RLS policies, and again here
// by restricting update/delete to rows whose owner is the session user.

import {
  validateEntryFields,
  validateImageFile,
  validateImageUrl,
  imageUrlLoads,
  uploadPhoto,
} from "./contribute.js";

// Update the text fields of an entry. The photo is optional: when the user
// picked a new file the photo is re-uploaded, when they pasted a different
// link the link is validated and stored, and when neither happened the old
// image is kept untouched.
export async function updateEntry({ supabase, id, values, imageFile, originalImage }) {
  const original = typeof originalImage === "string" ? originalImage : "";
  const { values: clean, errors } = validateEntryFields(values);
  if (Object.keys(errors).length > 0) {
    return { ok: false, fieldErrors: errors };
  }

  // The owner comes from the session, never from the form.
  let user = null;
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    user = sessionData?.user;
  } catch (error) {
    console.error("Edit session check error:", error);
  }
  if (!user) {
    return {
      ok: false,
      message: "Your session ended. Please log in and try again.",
    };
  }

  // A normal contributor's edit must go back into the review queue, so the
  // status is reset to 'pending'. Reviewers (confirmed via the is_reviewer
  // RPC) may save without touching status. If the RPC errors we cannot prove
  // reviewer status, so the edit defaults to requiring review.
  let isReviewer = false;
  try {
    const { data, error } = await supabase.rpc("is_reviewer");
    if (error) {
      console.error("is_reviewer RPC error:", error);
    } else {
      isReviewer = data === true;
    }
  } catch (error) {
    console.error("is_reviewer RPC error:", error);
  }

  // Read the entry's current status before any upload or write runs. A
  // returned entry must always go back to 'pending', even when the author
  // happens to be a reviewer (the is_reviewer branch below would otherwise
  // leave it 'returned' and it would never land back in the review queue). If
  // the status cannot be verified, the save stops — continuing could write a
  // returned entry without the status change. Ownership is scoped the same way
  // the update itself is, so this can only read the contributor's own row.
  let currentStatus = "";
  try {
    const { data: statusRow, error: statusError } = await supabase
      .from("entries")
      .select("status")
      .eq("id", id)
      .eq("owner", user.id)
      .maybeSingle();
    if (statusError) throw statusError;
    if (!statusRow) {
      console.error("updateEntry: status lookup returned no owned row", {
        id,
        owner: user.id,
      });
      return { ok: false, message: "That change wasn't saved" };
    }
    currentStatus = statusRow.status;
  } catch (error) {
    console.error("Edit status read error:", error);
    return { ok: false, message: "That change wasn't saved" };
  }

  const hasFile = imageFile instanceof File;
  const newUrl = clean.image_url;
  const urlChanged = newUrl.length > 0 && newUrl !== original;

  let imageValue = original;
  let uploadedPath = null;

  if (hasFile) {
    const check = await validateImageFile(imageFile);
    if (!check.ok) {
      return { ok: false, fieldErrors: { image: check.message } };
    }
    try {
      const upload = await uploadPhoto(supabase, user.id, imageFile, check.extension);
      uploadedPath = upload.path;
      imageValue = upload.publicUrl;
    } catch (error) {
      console.error("Edit photo upload error:", error);
      return {
        ok: false,
        message:
          "We couldn't upload your photo. Make sure it is a JPG, PNG, GIF, or WebP under 5 MB, then try again.",
      };
    }
  } else if (urlChanged) {
    const check = validateImageUrl(newUrl);
    if (!check.ok) {
      return { ok: false, fieldErrors: { image: check.message } };
    }
    if (!(await imageUrlLoads(check.url))) {
      return {
        ok: false,
        fieldErrors: {
          image: "That link could not be loaded as an image. Check the URL and try again.",
        },
      };
    }
    imageValue = check.url;
  }

  // Same columns as the contribute insert; the owner column never changes.
  const payload = {
    title_khmer: clean.title_khmer,
    title_english: clean.title_english,
    description: clean.description,
    contributor: clean.contributor,
    place: clean.place,
    image: imageValue,
  };

  // Non-reviewers' edits need a fresh review before they are public again.
  // Reviewers keep whatever status the entry already has — except a returned
  // entry always goes back to 'pending' so it re-enters the review queue.
  if (currentStatus === "returned" || !isReviewer) {
    payload.status = "pending";
  }

  try {
    const { data, error } = await supabase
      .from("entries")
      .update(payload)
      .eq("id", id)
      .eq("owner", user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      console.error("updateEntry: .select() returned no row after update", {
        id,
        owner: user.id,
      });
      return { ok: false, message: "That change wasn't saved" };
    }
    return { ok: true, entry: data[0] };
  } catch (error) {
    console.error("Edit entry update error:", error);
    // Don't leave an orphaned photo in the bucket if the save failed.
    if (uploadedPath) {
      try {
        await supabase.storage.from("photos").remove([uploadedPath]);
      } catch (cleanupError) {
        console.error("Edit photo cleanup error:", cleanupError);
      }
    }
    return { ok: false, message: "That change wasn't saved" };
  }
}

// Delete one entry. Restricted to the owner's rows, so a no-row result from
// .select() means the delete did not happen.
export async function deleteEntry({ supabase, id }) {
  let user = null;
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    user = sessionData?.user;
  } catch (error) {
    console.error("Delete session check error:", error);
  }
  if (!user) {
    return {
      ok: false,
      message: "Your session ended. Please log in and try again.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("entries")
      .delete()
      .eq("id", id)
      .eq("owner", user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      console.error("deleteEntry: .select() returned no row after delete", {
        id,
        owner: user.id,
      });
      return { ok: false, message: "That change wasn't saved" };
    }
    return { ok: true };
  } catch (error) {
    console.error("Delete entry delete error:", error);
    return { ok: false, message: "That change wasn't saved" };
  }
}