import { useEffect, useId, useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, X } from "lucide-react";

/* Field + input bertema: <Field label="NIP"><input className="input" /></Field> */
export function Field({ label, children, right }) {
  return (
    <div className="field">
      {right ? (
        <div className="field__row">
          <span className="t-label">{label}</span>
          {right}
        </div>
      ) : (
        <span className="t-label">{label}</span>
      )}
      {children}
    </div>
  );
}

export function TextField({ label, right, ...props }) {
  const id = useId();
  return (
    <div className="field">
      {right ? (
        <div className="field__row">
          <label className="t-label" htmlFor={id}>{label}</label>
          {right}
        </div>
      ) : (
        <label className="t-label" htmlFor={id}>{label}</label>
      )}
      <input id={id} className="input" {...props} />
    </div>
  );
}

export function PasswordField({ label, right, eye = true, ...props }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      {right ? (
        <div className="field__row">
          <label className="t-label" htmlFor={id}>{label}</label>
          {right}
        </div>
      ) : (
        <label className="t-label" htmlFor={id}>{label}</label>
      )}
      <div className="input-wrap">
        <input id={id} className="input" type={show ? "text" : "password"} {...props} />
        {eye && (
          <button type="button" className="icon-btn" aria-label={show ? "Sembunyikan password" : "Tampilkan password"} onClick={() => setShow((s) => !s)}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function DateField({ label, ...props }) {
  const id = useId();
  return (
    <div className="field">
      <label className="t-label" htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input id={id} className="input" type="date" {...props} />
        <Calendar size={16} />
      </div>
    </div>
  );
}

export function SelectField({ label, placeholder, options, value, ...props }) {
  const id = useId();
  return (
    <div className="field">
      <label className="t-label" htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <select id={id} className="input" value={value} required {...props}>
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={16} />
      </div>
    </div>
  );
}

export function PageHead({ crumbs, title, children }) {
  const parents = crumbs.slice(0, -1);
  const current = crumbs[crumbs.length - 1];
  return (
    <header className="page-head">
      <div className="page-head__titles">
        <div className="crumbs">
          {parents.map((c) => (
            <span key={c} className="crumbs">
              <span className="is-parent">{c}</span>
              <ChevronRight size={16} />
            </span>
          ))}
          <span>{current}</span>
        </div>
        <h1 className="t-title">{title}</h1>
      </div>
      {children && <div className="page-head__actions">{children}</div>}
    </header>
  );
}

export function Modal({ title, subtitle, onClose, children, actions }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <button className="icon-btn modal__close" onClick={onClose} aria-label="Tutup"><X size={16} /></button>
        <h2 className="t-title">{title}</h2>
        {subtitle && <p className="modal__sub">{subtitle}</p>}
        {children}
        {actions && <div className="modal__actions">{actions}</div>}
      </div>
    </div>
  );
}

export function Pager({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const items = [];
  const push = (p) => items.push(
    <button key={p} className={p === page ? "is-active" : ""} onClick={() => onChange(p)}>{p}</button>
  );
  if (pages <= 5) for (let p = 1; p <= pages; p++) push(p);
  else {
    push(1);
    if (page > 3) items.push(<span key="l" style={{ width: 32, textAlign: "center", lineHeight: "32px" }}>…</span>);
    for (let p = Math.max(2, page - 1); p <= Math.min(pages - 1, page + 1); p++) push(p);
    if (page < pages - 2) items.push(<span key="r" style={{ width: 32, textAlign: "center", lineHeight: "32px" }}>…</span>);
    push(pages);
  }
  return (
    <div className="pager">
      <button disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Sebelumnya"><ChevronLeft size={16} /></button>
      {items}
      <button disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Berikutnya"><ChevronRight size={16} /></button>
    </div>
  );
}
