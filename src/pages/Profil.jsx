import { useState } from "react";
import { PageHead, PasswordField, TextField } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profil() {
  const { user, updateProfile } = useAuth();
  const [nama, setNama] = useState(user.nama.split(" ")[0]);
  const [email, setEmail] = useState(user.email);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState({ profile: "", password: "" });

  async function saveProfile(e) {
    e.preventDefault();
    try {
      await updateProfile({ nama: nama.trim() || user.nama, email });
      setMsg((m) => ({ ...m, profile: "Profil disimpan." }));
    } catch (error) {
      setMsg((m) => ({ ...m, profile: error.message }));
    }
  }
  async function savePassword(e) {
    e.preventDefault();
    if (next.length < 8) return setMsg((m) => ({ ...m, password: "Password baru minimal 8 karakter." }));
    if (next !== confirm) return setMsg((m) => ({ ...m, password: "Konfirmasi password tidak sama." }));
    try {
      await updateProfile({
        nama: nama.trim() || user.nama,
        email,
        currentPassword: current,
        newPassword: next,
      });
      setCurrent(""); setNext(""); setConfirm("");
      setMsg((m) => ({ ...m, password: "Password diperbarui." }));
    } catch (error) {
      setMsg((m) => ({ ...m, password: error.message }));
    }
  }

  return (
    <>
      <PageHead crumbs={["Profil"]} title="Profil" />
      <div className="sections" style={{ maxWidth: 440 }}>
        <form className="section" onSubmit={saveProfile}>
          <h2 className="t-section">Nama dan Email</h2>
          <TextField label="Nama" value={nama} onChange={(e) => setNama(e.target.value)} />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {msg.profile && <p className="success-text" style={{ textAlign: "left" }}>{msg.profile}</p>}
          <div><button className="btn" type="submit">Simpan</button></div>
        </form>
        <form className="section" onSubmit={savePassword}>
          <h2 className="t-section">Password</h2>
          <PasswordField label="Password saat ini" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Password saat ini" autoComplete="current-password" />
          <PasswordField label="Password baru" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Password baru" autoComplete="new-password" />
          <PasswordField label="Konfirmasi password baru" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Konfirmasi password baru" autoComplete="new-password" />
          {msg.password && <p className={msg.password.includes("diperbarui") ? "success-text" : "error-text"} style={{ textAlign: "left" }}>{msg.password}</p>}
          <div><button className="btn" type="submit">Simpan</button></div>
        </form>
      </div>
    </>
  );
}
