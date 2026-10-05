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