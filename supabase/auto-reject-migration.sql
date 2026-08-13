-- ============================================
-- AUTO-REJECT PENDING BOOKINGS AFTER 30 MINUTES
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Tambah kolom pending_expires_at
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS pending_expires_at TIMESTAMPTZ;

-- 2. Buat function auto-reject
CREATE OR REPLACE FUNCTION auto_reject_expired_pending()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bookings
  SET
    status = 'rejected',
    customer_notes = COALESCE(customer_notes || ' | ', '') ||
      'Otomatis dibatalkan: slot tidak dikonfirmasi admin dalam 30 menit.'
  WHERE
    status = 'pending'
    AND pending_expires_at IS NOT NULL
    AND pending_expires_at < NOW();
END;
$$;

-- 3. Aktifkan pg_cron (jalan tiap 5 menit)
-- Jalankan ini SEKALI di Supabase SQL Editor:
SELECT cron.schedule(
  'auto-reject-pending',
  '*/5 * * * *',
  $$ SELECT auto_reject_expired_pending() $$
);

-- ============================================
-- VERIFIKASI
-- ============================================

-- Cek apakah cron sudah aktif:
-- SELECT cron.jobid, cron.schedule, cron.command, cron.active
-- FROM cron.job;

-- Manual test (jalankan function manually):
-- SELECT auto_reject_expired_pending();

-- Lihat booking yang akan expire:
-- SELECT id, booking_code, customer_name, status, pending_expires_at,
--        (pending_expires_at < NOW()) as is_expired
-- FROM bookings
-- WHERE status = 'pending'
-- ORDER BY pending_expires_at ASC;
