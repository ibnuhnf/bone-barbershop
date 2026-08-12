'use client'

import Link from 'next/link'
import { CheckCircle, Copy, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useState } from 'react'
import InvoiceDownloadButton from './InvoiceDownloadButton.dynamic'
import { toWaLink } from '@/lib/phone'
import { buildCustomerWaMessage } from '@/lib/wa-templates'

interface StepSuccessProps {
  bookingCode: string
  bookingData: {
    serviceName: string
    servicePrice: number
    date: string
    time: string
    customerName: string
    customerPhone: string
    customerNotes?: string
  }
}

export default function StepSuccess({ bookingCode, bookingData }: StepSuccessProps) {
  const [copied, setCopied] = useState(false)

  const formattedDate = bookingData.date
    ? format(new Date(bookingData.date), 'EEEE, d MMMM yyyy', { locale: id })
    : ''

  const waMessage = buildCustomerWaMessage({
    booking_code: bookingCode,
    customer_name: bookingData.customerName,
    customer_phone: bookingData.customerPhone,
    customer_notes: bookingData.customerNotes,
    service_name: bookingData.serviceName,
    service_price: bookingData.servicePrice,
    booking_date: bookingData.date,
    booking_time: bookingData.time,
  })

  const waLink = toWaLink(bookingData.customerPhone, waMessage)

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

        {/* Next Steps Notice */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-6 text-left">
          <p className="text-sm font-semibold text-[#C9A96E] mb-3">Langkah Selanjutnya:</p>
          <ol className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="text-[#C9A96E] font-bold">1.</span>
              <span>Download Invoice PDF sebagai bukti booking Anda.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#C9A96E] font-bold">2.</span>
              <span>Kirimkan invoice ke WhatsApp Admin untuk konfirmasi.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#C9A96E] font-bold">3.</span>
              <span>Admin akan segera mengonfirmasi booking Anda.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#C9A96E] font-bold">4.</span>
              <span>Harap hadir 5-10 menit sebelum waktu booking.</span>
            </li>
          </ol>
        </div>

        {/* Action Buttons: PDF + WA + My Bookings + Home */}
        <div className="flex flex-col gap-3">
          {/* Row 1: PDF Download (Primary Action) */}
          <InvoiceDownloadButton
            booking={{
              bookingCode,
              customerName: bookingData.customerName,
              customerPhone: bookingData.customerPhone,
              customerNotes: bookingData.customerNotes,
              serviceName: bookingData.serviceName,
              servicePrice: bookingData.servicePrice,
              bookingDate: bookingData.date,
              bookingTime: bookingData.time,
            }}
          />

          {/* Row 2: Send to WhatsApp */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Kirim Invoice via WhatsApp</span>
          </a>

          {/* Row 3: My Bookings */}
          <Link
            href="/my-bookings"
            className="border border-[#2a2a2a] text-white py-3 rounded-xl font-medium hover:border-[#C9A96E] transition-colors text-center"
          >
            Lihat My Bookings
          </Link>

          {/* Row 4: Back to Home */}
          <Link
            href="/"
            className="text-gray-500 text-sm hover:text-[#C9A96E] transition-colors text-center py-2"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  )
}
