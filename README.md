# Simpel (React + Vite)

Implementasi desain Figma "Simpel" (login, autentikasi, lupa/reset password, layar Pelayanan, dan layar Administrator).

## Menjalankan
Persyaratan: Node.js 24 atau lebih baru (SQLite memakai modul bawaan Node.js).

Jalankan API dan frontend sekaligus dengan satu perintah:
```bash
npm run dev
```
Perintah ini menjalankan Vite dan API bersama-sama. Frontend tersedia di `http://localhost:5173`; Vite meneruskan `/api` ke server pada port `3001`. Database dibuat otomatis di `data/simpel.sqlite`; atur `DATABASE_PATH` atau `PORT` untuk mengganti lokasi/port.
`npm run build` hanya membuat bundle frontend untuk deployment, bukan menjalankan server. Saat hosting, jalankan API dengan penyimpanan disk persisten dan arahkan `/api` pada domain yang sama ke port API. SQLite cocok untuk satu instance aplikasi; gunakan database server seperti PostgreSQL jika nanti perlu beberapa instance/replica.

## Aset yang perlu Anda taruh sendiri
- `public/assets/login-building.png` — ekspor layer **Rectangle 1** (node `6:18`) dari Figma.

## Akun demo (disimpan di SQLite)
| Role | NIP | Password |
|---|---|---|
| Pelayanan | 098765432123456787 | password123 |
| Administrator | 098765432123456788 | password123 |

Kode autentikasi: **6 digit angka apa pun** diterima untuk demo. Verifikasi TOTP sungguhan dan email reset password belum terintegrasi, sehingga aplikasi ini belum siap digunakan untuk autentikasi produksi tanpa layanan tersebut.

## Catatan
- Ikon memakai `lucide-react` sebagai pengganti; ganti dengan SVG ekspor Figma jika ingin identik piksel.
- "Ekspor/Impor Excel" memakai CSV (bisa dibuka di Excel).
- Data aplikasi tersimpan di SQLite melalui API Node.js (`server/index.js`); password disimpan dalam bentuk hash scrypt dan sesi disimpan sebagai hash token.
- Layar MacBook Air 16, 17, 18 belum terbaca dari Figma (batas panggilan MCP); pada Pegawai.jsx modal Ubah, Hapus, dan QR dibuat berdasarkan inferensi.
