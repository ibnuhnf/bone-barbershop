'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Search, Check, X, CheckCircle, Loader2 } from 'lucide-react'
import { Booking } from '@/lib/types'

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

export default function BookingsView() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer_phone.includes(searchQuery)
    return matchesStatus && matchesSearch
  })

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

      {/* Filters */}
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

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Tidak ada booking ditemukan</p>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
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
                      {format(new Date(booking.booking_date), 'd MMM yyyy', { locale: id })}
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
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
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
                  </div>
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
          ))
        )}
      </div>
    </div>
  )
}
