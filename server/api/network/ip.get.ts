// =============================================================================
// GET /api/network/ip — the client address as OUR origin observes it.
//
// A single origin can only ever see one address family: whichever one the
// browser actually connected over. Showing both IPv4 and IPv6 therefore needs
// two extra requests to IPv4-only / IPv6-only hostnames, which the browser makes
// itself (see app/services/network.service.ts). This route is the trustworthy
// half of that picture — it is our own server, no third party involved.
//
// Nothing here is logged or stored; the address is computed per request and
// returned only to the client it belongs to.
// =============================================================================
import type { H3Event } from 'h3'

/** Strip the IPv4-mapped IPv6 prefix Node reports for dual-stack sockets. */
function normalize(address: string): string {
  const trimmed = address.trim()
  return trimmed.startsWith('::ffff:') ? trimmed.slice(7) : trimmed
}

function familyOf(address: string): 4 | 6 | null {
  if (!address) return null
  if (address.includes(':')) return 6
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(address) ? 4 : null
}

/** Platform geo hints, when the host provides them. Never guessed. */
function geoHints(event: H3Event) {
  const read = (name: string) => {
    const value = getRequestHeader(event, name)
    if (!value) return undefined
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }
  return {
    country: read('x-vercel-ip-country') || read('cf-ipcountry') || undefined,
    region: read('x-vercel-ip-country-region') || undefined,
    city: read('x-vercel-ip-city') || undefined,
  }
}

export default defineEventHandler((event) => {
  applyMeasurementHeaders(event)

  const raw
    = getRequestIP(event, { xForwardedFor: true })
      || event.node?.req?.socket?.remoteAddress
      || ''
  const address = normalize(raw)
  const geo = geoHints(event)

  return {
    address: address || null,
    family: familyOf(address),
    /** Deployment region of the machine that answered, when exposed. */
    serverRegion: serverRegion() || null,
    country: geo.country ?? null,
    region: geo.region ?? null,
    city: geo.city ?? null,
    /** Protocol the browser negotiated with us (h2 / http/1.1 …). */
    httpVersion: event.node?.req?.httpVersion ?? null,
  }
})
