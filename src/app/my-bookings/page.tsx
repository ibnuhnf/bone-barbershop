'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Calendar, Clock, Scissors, XCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Booking } from '@/lib/types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Menunggu', color: 'text-yellow-400 bg-yellow-400/10' },
  confirmed: { label: 'Dikonfirmasi', color: 'text-green-400 bg-green-400/10' },
  done: { label: 'Selesai', color: 'text-blue-400 bg-blue-400/10' },
  cancelled: { label: 'Dibatalkan', color: 'text-red-400 bg-red-400/10' },
  rejected: { label: 'Ditolak', color: 'text-red-400 bg-red-400/10' },
}

export default function MyBookingsPage() {
  const [searchCode, setSearchCode] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const searchBookings = async () => {
    if (!searchCode.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/bookings/search?code=${encodeURIComponent(searchCode.trim())}`)
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : data.bookings || [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return
    setCancellingId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH' })
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
        )
      } else {
        alert('Gagal membatalkan booking')
      }
    } catch {
      alert('Terjadi kesalahan')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-[#C9A96E] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Kembali</span>
          </Link>
          <span className="text-lg font-bold tracking-wider">BONE</span>
          <div className="w-20" />
        </div>
      </div>

      <div className="pt-24 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">My Bookings</h1>
          <p className="text-gray-400 mb-8">Cari booking dengan kode booking atau nomor HP</p>

          {/* Search */}
          <div className="flex gap-3 mb-8">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchBookings()}
              placeholder="Masukkan kode booking atau nomor HP..."
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E] transition-colors"
            />
            <button
              onClick={searchBookings}
              disabled={loading}
              className="bg-[#C9A96E] text-black px-6 py-3 rounded-xl font-semibold hover:bg-[#b8954f] transition-colors disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searched && bookings.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Tidak ditemukan booking dengan kode tersebut</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[#C9A96E] font-bold text-sm tracking-wider">
                        {booking.booking_code}
                      </p>
                      <p className="text-white font-semibold mt-1">{booking.customer_name}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        STATUS_LABELS[booking.status]?.color || 'text-gray-400'
                      }`}
                    >
                      {STATUS_LABELS[booking.status]?.label || booking.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Scissors className="w-4 h-4 text-[#C9A96E]" />
                      <span>{booking.service?.name || booking.service_id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-[#C9A96E]" />
                      <span className="capitalize">
                        {format(new Date(booking.booking_date), 'EEEE, d MMMM yyyy', { locale: id })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-[#C9A96E]" />
                      <span>{booking.booking_time}</span>
                    </div>
                  </div>

                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="mt-4 flex items-center gap-2 text-red-400 text-sm hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === booking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Batalkan Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
