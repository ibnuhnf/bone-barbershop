'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, addDays } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Clock, MessageCircle, Ban, CheckCircle2, RefreshCw } from 'lucide-react'
import { generateTimeSlots } from '@/lib/constants'
import { Booking } from '@/lib/types'
import { toWaLink } from '@/lib/phone'
import { buildAdminWaMessage } from '@/lib/wa-templates'

interface DayData {
  date: string
  is_open: boolean
  custom_slots?: string[]
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: 'Menunggu', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  confirmed: { label: 'Dikonfirmasi', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  done: { label: 'Selesai', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  cancelled: { label: 'Dibatalkan', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  rejected: { label: 'Ditolak', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
}

export default function ScheduleView() {
  const [activeTab, setActiveTab] = useState<'today_grid' | 'monthly_setting'>('today_grid')

  // --- Today Grid State ---
  const [targetDate, setTargetDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [todayDisabledSlots, setTodayDisabledSlots] = useState<string[]>([])
  const [todayIsClosed, setTodayIsClosed] = useState<boolean>(false)
  const [gridLoading, setGridLoading] = useState(true)

  // --- Monthly Setting State ---
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dayData, setDayData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDaySlots, setSelectedDaySlots] = useState<string[]>([])
  const [disabledSlots, setDisabledSlots] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // --- Fetch Today Grid Data ---
  const fetchTodayGrid = useCallback(async (dateStr: string) => {
    setGridLoading(true)
    const supabase = createClient()

    // 1. Fetch bookings for target date
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, service:services(*)')
      .eq('booking_date', dateStr)
      .order('booking_time', { ascending: true })

    // 2. Fetch disabled slots
    const { data: disabled } = await supabase
      .from('disabled_slots')
      .select('time')
      .eq('date', dateStr)

    // 3. Fetch day_schedules to check if whole day is closed
    const { data: daySched } = await supabase
      .from('day_schedules')
      .select('is_open')
      .eq('date', dateStr)
      .maybeSingle()

    setTodayBookings(bookings || [])
    setTodayDisabledSlots(disabled?.map((d) => d.time) || [])
    setTodayIsClosed(daySched ? !daySched.is_open : false)
    setGridLoading(false)
  }, [])

  useEffect(() => {
    if (activeTab === 'today_grid') {
      fetchTodayGrid(targetDate)
    }
  }, [activeTab, targetDate, fetchTodayGrid])

  // --- Fetch Monthly Schedule ---
  const fetchSchedule = useCallback(async () => {
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
  }, [currentMonth])

  useEffect(() => {
    if (activeTab === 'monthly_setting') {
      fetchSchedule()
    }
  }, [activeTab, fetchSchedule])

  // Quick toggle slot disabled from Today Grid
  const toggleSlotToday = async (time: string) => {
    const supabase = createClient()
    const isDisabled = todayDisabledSlots.includes(time)

    if (isDisabled) {
      await supabase
        .from('disabled_slots')
        .delete()
        .eq('date', targetDate)
        .eq('time', time)

      setTodayDisabledSlots((prev) => prev.filter((t) => t !== time))
    } else {
      await supabase
        .from('disabled_slots')
        .insert({ date: targetDate, time })

      setTodayDisabledSlots((prev) => [...prev, time])
    }
  }

  // --- Monthly Handlers ---
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

    await supabase.from('disabled_slots').delete().eq('date', selectedDate)

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

  const allTimeSlots = generateTimeSlots()

  // Grid summary counts
  const gridStats = useMemo(() => {
    let empty = 0
    let booked = 0
    let disabled = 0

    allTimeSlots.forEach((time) => {
      const activeBooking = todayBookings.find(
        (b) => b.booking_time === time && (b.status === 'pending' || b.status === 'confirmed' || b.status === 'done')
      )
      if (activeBooking) {
        booked++
      } else if (todayDisabledSlots.includes(time) || todayIsClosed) {
        disabled++
      } else {
        empty++
      }
    })

    return { empty, booked, disabled, total: allTimeSlots.length }
  }, [allTimeSlots, todayBookings, todayDisabledSlots, todayIsClosed])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Manajemen Jadwal & Slot Waktu</h1>
      <p className="text-gray-400 mb-6">Atur hari operasional dan pantau keterisian slot jam secara real-time</p>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a] mb-6">
        <button
          onClick={() => setActiveTab('today_grid')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'today_grid'
              ? 'border-[#C9A96E] text-[#C9A96E]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Grid Jam Booking
        </button>
        <button
          onClick={() => setActiveTab('monthly_setting')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'monthly_setting'
              ? 'border-[#C9A96E] text-[#C9A96E]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Pengaturan Hari Bulanan
        </button>
      </div>

      {/* TAB 1: TODAY TIME GRID */}
      {activeTab === 'today_grid' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-300">Pilih Tanggal:</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#C9A96E]"
              />
              <button
                onClick={() => setTargetDate(format(new Date(), 'yyyy-MM-dd'))}
                className="px-3 py-1.5 bg-[#2a2a2a] text-xs font-medium rounded-lg text-gray-300 hover:bg-[#333333] hover:text-white transition-colors"
              >
                Hari Ini
              </button>
              <button
                onClick={() => setTargetDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'))}
                className="px-3 py-1.5 bg-[#2a2a2a] text-xs font-medium rounded-lg text-gray-300 hover:bg-[#333333] hover:text-white transition-colors"
              >
                Besok
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {gridStats.empty} Kosong
              </span>
              <span className="flex items-center gap-1.5 text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {gridStats.booked} Terisi
              </span>
              <span className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {gridStats.disabled} Nonaktif
              </span>
              <button
                onClick={() => fetchTodayGrid(targetDate)}
                className="p-1.5 text-gray-400 hover:text-[#C9A96E] transition-colors"
                title="Refresh Grid"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day Status Banner */}
          {todayIsClosed && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-center gap-2">
              <Ban className="w-5 h-5 shrink-0" />
              <span>
                <strong>Toko Tutup/Libur:</strong> Tanggal {format(new Date(targetDate), 'd MMMM yyyy', { locale: localeId })} ditandai sebagai hari libur di jadwal bulanan.
              </span>
            </div>
          )}

          {gridLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allTimeSlots.map((time) => {
                const booking = todayBookings.find(
                  (b) => b.booking_time === time && b.status !== 'cancelled' && b.status !== 'rejected'
                )
                const isDisabled = todayDisabledSlots.includes(time) || todayIsClosed

                if (booking) {
                  const badge = STATUS_BADGES[booking.status] || STATUS_BADGES.pending
                  const adminMsg = buildAdminWaMessage({
                    booking_code: booking.booking_code,
                    customer_name: booking.customer_name,
                    booking_date: format(new Date(booking.booking_date), 'd MMMM yyyy', { locale: localeId }),
                    booking_time: booking.booking_time,
                    service_name: booking.service?.name,
                    status: booking.status,
                  })
                  const waLink = toWaLink(booking.customer_phone, adminMsg)

                  return (
                    <div
                      key={time}
                      className={`bg-[#1a1a1a] border ${badge.border} rounded-xl p-4 flex flex-col justify-between relative overflow-hidden`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#C9A96E] font-bold text-lg">{time}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="font-semibold text-white text-sm line-clamp-1">{booking.customer_name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{booking.service?.name || 'Layanan'}</p>
                        <p className="text-gray-500 text-xs font-mono mt-1">{booking.booking_code}</p>
                      </div>

                      <div className="pt-2 border-t border-[#2a2a2a] flex items-center justify-between">
                        <span className="text-xs text-gray-400">{booking.customer_phone}</span>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                          title="Chat WA Customer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )
                }

                if (isDisabled) {
                  return (
                    <div
                      key={time}
                      className="bg-[#141414] border border-red-500/20 rounded-xl p-4 flex flex-col justify-between opacity-75"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 font-bold text-lg">{time}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          Nonaktif
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs my-2">Slot ini ditutup</p>
                      <button
                        onClick={() => toggleSlotToday(time)}
                        className="text-xs text-gray-400 hover:text-green-400 underline self-start transition-colors mt-2"
                      >
                        Buka Slot
                      </button>
                    </div>
                  )
                }

                return (
                  <div
                    key={time}
                    className="bg-[#1a1a1a] border border-green-500/20 hover:border-green-500/50 rounded-xl p-4 flex flex-col justify-between transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-400 font-bold text-lg">{time}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Kosong
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs my-2">Siap di-booking</p>
                    <button
                      onClick={() => toggleSlotToday(time)}
                      className="text-xs text-gray-500 hover:text-red-400 underline self-start transition-colors mt-2"
                    >
                      Tutup Slot Ini
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MONTHLY SETTING */}
      {activeTab === 'monthly_setting' && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
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
      )}

      {/* Slot Editor Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Edit Slot Waktu</h3>
            <p className="text-gray-400 text-sm mb-6 capitalize">
              {format(new Date(selectedDate), 'EEEE, d MMMM yyyy', { locale: localeId })}
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
