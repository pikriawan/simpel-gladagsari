import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout.jsx";
import { PasswordField, TextField } from "../../components/ui.jsx";
import { homeFor, useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (!nip.trim() || !password) return setError("NIP dan password wajib diisi.");
    const res = await login(nip, password);
    if (!res.ok) return setError(res.error);
    navigate(res.needsCode ? "/authentication" : homeFor(res.user), { replace: true });
  }

  return (
    <AuthLayout title="Login ke akun Anda" subtitle="Masukkan NIP dan password Anda di bawah ini untuk login.">
      <form className="form" onSubmit={onSubmit} noValidate>
        <TextField label="NIP" value={nip} onChange={(e) => setNip(e.target.value)} inputMode="numeric" autoComplete="username" placeholder="Masukkan NIP Anda" />
        <PasswordField
          label="Password" eye={false}
          right={<Link className="link t-label" to="/forgot-password">Lupa password?</Link>}
          value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Masukkan password Anda"
        />
        {error && <p className="error-text" role="alert">{error}</p>}
        <button className="btn btn--block" type="submit">Login</button>
      </form>
    </AuthLayout>
  );
}
