import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBookingCode } from '@/lib/constants'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*, service:services(*)')
    .order('booking_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { serviceId, date, time, customerName, customerPhone, customerNotes } = body

  // Validate required fields
  if (!serviceId || !date || !time || !customerName || !customerPhone) {
    return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
  }

  // Check if slot is still available
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('id')
    .eq('booking_date', date)
    .eq('booking_time', time)
    .in('status', ['pending', 'confirmed'])

  if (existingBookings && existingBookings.length > 0) {
    return NextResponse.json({ error: 'Slot waktu ini sudah terisi' }, { status: 409 })
  }

  // Try to get service by code first, then by id
  let serviceUUID: string | null = null

  const { data: serviceByCode } = await supabase
    .from('services')
    .select('id')
    .eq('code', serviceId)
    .maybeSingle()

  if (serviceByCode) {
    serviceUUID = serviceByCode.id
  } else {
    // Try direct UUID lookup
    const { data: serviceById } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .maybeSingle()

    if (serviceById) {
      serviceUUID = serviceById.id
    }
  }

  // If still no service found, create booking without service_id reference
  // This handles the case where RLS blocks the query or services table is empty
  let bookingServiceId = serviceUUID

  if (!bookingServiceId) {
    // Insert service on the fly if it doesn't exist (fallback)
    const serviceMap: Record<string, { name: string; description: string; duration: number; price: number }> = {
      'SVC-01': { name: 'Haircut (Potong)', description: 'Potong rambut standar oleh Abi', duration: 60, price: 50000 },
      'SVC-02': { name: 'Haircut + Cuci Rambut', description: 'Potong rambut dilanjutkan keramas', duration: 75, price: 70000 },
      'SVC-03': { name: 'Pewarnaan Rambut', description: 'Cat rambut sesuai permintaan pelanggan', duration: 120, price: 150000 },
      'SVC-04': { name: 'Jenggot / Beard Trim', description: 'Trim dan rapikan jenggot', duration: 30, price: 35000 },
      'SVC-05': { name: 'Hairstyle / Styling', description: 'Penataan rambut sesuai gaya yang diinginkan', duration: 60, price: 75000 },
    }

    const svc = serviceMap[serviceId]
    if (svc) {
      const { data: newService } = await supabase
        .from('services')
        .upsert(
          { code: serviceId, name: svc.name, description: svc.description, duration_minutes: svc.duration, price: svc.price, is_active: true },
          { onConflict: 'code' }
        )
        .select('id')
        .maybeSingle()

      bookingServiceId = newService?.id || null
    }
  }

  // Generate unique booking code
  let bookingCode = generateBookingCode()
  // Simple retry for uniqueness (max 5 attempts)
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_code', bookingCode)
      .maybeSingle()
    if (!existing) break
    bookingCode = generateBookingCode()
  }

  // Create booking
  const insertData: Record<string, unknown> = {
    booking_code: bookingCode,
    booking_date: date,
    booking_time: time,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_notes: customerNotes || null,
    status: 'pending',
  }

  if (bookingServiceId) {
    insertData.service_id = bookingServiceId
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ...data, booking_code: bookingCode }, { status: 201 })
}
