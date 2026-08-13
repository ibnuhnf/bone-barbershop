export interface Service {
  id: string
  code: string
  name: string
  description: string
  duration_minutes: number
  price: number
  is_active: boolean
}

export interface Booking {
  id: string
  booking_code: string
  customer_name: string
  customer_phone: string
  customer_notes?: string
  service_id: string
  booking_date: string
  booking_time: string
  status: 'pending' | 'confirmed' | 'done' | 'cancelled' | 'rejected'
  created_at: string
  service?: Service
}

export interface DaySchedule {
  id: string
  date: string
  is_open: boolean
  custom_slots?: string[]
}

export interface TimeSlot {
  time: string
  available: boolean
  status: 'available' | 'pending' | 'confirmed' | 'disabled'
}

export interface DefaultSchedule {
  id: string
  day_of_week: number // 0 = Sunday, 6 = Saturday
  is_open: boolean
  open_time: string
  close_time: string
}
