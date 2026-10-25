// components/Header.js - Sticky top navigation for the archive home page.
// Brand on the left links home; account actions sit on the right. While the
// session is loading, nothing is shown; signed-out visitors see Log In and
// Sign Up; signed-in visitors get a My Entries link, their email, and a
// Logout button. Contributors add new entries from /my-entries, whose
// "+ Add New Entry" link is the single clear path to the /contribute form.
// Reviewers (confirmed via the is_reviewer RPC in app/page.js and passed in as
// the isReviewer prop) also get a link to the /admin/review queue. Auth state,
// reviewer status, and the logout handler are passed in from app/page.js, so
// this component only renders. Styles live in components/archive.css.
import "./archive.css";

export default function Header({ loading, user, isReviewer, onLogout }) {
  return (
    <header className="archive-header">
      <a className="archive-brand" href="/">
        <span className="archive-brand-mark" aria-hidden="true" />
        KHMER LIVING ARCHIVE
      </a>

      <div className="archive-auth">
        {!loading && user ? (
          <>
            {isReviewer ? (
              <a className="archive-link" href="/admin/review">
                Review
              </a>
            ) : null}
            <a className="archive-link" href="/my-entries">
              My Entries
            </a>
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