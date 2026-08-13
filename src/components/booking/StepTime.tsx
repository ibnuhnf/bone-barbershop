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
              className={`slot-btn p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative overflow-hidden ${
                selectedTime === slot.time
                  ? 'border-[#C9A96E] bg-[#C9A96E]/20 text-[#C9A96E] shadow-lg shadow-[#C9A96E]/10'
                  : slot.available
                  ? 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#C9A96E]/60 text-white'
                  : 'border-red-500/30 bg-red-950/10 text-gray-500 cursor-not-allowed opacity-75'
              }`}
            >
              {slot.available ? (
                <Clock
                  className={`w-5 h-5 mb-2 ${
                    selectedTime === slot.time ? 'text-[#C9A96E]' : 'text-[#C9A96E]'
                  }`}
                />
              ) : (
                <XCircle className="w-5 h-5 mb-2 text-red-500/80" />
              )}
              <span className={`font-bold ${slot.available ? 'text-white' : 'text-gray-400'}`}>
                {slot.time}
              </span>
              <p
                className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${
                  slot.available ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {slot.available ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    Tersedia
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    Sudah Dipesan
                  </>
                )}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
