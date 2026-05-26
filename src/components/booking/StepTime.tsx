'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Pilih Waktu</h2>
      <p className="text-gray-400 mb-2">Pilih slot waktu yang tersedia</p>
      <p className="text-[#C9A96E] text-sm mb-8 capitalize">{formattedDate}</p>

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && onSelect(slot.time)}
              disabled={!slot.available}
              className={`slot-btn p-4 rounded-xl border text-center transition-all ${
                selectedTime === slot.time
                  ? 'border-[#C9A96E] bg-[#C9A96E]/20 text-[#C9A96E]'
                  : slot.available
                  ? 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#C9A96E]/50 text-white'
                  : 'border-[#2a2a2a] bg-[#111111] text-gray-600 cursor-not-allowed'
              }`}
            >
              <Clock className={`w-5 h-5 mx-auto mb-2 ${
                slot.available ? 'text-[#C9A96E]' : 'text-gray-700'
              }`} />
              <span className="font-semibold">{slot.time}</span>
              <p className={`text-xs mt-1 ${slot.available ? 'text-green-500' : 'text-red-400'}`}>
                {slot.available ? 'Tersedia' : 'Penuh'}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
