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
  try {
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

    // Try to get service by code
    const { data: serviceByCode, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('code', serviceId)
      .maybeSingle()

    const bookingServiceId = serviceByCode?.id || null

    // If service lookup failed due to RLS or missing table, log but continue
    if (serviceError) {
      console.error('Service lookup error:', serviceError.message)
    }

    // Generate unique booking code
    const bookingCode = generateBookingCode()

    // Create booking - service_id is optional
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
      console.error('Booking insert error:', error)
      return NextResponse.json({ error: error.message, detail: error }, { status: 500 })
    }

    return NextResponse.json({ ...data, booking_code: bookingCode }, { status: 201 })
  } catch (err: unknown) {
    console.error('Unexpected error in POST /api/bookings:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
