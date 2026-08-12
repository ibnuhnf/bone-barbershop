export interface InvoiceBookingData {
  booking_code: string
  customer_name: string
  customer_phone: string
  customer_notes?: string
  service_name: string
  service_price: number
  booking_date: string
  booking_time: string
  status?: string
}

export function buildCustomerWaMessage(data: InvoiceBookingData): string {
  const priceFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(data.service_price || 0)

  return (
    `Halo Admin BONE Barbershop, saya ingin mengonfirmasi booking saya:\n\n` +
    ` Kode Booking: *${data.booking_code}*\n` +
    ` Nama: ${data.customer_name}\n` +
    ` Layanan: ${data.service_name} (${priceFormatted})\n` +
    ` Tanggal: ${data.booking_date}\n` +
    ` Jam: ${data.booking_time}\n` +
    (data.customer_notes ? ` Catatan: ${data.customer_notes}\n` : '') +
    `\nBerikut invoice PDF booking saya. Mohon konfirmasinya. Terima kasih!`
  )
}

export function buildAdminWaMessage(data: {
  booking_code: string
  customer_name: string
  booking_date: string
  booking_time: string
  service_name?: string
  status: string
}): string {
  const { booking_code, customer_name, booking_date, booking_time, service_name, status } = data
  const svcStr = service_name ? ` (${service_name})` : ''

  switch (status) {
    case 'confirmed':
      return (
        `Halo ${customer_name}, booking Anda di *BONE Barbershop* dengan kode *${booking_code}*${svcStr} ` +
        `untuk tanggal *${booking_date}* jam *${booking_time}* telah *DIKONFIRMASI*.\n\n` +
        `Mohon hadir 5-10 menit sebelum waktu booking. Sampai jumpa!`
      )
    case 'rejected':
      return (
        `Halo ${customer_name}, mohon maaf booking Anda di *BONE Barbershop* dengan kode *${booking_code}* ` +
        `pada tanggal *${booking_date}* jam *${booking_time}* *TIDAK DAPAT KAMI PROSES* (Slot Penuh / Hal Lain).\n\n` +
        `Silakan lakukan booking ulang untuk tanggal/waktu yang lain. Terima kasih!`
      )
    case 'done':
      return (
        `Halo ${customer_name}, terima kasih telah mempercayakan perawatan Anda di *BONE Barbershop*! ` +
        `Booking *${booking_code}* telah selesai. Sampai jumpa di kunjungan berikutnya!`
      )
    case 'cancelled':
      return (
        `Halo ${customer_name}, booking Anda dengan kode *${booking_code}* untuk tanggal *${booking_date}* telah dibatalkan.`
      )
    default:
      return (
        `Halo ${customer_name}, mengenai booking Anda dengan kode *${booking_code}* di BONE Barbershop...`
      )
  }
}
