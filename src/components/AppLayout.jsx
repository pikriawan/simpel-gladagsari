import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, FileText, LayoutDashboard, SlidersHorizontal, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const SURAT_CHILDREN = [
  { to: "/surat-dispensasi-nikah/editor", label: "Editor" },
  { to: "/surat-dispensasi-nikah/riwayat", label: "Riwayat" },
  { to: "/surat-dispensasi-nikah/data-desa-dukuh", label: "Data Desa dan Dukuh" },
  { to: "/surat-dispensasi-nikah/pengaturan-template", label: "Pengaturan Template" },
];

const itemClass = ({ isActive }) => `nav-item${isActive ? " is-active" : ""}`;

function SuratGroup() {
  const { pathname } = useLocation();
  const inside = pathname.startsWith("/surat-dispensasi-nikah");
  const [open, setOpen] = useState(inside);
  useEffect(() => { if (inside) setOpen(true); }, [inside]);
  return (
    <div>
      <button className="nav-item" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <FileText size={16} />
        <span className="nav-item__label">Surat Dispensasi Nikah</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && (
        <div className="nav-sub">
          <div className="nav-sub__line" />
          <div className="nav-sub__items">
            {SURAT_CHILDREN.map((c) => (
              <NavLink key={c.to} to={c.to} className={itemClass}>{c.label}</NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="sidebar__user" ref={ref}>
      <div className="sidebar__user-info">
        <span className="sidebar__user-name">{user.nama.split(" ")[0]}</span>
        <span className="sidebar__user-role">{user.role}</span>
      </div>
      <button className="icon-btn" aria-label="Menu pengguna" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <SlidersHorizontal size={16} />
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          <button role="menuitem" onClick={() => { setOpen(false); navigate("/profil"); }}>Profil</button>
          <button role="menuitem" onClick={() => { logout(); navigate("/login"); }}>Keluar</button>
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const { user } = useAuth();
  const admin = user.role === "Administrator";
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__top">
          <span className="sidebar__brand">Simpel</span>
          <nav className="nav">
            <NavLink end to={admin ? "/admin" : "/"} className={itemClass}>
              <LayoutDashboard size={16} /><span>Dashboard</span>
            </NavLink>
            {admin ? (
              <NavLink to="/admin/pegawai" className={itemClass}>
                <Users size={16} /><span>Manajemen Data Pegawai</span>
              </NavLink>
            ) : (
              <>
                <SuratGroup />
                <NavLink to="/registrasi-paten" className={itemClass}>
                  <FileText size={16} /><span>Registrasi PATEN</span>
                </NavLink>
              </>
            )}
          </nav>
        </div>
        <UserMenu />
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
