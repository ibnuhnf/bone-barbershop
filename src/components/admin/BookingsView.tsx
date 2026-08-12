'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, addWeeks, startOfMonth, endOfMonth, isWithinInterval, isSameDay } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { Search, Check, X, CheckCircle, Loader2, MessageCircle, Calendar, Filter } from 'lucide-react'
import { Booking } from '@/lib/types'
import { toWaLink } from '@/lib/phone'
import { buildAdminWaMessage } from '@/lib/wa-templates'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'done', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'rejected', label: 'Ditolak' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  confirmed: 'text-green-400 bg-green-400/10',
  done: 'text-blue-400 bg-blue-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
  rejected: 'text-red-400 bg-red-400/10',
}

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

export default function BookingsView() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from('bookings')
      .select('*, service:services(*)')
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: true })

    setBookings(data || [])
    setLoading(false)
  }

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId)
    const supabase = createClient()

    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)

    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: status as Booking['status'] } : b))
      )
    }
    setUpdatingId(null)
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
    return bookings.filter((b) => {
      // Status filter
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter

      // Date filter
      let matchesDate = true
      if (dateRange.from && dateRange.to) {
        const bookingDate = new Date(b.booking_date)
        matchesDate = isWithinInterval(bookingDate, {
          start: dateRange.from,
          end: dateRange.to,
        })
      } else if (dateFilter === 'today' && !dateRange.from) {
        matchesDate = isSameDay(new Date(b.booking_date), new Date())
      }

      // Search filter
      const matchesSearch =
        !searchQuery ||
        b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer_phone.includes(searchQuery)

      return matchesStatus && matchesDate && matchesSearch
    })
  }, [bookings, statusFilter, dateFilter, dateRange, searchQuery])

  const dateRangeLabel = useMemo(() => {
    if (dateFilter === 'all') return 'Semua waktu'
    if (dateFilter === 'custom' && customFrom && customTo) {
      return `${format(new Date(customFrom), 'd MMM', { locale: localeId })} - ${format(new Date(customTo), 'd MMM yyyy', { locale: localeId })}`
    }
    if (dateFilter === 'today') return format(new Date(), 'EEEE, d MMMM yyyy', { locale: localeId })
    if (dateFilter === 'tomorrow') return format(addDays(new Date(), 1), 'EEEE, d MMMM yyyy', { locale: localeId })
    if (dateFilter === 'thisWeek') return `${format(dateRange.from!, 'd MMM', { locale: localeId })} - ${format(dateRange.to!, 'd MMM yyyy', { locale: localeId })}`
    if (dateFilter === 'nextWeek') return `${format(dateRange.from!, 'd MMM', { locale: localeId })} - ${format(dateRange.to!, 'd MMM yyyy', { locale: localeId })}`
    if (dateFilter === 'thisMonth') return format(new Date(), 'MMMM yyyy', { locale: localeId })
    return ''
  }, [dateFilter, customFrom, customTo, dateRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Manajemen Booking</h1>
      <p className="text-gray-400 mb-8">Kelola semua booking pelanggan</p>

      {/* Date Filter Presets */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[#C9A96E]" />
          <span className="text-sm font-medium text-gray-300">Filter Waktu</span>
          <span className="text-xs text-gray-500 ml-auto capitalize">{dateRangeLabel}</span>
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

        {/* Custom date range */}
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

      {/* Status Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, kode, atau nomor HP..."
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E] transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A96E]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          Menampilkan <span className="text-[#C9A96E] font-semibold">{filteredBookings.length}</span> dari{' '}
          <span className="text-gray-300">{bookings.length}</span> bookings
        </p>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl py-16 text-center">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">Tidak ada booking ditemukan</p>
            <p className="text-gray-600 text-xs">Coba ubah filter atau rentang waktu</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
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
                key={booking.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-[#C9A96E] font-bold text-sm tracking-wider">
                        {booking.booking_code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[booking.status] || ''
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="font-medium text-white">{booking.customer_name}</p>
                    <p className="text-gray-400 text-sm">{booking.customer_phone}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                      <span>{booking.service?.name}</span>
                      <span>•</span>
                      <span className="capitalize">
                        {format(new Date(booking.booking_date), 'd MMM yyyy', { locale: localeId })}
                      </span>
                      <span>•</span>
                      <span>{booking.booking_time}</span>
                    </div>
                    {booking.customer_notes && (
                      <p className="text-gray-500 text-sm mt-2 italic">
                        &ldquo;{booking.customer_notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {/* WhatsApp Button - Always shown */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors"
                      title={`Chat WhatsApp ${booking.customer_name}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          disabled={updatingId === booking.id}
                          className="flex items-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
                        >
                          {updatingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Konfirmasi
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, 'rejected')}
                          disabled={updatingId === booking.id}
                          className="flex items-center gap-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Tolak
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'done')}
                        disabled={updatingId === booking.id}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                      >
                        {updatingId === booking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
