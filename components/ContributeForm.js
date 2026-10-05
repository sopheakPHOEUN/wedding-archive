// ContributeForm.js - The form that saves a new entry to Supabase.
// Validation, photo upload, and the insert live in lib/contribute.js.
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

export default function ContributeForm() {
  const router = useRouter();
  const [values, setValues] = React.useState({
    title_khmer: "",
    title_english: "",
    description: "",
    contributor: "",
    place: "",
    image_url: "",
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setGeneralError("");
    try {
      const supabase = createBrowserSupabaseClient();
      const result = await submitEntry({ supabase, values, imageFile });
      if (result.ok) {
        // The archive home lists the newest entry first.
        router.push("/");
        return;
      }
      setFieldErrors(result.fieldErrors || {});
      if (result.message) setGeneralError(result.message);
    } catch (error) {
      console.error("Contribute form error:", error);
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
        {submitting ? "Uploading and saving…" : "Submit Entry"}
      </button>
    </form>
  );
}