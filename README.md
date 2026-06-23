# HCR.ID — Audio Afirmasi (Vite + React SPA)

Stack: **Vite + React 18 (JavaScript)**, React Router v6, Tailwind CSS v4, Supabase JS (browser).

## 1. Install
```bash
npm install
cp .env.example .env   # isi VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```
Buka http://localhost:5173

## 2. Setup Supabase
1. Buat project Supabase baru (atau pakai existing).
2. Jalankan migration di `supabase/migrations/` (lewat Supabase Studio → SQL editor, urutkan by filename).
3. Buat bucket storage **private** bernama `media`.
4. Salin URL & `anon` (publishable) key ke `.env`.
5. Deploy Edge Function untuk admin (opsional, hanya untuk membuat/menghapus user):
   ```bash
   supabase functions deploy admin-users --no-verify-jwt
   ```
   (Edge Function butuh env `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — biasanya otomatis tersedia.)

## 3. Login
- **User**: `/login` — pakai email & password yang dibuat admin.
- **Admin**: `/admin` — username `HCR.ID`, password `12345678`.
  - Pertama kali login, sistem otomatis bootstrap akun admin (`hcr.id@hcr.local`) & memberikan role admin.
  - **Penting**: di Supabase Auth Settings, izinkan signup atau matikan email confirmation supaya bootstrap pertama berhasil. Setelah itu boleh dikunci.

## 4. Struktur
```
src/
  pages/          Login, AdminLogin, AppHome, Folder, AdminDashboard
  components/     ProtectedRoute, AdminRoute, BrandLogo
  lib/supabase.js
supabase/
  migrations/     Schema (folders, files, user_roles + RLS)
  functions/admin-users/   Edge function utk create/delete/reset user
```

## 5. Anti-download
Audio pakai `controlsList="nodownload"`, image `pointer-events-none + draggable=false`, PDF via iframe signed URL. Catatan: tidak ada DRM penuh — pengguna dengan keahlian teknis tetap bisa menangkap stream. Untuk proteksi lebih kuat butuh DRM komersial.

## 6. Deploy
- **Vercel/Netlify**: build command `npm run build`, output `dist/`. Tambahkan SPA fallback (Netlify: `/_redirects` → `/*  /index.html  200`; Vercel: otomatis).
- Set env `VITE_SUPABASE_URL` & `VITE_SUPABASE_PUBLISHABLE_KEY` di dashboard.
# Audiobook
