import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDay } from 'date-fns'
import { generateTimeSlots, DEFAULT_OPEN_TIME, DEFAULT_CLOSE_TIME } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Date required' }, { status: 400 })
  }

  const dayOfWeek = getDay(new Date(date))

  // Check if day is open
  const { data: customDay } = await supabase
    .from('day_schedules')
    .select('*')
    .eq('date', date)
    .single()

  if (customDay && !customDay.is_open) {
    return NextResponse.json([])
  }

  // Get default schedule for this day of week
  const { data: defaultSchedule } = await supabase
    .from('default_schedules')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .single()

  if (defaultSchedule && !defaultSchedule.is_open) {
    return NextResponse.json([])
  }

  // Determine time slots
  let slots: string[]

  if (customDay?.custom_slots && customDay.custom_slots.length > 0) {
    slots = customDay.custom_slots
  } else {
    const openTime = defaultSchedule?.open_time || DEFAULT_OPEN_TIME
    const closeTime = defaultSchedule?.close_time || DEFAULT_CLOSE_TIME
    slots = generateTimeSlots(openTime, closeTime)
  }

  // Get disabled slots for this date
  const { data: disabledSlots } = await supabase
    .from('disabled_slots')
    .select('time')
    .eq('date', date)

  const disabledTimes = disabledSlots?.map((s) => s.time) || []

  // Get existing bookings for this date
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('booking_time')
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed'])

  const bookedTimes = existingBookings?.map((b) => b.booking_time) || []

  // Build slot availability
  const result = slots.map((time) => ({
    time,
    available: !disabledTimes.includes(time) && !bookedTimes.includes(time),
  }))

  return NextResponse.json(result)
}
