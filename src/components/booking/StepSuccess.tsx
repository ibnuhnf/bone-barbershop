'use client'

import Link from 'next/link'
import { CheckCircle, Copy } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useState } from 'react'

interface StepSuccessProps {
  bookingCode: string
  bookingData: {
    serviceName: string
    date: string
    time: string
    customerName: string
  }
}

export default function StepSuccess({ bookingCode, bookingData }: StepSuccessProps) {
  const [copied, setCopied] = useState(false)

  const formattedDate = bookingData.date
    ? format(new Date(bookingData.date), 'EEEE, d MMMM yyyy', { locale: id })
    : ''

  const copyCode = () => {
    navigator.clipboard.writeText(bookingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Booking Berhasil!</h1>
        <p className="text-gray-400 mb-8">
          Terima kasih, {bookingData.customerName}. Booking kamu telah diterima.
        </p>

        {/* Booking Code */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-6">
          <p className="text-sm text-gray-400 mb-2">Kode Booking</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-bold text-[#C9A96E] tracking-wider">
              {bookingCode}
            </span>
            <button
              onClick={copyCode}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              title="Copy kode"
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          {copied && <p className="text-green-400 text-xs mt-2">Tersalin!</p>}
        </div>

        {/* Summary */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-8 text-left">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Layanan</span>
              <span className="font-medium">{bookingData.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tanggal</span>
              <span className="font-medium capitalize">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Waktu</span>
              <span className="font-medium">{bookingData.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-yellow-400 font-medium">Menunggu Konfirmasi</span>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          Simpan kode booking ini. Admin akan mengkonfirmasi booking kamu segera.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/my-bookings"
            className="bg-[#C9A96E] text-black py-3 rounded-xl font-bold hover:bg-[#b8954f] transition-colors"
          >
            Lihat My Bookings
          </Link>
          <Link
            href="/"
            className="border border-[#2a2a2a] text-white py-3 rounded-xl font-medium hover:border-[#C9A96E] transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  )
}
