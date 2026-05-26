'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react'
import { Booking } from '@/lib/types'

export default function DashboardView() {
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({ today: 0, pending: 0, confirmed: 0, done: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()
    const today = format(new Date(), 'yyyy-MM-dd')

    // Get today's bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, service:services(*)')
      .eq('booking_date', today)
      .order('booking_time', { ascending: true })

    if (bookings) {
      setTodayBookings(bookings)
      setStats({
        today: bookings.length,
        pending: bookings.filter((b) => b.status === 'pending').length,
        confirmed: bookings.filter((b) => b.status === 'confirmed').length,
        done: bookings.filter((b) => b.status === 'done').length,
      })
    }

    setLoading(false)
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    confirmed: 'text-green-400 bg-green-400/10',
    done: 'text-blue-400 bg-blue-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
    rejected: 'text-red-400 bg-red-400/10',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8 capitalize">
        {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
          <Calendar className="w-6 h-6 text-[#C9A96E] mb-3" />
          <p className="text-2xl font-bold">{stats.today}</p>
          <p className="text-gray-400 text-sm">Booking Hari Ini</p>
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

      {/* Today's Bookings */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Booking Hari Ini</h2>
        {todayBookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada booking hari ini</p>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-[#111111] rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-[#C9A96E] font-bold text-lg">{booking.booking_time}</p>
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
