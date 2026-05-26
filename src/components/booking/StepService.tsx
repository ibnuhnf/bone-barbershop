'use client'

import { Clock, ChevronRight } from 'lucide-react'
import { SERVICES } from '@/lib/constants'

interface StepServiceProps {
  selectedServiceId: string
  onSelect: (id: string, name: string, price: number) => void
}

export default function StepService({ selectedServiceId, onSelect }: StepServiceProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Pilih Layanan</h2>
      <p className="text-gray-400 mb-8">Pilih layanan yang kamu inginkan</p>

      <div className="space-y-4">
        {SERVICES.map((service) => (
          <button
            key={service.code}
            onClick={() => onSelect(service.code, service.name, service.price)}
            className={`w-full text-left p-5 rounded-xl border transition-all ${
              selectedServiceId === service.code
                ? 'border-[#C9A96E] bg-[#C9A96E]/10'
                : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#C9A96E]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">{service.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{service.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    {service.duration_minutes} menit
                  </span>
                  <span className="text-[#C9A96E] font-bold">
                    Rp {service.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
