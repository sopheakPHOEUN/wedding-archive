// lib/contribute.js
// Validation, photo upload, and insert helpers for the /contribute form.
//
// The photo upload follows the OWASP File Upload Cheat Sheet as far as a
// client-side form can:
//   - an allowlist of image extensions (never executables, HTML, or SVG)
//   - a content check via magic bytes, not just filename or claimed MIME
//   - a strict file size limit
//   - an unpredictable random storage name (never the original filename)
//   - the file lands in Supabase Storage, never on the app server
// The authoritative copy of these rules lives in the Supabase policies
// (RLS + storage), which every request runs against.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB upload limit

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

const MIME_BY_EXTENSION = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

const MAGIC_SIGNATURES = {
  jpeg: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  png: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  gif: [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }],
  webp: [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
  ],
};

const hasLetter = (text) => /\p{L}/u.test(text);

const randomUuid = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Trim every field, then apply the length rules from the task brief.
export function validateEntryFields(raw) {
  const get = (key) => (typeof raw[key] === "string" ? raw[key] : "").trim();

  const values = {
    title_khmer: get("title_khmer"),
    title_english: get("title_english"),
    description: get("description"),
    contributor: get("contributor"),
    place: get("place"),
    image_url: get("image_url"),
  };

  const errors = {};

  const checkLength = (key, label, min, max) => {
    const length = values[key].length;
    if (length < min || length > max) {
      errors[key] = `${label} must be ${min}–${max} characters.`;
    }
  };

  checkLength("title_khmer", "Khmer title", 2, 100);
  checkLength("title_english", "English title", 2, 100);
  checkLength("description", "Description", 10, 500);
  checkLength("contributor", "Contributor", 2, 100);
  checkLength("place", "Place", 2, 150);

  // Reject symbol-only or number-only strings (like "######" or "00000").
  if (!errors.title_english && !hasLetter(values.title_english)) {
    errors.title_english =
      "English title must include letters, not just symbols or numbers.";
  }
  if (!errors.description && !hasLetter(values.description)) {
    errors.description =
      "Description must include real words, not just symbols or numbers.";
  }
  if (!errors.contributor && !hasLetter(values.contributor)) {
    errors.contributor =
      "Contributor must include letters, not just numbers or symbols.";
  }
  if (!errors.place && !hasLetter(values.place)) {
    errors.place = "Place must include letters, not just numbers or symbols.";
  }

  return { values, errors };
}

// Read the first bytes of the file and compare them against known image
// signatures. This catches renamed files and spoofed extensions that the
// filename and claimed MIME type alone can't.
async function detectImageExtension(file) {
  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    for (const [extension, checks] of Object.entries(MAGIC_SIGNATURES)) {
      const matches = checks.every(({ offset, bytes: expected }) =>
        expected.every((byte, index) => bytes[offset + index] === byte)
      );
      if (matches) return extension;
    }
  } catch (error) {
    console.error("Could not inspect image contents:", error);
  }
  return null;
}

export async function validateImageFile(file) {
  const rawName = file?.name || "";
  const extension = rawName.includes(".")
    ? rawName.split(".").pop().toLowerCase()
    : "";

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { ok: false, message: "Photo must be a JPG, PNG, GIF, or WebP file." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "Photo must be smaller than 5 MB." };
  }
  if (file.type && !file.type.toLowerCase().startsWith("image/")) {
    return { ok: false, message: "That file is not an image." };
  }

  const realExtension = await detectImageExtension(file);
  if (!realExtension) {
    return {
      ok: false,
      message: "That file's contents do not look like a real image.",
    };
  }

  // The storage name uses the format of the real content, not the filename,
  // so a renamed file still lands with a truthful extension.
  return { ok: true, extension: realExtension };
}

export function validateImageUrl(raw) {
  const url = (typeof raw === "string" ? raw : "").trim();
  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    return { ok: false, url: "", message: "Image link must be a full http(s) URL." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, url: "", message: "Image link must use http or https." };
  }
  return { ok: true, url };
}

// Confirm a pasted link really loads as an image before we store it.
export function imageUrlLoads(url) {
  return new Promise((resolve) => {
    const probe = new window.Image();
    probe.onload = () => resolve(true);
    probe.onerror = () => resolve(false);
    probe.src = url;
  });
}

export async function uploadPhoto(supabase, userId, file, extension) {
  const path = `${userId}/${randomUuid()}.${extension}`;

  const { error } = await supabase.storage
    .from("photos")
    .upload(path, file, {
      contentType: MIME_BY_EXTENSION[extension],
      upsert: false,
    });
  if (error) throw error;

  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

// The one function the form calls. It owns every step — session check,
// validation, upload, insert — and maps each failure to a short, actionable
// message. The real error always goes to console.error, never to the user.
export async function submitEntry({ supabase, values, imageFile }) {
  const { values: clean, errors } = validateEntryFields(values);
  if (Object.keys(errors).length > 0) {
    return { ok: false, fieldErrors: errors };
  }

  // owner comes from the session, never from the form.
  let user = null;
  try {
    const { data: sessionData } = await supabase.auth.getUser();
    user = sessionData?.user;
  } catch (error) {
    console.error("Contribute session check error:", error);
  }
  if (!user) {
    return {
      ok: false,
      message: "Your session ended. Please log in and try again.",
    };
  }

  const hasFile = imageFile instanceof File;
  const hasUrl = clean.image_url.length > 0;

  let imageValue = "";
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
      console.error("Contribute photo upload error:", error);
      return {
        ok: false,
        message:
          "We couldn't upload your photo. Make sure it is a JPG, PNG, GIF, or WebP under 5 MB, then try again.",
      };
    }
  } else if (hasUrl) {
    const check = validateImageUrl(clean.image_url);
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
  } else {
    return {
      ok: false,
      fieldErrors: {
        image: "Add a photo: upload an image file or paste an image link.",
      },
    };
  }

  // Insert only the columns from the task brief, plus the session-derived owner.
  const payload = {
    title_khmer: clean.title_khmer,
    title_english: clean.title_english,
    description: clean.description,
    contributor: clean.contributor,
    place: clean.place,
    image: imageValue,
    owner: user.id,
  };

  try {
    const { data, error } = await supabase
      .from("entries")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return { ok: true, entry: data };
  } catch (error) {
    console.error("Contribute entry insert error:", error);
    // Don't leave an orphaned photo in the bucket if the save failed.
    if (uploadedPath) {
      try {
        await supabase.storage.from("photos").remove([uploadedPath]);
      } catch (cleanupError) {
        console.error("Contribute photo cleanup error:", cleanupError);
      }
    }
    return { ok: false, message: "We couldn't save your entry. Please try again." };
  }
}