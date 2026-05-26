import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: booking } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', id)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 })
  }

  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    return NextResponse.json({ error: 'Booking tidak dapat dibatalkan' }, { status: 400 })
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
