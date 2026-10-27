import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { request, setSessionToken } from "../lib/api.js";
import { useData } from "./DataContext.jsx";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const { refreshData } = useData();
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState(null);
  const [pendingToken, setPendingToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    request("/auth/me")
      .then(async ({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        try {
          await refreshData();
        } catch (error) {
          console.error("Gagal memuat data aplikasi:", error);
        }
      })
      .catch((error) => {
        setSessionToken(null);
        if (error.message !== "Silakan login kembali." && error.message !== "Sesi tidak berlaku.") {
          console.error("Gagal memulihkan sesi:", error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [refreshData]);

  const login = useCallback(async (nip, password) => {
    let result;
    try {
      result = await request("/auth/login", {
        method: "POST",
        body: { nip: nip.trim(), password },
        token: null,
      });
    } catch (error) {
      return { ok: false, error: error.message };
    }
    if (result.needsCode) {
      setPendingToken(result.pendingToken);
      setPending(result.user);
      return { ok: true, needsCode: true };
    }
    setSessionToken(result.token);
    setUser(result.user);
    try {
      await refreshData();
    } catch (error) {
      console.error("Gagal memuat data aplikasi:", error);
    }
    return { ok: true, needsCode: false, user: result.user };
  }, [refreshData]);

  const verifyCode = useCallback(async (code) => {
    if (!/^\d{6}$/.test(code)) return { ok: false, error: "Kode harus 6 digit." };
    try {
      const result = await request("/auth/verify", {
        method: "POST",
        body: { code },
        token: pendingToken,
      });
      setSessionToken(result.token);
      setPendingToken(null);
      setPending(null);
      setUser(result.user);
      try {
        await refreshData();
      } catch (error) {
        console.error("Gagal memuat data aplikasi:", error);
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [pendingToken, refreshData]);

  const completeWithoutCode = useCallback(async () => {
    if (pending) {
      setPendingToken(null);
      setPending(null);
      throw new Error("Autentikasi akun ini memerlukan kode.");
    }
  }, [pending]);

  const logout = useCallback(async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Gagal mengakhiri sesi di server:", error);
    } finally {
      setSessionToken(null);
      setUser(null);
      setPending(null);
      setPendingToken(null);
    }
  }, []);

  const updateProfile = useCallback(async (body) => {
    const result = await request("/profile", { method: "PUT", body });
    setUser(result.user);
    await refreshData();
    return result.user;
  }, [refreshData]);

  const value = useMemo(
    () => ({ user, pending, loading, login, verifyCode, completeWithoutCode, logout, updateProfile }),
    [user, pending, loading, login, verifyCode, completeWithoutCode, logout, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const homeFor = (user) => (user?.role === "Administrator" ? "/admin" : "/");
