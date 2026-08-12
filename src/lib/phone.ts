/**
 * Converts any phone number string into a standard Indonesian 62 format
 * and builds a clean wa.me link.
 * Handles formats like: 08123456789, +628123456789, 628123456789, 8123456789
 */
export function normalizeIndonesianPhone(phone: string): string {
  if (!phone) return ''

  // Remove non-digit characters except leading +
  let cleaned = phone.trim().replace(/[^\d+]/g, '')

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1)
  }

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned
  }

  return cleaned
}

export function toWaLink(phone: string, message?: string): string {
  const normalized = normalizeIndonesianPhone(phone)
  if (!normalized) return '#'

  const baseUrl = `https://wa.me/${normalized}`
  if (!message) return baseUrl

  return `${baseUrl}?text=${encodeURIComponent(message)}`
}
