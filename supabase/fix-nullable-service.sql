-- Fix: Pastikan service_id bisa NULL (untuk fallback jika RLS block)
ALTER TABLE bookings ALTER COLUMN service_id DROP NOT NULL;

-- Disable RLS (solusi paling simpel untuk single-admin barbershop)
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE day_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE default_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE disabled_slots DISABLE ROW LEVEL SECURITY;

-- Pastikan data services ada
INSERT INTO services (code, name, description, duration_minutes, price, is_active) VALUES
  ('SVC-01', 'Haircut (Potong)', 'Potong rambut standar oleh Abi', 60, 50000, true),
  ('SVC-02', 'Haircut + Cuci Rambut', 'Potong rambut dilanjutkan keramas', 75, 70000, true),
  ('SVC-03', 'Pewarnaan Rambut', 'Cat rambut sesuai permintaan pelanggan', 120, 150000, true),
  ('SVC-04', 'Jenggot / Beard Trim', 'Trim dan rapikan jenggot', 30, 35000, true),
  ('SVC-05', 'Hairstyle / Styling', 'Penataan rambut sesuai gaya yang diinginkan', 60, 75000, true)
ON CONFLICT (code) DO NOTHING;
