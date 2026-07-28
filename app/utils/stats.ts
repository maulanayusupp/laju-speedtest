// =============================================================================
// Small, dependency-free statistics helpers used by the measurement engine.
// Pure functions: no Vue, no DOM — trivially unit-testable.
// =============================================================================

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0)
}

export function minOf(values: number[]): number {
  return values.length ? Math.min(...values) : 0
}

export function maxOf(values: number[]): number {
  return values.length ? Math.max(...values) : 0
}

/**
 * Jitter as the mean absolute difference between *consecutive* round trips —
 * the definition used for packet-delay variation (RFC 3550 §6.4.1 in spirit).
 * A plain standard deviation would hide the ordering that makes calls stutter.
 */
export function consecutiveJitter(values: number[]): number {
  if (values.length < 2) return 0
  let total = 0
  for (let i = 1; i < values.length; i++) {
    total += Math.abs((values[i] ?? 0) - (values[i - 1] ?? 0))
  }
  return total / (values.length - 1)
}

/** Convert a byte count over a duration into megabits per second (10^6 bits). */
export function toMbps(bytes: number, durationMs: number): number {
  if (durationMs <= 0) return 0
  return (bytes * 8) / (durationMs / 1000) / 1_000_000
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Non-linear gauge position. Speeds cluster at the low end, so a linear dial
 * would leave 90 % of the arc unused on a typical home connection. A power
 * curve keeps 0–100 Mbps readable while still reaching 1 Gbps.
 */
export function gaugeFraction(mbps: number, max: number): number {
  if (mbps <= 0) return 0
  return clamp((Math.log10(1 + mbps) / Math.log10(1 + max)) ** 1.15, 0, 1)
}
