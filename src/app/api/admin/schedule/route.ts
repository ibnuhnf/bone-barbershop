import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { date, is_open, custom_slots } = body

  if (!date) {
    return NextResponse.json({ error: 'Date required' }, { status: 400 })
  }

  // Upsert day schedule
  const { error } = await supabase
    .from('day_schedules')
    .upsert(
      { date, is_open, custom_slots },
      { onConflict: 'date' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
