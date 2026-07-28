// =============================================================================
// Deep links for the contact channels. Pure string builders so they can be used
// from components, composables, or tests without a browser.
// =============================================================================

export interface ContactChannelConfig {
  email: string
  phone: string
  whatsapp: string
}

/** Digits only — wa.me rejects spaces, dashes and a leading '+'. */
function normalizeWhatsApp(value: string): string {
  return value.replace(/\D/g, '')
}

export function mailtoLink(email: string, subject: string, body: string): string {
  const query = new URLSearchParams({ subject, body }).toString()
  return `mailto:${email}?${query}`
}

export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${normalizeWhatsApp(number)}?text=${encodeURIComponent(message)}`
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
