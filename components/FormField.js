// FormField.js - One labeled field: label, control, optional hint, and error.
// Styling lives in components/contribute.css (imported by the contribute page).
export default function FormField({ id, label, hint, error, children }) {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? <p className="form-hint">{hint}</p> : null}
      {error ? <p className="form-field-error">{error}</p> : null}
    </div>
  );
}