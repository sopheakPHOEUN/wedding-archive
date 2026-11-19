// FormField.js - One labelled field: label, control, optional hint, and error.
// Uses React.cloneElement to pass accessible attributes to the nested control:
// aria-invalid when the field has an error, aria-required when it is required,
// and aria-describedby pointing at the hint/error text so screen readers
// announce them. Styling lives in components/contribute.css.
import React from "react";

export default function FormField({ id, label, hint, error, required, children }) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  // Inject a11y attributes into the single control (input/textarea/file).
  const control =
    React.isValidElement(children) && typeof children.type === "string"
      ? React.cloneElement(children, {
          "aria-invalid": error ? true : undefined,
          "aria-required": required || undefined,
          "aria-describedby": describedBy || undefined,
        })
      : children;

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
        {required ? (
          <span className="form-required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {control}
      {hint ? (
        <p className="form-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="form-field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}