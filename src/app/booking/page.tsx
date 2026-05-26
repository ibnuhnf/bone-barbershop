'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import StepService from '@/components/booking/StepService'
import StepDate from '@/components/booking/StepDate'
import StepTime from '@/components/booking/StepTime'
import StepDetails from '@/components/booking/StepDetails'
import StepReview from '@/components/booking/StepReview'
import StepSuccess from '@/components/booking/StepSuccess'

const STEPS = ['Layanan', 'Tanggal', 'Waktu', 'Data Diri', 'Review']

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    serviceName: '',
    servicePrice: 0,
    date: '',
    time: '',
    customerName: '',
    customerPhone: '',
    customerNotes: '',
  })
  const [bookingCode, setBookingCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  const updateBookingData = (data: Partial<typeof bookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })
      const result = await res.json()
      if (res.ok) {
        setBookingCode(result.booking_code)
        setCurrentStep(5)
      } else {
        alert(result.error || 'Gagal membuat booking. Silakan coba lagi.')
      }
    } catch {
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (currentStep === 5) {
    return <StepSuccess bookingCode={bookingCode} bookingData={bookingData} />
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={currentStep === 0 ? undefined : prevStep}
            className="text-white hover:text-[#C9A96E] transition-colors"
          >
            {currentStep === 0 ? (
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Kembali</span>
              </Link>
            ) : (
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Kembali</span>
              </span>
            )}
          </button>
          <span className="text-lg font-bold tracking-wider">BONE</span>
          <span className="text-sm text-gray-400">
            {currentStep + 1}/{STEPS.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-16 w-full z-40 bg-black/90 backdrop-blur-sm px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    index < currentStep
                      ? 'bg-[#C9A96E] text-black'
                      : index === currentStep
                      ? 'bg-[#C9A96E] text-black'
                      : 'bg-[#2a2a2a] text-gray-500'
                  }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block w-12 lg:w-20 h-0.5 mx-1 ${
                      index < currentStep ? 'bg-[#C9A96E]' : 'bg-[#2a2a2a]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#C9A96E] font-medium">
            {STEPS[currentStep]}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="pt-36 pb-8 px-4">
        <div className="max-w-3xl mx-auto animate-fade-in">
          {currentStep === 0 && (
            <StepService
              selectedServiceId={bookingData.serviceId}
              onSelect={(id, name, price) => {
                updateBookingData({ serviceId: id, serviceName: name, servicePrice: price })
                nextStep()
              }}
            />
          )}
          {currentStep === 1 && (
            <StepDate
              selectedDate={bookingData.date}
              onSelect={(date) => {
                updateBookingData({ date })
                nextStep()
              }}
            />
          )}
          {currentStep === 2 && (
            <StepTime
              selectedDate={bookingData.date}
              selectedTime={bookingData.time}
              onSelect={(time) => {
                updateBookingData({ time })
                nextStep()
              }}
            />
          )}
          {currentStep === 3 && (
            <StepDetails
              data={bookingData}
              onUpdate={updateBookingData}
              onNext={nextStep}
            />
          )}
          {currentStep === 4 && (
            <StepReview
              data={bookingData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </main>
  )
}
