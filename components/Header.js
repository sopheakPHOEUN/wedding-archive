// components/Header.js - Sticky top navigation for the archive home page.
// Brand on the left links home; account actions sit on the right. While the
// session is loading, nothing is shown; signed-out visitors see Log In and
// Sign Up; signed-in visitors see their email and a Logout button. Auth state
// and the logout handler are passed in from app/page.js, so this component
// only renders. Styles live in components/archive.css.
import "./archive.css";

export default function Header({ loading, user, onLogout }) {
  return (
    <header className="archive-header">
      <a className="archive-brand" href="/">
        <span className="archive-brand-mark" aria-hidden="true" />
        KHMER LIVING ARCHIVE
      </a>

      <div className="archive-auth">
        {!loading && user ? (
          <>
            <span className="archive-user" title={user.email}>
              {user.email}
            </span>
            <button type="button" className="archive-logout" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : !loading ? (
          <>
            <a className="archive-link" href="/login">
              Log In
            </a>
            <a className="archive-link archive-link-primary" href="/signup">
              Sign Up
            </a>
          </>
        ) : null}
      </div>
    </header>
  );
}