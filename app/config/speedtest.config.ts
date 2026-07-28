// =============================================================================
// Measurement parameters. Structure only — every user-facing string lives in
// i18n. Tuning the test means editing this file and nothing else.
// =============================================================================
import type { Grade } from '~/types'

export const speedTestConfig = {
  endpoints: {
    ping: '/api/speed/ping',
    download: '/api/speed/download',
    upload: '/api/speed/upload',
    ip: '/api/network/ip',
  },

  latency: {
    /** Round trips attempted. The first `warmupSamples` are discarded. */
    samples: 14,
    /** Discarded: they carry TLS/connection setup cost, not steady-state RTT. */
    warmupSamples: 3,
    /** Pause between probes so we sample different moments, not one burst. */
    intervalMs: 70,
    /** A probe that takes longer than this counts as lost. */
    timeoutMs: 5000,
  },

  download: {
    /** Total wall time spent pulling bytes. */
    durationMs: 11000,
    /** Ignored in the final average: TCP slow start and cache warm-up. */
    warmupMs: 1600,
    /** Parallel connections — matches how real downloads behave. */
    streams: 5,
    /** Bytes requested per fetch; workers loop until the deadline. */
    payloadBytes: 40 * 1024 * 1024,
  },

  upload: {
    durationMs: 11000,
    /** Longer than download: the browser reports socket-buffer fills first. */
    warmupMs: 2200,
    streams: 4,
    payloadBytes: 12 * 1024 * 1024,
  },

  /** Latency re-measured while the download saturates the line (bufferbloat). */
  loadedLatency: {
    intervalMs: 450,
    timeoutMs: 5000,
  },

  /** How often the live chart takes a reading. */
  sampleIntervalMs: 100,

  /** Window used to compute the instantaneous number on the gauge. */
  liveWindowMs: 700,

  /** Ceiling of the gauge's non-linear scale, in Mbps. */
  gaugeMaxMbps: 1000,
} as const

/** Upper bounds (inclusive) for each grade. Anything above is 'poor'. */
export const gradeThresholds = {
  /** Idle round-trip time, ms. */
  latency: { excellent: 20, good: 50, fair: 100 },
  /** Variation between consecutive round trips, ms. */
  jitter: { excellent: 5, good: 15, fair: 30 },
  /** Extra latency added when the line is saturated, ms. */
  bufferbloat: { excellent: 30, good: 75, fair: 200 },
} as const

export type GradedMetric = keyof typeof gradeThresholds

/** Lower bounds (inclusive) for throughput grades, in Mbps. */
export const throughputThresholds = {
  download: { excellent: 200, good: 50, fair: 15 },
  upload: { excellent: 100, good: 20, fair: 5 },
} as const

export type GradedThroughput = keyof typeof throughputThresholds

export function gradeLower(metric: GradedMetric, value: number): Grade {
  const t = gradeThresholds[metric]
  if (value <= t.excellent) return 'excellent'
  if (value <= t.good) return 'good'
  if (value <= t.fair) return 'fair'
  return 'poor'
}

export function gradeHigher(metric: GradedThroughput, value: number): Grade {
  const t = throughputThresholds[metric]
  if (value >= t.excellent) return 'excellent'
  if (value >= t.good) return 'good'
  if (value >= t.fair) return 'fair'
  return 'poor'
}
