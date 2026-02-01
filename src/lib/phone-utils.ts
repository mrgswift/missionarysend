/**
 * Normalize phone number to E.164 format (+1234567890)
 * Removes all non-numeric characters and ensures it starts with +
 *
 * Examples:
 * - "555-555-1212" -> "+5555551212"
 * - "1-555-555-1212" -> "+15555551212"
 * - "+1 (555) 555-1212" -> "+15555551212"
 * - "5555551212" -> "+5555551212"
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const digitsOnly = phone.replace(/\D/g, '')

  // If empty after cleaning, return empty string
  if (!digitsOnly) {
    return ''
  }

  // Add + prefix if not present
  return `+${digitsOnly}`
}

/**
 * Format phone number for display (US format)
 * Converts +15555551212 to (555) 555-1212
 * For international numbers, just displays as-is
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return ''

  // Remove + and any non-numeric characters
  const digitsOnly = phone.replace(/\D/g, '')

  // US/Canada format (11 digits starting with 1)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    const areaCode = digitsOnly.slice(1, 4)
    const prefix = digitsOnly.slice(4, 7)
    const lineNumber = digitsOnly.slice(7, 11)
    return `+1 (${areaCode}) ${prefix}-${lineNumber}`
  }

  // US format without country code (10 digits)
  if (digitsOnly.length === 10) {
    const areaCode = digitsOnly.slice(0, 3)
    const prefix = digitsOnly.slice(3, 6)
    const lineNumber = digitsOnly.slice(6, 10)
    return `(${areaCode}) ${prefix}-${lineNumber}`
  }

  // International or other formats - just add + if missing
  return phone.startsWith('+') ? phone : `+${digitsOnly}`
}

/**
 * Validate that a phone number has enough digits
 * Minimum 10 digits for most countries
 */
export function isValidPhoneNumber(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '')
  return digitsOnly.length >= 10
}
