-- ============================================
-- BONE BARBERSHOP - Database Schema
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- 1. Tabel Services (Layanan)
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_notes TEXT,
  booking_date DATE NOT NULL,
  booking_time VARCHAR(5) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'done', 'cancelled', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Day Schedules (Jadwal per hari)
CREATE TABLE IF NOT EXISTS day_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  is_open BOOLEAN DEFAULT true,
  custom_slots TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Default Schedules (Jadwal default per hari dalam seminggu)
CREATE TABLE IF NOT EXISTS default_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER UNIQUE NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open BOOLEAN DEFAULT true,
  open_time VARCHAR(5) DEFAULT '09:00',
  close_time VARCHAR(5) DEFAULT '17:00',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Disabled Slots (Slot yang dinonaktifkan per hari)
CREATE TABLE IF NOT EXISTS disabled_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time VARCHAR(5) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, time)
);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default services
INSERT INTO services (code, name, description, duration_minutes, price) VALUES
  ('SVC-01', 'Haircut (Potong)', 'Potong rambut standar oleh Abi', 60, 50000),
  ('SVC-02', 'Haircut + Cuci Rambut', 'Potong rambut dilanjutkan keramas', 75, 70000),
  ('SVC-03', 'Pewarnaan Rambut', 'Cat rambut sesuai permintaan pelanggan', 120, 150000),
  ('SVC-04', 'Jenggot / Beard Trim', 'Trim dan rapikan jenggot', 30, 35000),
  ('SVC-05', 'Hairstyle / Styling', 'Penataan rambut sesuai gaya yang diinginkan', 60, 75000)
ON CONFLICT (code) DO NOTHING;

-- Insert default weekly schedule (Senin-Sabtu buka, Minggu tutup)
INSERT INTO default_schedules (day_of_week, is_open, open_time, close_time) VALUES
  (0, false, '09:00', '17:00'),  -- Minggu (tutup)
  (1, true, '09:00', '17:00'),   -- Senin
  (2, true, '09:00', '17:00'),   -- Selasa
  (3, true, '09:00', '17:00'),   -- Rabu
  (4, true, '09:00', '17:00'),   -- Kamis
  (5, true, '09:00', '17:00'),   -- Jumat
  (6, true, '09:00', '14:00')    -- Sabtu (sampai jam 14:00)
ON CONFLICT (day_of_week) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE disabled_slots ENABLE ROW LEVEL SECURITY;

-- SERVICES: semua bisa baca, admin bisa edit
CREATE POLICY "services_select_all" ON services
  FOR SELECT USING (true);

CREATE POLICY "services_insert_auth" ON services
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "services_update_auth" ON services
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "services_delete_auth" ON services
  FOR DELETE USING (auth.role() = 'authenticated');

-- BOOKINGS: semua bisa buat & baca & update (untuk cancel), admin bisa delete
CREATE POLICY "bookings_select_all" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "bookings_insert_all" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "bookings_update_all" ON bookings
  FOR UPDATE USING (true);

CREATE POLICY "bookings_delete_auth" ON bookings
  FOR DELETE USING (auth.role() = 'authenticated');

-- DAY_SCHEDULES: semua bisa baca, admin bisa edit
CREATE POLICY "day_schedules_select_all" ON day_schedules
  FOR SELECT USING (true);

CREATE POLICY "day_schedules_insert_auth" ON day_schedules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "day_schedules_update_auth" ON day_schedules
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "day_schedules_delete_auth" ON day_schedules
  FOR DELETE USING (auth.role() = 'authenticated');

-- DEFAULT_SCHEDULES: semua bisa baca, admin bisa edit
CREATE POLICY "default_schedules_select_all" ON default_schedules
  FOR SELECT USING (true);

CREATE POLICY "default_schedules_insert_auth" ON default_schedules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "default_schedules_update_auth" ON default_schedules
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "default_schedules_delete_auth" ON default_schedules
  FOR DELETE USING (auth.role() = 'authenticated');

-- DISABLED_SLOTS: semua bisa baca, admin bisa edit
CREATE POLICY "disabled_slots_select_all" ON disabled_slots
  FOR SELECT USING (true);

CREATE POLICY "disabled_slots_insert_auth" ON disabled_slots
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "disabled_slots_update_auth" ON disabled_slots
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "disabled_slots_delete_auth" ON disabled_slots
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_day_schedules_date ON day_schedules(date);
CREATE INDEX IF NOT EXISTS idx_disabled_slots_date ON disabled_slots(date);
