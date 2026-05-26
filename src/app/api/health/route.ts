import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test connection
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1)

    return NextResponse.json({
      status: 'ok',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'NOT SET',
      supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'NOT SET',
      services: {
        count: services?.length || 0,
        error: servicesError?.message || null,
        data: services,
      },
      bookings: {
        error: bookingsError?.message || null,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}
