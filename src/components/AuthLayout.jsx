import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, success }) {
  return (
    <main className="auth">
      <section className="auth__panel">
        <Link className="auth__brand" to="/login">Simpel</Link>
        <div className="auth__content">
          <header className="auth__header">
            <h1 className="t-title">{title}</h1>
            <p>{subtitle}</p>
          </header>
          {success && <p className="success-text" role="status">{success}</p>}
          {children}
        </div>
      </section>
      <aside className="auth__visual">
        {/* Ekspor node Figma 6:18 (Rectangle 1) ke public/assets/login-building.png */}
        <img src="/assets/login-building.png" alt="" />
      </aside>
    </main>
  );
}
