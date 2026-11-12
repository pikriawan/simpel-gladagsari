import { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  LayoutDashboard,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const SURAT_CHILDREN = [
  { to: "/surat-dispensasi-nikah/editor", label: "Editor" },
  { to: "/surat-dispensasi-nikah/riwayat", label: "Riwayat" },
  { to: "/surat-dispensasi-nikah/data-desa-dukuh", label: "Data Desa dan Dukuh" },
  { to: "/surat-dispensasi-nikah/pengaturan-template", label: "Pengaturan Template" },
];

const PATEN_CHILDREN = [
  { to: "/paten-registration/editor", label: "Editor" },
  { to: "/paten-registration/template", label: "Template" },
];

function itemClass(pathname, to, exact = false) {
  const active = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  return `nav-item${active ? " is-active" : ""}`;
}

function NavGroup({ label, pathname, items, initiallyOpen }) {
  const [open, setOpen] = useState(initiallyOpen);
  useEffect(() => {
    setOpen(initiallyOpen);
  }, [initiallyOpen]);

  return (
    <div>
      <button className="nav-item" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <FileText size={16} />
        <span className="nav-item__label">{label}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {open && (
        <div className="nav-sub">
          <div className="nav-sub__line" />
          <div className="nav-sub__items">
            {items.map((item) => (
              <Link key={item.to} href={item.to} className={itemClass(pathname, item.to)}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnifiedSidebar({ currentPath }) {
  const { user: contextUser, logout } = useAuth();
  const page = usePage();
  const user = contextUser || page.props.auth?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const pathname = (currentPath || page.url).split("?")[0];
  const admin = user?.role === "Administrator" || user?.role === "administrator";
  const roleLabel = admin ? "Administrator" : "Pelayanan";
  const displayName = (user?.nama || user?.name || "Pengguna").trim().split(/\s+/)[0];
  const dashboardPath = admin ? "/admin" : "/";
  const insideSurat = pathname.startsWith("/surat-dispensasi-nikah");
  const insidePaten = pathname.startsWith("/paten-registration");

  async function handleLogout() {
    await logout();
    // Gunakan full reload agar state Inertia/Auth bersih dan halaman login
    // benar-benar dirender (menghindari blank putih pada role admin).
    window.location.replace("/login");
  }

  useEffect(() => {
    const closeMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <Link className="sidebar__brand" href={dashboardPath}>Simpel</Link>
        <nav className="nav">
          <Link className={itemClass(pathname, dashboardPath, true)} href={dashboardPath}>
            <LayoutDashboard size={16} /><span>Dashboard</span>
          </Link>
          {admin ? (
            <Link className={itemClass(pathname, "/admin/pegawai")} href="/admin/pegawai">
              <Users size={16} /><span>Manajemen Data Pegawai</span>
            </Link>
          ) : (
            <>
              <NavGroup
                label="Surat Dispensasi Nikah"
                pathname={pathname}
                items={SURAT_CHILDREN}
                initiallyOpen={insideSurat}
              />
              <NavGroup
                label="Registrasi PATEN"
                pathname={pathname}
                items={PATEN_CHILDREN}
                initiallyOpen={insidePaten}
              />
            </>
          )}
        </nav>
      </div>

      <div className="sidebar__user" ref={menuRef}>
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">{displayName}</span>
          <span className="sidebar__user-role">{roleLabel}</span>
        </div>
        <button
          className="icon-btn"
          aria-label="Menu pengguna"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <SlidersHorizontal size={16} />
        </button>
        {menuOpen && (
          <div className="menu-pop" role="menu">
            <Link role="menuitem" href="/profil">Profil</Link>
            <button role="menuitem" onClick={handleLogout}>Keluar</button>
          </div>
        )}
      </div>
    </aside>
  );
}