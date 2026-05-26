'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay } from 'date-fns'
import { id } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { generateTimeSlots } from '@/lib/constants'

interface DayData {
  date: string
  is_open: boolean
  custom_slots?: string[]
}

export default function ScheduleView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dayData, setDayData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDaySlots, setSelectedDaySlots] = useState<string[]>([])
  const [disabledSlots, setDisabledSlots] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSchedule()
  }, [currentMonth])

  const fetchSchedule = async () => {
    setLoading(true)
    const supabase = createClient()
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

    const { data } = await supabase
      .from('day_schedules')
      .select('*')
      .gte('date', start)
      .lte('date', end)

    setDayData(data || [])
    setLoading(false)
  }

  const toggleDay = async (date: string) => {
    const supabase = createClient()
    const existing = dayData.find((d) => d.date === date)

    if (existing) {
      await supabase
        .from('day_schedules')
        .update({ is_open: !existing.is_open })
        .eq('date', date)

      setDayData((prev) =>
        prev.map((d) => (d.date === date ? { ...d, is_open: !d.is_open } : d))
      )
    } else {
      await supabase
        .from('day_schedules')
        .insert({ date, is_open: false })

      setDayData((prev) => [...prev, { date, is_open: false }])
    }
  }

  const openSlotEditor = async (date: string) => {
    setSelectedDate(date)
    const allSlots = generateTimeSlots()
    setSelectedDaySlots(allSlots)

    const supabase = createClient()
    const { data } = await supabase
      .from('disabled_slots')
      .select('time')
      .eq('date', date)

    setDisabledSlots(data?.map((s) => s.time) || [])
  }

  const toggleSlot = (time: string) => {
    setDisabledSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    )
  }

  const saveSlots = async () => {
    if (!selectedDate) return
    setSaving(true)
    const supabase = createClient()

    // Delete existing disabled slots for this date
    await supabase.from('disabled_slots').delete().eq('date', selectedDate)

    // Insert new disabled slots
    if (disabledSlots.length > 0) {
      await supabase.from('disabled_slots').insert(
        disabledSlots.map((time) => ({ date: selectedDate, time }))
      )
    }

    setSaving(false)
    setSelectedDate(null)
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const firstDayOfWeek = getDay(startOfMonth(currentMonth))

  const getDayStatus = (date: string): 'open' | 'closed' | 'default' => {
    const day = dayData.find((d) => d.date === date)
    if (day) return day.is_open ? 'open' : 'closed'
    return 'default'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Manajemen Jadwal</h1>
      <p className="text-gray-400 mb-8">Atur hari buka/tutup dan slot waktu</p>

      {/* Calendar */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const status = getDayStatus(dateStr)

                return (
                  <div
                    key={dateStr}
                    className="aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer hover:ring-1 hover:ring-[#C9A96E] transition-all relative group"
                    style={{
                      backgroundColor:
                        status === 'closed'
                          ? '#2a1a1a'
                          : status === 'open'
                          ? '#1a2a1a'
                          : '#1a1a1a',
                    }}
                  >
                    <span className="text-sm font-medium">{format(day, 'd')}</span>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => toggleDay(dateStr)}
                        className={`w-2 h-2 rounded-full ${
                          status === 'closed' ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        title={status === 'closed' ? 'Tutup - klik untuk buka' : 'Buka - klik untuk tutup'}
                      />
                      <button
                        onClick={() => openSlotEditor(dateStr)}
                        className="w-2 h-2 rounded-full bg-[#C9A96E]"
                        title="Edit slot waktu"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#2a2a2a] flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-400">Buka</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-400">Tutup</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#C9A96E]" />
            <span className="text-xs text-gray-400">Edit Slot</span>
          </div>
        </div>
      </div>

      {/* Slot Editor Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Edit Slot Waktu</h3>
            <p className="text-gray-400 text-sm mb-6 capitalize">
              {format(new Date(selectedDate), 'EEEE, d MMMM yyyy', { locale: id })}
            </p>

            <p className="text-sm text-gray-400 mb-3">
              Klik slot untuk menonaktifkan/mengaktifkan:
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {selectedDaySlots.map((time) => (
                <button
                  key={time}
                  onClick={() => toggleSlot(time)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    disabledSlots.includes(time)
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'bg-green-500/20 text-green-400 border border-green-500/50'
                  }`}
                >
                  {time}
                  <p className="text-xs mt-1">
                    {disabledSlots.includes(time) ? 'Nonaktif' : 'Aktif'}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedDate(null)}
                className="flex-1 border border-[#2a2a2a] py-3 rounded-xl font-medium hover:border-gray-500 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveSlots}
                disabled={saving}
                className="flex-1 bg-[#C9A96E] text-black py-3 rounded-xl font-bold hover:bg-[#b8954f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
