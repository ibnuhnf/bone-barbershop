# ✂️ BONE Barbershop - Booking System

Sistem booking barbershop modern berbasis web dengan tema dark mode elegan.

## Tech Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Icons**: Lucide React
- **Date**: date-fns
- **Deploy**: Vercel (free tier)

## Fitur

### 👤 User (Pelanggan)
- Landing page dengan profil barbershop
- Booking step-by-step (layanan → tanggal → waktu → data diri → review)
- Kalender interaktif dengan status hari
- Grid slot waktu per jam
- Kode booking unik
- Halaman My Bookings (cari & batalkan)

### 🔧 Admin (Abi)
- Dashboard dengan statistik hari ini
- Manajemen jadwal (buka/tutup hari, aktif/nonaktif slot)
- Manajemen booking (konfirmasi, tolak, selesai)
- Filter & pencarian booking

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
# Copy .env.local dan isi dengan Supabase credentials
cp .env.local.example .env.local

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Setup Database

1. Buat project di [Supabase](https://supabase.com)
2. Jalankan `supabase/schema.sql` di SQL Editor
3. Buat user admin di Authentication → Users
4. Update `.env.local` dengan URL dan anon key

## Struktur Project

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── booking/page.tsx      # Halaman booking
│   ├── my-bookings/page.tsx  # Cari booking
│   ├── admin/
│   │   ├── page.tsx          # Admin dashboard
│   │   └── login/page.tsx    # Admin login
│   └── api/
│       ├── bookings/         # CRUD booking
│       ├── schedule/         # Jadwal & slot
│       └── admin/            # Admin actions
├── components/
│   ├── booking/              # Komponen step booking
│   └── admin/                # Komponen admin panel
└── lib/
    ├── supabase/             # Supabase client config
    ├── types.ts              # TypeScript types
    └── constants.ts          # Constants & helpers
```

## Deploy

Lihat [DEPLOY.md](./DEPLOY.md) untuk panduan lengkap deploy gratis.

---

BONE Barbershop © 2026
