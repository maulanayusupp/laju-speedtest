// =============================================================================
// Test history — stored in the visitor's own browser (localStorage) and never
// sent anywhere. The raw sample series are stripped before saving: history only
// needs the headline numbers, and small entries keep the quota healthy.
// =============================================================================
import type { SpeedTestResult } from '~/types'

const STORAGE_KEY = 'laju.history.v1'
const MAX_ENTRIES = 30

/** A history row: a result with its per-sample series removed. */
export type StoredResult = Omit<SpeedTestResult, 'download' | 'upload' | 'latency'> & {
  download: Omit<SpeedTestResult['download'], 'samples'>
  upload: Omit<SpeedTestResult['upload'], 'samples'>
  latency: Omit<SpeedTestResult['latency'], 'samples'>
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function compact(result: SpeedTestResult): StoredResult {
  const { samples: _d, ...download } = result.download
  const { samples: _u, ...upload } = result.upload
  const { samples: _l, ...latency } = result.latency
  return {
    ...result,
    download,
    upload,
    latency,
    loadedLatency: result.loadedLatency
      ? { ...result.loadedLatency, samples: [] }
      : null,
  }
}

export function readHistory(): StoredResult[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as StoredResult[]) : []
  } catch {
    // Corrupt or unreadable storage should never break the page.
    return []
  }
}

export function appendHistory(result: SpeedTestResult): StoredResult[] {
  if (!isBrowser()) return []
  const next = [compact(result), ...readHistory()].slice(0, MAX_ENTRIES)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Quota exceeded or storage disabled — history is a convenience, not a
    // requirement, so we silently continue with an in-memory list.
  }
  return next
}

export function clearHistory(): StoredResult[] {
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore: nothing we can do, and nothing depends on it.
    }
  }
  return []
}

/** Everything needed to render the history sparkline, oldest → newest. */
export function historySeries(entries: StoredResult[]) {
  return [...entries]
    .reverse()
    .map((entry) => ({
      at: entry.startedAt,
      download: entry.download.mbps,
      upload: entry.upload.mbps,
      latency: entry.latency.minMs,
    }))
}
