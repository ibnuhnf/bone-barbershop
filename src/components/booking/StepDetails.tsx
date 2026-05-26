'use client'

import { useState } from 'react'
import { User, Phone, MessageSquare } from 'lucide-react'

interface StepDetailsProps {
  data: {
    customerName: string
    customerPhone: string
    customerNotes: string
  }
  onUpdate: (data: Partial<{ customerName: string; customerPhone: string; customerNotes: string }>) => void
  onNext: () => void
}

export default function StepDetails({ data, onUpdate, onNext }: StepDetailsProps) {
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  const validateAndNext = () => {
    const newErrors: { name?: string; phone?: string } = {}

    if (!data.customerName.trim()) {
      newErrors.name = 'Nama wajib diisi'
    }

    if (!data.customerPhone.trim()) {
      newErrors.phone = 'Nomor HP wajib diisi'
    } else if (!/^(08|\+62)\d{8,13}$/.test(data.customerPhone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Format nomor HP tidak valid (contoh: 08xxxxxxxxxx)'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Data Diri</h2>
      <p className="text-gray-400 mb-8">Isi data diri untuk konfirmasi booking</p>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Nama Lengkap *
          </label>
          <input
            type="text"
            value={data.customerName}
            onChange={(e) => {
              onUpdate({ customerName: e.target.value })
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
            }}
            placeholder="Masukkan nama lengkap"
            className={`w-full bg-[#1a1a1a] border ${
              errors.name ? 'border-red-500' : 'border-[#2a2a2a]'
            } rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E] transition-colors`}
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Nomor HP (WhatsApp) *
          </label>
          <input
            type="tel"
            value={data.customerPhone}
            onChange={(e) => {
              onUpdate({ customerPhone: e.target.value })
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }))
            }}
            placeholder="08xxxxxxxxxx"
            className={`w-full bg-[#1a1a1a] border ${
              errors.phone ? 'border-red-500' : 'border-[#2a2a2a]'
            } rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E] transition-colors`}
          />
          {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Catatan (opsional)
          </label>
          <textarea
            value={data.customerNotes}
            onChange={(e) => onUpdate({ customerNotes: e.target.value })}
            placeholder="Contoh: Mau potong model fade, atau request khusus lainnya"
            rows={3}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E] transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={validateAndNext}
          className="w-full bg-[#C9A96E] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#b8954f] transition-colors"
        >
          Lanjutkan
        </button>
      </div>
    </div>
  )
}
