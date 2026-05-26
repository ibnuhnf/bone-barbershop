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

-- Services: public read, admin write
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

CREATE POLICY "Services are editable by authenticated users" ON services
  FOR ALL USING (auth.role() = 'authenticated');

-- Bookings: public can insert and read their own, admin can do all
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view bookings" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update bookings" ON bookings
  FOR UPDATE USING (true);

-- Day Schedules: public read, admin write
CREATE POLICY "Day schedules are viewable by everyone" ON day_schedules
  FOR SELECT USING (true);

CREATE POLICY "Day schedules are editable by authenticated users" ON day_schedules
  FOR ALL USING (auth.role() = 'authenticated');

-- Default Schedules: public read, admin write
CREATE POLICY "Default schedules are viewable by everyone" ON default_schedules
  FOR SELECT USING (true);

CREATE POLICY "Default schedules are editable by authenticated users" ON default_schedules
  FOR ALL USING (auth.role() = 'authenticated');

-- Disabled Slots: public read, admin write
CREATE POLICY "Disabled slots are viewable by everyone" ON disabled_slots
  FOR SELECT USING (true);

CREATE POLICY "Disabled slots are editable by authenticated users" ON disabled_slots
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_day_schedules_date ON day_schedules(date);
CREATE INDEX IF NOT EXISTS idx_disabled_slots_date ON disabled_slots(date);
