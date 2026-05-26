import { Service } from './types'

export const SERVICES: Omit<Service, 'id' | 'is_active'>[] = [
  {
    code: 'SVC-01',
    name: 'Haircut (Potong)',
    description: 'Potong rambut standar oleh Abi',
    duration_minutes: 60,
    price: 50000,
  },
  {
    code: 'SVC-02',
    name: 'Haircut + Cuci Rambut',
    description: 'Potong rambut dilanjutkan keramas',
    duration_minutes: 75,
    price: 70000,
  },
  {
    code: 'SVC-03',
    name: 'Pewarnaan Rambut',
    description: 'Cat rambut sesuai permintaan pelanggan',
    duration_minutes: 120,
    price: 150000,
  },
  {
    code: 'SVC-04',
    name: 'Jenggot / Beard Trim',
    description: 'Trim dan rapikan jenggot',
    duration_minutes: 30,
    price: 35000,
  },
  {
    code: 'SVC-05',
    name: 'Hairstyle / Styling',
    description: 'Penataan rambut sesuai gaya yang diinginkan',
    duration_minutes: 60,
    price: 75000,
  },
]

export const DEFAULT_OPEN_TIME = '09:00'
export const DEFAULT_CLOSE_TIME = '17:00'
export const SLOT_INTERVAL_MINUTES = 60

export const DAYS_OF_WEEK = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
]

export function generateTimeSlots(
  openTime: string = DEFAULT_OPEN_TIME,
  closeTime: string = DEFAULT_CLOSE_TIME
): string[] {
  const slots: string[] = []
  const [openHour] = openTime.split(':').map(Number)
  const [closeHour] = closeTime.split(':').map(Number)

  for (let hour = openHour; hour < closeHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
  }

  return slots
}

export function generateBookingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'BONE-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
