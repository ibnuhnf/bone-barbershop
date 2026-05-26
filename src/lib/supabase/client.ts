import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '')
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}
