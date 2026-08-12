'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, addWeeks, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { id } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, Users, CheckCircle, Filter, ListChecks } from 'lucide-react'
import { Booking } from '@/lib/types'

type DateFilter = 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'thisMonth' | 'all' | 'custom'

const DATE_PRESETS: { value: DateFilter; label: string }[] = [
  { value: 'today', label: 'Hari Ini' },
  { value: 'tomorrow', label: 'Besok' },
  { value: 'thisWeek', label: 'Minggu Ini' },
  { value: 'nextWeek', label: 'Minggu Depan' },
  { value: 'thisMonth', label: 'Bulan Ini' },
  { value: 'all', label: 'Semua' },
]

function getPresetRange(filter: DateFilter): { from: Date | null; to: Date | null } {
  const now = new Date()
  switch (filter) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) }
    case 'tomorrow':
      return { from: startOfDay(addDays(now, 1)), to: endOfDay(addDays(now, 1)) }
    case 'thisWeek':
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'nextWeek':
      return {
        from: startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }),
        to: endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }),
      }
    case 'thisMonth':
      return { from: startOfMonth(now), to: endOfMonth(now) }
    case 'all':
    default:
      return { from: null, to: null }
  }
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  confirmed: 'text-green-400 bg-green-400/10',
  done: 'text-blue-400 bg-blue-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
  rejected: 'text-red-400 bg-red-400/10',
}

export default function DashboardView() {
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => {
    fetchAllBookings()
  }, [])

  const fetchAllBookings = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(*)')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true })

    setAllBookings(data || [])
    setLoading(false)
  }

  const dateRange = useMemo(() => {
    if (dateFilter === 'custom') {
      const from = customFrom ? startOfDay(new Date(customFrom)) : null
      const to = customTo ? endOfDay(new Date(customTo)) : null
      return { from, to }
    }
    return getPresetRange(dateFilter)
  }, [dateFilter, customFrom, customTo])

  const filteredBookings = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return allBookings
    return allBookings.filter((b) => {
      const d = new Date(b.booking_date)
      return isWithinInterval(d, { start: dateRange.from!, end: dateRange.to! })
    })
  }, [allBookings, dateRange])

  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todaysCount = allBookings.filter((b) => b.booking_date === today).length
    return {
      today: todaysCount,
      total: filteredBookings.length,
      pending: filteredBookings.filter((b) => b.status === 'pending').length,
      confirmed: filteredBookings.filter((b) => b.status === 'confirmed').length,
      done: filteredBookings.filter((b) => b.status === 'done').length,
      cancelled: filteredBookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected').length,
    }
  }, [filteredBookings, allBookings])

  const dateRangeLabel = useMemo(() => {
    if (dateFilter === 'all') return 'Semua waktu'
    if (dateFilter === 'today') return format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })
    if (dateFilter === 'tomorrow') return format(addDays(new Date(), 1), 'EEEE, d MMMM yyyy', { locale: id })
    if (dateFilter === 'thisWeek' && dateRange.from && dateRange.to)
      return `${format(dateRange.from, 'd MMM', { locale: id })} - ${format(dateRange.to, 'd MMM yyyy', { locale: id })}`
    if (dateFilter === 'nextWeek' && dateRange.from && dateRange.to)
      return `${format(dateRange.from, 'd MMM', { locale: id })} - ${format(dateRange.to, 'd MMM yyyy', { locale: id })}`
    if (dateFilter === 'thisMonth') return format(new Date(), 'MMMM yyyy', { locale: id })
    if (dateFilter === 'custom' && customFrom && customTo)
      return `${format(new Date(customFrom), 'd MMM', { locale: id })} - ${format(new Date(customTo), 'd MMM yyyy', { locale: id })}`
    return ''
  }, [dateFilter, dateRange, customFrom, customTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-xs px-3 py-1 rounded-full bg-[#C9A96E]/10 text-[#C9A96E] font-medium capitalize">
          {dateRangeLabel}
        </span>
      </div>
      <p className="text-gray-400 mb-6">
        Ringkasan booking berdasarkan filter waktu
      </p>

      {/* Date Filter Presets */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[#C9A96E]" />
          <span className="text-sm font-medium text-gray-300">Filter Waktu</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setDateFilter(preset.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                dateFilter === preset.value
                  ? 'bg-[#C9A96E] text-black'
                  : 'bg-[#0a0a0a] text-gray-400 border border-[#2a2a2a] hover:border-[#C9A96E] hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setDateFilter('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              dateFilter === 'custom'
                ? 'bg-[#C9A96E] text-black'
                : 'bg-[#0a0a0a] text-gray-400 border border-[#2a2a2a] hover:border-[#C9A96E] hover:text-white'
            }`}
          >
            <Filter className="w-3 h-3" />
            Custom
          </button>
        </div>

        {dateFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Dari</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Sampai</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards - all follow the time filter */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <ListChecks className="w-6 h-6 text-[#C9A96E] mb-3" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-gray-400 text-sm">Total Booking</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <Calendar className="w-6 h-6 text-cyan-400 mb-3" />
          <p className="text-2xl font-bold">{stats.today}</p>
          <p className="text-gray-400 text-sm">Hari Ini</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <Clock className="w-6 h-6 text-yellow-400 mb-3" />
          <p className="text-2xl font-bold">{stats.pending}</p>
          <p className="text-gray-400 text-sm">Menunggu</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <Users className="w-6 h-6 text-green-400 mb-3" />
          <p className="text-2xl font-bold">{stats.confirmed}</p>
          <p className="text-gray-400 text-sm">Dikonfirmasi</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <CheckCircle className="w-6 h-6 text-blue-400 mb-3" />
          <p className="text-2xl font-bold">{stats.done}</p>
          <p className="text-gray-400 text-sm">Selesai</p>
        </div>
      </div>

      {/* Filtered Bookings List */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Daftar Booking</h2>
          <span className="text-xs text-gray-500">
            {filteredBookings.length} item
          </span>
        </div>
        {filteredBookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Tidak ada booking pada rentang waktu ini
          </p>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-[#111111] rounded-xl flex-wrap gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <p className="text-[#C9A96E] font-bold text-lg">{booking.booking_time}</p>
                    <p className="text-gray-500 text-[10px] capitalize">
                      {format(new Date(booking.booking_date), 'd MMM', { locale: id })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-white">{booking.customer_name}</p>
                    <p className="text-gray-400 text-sm">{booking.service?.name}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    STATUS_COLORS[booking.status] || ''
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
