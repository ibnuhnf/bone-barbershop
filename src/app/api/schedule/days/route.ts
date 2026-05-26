import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { eachDayOfInterval, format, getDay } from 'date-fns'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'Start and end dates required' }, { status: 400 })
  }

  // Get custom day schedules
  const { data: customDays } = await supabase
    .from('day_schedules')
    .select('*')
    .gte('date', start)
    .lte('date', end)

  // Get default schedules
  const { data: defaults } = await supabase
    .from('default_schedules')
    .select('*')

  // Generate day statuses for the range
  const days = eachDayOfInterval({
    start: new Date(start),
    end: new Date(end),
  })

  const result = days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const customDay = customDays?.find((d) => d.date === dateStr)

    if (customDay) {
      return { date: dateStr, is_open: customDay.is_open }
    }

    // Use default schedule
    const dayOfWeek = getDay(day)
    const defaultSchedule = defaults?.find((d) => d.day_of_week === dayOfWeek)

    if (defaultSchedule) {
      return { date: dateStr, is_open: defaultSchedule.is_open }
    }

    // Default: open Mon-Sat, closed Sunday
    return { date: dateStr, is_open: dayOfWeek !== 0 }
  })

  return NextResponse.json(result)
}
