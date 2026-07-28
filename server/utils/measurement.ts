// =============================================================================
// Shared helpers for the measurement endpoints (/api/speed/*, /api/network/*).
//
// Every measurement response must be uncacheable — a cached payload would be
// served from disk/CDN and report a fantasy speed. We also advertise the region
// the response was produced in, so the UI can name the test server honestly.
// =============================================================================
import type { H3Event } from 'h3'

/** Headers that defeat browser, proxy and CDN caching. */
export const NO_STORE_HEADERS: Record<string, string> = {
  'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
  'cdn-cache-control': 'no-store',
  pragma: 'no-cache',
  expires: '0',
}

/**
 * The deployment region, when the platform exposes one. Empty string locally.
 * Verified env names: Vercel (`VERCEL_REGION`), Fly (`FLY_REGION`),
 * AWS Lambda (`AWS_REGION`). Anything else falls back to "".
 */
export function serverRegion(): string {
  return (
    process.env.VERCEL_REGION
    || process.env.FLY_REGION
    || process.env.AWS_REGION
    || ''
  )
}

/** Apply the no-store + diagnostics headers shared by all measurement routes. */
export function applyMeasurementHeaders(event: H3Event): void {
  const headers: Record<string, string> = { ...NO_STORE_HEADERS }
  const region = serverRegion()
  if (region) headers['x-laju-region'] = region
  // Lets the browser read transfer timings for this response via Resource Timing.
  headers['timing-allow-origin'] = '*'
  setResponseHeaders(event, headers)
}

/** Parse a positive integer query param, clamped into [min, max]. */
export function clampedInt(raw: unknown, fallback: number, min: number, max: number): number {
  const value = Number.parseInt(String(raw ?? ''), 10)
  if (!Number.isFinite(value)) return fallback
  return Math.min(Math.max(value, min), max)
}
