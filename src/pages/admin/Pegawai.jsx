import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CircleCheck, Plus, QrCode, RotateCcw, Shield, SquarePen, Trash2, TriangleAlert } from "lucide-react";
import { Modal, PageHead, PasswordField, SelectField, TextField } from "../../components/ui.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLES = ["Pelayanan", "Administrator"];
const EMPTY = { nip: "", nama: "", email: "", role: "" };

function PegawaiForm({ initial, title, submitLabel, icon, onClose, onSubmit }) {
  const [f, setF] = useState(initial);
  const [error, setError] = useState("");
  const bind = (k) => ({ value: f[k], onChange: (e) => setF((x) => ({ ...x, [k]: e.target.value })) });
  function submit(e) {
    e.preventDefault();
    if (!/^\d{18}$/.test(f.nip)) return setError("NIP harus 18 digit angka.");
    if (!f.nama.trim() || !/^\S+@\S+\.\S+$/.test(f.email) || !f.role) return setError("Lengkapi nama, email yang valid, dan role.");
    onSubmit({ ...f, nama: f.nama.trim() });
  }
  return (
    <Modal title={title} onClose={onClose}>
      <form className="form" onSubmit={submit} noValidate>
        <TextField label="NIP" placeholder="Contoh: 123456789012345678" inputMode="numeric" {...bind("nip")} />
        <TextField label="Nama lengkap" placeholder="Nama lengkap" {...bind("nama")} />
        <TextField label="Email" type="email" placeholder="Email" {...bind("email")} />
        <SelectField label="Role" placeholder="Pilih role" options={ROLES} {...bind("role")} />
        {error && <p className="error-text" role="alert">{error}</p>}
        <div className="modal__actions">
          <button type="button" className="btn btn--grey" onClick={onClose}>Batal</button>
          <button type="submit" className="btn">{icon}{submitLabel}</button>
        </div>
      </form>
    </Modal>
  );
}

