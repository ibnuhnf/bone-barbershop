'use client'

import { useState, useEffect } from 'react'
import { Clock, XCircle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { TimeSlot } from '@/lib/types'

interface StepTimeProps {
  selectedDate: string
  selectedTime: string
  onSelect: (time: string) => void
}

export default function StepTime({ selectedDate, selectedTime, onSelect }: StepTimeProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlots()
  }, [selectedDate])

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/schedule/slots?date=${selectedDate}`)
      const data = await res.json()
      setSlots(data)
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  const formattedDate = selectedDate
    ? format(new Date(selectedDate), 'EEEE, d MMMM yyyy', { locale: id })
    : ''

  const getSlotStyle = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      return selectedTime === slot.time
        ? 'border-[#C9A96E] bg-[#C9A96E]/20 text-[#C9A96E] shadow-lg shadow-[#C9A96E]/10 cursor-pointer'
        : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#C9A96E]/60 text-white cursor-pointer'
    }
    if (slot.status === 'pending') {
      return 'border-orange-500/30 bg-orange-950/10 text-gray-400 cursor-not-allowed opacity-80'
    }
    if (slot.status === 'confirmed') {
      return 'border-red-500/30 bg-red-950/10 text-gray-500 cursor-not-allowed opacity-75'
    }
    return 'border-[#2a2a2a] bg-[#111111] text-gray-600 cursor-not-allowed opacity-50'
  }

  const getIcon = (slot: TimeSlot) => {
    if (slot.status === 'available') return <Clock className="w-5 h-5 mb-2 text-[#C9A96E]" />
    if (slot.status === 'pending') return <Clock className="w-5 h-5 mb-2 text-orange-400" />
    if (slot.status === 'confirmed') return <XCircle className="w-5 h-5 mb-2 text-red-400" />
    return <XCircle className="w-5 h-5 mb-2 text-gray-600" />
  }

  const getLabel = (slot: TimeSlot) => {
    if (slot.status === 'available') {
      return { text: 'Tersedia', color: 'text-green-400', icon: <CheckCircle2 className="w-3 h-3" /> }
    }
    if (slot.status === 'pending') {
      return { text: 'Menunggu Konfirmasi', color: 'text-orange-400', icon: <Clock className="w-3 h-3" /> }
    }
    if (slot.status === 'confirmed') {
      return { text: 'Sudah Terisi', color: 'text-red-400', icon: <XCircle className="w-3 h-3" /> }
    }
    return { text: 'Nonaktif', color: 'text-gray-500', icon: <XCircle className="w-3 h-3" /> }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Pilih Waktu</h2>
      <p className="text-gray-400 mb-2">Pilih slot waktu yang tersedia</p>
      <p className="text-[#C9A96E] text-sm mb-6 capitalize">{formattedDate}</p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Tidak ada slot tersedia untuk tanggal ini</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-medium">Tersedia</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-400 font-medium">Menunggu Konfirmasi</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 font-medium">Sudah Terisi</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const label = getLabel(slot)
              const isClickable = slot.status === 'available'

              return (
                <button
                  key={slot.time}
                  onClick={() => isClickable && onSelect(slot.time)}
                  disabled={!isClickable}
                  className={`slot-btn p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative overflow-hidden ${getSlotStyle(
                    slot
                  )}`}
                >
                  {getIcon(slot)}
                  <span className={`font-bold ${slot.status === 'available' ? 'text-white' : 'text-gray-400'}`}>
                    {slot.time}
                  </span>
                  <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${label.color}`}>
                    {label.icon}
                    {label.text}
                  </p>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
