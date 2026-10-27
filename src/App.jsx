import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import { homeFor, useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/auth/Login.jsx";
import Authentication from "./pages/auth/Authentication.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Profil from "./pages/Profil.jsx";
import Editor from "./pages/pelayanan/Editor.jsx";
import Riwayat from "./pages/pelayanan/Riwayat.jsx";
import DataDesaDukuh from "./pages/pelayanan/DataDesaDukuh.jsx";
import PengaturanTemplate from "./pages/pelayanan/PengaturanTemplate.jsx";
import RegistrasiPaten from "./pages/pelayanan/RegistrasiPaten.jsx";
import Pegawai from "./pages/admin/Pegawai.jsx";

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/authentication" element={<Authentication />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/profil" element={<Profil />} />

        {/* Pelayanan */}
        <Route index element={<Protected role="Pelayanan"><Dashboard /></Protected>} />
        <Route path="/surat-dispensasi-nikah">
          <Route index element={<Navigate to="editor" replace />} />
          <Route path="editor" element={<Protected role="Pelayanan"><Editor /></Protected>} />
          <Route path="riwayat" element={<Protected role="Pelayanan"><Riwayat /></Protected>} />
          <Route path="data-desa-dukuh" element={<Protected role="Pelayanan"><DataDesaDukuh /></Protected>} />
          <Route path="pengaturan-template" element={<Protected role="Pelayanan"><PengaturanTemplate /></Protected>} />
        </Route>
        <Route path="/registrasi-paten" element={<Protected role="Pelayanan"><RegistrasiPaten /></Protected>} />

        {/* Administrator */}
        <Route path="/admin" element={<Protected role="Administrator"><Dashboard /></Protected>} />
        <Route path="/admin/pegawai" element={<Protected role="Administrator"><Pegawai /></Protected>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
