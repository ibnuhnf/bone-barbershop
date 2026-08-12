'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { Download, Loader2 } from 'lucide-react'
import InvoiceDocument from './InvoiceDocument'

interface InvoiceDownloadButtonProps {
  booking: {
    bookingCode: string
    customerName: string
    customerPhone: string
    customerNotes?: string
    serviceName: string
    servicePrice: number
    bookingDate: string
    bookingTime: string
  }
}

export default function InvoiceDownloadButton({ booking }: InvoiceDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const doc = <InvoiceDocument {...booking} />
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice-BONE-${booking.bookingCode}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Gagal membuat PDF. Silakan coba lagi.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center justify-center gap-2 bg-[#C9A96E] text-black py-3 rounded-xl font-bold hover:bg-[#b8954f] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          <span>Download Invoice PDF</span>
        </>
      )}
    </button>
  )
}
