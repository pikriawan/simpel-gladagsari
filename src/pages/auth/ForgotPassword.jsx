import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout.jsx";
import { TextField } from "../../components/ui.jsx";
import { request } from "../../lib/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Masukkan alamat email yang valid.");
    setError("");
    try {
      await request("/auth/forgot-password", { method: "POST", body: { email }, token: null });
      setSent(true);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <AuthLayout
      title="Lupa password"
      subtitle="Masukkan email Anda untuk menerima tautan reset password."
      success={sent ? "Kami telah mengirimkan tautan pengaturan ulang kata sandi ke email Anda." : undefined}
    >
      <form className="form" onSubmit={onSubmit} noValidate>
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Masukkan email Anda" autoComplete="email" />
        {error && <p className="error-text" role="alert">{error}</p>}
        <button className="btn btn--block" type="submit">Kirim tautan reset password</button>
      </form>
      <Link className="auth__back" to="/login">Kembali ke halaman login</Link>
    </AuthLayout>
  );
}
