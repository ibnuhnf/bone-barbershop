'use client'

import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Calendar, Clock, User, Phone, Scissors, MessageSquare, Loader2 } from 'lucide-react'

interface StepReviewProps {
  data: {
    serviceName: string
    servicePrice: number
    date: string
    time: string
    customerName: string
    customerPhone: string
    customerNotes: string
  }
  onSubmit: () => void
  isSubmitting: boolean
}

export default function StepReview({ data, onSubmit, isSubmitting }: StepReviewProps) {
  const formattedDate = data.date
    ? format(new Date(data.date), 'EEEE, d MMMM yyyy', { locale: id })
    : ''

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Review Booking</h2>
      <p className="text-gray-400 mb-8">Pastikan semua data sudah benar sebelum konfirmasi</p>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-3">
          <Scissors className="w-5 h-5 text-[#C9A96E] mt-0.5" />
          <div>
            <p className="text-sm text-gray-400">Layanan</p>
            <p className="font-semibold text-white">{data.serviceName}</p>
            <p className="text-[#C9A96E] text-sm font-medium">
              Rp {data.servicePrice.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a]" />

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[#C9A96E] mt-0.5" />
          <div>
            <p className="text-sm text-gray-400">Tanggal</p>
            <p className="font-semibold text-white capitalize">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#C9A96E] mt-0.5" />
          <div>
            <p className="text-sm text-gray-400">Waktu</p>
            <p className="font-semibold text-white">{data.time}</p>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a]" />

        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-[#C9A96E] mt-0.5" />
          <div>
            <p className="text-sm text-gray-400">Nama</p>
            <p className="font-semibold text-white">{data.customerName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-[#C9A96E] mt-0.5" />
          <div>
            <p className="text-sm text-gray-400">Nomor HP</p>
            <p className="font-semibold text-white">{data.customerPhone}</p>
          </div>
        </div>

        {data.customerNotes && (
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-[#C9A96E] mt-0.5" />
            <div>
              <p className="text-sm text-gray-400">Catatan</p>
              <p className="font-semibold text-white">{data.customerNotes}</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full mt-6 bg-[#C9A96E] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#b8954f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Memproses...
          </>
        ) : (
          'Konfirmasi Booking'
        )}
      </button>
    </div>
  )
}