function SecurityModal({ p, onClose, onUpdate }) {
  const [tab, setTab] = useState("password");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [qr, setQr] = useState(false);
  const uri = `otpauth://totp/Simpel:${encodeURIComponent(p.nip)}?secret=${btoa(p.id + p.nip).replace(/=/g, "").toUpperCase().slice(0, 16)}&issuer=Simpel`;

  function savePassword() {
    if (pw.length < 8) return setError("Password minimal 8 karakter.");
    if (pw !== confirm) return setError("Konfirmasi password tidak sama.");
    onUpdate({ password: pw, passwordSet: true });
    onClose();
  }

  return (
    <Modal title="Pengaturan Keamanan" subtitle={p.nama.split(" ")[0]} onClose={onClose}>
      <div className="badges">
        {!p.passwordSet && <span className="badge badge--warn"><TriangleAlert size={10} />Password belum diatur</span>}
        {p.authenticator ? (
          <span className="badge badge--ok"><CircleCheck size={10} />Authenticator aktif</span>
        ) : (
          <span className="badge badge--warn"><TriangleAlert size={10} />Authenticator belum aktif</span>
        )}
      </div>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "password"} className={tab === "password" ? "is-active" : ""} onClick={() => setTab("password")}>Password</button>
        <button role="tab" aria-selected={tab === "auth"} className={tab === "auth" ? "is-active" : ""} onClick={() => setTab("auth")}>Authenticator</button>
      </div>

      {tab === "password" ? (
        <>
          <PasswordField label="Password baru" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password baru" autoComplete="new-password" />
          <PasswordField label="Konfirmasi password baru" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Konfirmasi password baru" autoComplete="new-password" />
          {error && <p className="error-text" role="alert">{error}</p>}
          <div className="modal__actions">
            <button className="btn btn--grey" onClick={onClose}>Batal</button>
            <button className="btn" onClick={savePassword}>Simpan password</button>
          </div>
        </>
      ) : (
        <>
          {qr && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <QRCodeSVG value={uri} size={176} />
              <p className="t-muted" style={{ fontSize: 14, textAlign: "center" }}>Pindai dengan aplikasi autentikator, lalu aktifkan.</p>
            </div>
          )}
          <div className="modal__actions">
            <button className="btn btn--grey" onClick={onClose}>Batal</button>
            {qr ? (
              <button className="btn" onClick={() => { onUpdate({ authenticator: true }); onClose(); }}><CircleCheck size={16} />Aktifkan authenticator</button>
            ) : (
              <button className="btn" onClick={() => setQr(true)}><QrCode size={16} />Generate QR code authenticator</button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

export default function Pegawai() {
  const { pegawai, setPegawai } = useData();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null); // {type:'add'|'edit'|'security'|'delete', p?}

  const rows = useMemo(() => {
    const k = q.trim().toLowerCase();
    return k ? pegawai.filter((p) => [p.nama, p.nip, p.email].some((v) => v.toLowerCase().includes(k))) : pegawai;
  }, [pegawai, q]);

  const update = (id, patch) => setPegawai((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const nipTaken = (nip, id) => pegawai.some((p) => p.nip === nip && p.id !== id);

  return (
    <>
      <PageHead crumbs={["Manajemen Data Pegawai"]} title="Manajemen Data Pegawai">
        <button className="btn btn--grey" onClick={() => window.confirm("Kembalikan data pegawai ke bawaan?") && setPegawai([
          { id: "p1", nip: "098765432123456787", nama: "Salung Fadlan Juliansyah", email: "salung@gmail.com", role: "Pelayanan", status: "Aktif", password: "password123", passwordSet: true, authenticator: true },
          { id: "p2", nip: "098765432123456788", nama: "Gilang Pamungkas", email: "gilang@gmail.com", role: "Administrator", status: "Aktif", password: "password123", passwordSet: true, authenticator: true },
          { id: "p3", nip: "098765432123456789", nama: "Rifqi Khoirurrozaq", email: "rifqi@gmail.com", role: "Pelayanan", status: "Aktif", password: "", passwordSet: false, authenticator: false },
        ])}>
          <RotateCcw size={16} />Reset default
        </button>
        <button className="btn" onClick={() => setModal({ type: "add" })}><Plus size={16} />Tambah pegawai baru</button>
      </PageHead>

      <TextField label="Cari" placeholder="Cari berdasarkan nama, NIP, email..." value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Pegawai</th><th>NIP</th><th>Email</th><th>Role</th><th>Status</th><th className="actions" /></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td className="empty" colSpan={6}>Pegawai tidak ditemukan.</td></tr>}
            {rows.map((p) => (
              <tr key={p.id}>
                <td title={p.nama}>{p.nama}</td><td>{p.nip}</td><td>{p.email}</td><td>{p.role}</td><td>{p.status}</td>
                <td className="actions">
                  <button className="icon-btn" aria-label="Pengaturan keamanan" onClick={() => setModal({ type: "security", id: p.id })}><Shield size={16} /></button>
                  <button className="icon-btn" aria-label="Ubah" onClick={() => setModal({ type: "edit", id: p.id })}><SquarePen size={16} /></button>
                  <button className="icon-btn icon-btn--danger" aria-label="Hapus" disabled={p.id === user.id} onClick={() => setModal({ type: "delete", id: p.id })}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type === "add" && (
        <PegawaiForm
          title="Tambah Data Pegawai Baru" submitLabel="Tambah" icon={<Plus size={16} />} initial={EMPTY}
          onClose={() => setModal(null)}
          onSubmit={(f) => {
            if (nipTaken(f.nip)) return window.alert("NIP sudah terdaftar.");
            setPegawai((l) => [...l, { ...f, id: crypto.randomUUID(), status: "Aktif", password: "", passwordSet: false, authenticator: false }]);
            setModal(null);
          }}
        />
      )}
      {modal?.type === "edit" && (() => {
        const p = pegawai.find((x) => x.id === modal.id);
        return (
          <PegawaiForm
            title="Ubah Data Pegawai" submitLabel="Simpan" initial={{ nip: p.nip, nama: p.nama, email: p.email, role: p.role }}
            onClose={() => setModal(null)}
            onSubmit={(f) => {
              if (nipTaken(f.nip, p.id)) return window.alert("NIP sudah terdaftar.");
              update(p.id, f);
              setModal(null);
            }}
          />
        );
      })()}
      {modal?.type === "security" && (
        <SecurityModal p={pegawai.find((x) => x.id === modal.id)} onClose={() => setModal(null)} onUpdate={(patch) => update(modal.id, patch)} />
      )}
      {modal?.type === "delete" && (() => {
        const p = pegawai.find((x) => x.id === modal.id);
        return (
          <Modal
            title="Hapus Pegawai" onClose={() => setModal(null)}
            actions={
              <>
                <button className="btn btn--grey" onClick={() => setModal(null)}>Batal</button>
                <button className="btn btn--danger" onClick={() => { setPegawai((l) => l.filter((x) => x.id !== p.id)); setModal(null); }}><Trash2 size={16} />Hapus</button>
              </>
            }
          >
            <p>Hapus data <b>{p.nama}</b>? Tindakan ini tidak dapat dibatalkan.</p>
          </Modal>
        );
      })()}
    </>
  );
}
