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
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id')
    .eq('booking_date', date)
    .eq('booking_time', time)
    .in('status', ['pending', 'confirmed'])
    .single()

  if (existingBooking) {
    return NextResponse.json({ error: 'Slot waktu ini sudah terisi' }, { status: 409 })
  }

  // Get service by code
  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('code', serviceId)
    .single()

  if (!service) {
    return NextResponse.json({ error: 'Layanan tidak ditemukan' }, { status: 404 })
  }

  // Generate unique booking code
  let bookingCode = generateBookingCode()
  let codeExists = true
  while (codeExists) {
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_code', bookingCode)
      .single()
    if (!existing) {
      codeExists = false
    } else {
      bookingCode = generateBookingCode()
    }
  }

  // Create booking
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      booking_code: bookingCode,
      service_id: service.id,
      booking_date: date,
      booking_time: time,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_notes: customerNotes || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ...data, booking_code: bookingCode }, { status: 201 })
}
