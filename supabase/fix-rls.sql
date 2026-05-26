-- ============================================
-- FIX: RLS Policies untuk BONE Barbershop
-- Jalankan ini di Supabase SQL Editor
-- ============================================

-- Hapus policy lama yang bermasalah
DROP POLICY IF EXISTS "Services are editable by authenticated users" ON services;
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can view bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;
DROP POLICY IF EXISTS "Day schedules are viewable by everyone" ON day_schedules;
DROP POLICY IF EXISTS "Day schedules are editable by authenticated users" ON day_schedules;
DROP POLICY IF EXISTS "Default schedules are viewable by everyone" ON default_schedules;
DROP POLICY IF EXISTS "Default schedules are editable by authenticated users" ON default_schedules;
DROP POLICY IF EXISTS "Disabled slots are viewable by everyone" ON disabled_slots;
DROP POLICY IF EXISTS "Disabled slots are editable by authenticated users" ON disabled_slots;

-- ============================================
-- SERVICES: semua bisa baca, admin bisa edit
-- ============================================
CREATE POLICY "services_select_all" ON services
  FOR SELECT USING (true);

CREATE POLICY "services_insert_auth" ON services
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "services_update_auth" ON services
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "services_delete_auth" ON services
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- BOOKINGS: semua bisa buat & baca, admin bisa update
-- ============================================
CREATE POLICY "bookings_select_all" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "bookings_insert_all" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "bookings_update_all" ON bookings
  FOR UPDATE USING (true);

CREATE POLICY "bookings_delete_auth" ON bookings
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- DAY_SCHEDULES: semua bisa baca, admin bisa edit
-- ============================================
CREATE POLICY "day_schedules_select_all" ON day_schedules
  FOR SELECT USING (true);

CREATE POLICY "day_schedules_insert_auth" ON day_schedules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "day_schedules_update_auth" ON day_schedules
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "day_schedules_delete_auth" ON day_schedules
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- DEFAULT_SCHEDULES: semua bisa baca, admin bisa edit
-- ============================================
CREATE POLICY "default_schedules_select_all" ON default_schedules
  FOR SELECT USING (true);

CREATE POLICY "default_schedules_insert_auth" ON default_schedules
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "default_schedules_update_auth" ON default_schedules
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "default_schedules_delete_auth" ON default_schedules
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- DISABLED_SLOTS: semua bisa baca, admin bisa edit
-- ============================================
CREATE POLICY "disabled_slots_select_all" ON disabled_slots
  FOR SELECT USING (true);

CREATE POLICY "disabled_slots_insert_auth" ON disabled_slots
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "disabled_slots_update_auth" ON disabled_slots
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "disabled_slots_delete_auth" ON disabled_slots
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Pastikan seed data services ada
-- ============================================
INSERT INTO services (code, name, description, duration_minutes, price) VALUES
  ('SVC-01', 'Haircut (Potong)', 'Potong rambut standar oleh Abi', 60, 50000),
  ('SVC-02', 'Haircut + Cuci Rambut', 'Potong rambut dilanjutkan keramas', 75, 70000),
  ('SVC-03', 'Pewarnaan Rambut', 'Cat rambut sesuai permintaan pelanggan', 120, 150000),
  ('SVC-04', 'Jenggot / Beard Trim', 'Trim dan rapikan jenggot', 30, 35000),
  ('SVC-05', 'Hairstyle / Styling', 'Penataan rambut sesuai gaya yang diinginkan', 60, 75000)
ON CONFLICT (code) DO NOTHING;
