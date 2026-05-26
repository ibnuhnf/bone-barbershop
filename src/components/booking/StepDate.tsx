'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
  getDay,
} from 'date-fns'
import { id } from 'date-fns/locale'

interface StepDateProps {
  selectedDate: string
  onSelect: (date: string) => void
}

interface DayStatus {
  date: string
  is_open: boolean
}

export default function StepDate({ selectedDate, onSelect }: StepDateProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDayStatuses()
  }, [currentMonth])

  const fetchDayStatuses = async () => {
    setLoading(true)
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
      const res = await fetch(`/api/schedule/days?start=${start}&end=${end}`)
      const data = await res.json()
      setDayStatuses(data)
    } catch {
      setDayStatuses([])
    } finally {
      setLoading(false)
    }
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const firstDayOfWeek = getDay(startOfMonth(currentMonth))

  const isDayAvailable = (date: Date): boolean => {
    if (isBefore(date, startOfDay(new Date()))) return false
    const dateStr = format(date, 'yyyy-MM-dd')
    const status = dayStatuses.find((d) => d.date === dateStr)
    if (status) return status.is_open
    // Default: open on weekdays (Mon-Sat), closed on Sunday
    return getDay(date) !== 0
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Pilih Tanggal</h2>
      <p className="text-gray-400 mb-8">Pilih tanggal yang tersedia untuk booking</p>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: id })}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const available = isDayAvailable(day)
              const selected = selectedDate && isSameDay(day, new Date(selectedDate))
              const today = isToday(day)
              const inMonth = isSameMonth(day, currentMonth)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => available && onSelect(format(day, 'yyyy-MM-dd'))}
                  disabled={!available}
                  className={`calendar-day aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    !inMonth
                      ? 'text-gray-700'
                      : selected
                      ? 'bg-[#C9A96E] text-black font-bold'
                      : available
                      ? 'hover:bg-[#C9A96E]/20 text-white'
                      : 'text-gray-600 cursor-not-allowed'
                  } ${today && !selected ? 'ring-1 ring-[#C9A96E]' : ''}`}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#C9A96E]" />
            <span className="text-xs text-gray-400">Tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-700" />
            <span className="text-xs text-gray-400">Tidak tersedia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full ring-1 ring-[#C9A96E]" />
            <span className="text-xs text-gray-400">Hari ini</span>
          </div>
        </div>
      </div>
    </div>
  )
}
