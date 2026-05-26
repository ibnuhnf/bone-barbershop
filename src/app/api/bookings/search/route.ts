import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Kode booking diperlukan' }, { status: 400 })
  }

  // Search by booking code or phone number
  const { data, error } = await supabase
    .from('bookings')
    .select('*, service:services(*)')
    .or(`booking_code.ilike.%${code}%,customer_phone.ilike.%${code}%`)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
