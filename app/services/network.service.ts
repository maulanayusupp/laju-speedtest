// =============================================================================
// Resolving the visitor's network identity.
//
// Important honesty note: a web page cannot ask the operating system for its
// addresses. It can only learn which address a *server* saw it arrive from.
// Our own origin therefore reveals exactly one family — whichever the browser
// chose. To show both, the browser makes one extra request to an IPv4-only
// hostname and one to an IPv6-only hostname; the family is proven by DNS, not
// guessed. Those two hostnames are third parties (configurable, and disableable
// by setting the env vars to an empty string) and are disclosed on the privacy
// and compliance pages.
// =============================================================================
import type { IpAddressInfo, NetworkIdentity } from '~/types'
import { speedTestConfig as cfg } from '~/config/speedtest.config'

const PROBE_TIMEOUT_MS = 6000

const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/
const IPV6_PATTERN = /^[0-9a-f:]+$/i

interface ObservedResponse {
  address: string | null
  family: 4 | 6 | null
  serverRegion: string | null
  country: string | null
  region: string | null
  city: string | null
  httpVersion: string | null
}

function emptyAddress(family: 4 | 6, status: IpAddressInfo['status']): IpAddressInfo {
  return { family, address: null, source: 'probe', status }
}

/** Accepts either a bare address (text/plain) or `{"ip":"..."}` (JSON). */
function extractAddress(body: string): string {
  const trimmed = body.trim()
  if (!trimmed.startsWith('{')) return trimmed
  try {
    const parsed = JSON.parse(trimmed) as { ip?: string }
    return (parsed.ip ?? '').trim()
  } catch {
    return ''
  }
}

function isFamily(address: string, family: 4 | 6): boolean {
  return family === 4
    ? IPV4_PATTERN.test(address)
    : address.includes(':') && IPV6_PATTERN.test(address)
}

/**
 * Loopback, link-local and RFC 1918 / ULA ranges. Our origin legitimately sees
 * these during local development or behind some proxies, but presenting `::1`
 * as "your IPv6 address" would be a lie, so they are never promoted.
 */
function isPublicAddress(address: string): boolean {
  const value = address.toLowerCase()
  if (value === '::1' || value === '0.0.0.0' || value === '::') return false
  if (value.startsWith('127.') || value.startsWith('169.254.')) return false
  if (value.startsWith('10.') || value.startsWith('192.168.')) return false
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(value)) return false
  // fe80::/10 (link-local) and fc00::/7 (unique local).
  if (/^fe[89ab]/.test(value) || /^f[cd]/.test(value)) return false
  return true
}

/**
 * Ask a family-locked endpoint what address it sees. A failure is meaningful,
 * not an error: it usually means the network simply has no address of that
 * family (very common for IPv6 in Indonesia).
 */
export async function probeAddressFamily(url: string, family: 4 | 6): Promise<IpAddressInfo> {
  if (!url) return emptyAddress(family, 'disabled')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      referrerPolicy: 'no-referrer',
      mode: 'cors',
    })
    if (!response.ok) return emptyAddress(family, 'unavailable')
    const address = extractAddress(await response.text())
    if (!address || !isFamily(address, family)) return emptyAddress(family, 'unavailable')
    return { family, address, source: 'probe', status: 'ok' }
  } catch {
    return emptyAddress(family, 'unavailable')
  } finally {
    clearTimeout(timer)
  }
}

/** The address our own origin observed, plus any platform-provided geo hints. */
export async function fetchObservedIdentity(): Promise<ObservedResponse | null> {
  try {
    return await $fetch<ObservedResponse>(cfg.endpoints.ip, { cache: 'no-store' })
  } catch {
    return null
  }
}

export interface ProbeEndpoints {
  ipv4: string
  ipv6: string
}

/**
 * Full picture: what we saw + what the family-locked probes saw. When a probe
 * is disabled but our own origin happens to have observed that family, the
 * observed value is promoted so the panel is never needlessly empty.
 */
export async function resolveNetworkIdentity(probes: ProbeEndpoints): Promise<NetworkIdentity> {
  const [observed, ipv4, ipv6] = await Promise.all([
    fetchObservedIdentity(),
    probeAddressFamily(probes.ipv4, 4),
    probeAddressFamily(probes.ipv6, 6),
  ])

  const promote = (info: IpAddressInfo): IpAddressInfo => {
    if (info.status === 'ok') return info
    if (
      observed?.address
      && observed.family === info.family
      && isPublicAddress(observed.address)
    ) {
      return { family: info.family, address: observed.address, source: 'origin', status: 'ok' }
    }
    return info
  }

  return {
    ipv4: promote(ipv4),
    ipv6: promote(ipv6),
    observed: {
      address: observed?.address ?? null,
      family: observed?.family ?? null,
      httpVersion: observed?.httpVersion ?? null,
    },
    location: {
      city: observed?.city ?? null,
      region: observed?.region ?? null,
      country: observed?.country ?? null,
    },
    serverRegion: observed?.serverRegion ?? null,
  }
}
