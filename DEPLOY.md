# 🚀 Panduan Deploy BONE Barbershop

Panduan lengkap untuk deploy aplikasi BONE Barbershop dengan biaya **GRATIS** atau sangat murah.

---

## 📋 Arsitektur

| Layer | Teknologi | Biaya |
|-------|-----------|-------|
| Frontend & API | Next.js (Vercel) | **GRATIS** (Hobby Plan) |
| Database | Supabase (PostgreSQL) | **GRATIS** (Free Tier) |
| Auth | Supabase Auth | **GRATIS** |
| Domain (opsional) | Namecheap / Niagahoster | Rp 15.000-100.000/tahun |

**Total biaya: Rp 0 - Rp 100.000/tahun** (hanya jika beli domain custom)

---

## 🔧 Langkah 1: Setup Supabase (Database)

### 1.1 Buat Akun & Project

1. Buka [supabase.com](https://supabase.com) dan daftar (gratis)
2. Klik **"New Project"**
3. Isi:
   - **Name**: `bone-barbershop`
   - **Database Password**: cekbone123#
   - **Region**: `Southeast Asia (Singapore)` ← pilih yang terdekat
4. Tunggu project selesai dibuat (~2 menit)

### 1.2 Jalankan Schema Database

1. Di Supabase Dashboard, buka **SQL Editor** (menu kiri)
2. Klik **"New Query"**
3. Copy-paste seluruh isi file `supabase/schema.sql` dari project ini
4. Klik **"Run"** (atau Ctrl+Enter)
5. Pastikan tidak ada error

### 1.3 Buat Akun Admin

1. Di Supabase Dashboard, buka **Authentication** → **Users**
2. Klik **"Add User"** → **"Create New User"**
3. Isi:
   - **Email**: `admin@bone.com` (atau email Abi)
   - **Password**: (buat password yang kuat)
   - Centang **"Auto Confirm User"**
4. Klik **"Create User"**

### 1.4 Catat API Keys

1. Buka **Settings** → **API**
2. Catat:
   - **Project URL**: `https://mvfeloznytxcsrcxsggj.supabase.co/rest/v1/`
   - **anon public key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12ZmVsb3pueXR4Y3NyY3hzZ2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzEyMDgsImV4cCI6MjA5NTMwNzIwOH0.WKt2yOXg1NdBw6HNtj9RVQtQEtqSoKF9dH0KJfTGLuU

---

## 🌐 Langkah 2: Deploy ke Vercel (Hosting)

### 2.1 Push Code ke GitHub

```bash
# Di folder project
git init
git add .
git commit -m "Initial commit - BONE Barbershop"

# Buat repo baru di github.com, lalu:
git remote add origin https://github.com/ibnuhnf/bone-barbershop.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy di Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan GitHub
2. Klik **"Add New..."** → **"Project"**
3. Pilih repository `bone-barbershop`
4. Di bagian **Environment Variables**, tambahkan:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |

5. Klik **"Deploy"**
6. Tunggu build selesai (~2-3 menit)

### 2.3 Hasil

Setelah deploy berhasil, kamu akan mendapat URL seperti:
- `https://bone-barbershop.vercel.app`

---

## 🌍 Langkah 3: Custom Domain (Opsional)

### Opsi Domain Murah:

| Provider | Harga .com | Harga .id |
|----------|-----------|-----------|
| [Namecheap](https://namecheap.com) | ~Rp 130.000/tahun | - |
| [Niagahoster](https://niagahoster.co.id) | ~Rp 130.000/tahun | ~Rp 100.000/tahun |
| [Domainesia](https://domainesia.com) | ~Rp 120.000/tahun | ~Rp 90.000/tahun |
| [Cloudflare](https://cloudflare.com) | ~Rp 130.000/tahun | - |

### Rekomendasi domain:
- `bonebarbershop.com`
- `bone.id`
- `bookbone.com`

### Cara pasang domain di Vercel:

1. Di Vercel Dashboard → Project → **Settings** → **Domains**
2. Tambahkan domain kamu (misal: `bonebarbershop.com`)
3. Vercel akan memberikan DNS records
4. Di provider domain kamu, tambahkan:
   - **A Record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com`
5. Tunggu propagasi DNS (~5-30 menit)

---

## 📱 Langkah 4: PWA (Progressive Web App) - Bonus

Agar website bisa "diinstall" di HP seperti aplikasi native:

Website Next.js sudah responsive dan mobile-first. Pelanggan cukup buka website di browser HP dan "Add to Home Screen".

---

## ✅ Checklist Setelah Deploy

- [ ] Buka website dan test landing page
- [ ] Test alur booking lengkap (pilih layanan → tanggal → jam → data diri → konfirmasi)
- [ ] Login admin di `/admin/login`
- [ ] Test toggle buka/tutup hari di admin
- [ ] Test konfirmasi/tolak booking di admin
- [ ] Test cari booking di `/my-bookings`

---

## 🔄 Update & Maintenance

### Cara update website:

```bash
# Edit code, lalu:
git add .
git commit -m "Update: deskripsi perubahan"
git push
```

Vercel akan **otomatis** rebuild dan deploy setiap kali ada push ke branch `main`.

### Monitoring:

- **Vercel Dashboard**: Lihat traffic, error logs, dan build status
- **Supabase Dashboard**: Lihat database usage, auth logs, dan API calls

---

## 💰 Ringkasan Biaya

### Free Tier Limits:

| Service | Free Limit | Cukup untuk |
|---------|-----------|-------------|
| Vercel | 100GB bandwidth/bulan | ~50.000 visitors/bulan |
| Supabase | 500MB database, 2GB storage | ~10.000+ bookings |
| Supabase Auth | 50.000 MAU | Lebih dari cukup |

### Kapan perlu upgrade?

- **Vercel Pro** ($20/bulan): Jika traffic > 100GB/bulan atau butuh analytics
- **Supabase Pro** ($25/bulan): Jika database > 500MB atau butuh backup harian

Untuk barbershop dengan 30+ booking/bulan, **Free Tier sudah lebih dari cukup** untuk 1-2 tahun ke depan.

---

## 🆘 Troubleshooting

### Error "Invalid API Key"
→ Pastikan environment variables di Vercel sudah benar (tanpa spasi/newline)

### Error "relation does not exist"
→ Jalankan ulang `schema.sql` di Supabase SQL Editor

### Admin tidak bisa login
→ Pastikan user sudah dibuat di Supabase Auth dan email sudah confirmed

### Booking tidak muncul
→ Cek RLS policies di Supabase. Pastikan policy "Anyone can create bookings" aktif

---

## 📞 Kontak Support

Jika ada masalah teknis:
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

*Dokumen ini dibuat untuk BONE Barbershop - Mei 2026*
