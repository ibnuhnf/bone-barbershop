const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

export async function sendTelegramNotification(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram not configured, skipping notification')
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    if (!res.ok) {
      console.error('Telegram API error:', await res.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to send Telegram notification:', error)
    return false
  }
}

export function formatBookingNotification(data: {
  bookingCode: string
  customerName: string
  customerPhone: string
  serviceName: string
  date: string
  time: string
  notes?: string
}): string {
  let message = `🔔 <b>BOOKING BARU!</b>\n\n`
  message += `📋 Kode: <b>${data.bookingCode}</b>\n`
  message += `👤 Nama: ${data.customerName}\n`
  message += `📱 HP: ${data.customerPhone}\n`
  message += `✂️ Layanan: ${data.serviceName}\n`
  message += `📅 Tanggal: ${data.date}\n`
  message += `🕐 Waktu: ${data.time}\n`

  if (data.notes) {
    message += `📝 Catatan: ${data.notes}\n`
  }

  message += `\n⏳ Status: Menunggu Konfirmasi`

  return message
}
