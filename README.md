# Simpel

Project utama menggunakan Laravel dan Inertia sebagai satu router/aplikasi. Backend, autentikasi Fortify, dan database Laravel berada di root. Halaman React utama tetap memakai komponen dari `src/`, yang dipasang sebagai page Inertia. Registrasi PATEN tetap memakai page React/Inertia dan controller Laravel teman.

## Persyaratan

- PHP 8.3 atau lebih baru dengan ekstensi PDO SQLite
- Composer
- Node.js 24 atau lebih baru

## Menjalankan di Windows

```powershell
Copy-Item .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
npm install
npm run dev
```

Jika `.env` sudah tersedia, jangan salin ulang. `npm run dev` menjalankan Laravel pada port 8000 dan Vite pada port 5173 untuk aset; keduanya melayani satu aplikasi. Buka aplikasi di `http://localhost:8000`. Database SQLite lokal berada di `database/database.sqlite`.

## Akun awal

Seeder menyediakan akun berikut. Ganti password sebelum penggunaan nyata.

| Role | NIP | Password |
|---|---|---|
| Pelayanan | 098765432123456787 | password |
| Administrator | 098765432123456788 | password |

Email verifikasi dan reset password memakai Gmail SMTP. Isi `MAIL_USERNAME` dengan alamat Gmail dan `MAIL_PASSWORD` dengan Google App Password di `.env` lokal; jangan gunakan password akun Gmail biasa. `MAIL_FROM_ADDRESS` harus sama dengan `MAIL_USERNAME`. App Password hanya dipakai di `.env`, jangan commit atau kirim melalui chat.

## Build dan tes

```powershell
npm run build
php artisan test
```

Build menghasilkan aset Laravel/Inertia di `public/build`. Untuk deployment, sajikan direktori `public/` Laravel dan gunakan database persisten. `Backend from github/` hanya salinan sumber lokal yang diabaikan Git; kode backend yang aktif berada di root.

## Aset

Tambahkan `public/assets/login-building.png` dari ekspor layer **Rectangle 1** Figma untuk gambar halaman login.
