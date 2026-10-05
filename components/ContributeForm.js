// ContributeForm.js - The archive entry form.
// /contribute uses it for new entries; the edit page reuses the same form
// pre-filled, passing initialValues/initialImage and its own onSubmit.
// Validation and the save calls live in lib/contribute.js and lib/entries.js.
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../lib/supabase-browser.js";
import { submitEntry } from "../lib/contribute.js";
import FormField from "./FormField.js";
import "./contribute.css";

const TEXT_FIELDS = [
  {
    key: "title_khmer",
    label: "Khmer title",
    khmer: true,
    placeholder: "ពិធីសែនក្រុងពាលី",
  },
  {
    key: "title_english",
    label: "English title",
    placeholder: "Krong Pali Ceremony",
  },
  {
    key: "description",
    label: "Description",
    textarea: true,
    placeholder: "What happens in this ritual, and why does it matter?",
  },
  { key: "contributor", label: "Contributor", placeholder: "Grandma Srey Nang" },
  {
    key: "place",
    label: "Place",
    placeholder: "Kompong Cham Province, Cambodia",
  },
];

export default function ContributeForm({
  initialValues = {},
  initialImage = "",
  onSubmit,
  submitLabel = "Submit Entry",
  submittingLabel = "Uploading and saving…",
  optionalPhoto = false,
}) {
  const router = useRouter();
  const currentImage = initialValues.image_url || initialImage || "";
  const [values, setValues] = React.useState({
    title_khmer: initialValues.title_khmer || "",
    title_english: initialValues.title_english || "",
    description: initialValues.description || "",
    contributor: initialValues.contributor || "",
    place: initialValues.place || "",
    image_url: currentImage,
  });
  const [imageFile, setImageFile] = React.useState(null);
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [generalError, setGeneralError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const update = (key) => (event) => {
    setValues((previous) => ({ ...previous, [key]: event.target.value }));
    if (fieldErrors[key]) {
      setFieldErrors((previous) => ({ ...previous, [key]: "" }));
    }
    setGeneralError("");
  };

  const updateImageFile = (event) => {
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    setImageFile(file);
    if (fieldErrors.image) {
      setFieldErrors((previous) => ({ ...previous, image: "" }));
    }
    setGeneralError("");
  };

  // The default save action matches /contribute's behavior exactly: validate,
  // upload the photo if one was chosen, and insert a new row owned by the
  // session user.
  const defaultSubmit = async ({ values, imageFile }) => {
    const supabase = createBrowserSupabaseClient();
    return submitEntry({ supabase, values, imageFile });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setGeneralError("");
    try {
      const doSubmit = onSubmit || defaultSubmit;
      const result = await doSubmit({ values, imageFile });
      if (result.ok) {
        // The edit page returns a redirectTo so the user lands back on the
        // entry; new entries go home, where the newest one is listed first.
        router.push(result.redirectTo || "/");
        return;
      }
      setFieldErrors(result.fieldErrors || {});
      if (result.message) setGeneralError(result.message);
    } catch (error) {
      console.error("Entry form error:", error);
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const error = (key) => fieldErrors[key] || "";

  return (
    <form onSubmit={handleSubmit} noValidate>
      {generalError ? (
        <p className="form-error-banner" role="alert">
          {generalError}
        </p>
      ) : null}

      {TEXT_FIELDS.map(({ key, label, placeholder, textarea, khmer }) => (
        <FormField key={key} id={key} label={label} error={error(key)}>
          {textarea ? (
            <textarea
              id={key}
              className="form-textarea"
              rows={6}
              placeholder={placeholder}
              value={values[key]}
              onChange={update(key)}
              disabled={submitting}
            />
          ) : (
            <input
              id={key}
              className={khmer ? "form-input form-input-khmer" : "form-input"}
              type="text"
              placeholder={placeholder}
              value={values[key]}
              onChange={update(key)}
              disabled={submitting}
            />
          )}
        </FormField>
      ))}

      <FormField
        id="image_file"
        label="Photo"
        hint="Pick one: upload a photo from your device, or paste a full http(s) link to a photo. Uploaded photos are stored in our photos bucket."
        error={error("image")}
      >
        {currentImage && !imageFile ? (
          <img
            src={currentImage}
            alt="Current photo"
            className="form-current-photo"
          />
        ) : null}
        {optionalPhoto ? (
          <p className="form-hint">
            Leave the photo as-is to keep the current one.
          </p>
        ) : null}
        <input
          id="image_file"
          className="form-file"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={updateImageFile}
          disabled={submitting}
        />
        <p className="form-hint">or</p>
        <input
          id="image_url"
          className="form-input"
          type="text"
          inputMode="url"
          placeholder="https://example.com/photo.jpg"
          value={values.image_url}
          onChange={update("image_url")}
          disabled={submitting}
        />
      </FormField>

      <button type="submit" className="form-submit" disabled={submitting}>
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}