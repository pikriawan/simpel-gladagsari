import { useState } from "react";
import { router } from "@inertiajs/react";
import AuthLayout from "../../components/AuthLayout.jsx";
import { PasswordField, TextField } from "../../components/ui.jsx";
import { request } from "../../lib/api.js";

export default function ResetPassword() {
  const url = new URL(window.location.href);
  const routeToken = url.pathname.split("/").filter(Boolean).at(-1);
  const email = url.searchParams.get("email") || "example@mail.com";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (password.length < 8) return setError("Password minimal 8 karakter.");
    if (password !== confirm) return setError("Konfirmasi password tidak sama.");
    try {
      await request("/auth/reset-password", {
        method: "POST",
        body: { email, token: url.searchParams.get("token") || routeToken, password },
        token: null,
      });
      router.visit("/login", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <AuthLayout title="Reset password" subtitle="Silahkan masukkan password baru Anda di bawah ini.">
      <form className="form" onSubmit={onSubmit} noValidate>
        <TextField label="Email" value={email} readOnly />
        <PasswordField label="Password" eye={false} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Masukkan password Anda" />
        <PasswordField label="Konfirmasi password" eye={false} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Masukkan konfirmasi password Anda" />
        {error && <p className="error-text" role="alert">{error}</p>}
        <button className="btn btn--block" type="submit">Reset password</button>
      </form>
    </AuthLayout>
  );
}
