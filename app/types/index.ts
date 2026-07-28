// =============================================================================
// Shared domain types. The measurement engine, the services and the UI all
// speak this vocabulary — nothing else is passed around untyped.
// =============================================================================

/** Ordered lifecycle of a test run. */
export type TestPhase
  = | 'idle'
    | 'latency'
    | 'download'
    | 'upload'
    | 'done'
    | 'error'

/** The four headline numbers, each of which owns one colour in the design. */
export type MetricKey = 'download' | 'upload' | 'latency' | 'jitter'

/** A qualitative bucket used for grading a metric. */
export type Grade = 'excellent' | 'good' | 'fair' | 'poor'

/** One throughput reading on the live chart. */
export interface ThroughputSample {
  /** Milliseconds since the start of the phase. */
  t: number
  /** Instantaneous throughput in megabits per second (10^6 bits). */
  mbps: number
}

export interface LatencyStats {
  /** Fastest round trip observed — the closest thing to the "true" latency. */
  minMs: number
  /** Arithmetic mean of the accepted round trips. */
  avgMs: number
  /** Slowest accepted round trip. */
  maxMs: number
  /** Mean absolute difference between consecutive round trips. */
  jitterMs: number
  /** Requests that never completed, as a share of all attempts (0–1). */
  lossRatio: number
  /** Raw accepted round trips, in order. */
  samples: number[]
}

export interface ThroughputStats {
  /** Sustained throughput over the measured window (Mbps). */
  mbps: number
  /** Highest instantaneous reading seen (Mbps). */
  peakMbps: number
  /** Bytes counted inside the measured window (warm-up excluded). */
  bytes: number
  /** Length of the measured window in milliseconds. */
  durationMs: number
  /** Parallel connections used. */
  streams: number
  /** Series for the live chart (includes warm-up, marked by `t`). */
  samples: ThroughputSample[]
}

/**
 * Latency measured *while the line is saturated*. The gap between this and idle
 * latency is what people feel as lag on a "fast" connection (bufferbloat).
 */
export interface LoadedLatencyStats {
  avgMs: number
  /** Increase over idle latency, in milliseconds. */
  increaseMs: number
  samples: number[]
}

/** Where the measurement was taken. */
export interface TestServerInfo {
  /** Origin the payloads were fetched from. */
  origin: string
  /** Deployment region reported by the platform, if any. */
  region: string | null
}

export interface SpeedTestResult {
  /** Local identifier for history entries. */
  id: string
  /** ISO timestamp of when the run started. */
  startedAt: string
  latency: LatencyStats
  download: ThroughputStats
  upload: ThroughputStats
  loadedLatency: LoadedLatencyStats | null
  server: TestServerInfo
}

/** Progress payload emitted continuously while a test runs. */
export interface TestProgress {
  phase: TestPhase
  /** 0–1 progress inside the current phase. */
  phaseProgress: number
  /** Live value for the active phase (Mbps for throughput, ms for latency). */
  value: number
  /**
   * Series collected so far in the active phase. During the latency phase the
   * `mbps` field carries milliseconds and `t` carries the probe index — the
   * chart draws a generic series and the unit comes from the phase.
   */
  samples: ThroughputSample[]
}

/** One address family as resolved for the current connection. */
export interface IpAddressInfo {
  family: 4 | 6
  address: string | null
  /** 'origin' = observed by our own server; 'probe' = third-party echo service. */
  source: 'origin' | 'probe'
  /** Set when the lookup failed or was disabled. */
  status: 'ok' | 'unavailable' | 'disabled'
}

/** Everything the connection panel knows about the visitor's network. */
export interface NetworkIdentity {
  ipv4: IpAddressInfo
  ipv6: IpAddressInfo
  /** Address our own origin saw, whichever family the browser used. */
  observed: {
    address: string | null
    family: 4 | 6 | null
    httpVersion: string | null
  }
  location: {
    city: string | null
    region: string | null
    country: string | null
  }
  serverRegion: string | null
}

/** A capability the measured speed is compared against (estimates only). */
export interface CapabilityCheck {
  id: string
  /** Minimum sustained download in Mbps. */
  downloadMbps: number
  /** Minimum sustained upload in Mbps, when the activity needs one. */
  uploadMbps?: number
  icon: string
}

/** Navigation entry (label text comes from i18n by key). */
export interface NavItem {
  key: string
  to: string
}

/** A legal/compliance document section (body text comes from i18n). */
export interface LegalSection {
  key: string
}

export interface LegalDocumentConfig {
  /** i18n namespace, e.g. `privacy`. */
  namespace: string
  sections: LegalSection[]
}
