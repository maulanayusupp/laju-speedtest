// =============================================================================
// Locale-independent number shaping. The locale-aware wrappers live in the
// `useFormat` composable; these are the pure rules about *how many digits* a
// measurement deserves.
// =============================================================================

/**
 * Speed precision scales with magnitude: 4.83 Mbps is meaningful, 483.19 Mbps
 * is false precision. Matches how consumer speed tests present numbers.
 */
export function speedDigits(mbps: number): number {
  if (mbps >= 100) return 0
  if (mbps >= 10) return 1
  return 2
}

export function latencyDigits(ms: number): number {
  return ms >= 100 ? 0 : 1
}

/** Human-readable byte size for the "data used" line. */
export function formatBytes(bytes: number): { value: number, unit: 'B' | 'KB' | 'MB' | 'GB' } {
  if (bytes >= 1_000_000_000) return { value: bytes / 1_000_000_000, unit: 'GB' }
  if (bytes >= 1_000_000) return { value: bytes / 1_000_000, unit: 'MB' }
  if (bytes >= 1000) return { value: bytes / 1000, unit: 'KB' }
  return { value: bytes, unit: 'B' }
}

/** Megabits per second → megabytes per second, for the "real download" hint. */
export function mbpsToMBps(mbps: number): number {
  return mbps / 8
}
