// =============================================================================
// Deep links for the contact channels. Pure string builders so they can be used
// from components, composables, or tests without a browser.
//
// Email only: the site publishes no phone number, so there is deliberately no
// `tel:` or `wa.me` builder here to reach for.
// =============================================================================

export interface ContactChannelConfig {
  email: string
}

export function mailtoLink(email: string, subject: string, body: string): string {
  const query = new URLSearchParams({ subject, body }).toString()
  return `mailto:${email}?${query}`
}
