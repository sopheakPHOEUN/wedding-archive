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
import { useLanguage } from "./LanguageProvider.js";
import { WEDDING_DAY_OPTIONS } from "../lib/ceremony-order.js";
import "./contribute.css";

// The wedding-day choices shown to the contributor, each with BOTH the full
// English name and the Khmer name so listeners can see both versions at a
// glance. (The stored values stay day1 / day2 / other; the shared
// WEDDING_DAY_OPTIONS used by the review queue keeps its own shorter labels.)
const WEDDING_DAY_LABELS = {
  day1: "Day 1 — Setting Up & Blessing · ថ្ងៃទី ១ ចូលរោង និងសូត្រមន្ត",
  day2: "Day 2 — The Main Wedding Day · ថ្ងៃទី ២ ថ្ងៃសំពះផ្ទឹម",
  other: "Other / Not sure · មិនទាន់កំណត់",
};

const TEXT_FIELDS = [
  {
    key: "title_khmer",
    labelKey: "form.field.title_khmer",
    khmer: true,
    placeholder: "ពិធីសែនក្រុងពាលី",
  },
  {
    key: "title_english",
    labelKey: "form.field.title_english",
    placeholder: "Krong Pali Ceremony",
  },
  {
    key: "description",
    labelKey: "form.field.description",
    placeholderKey: "form.ph.description",
    textarea: true,
  },
  {
    key: "description_khmer",
    labelKey: "form.field.description_khmer",
    placeholderKey: "form.ph.description_khmer",
    textarea: true,
    khmer: true,
  },
  {
    key: "contributor",
    labelKey: "form.field.contributor",
    placeholder: "Ms. Sok Socheata",
  },
  {
    key: "contributor_khmer",
    labelKey: "form.field.contributor_khmer",
    khmer: true,
    placeholder: "អ្នកស្រី សុខ សុជាតា",
  },
  {
    key: "place",
    labelKey: "form.field.place",
    placeholder: "Kompong Cham Province, Cambodia",
  },
  {
    key: "place_khmer",
    labelKey: "form.field.place_khmer",
    khmer: true,
    placeholder: "ខេត្តកំពង់ចាម កម្ពុជា",
  },
];

export default function ContributeForm({
  initialValues = {},
  initialImage = "",
  onSubmit,
  submitLabel,
  submittingLabel,
  optionalPhoto = false,
}) {
  const router = useRouter();
  const { t, tError } = useLanguage();
  const finalSubmitLabel = submitLabel || t("form.submitEntry");
  const finalSubmittingLabel = submittingLabel || t("form.submitting");
  const currentImage = initialValues.image_url || initialImage || "";
  const [values, setValues] = React.useState({
    title_khmer: initialValues.title_khmer || "",
    title_english: initialValues.title_english || "",
    description: initialValues.description || "",
    description_khmer: initialValues.description_khmer || "",
    contributor: initialValues.contributor || "",
    contributor_khmer: initialValues.contributor_khmer || "",
    place: initialValues.place || "",
    place_khmer: initialValues.place_khmer || "",
    image_url: currentImage,
    wedding_day: initialValues.wedding_day || "",
  });
  const [imageFile, setImageFile] = React.useState(null);
  const [fieldErrors, setFieldErrors] = React.useState({});
  const [generalError, setGeneralError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");

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

  // Move keyboard/screen-reader focus to the first field that failed, so the
  // visitor lands right where they need to fix something.
  const focusFirstError = (errors) => {
    const order = [
      "title_khmer",
      "title_english",
      "description",
      "description_khmer",
      "contributor",
      "contributor_khmer",
      "place",
      "place_khmer",
      "image",
    ];
    const firstKey = order.find((key) => errors[key]);
    if (!firstKey) return;
    const targetId = firstKey === "image" ? "image_url" : firstKey;
    const el = document.getElementById(targetId);
    if (el) el.focus();
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
        // entry. New contributions don't have one: keep the contributor on
        // this page and show the waiting-for-review message instead.
        if (result.redirectTo) {
          router.push(result.redirectTo);
          return;
        }
        setSuccessMessage(
          t("form.success")
        );
        return;
      }
      const errors = result.fieldErrors || {};
      setFieldErrors(errors);
      focusFirstError(errors);
      if (result.message) setGeneralError(tError(result.message));
    } catch (error) {
      console.error("Entry form error:", error);
      setGeneralError(t("form.genericError"));
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

      {successMessage ? (
        <p className="form-success" role="status">
          {successMessage}
        </p>
      ) : (
        <>
          {TEXT_FIELDS.map(
            ({ key, labelKey, placeholder, placeholderKey, textarea, khmer }) => (
            <FormField
              key={key}
              id={key}
              label={t(labelKey)}
              required
              error={tError(error(key))}
            >
              {textarea ? (
                <textarea
                  id={key}
                  className="form-textarea"
                  rows={6}
                  placeholder={placeholderKey ? t(placeholderKey) : placeholder}
                  value={values[key]}
                  onChange={update(key)}
                  disabled={submitting}
                />
              ) : (
                <input
                  id={key}
                  className={khmer ? "form-input form-input-khmer" : "form-input"}
                  type="text"
                  placeholder={placeholderKey ? t(placeholderKey) : placeholder}
                  value={values[key]}
                  onChange={update(key)}
                  disabled={submitting}
                />
              )}
            </FormField>
          )
          )}

          <FormField
            id="wedding_day"
            label={t("form.weddingDay")}
            required
            hint={t("form.weddingDayHint")}
            error={tError(error("wedding_day"))}
          >
            <select
              id="wedding_day"
              className="form-select"
              value={values.wedding_day}
              onChange={update("wedding_day")}
              disabled={submitting}
            >
              <option value="" disabled>
                {t("form.weddingDayPlaceholder")}
              </option>
              {WEDDING_DAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {WEDDING_DAY_LABELS[option.value] || option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="image_file"
            label={t("form.photo")}
            required={!optionalPhoto}
            hint={t("form.photoHint")}
            error={tError(error("image"))}
          >
            {currentImage && !imageFile ? (
              <img
                src={currentImage}
                alt={t("form.currentPhoto")}
                className="form-current-photo"
              />
            ) : null}
            {optionalPhoto ? (
              <p className="form-hint">
                {t("form.keepPhoto")}
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
            <p className="form-hint">{t("form.or")}</p>
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

          <button
            type="submit"
            className="form-submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? finalSubmittingLabel : finalSubmitLabel}
          </button>
        </>
      )}
    </form>
  );
}