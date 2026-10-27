import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout.jsx";
import { homeFor, useAuth } from "../../context/AuthContext.jsx";

const LEN = 6;

export default function Authentication() {
  const { pending, user, verifyCode, completeWithoutCode } = useAuth();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(Array(LEN).fill(""));
  const [error, setError] = useState("");
  const refs = useRef([]);

  if (user) return <Navigate to={homeFor(user)} replace />;
  if (!pending) return <Navigate to="/login" replace />;

  const setAt = (i, v) => setDigits((d) => d.map((x, idx) => (idx === i ? v : x)));

  function onChange(i, e) {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    setAt(i, v);
    if (v && i < LEN - 1) refs.current[i + 1]?.focus();
  }
  function onKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "Enter") submit();
  }
  function onPaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (!text) return;
    e.preventDefault();
    setDigits(Array.from({ length: LEN }, (_, i) => text[i] || ""));
    refs.current[Math.min(text.length, LEN - 1)]?.focus();
  }
  async function submit() {
    if (!pending.authenticator) {
      completeWithoutCode();
      return navigate(homeFor(pending), { replace: true });
    }
    const res = await verifyCode(digits.join(""));
    if (!res.ok) return setError(res.error);
    navigate(homeFor(pending), { replace: true });
  }

  return (
    <AuthLayout title="Kode autentikasi" subtitle="Masukkan kode autentikasi yang diberikan oleh aplikasi autentikator Anda.">
      <div className="form">
        <div className="code-row" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i} ref={(el) => (refs.current[i] = el)} value={d} inputMode="numeric" autoComplete="one-time-code"
              aria-label={`Digit ${i + 1}`} autoFocus={i === 0}
              onChange={(e) => onChange(i, e)} onKeyDown={(e) => onKeyDown(i, e)}
            />
          ))}
        </div>
        {error && <p className="error-text" role="alert" style={{ textAlign: "center" }}>{error}</p>}
        <button className="btn btn--block" type="button" onClick={submit}>Lanjutkan</button>
      </div>
    </AuthLayout>
  );
}
