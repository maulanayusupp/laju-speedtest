// =============================================================================
// The measurement engine. Framework-free on purpose: no Vue, no component
// imports — just async functions over `fetch` / `XMLHttpRequest` that report
// progress through callbacks. `useSpeedTest()` is the thin reactive wrapper.
//
// Method, in one paragraph: latency is a series of tiny uncached round trips;
// throughput opens several parallel connections and counts bytes as they land,
// discarding an initial warm-up window (TCP slow start, socket buffers) before
// dividing bytes by time. Speeds use decimal megabits (10^6 bits), the unit ISPs
// advertise in. Limitations are documented on the /how-it-works page.
// =============================================================================
import type {
  LatencyStats,
  LoadedLatencyStats,
  SpeedTestResult,
  TestPhase,
  TestProgress,
  ThroughputSample,
  ThroughputStats,
} from '~/types'
import { speedTestConfig as cfg } from '~/config/speedtest.config'
import { consecutiveJitter, maxOf, mean, minOf, toMbps } from '~/utils/stats'

// --- low-level plumbing ------------------------------------------------------

/** Cache-busting token; a repeated URL could be answered from a cache. */
function nonce(): string {
  return Math.random().toString(36).slice(2, 10)
}

function withParams(path: string, params: Record<string, string | number>): string {
  const query = Object.entries({ ...params, _: nonce() })
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return `${path}?${query}`
}

/** An AbortController that also aborts when the parent signal does. */
function linkedController(parent: AbortSignal): AbortController {
  const controller = new AbortController()
  if (parent.aborted) controller.abort()
  else parent.addEventListener('abort', () => controller.abort(), { once: true })
  return controller
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    }, { once: true })
  })
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

// --- latency -----------------------------------------------------------------

/** One uncached round trip. Resolves to the RTT in ms, or null when lost. */
async function probeOnce(signal: AbortSignal, timeoutMs: number): Promise<number | null> {
  const controller = linkedController(signal)
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const startedAt = performance.now()
  try {
    const response = await fetch(withParams(cfg.endpoints.ping, {}), {
      cache: 'no-store',
      signal: controller.signal,
      headers: { 'cache-control': 'no-cache' },
    })
    // Drain (there is no body on 204, but be explicit) so timing is complete.
    await response.arrayBuffer().catch(() => undefined)
    if (!response.ok && response.status !== 204) return null
    return performance.now() - startedAt
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Idle latency, jitter and loss. Probes run one at a time with a short gap so
 * they sample different instants rather than one burst down a warm socket.
 */
export async function measureLatency(
  signal: AbortSignal,
  onSample?: (rttMs: number, index: number, total: number) => void,
): Promise<LatencyStats> {
  const samples: number[] = []
  let attempts = 0
  let lost = 0

  for (let i = 0; i < cfg.latency.samples; i++) {
    if (signal.aborted) break
    attempts++
    const rtt = await probeOnce(signal, cfg.latency.timeoutMs)
    if (rtt === null) {
      lost++
    } else if (i >= cfg.latency.warmupSamples) {
      samples.push(rtt)
      onSample?.(rtt, i, cfg.latency.samples)
    }
    if (i < cfg.latency.samples - 1) await delay(cfg.latency.intervalMs, signal)
  }

  return {
    minMs: minOf(samples),
    avgMs: mean(samples),
    maxMs: maxOf(samples),
    jitterMs: consecutiveJitter(samples),
    lossRatio: attempts > 0 ? lost / attempts : 0,
    samples,
  }
}

// --- throughput core ---------------------------------------------------------

interface WorkerContext {
  /** performance.now() value after which workers must stop. */
  deadline: number
  signal: AbortSignal
  /** Report freshly transferred bytes. Called very frequently — keep it cheap. */
  addBytes: (bytes: number) => void
}

interface ThroughputRunOptions {
  durationMs: number
  warmupMs: number
  streams: number
  signal: AbortSignal
  worker: (index: number, ctx: WorkerContext) => Promise<void>
  onSample?: (sample: ThroughputSample) => void
  /** Optional side-channel that runs for the duration (loaded-latency probes). */
  sidecar?: (ctx: WorkerContext) => Promise<void>
}

/**
 * Runs N parallel workers for a fixed window, sampling throughput on a timer,
 * and reduces the run to a `ThroughputStats`. Bytes transferred during the
 * warm-up window are excluded from the final average but kept in the chart.
 */
async function runThroughput(options: ThroughputRunOptions): Promise<ThroughputStats> {
  const { durationMs, warmupMs, streams, signal, worker, onSample, sidecar } = options

  const controller = linkedController(signal)
  const startedAt = performance.now()
  const deadline = startedAt + durationMs

  let totalBytes = 0
  let warmupBytes = 0
  let warmupEndedAt = 0
  let warmupCaptured = false

  const samples: ThroughputSample[] = []
  /** Cumulative (time, bytes) records backing the sliding live window. */
  const timeline: Array<{ t: number, bytes: number }> = [{ t: startedAt, bytes: 0 }]

  const ctx: WorkerContext = {
    deadline,
    signal: controller.signal,
    addBytes: (bytes) => {
      totalBytes += bytes
    },
  }

  const ticker = setInterval(() => {
    const now = performance.now()
    timeline.push({ t: now, bytes: totalBytes })

    // Drop records older than the live window, keeping one anchor before it.
    const windowStart = now - cfg.liveWindowMs
    while (timeline.length > 2 && (timeline[1]?.t ?? 0) < windowStart) timeline.shift()

    const anchor = timeline[0] ?? { t: startedAt, bytes: 0 }
    const mbps = toMbps(totalBytes - anchor.bytes, now - anchor.t)

    if (!warmupCaptured && now - startedAt >= warmupMs) {
      warmupBytes = totalBytes
      warmupEndedAt = now
      warmupCaptured = true
    }

    const sample: ThroughputSample = { t: now - startedAt, mbps }
    samples.push(sample)
    onSample?.(sample)
  }, cfg.sampleIntervalMs)

  const stopAt = setTimeout(() => controller.abort(), durationMs)

  try {
    const jobs: Array<Promise<void>> = []
    for (let i = 0; i < streams; i++) jobs.push(worker(i, ctx).catch(() => undefined))
    if (sidecar) jobs.push(sidecar(ctx).catch(() => undefined))
    await Promise.all(jobs)
  } finally {
    clearTimeout(stopAt)
    clearInterval(ticker)
    controller.abort()
  }

  const endedAt = performance.now()
  const measuredFrom = warmupCaptured ? warmupEndedAt : startedAt
  const measuredBytes = totalBytes - (warmupCaptured ? warmupBytes : 0)
  const measuredMs = Math.max(endedAt - measuredFrom, 1)

  const measuredSamples = samples.filter((s) => s.t >= warmupMs)

  return {
    mbps: toMbps(measuredBytes, measuredMs),
    peakMbps: maxOf((measuredSamples.length ? measuredSamples : samples).map((s) => s.mbps)),
    bytes: measuredBytes,
    durationMs: measuredMs,
    streams,
    samples,
  }
}

// --- download ----------------------------------------------------------------

/** Pulls payloads back-to-back until the deadline, counting bytes as they land. */
async function downloadWorker(index: number, ctx: WorkerContext): Promise<void> {
  while (!ctx.signal.aborted && performance.now() < ctx.deadline) {
    const url = withParams(cfg.endpoints.download, {
      bytes: cfg.download.payloadBytes,
      stream: index,
    })
    try {
      const response = await fetch(url, { cache: 'no-store', signal: ctx.signal })
      if (!response.ok) return

      if (!response.body) {
        // No streaming support: fall back to whole-response timing.
        const buffer = await response.arrayBuffer()
        ctx.addBytes(buffer.byteLength)
        continue
      }

      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) ctx.addBytes(value.byteLength)
        if (performance.now() >= ctx.deadline || ctx.signal.aborted) {
          await reader.cancel().catch(() => undefined)
          return
        }
      }
    } catch (error) {
      if (isAbort(error) || ctx.signal.aborted) return
      // Transient network error: back off briefly, then retry until deadline.
      await delay(150, ctx.signal)
    }
  }
}

/** Latency probes fired while the line is saturated — the bufferbloat signal. */
function loadedLatencySidecar(collect: number[]) {
  return async (ctx: WorkerContext): Promise<void> => {
    while (!ctx.signal.aborted && performance.now() < ctx.deadline) {
      await delay(cfg.loadedLatency.intervalMs, ctx.signal)
      if (ctx.signal.aborted || performance.now() >= ctx.deadline) return
      const rtt = await probeOnce(ctx.signal, cfg.loadedLatency.timeoutMs)
      if (rtt !== null) collect.push(rtt)
    }
  }
}

export async function measureDownload(
  signal: AbortSignal,
  onSample?: (sample: ThroughputSample) => void,
): Promise<{ stats: ThroughputStats, loadedLatency: number[] }> {
  const loadedLatency: number[] = []
  const stats = await runThroughput({
    durationMs: cfg.download.durationMs,
    warmupMs: cfg.download.warmupMs,
    streams: cfg.download.streams,
    signal,
    worker: downloadWorker,
    sidecar: loadedLatencySidecar(loadedLatency),
    onSample,
  })
  return { stats, loadedLatency }
}

// --- upload ------------------------------------------------------------------

let uploadPayload: Blob | null = null

/**
 * One random blob, generated lazily and reused by every stream. Random bytes
 * cannot be compressed away by an intermediary, so the measurement is honest.
 */
function getUploadPayload(): Blob {
  if (uploadPayload) return uploadPayload
  const size = cfg.upload.payloadBytes
  const bytes = new Uint8Array(size)
  const step = 65536 // crypto.getRandomValues() hard limit per call
  for (let offset = 0; offset < size; offset += step) {
    crypto.getRandomValues(bytes.subarray(offset, Math.min(offset + step, size)))
  }
  uploadPayload = new Blob([bytes], { type: 'application/octet-stream' })
  return uploadPayload
}

/**
 * `fetch()` exposes no upload progress, so uploads go through XMLHttpRequest —
 * the only browser API that reports bytes as they are handed to the socket.
 * Those events lead the wire slightly, which is exactly why the upload warm-up
 * window is longer than the download one.
 */
function uploadOnce(blob: Blob, ctx: WorkerContext, index: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', withParams(cfg.endpoints.upload, { stream: index }), true)
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')

    let lastLoaded = 0
    xhr.upload.onprogress = (event) => {
      ctx.addBytes(event.loaded - lastLoaded)
      lastLoaded = event.loaded
      if (performance.now() >= ctx.deadline) xhr.abort()
    }
    xhr.onload = () => resolve()
    xhr.onabort = () => resolve()
    xhr.onerror = () => reject(new Error('upload-failed'))
    xhr.ontimeout = () => resolve()

    const abort = () => xhr.abort()
    ctx.signal.addEventListener('abort', abort, { once: true })
    xhr.onloadend = () => ctx.signal.removeEventListener('abort', abort)

    xhr.send(blob)
  })
}

async function uploadWorker(index: number, ctx: WorkerContext): Promise<void> {
  const blob = getUploadPayload()
  while (!ctx.signal.aborted && performance.now() < ctx.deadline) {
    try {
      await uploadOnce(blob, ctx, index)
    } catch {
      if (ctx.signal.aborted) return
      await delay(150, ctx.signal)
    }
  }
}

export function measureUpload(
  signal: AbortSignal,
  onSample?: (sample: ThroughputSample) => void,
): Promise<ThroughputStats> {
  return runThroughput({
    durationMs: cfg.upload.durationMs,
    warmupMs: cfg.upload.warmupMs,
    streams: cfg.upload.streams,
    signal,
    worker: uploadWorker,
    onSample,
  })
}

// --- orchestration -----------------------------------------------------------

export interface RunOptions {
  signal: AbortSignal
  onPhase?: (phase: TestPhase) => void
  onProgress?: (progress: TestProgress) => void
  serverRegion?: string | null
}

/** Runs the full sequence: latency → download → upload. */
export async function runSpeedTest(options: RunOptions): Promise<SpeedTestResult> {
  const { signal, onPhase, onProgress } = options
  const startedAt = new Date().toISOString()

  // 1. Idle latency ----------------------------------------------------------
  onPhase?.('latency')
  const latencySamples: ThroughputSample[] = []
  const latency = await measureLatency(signal, (rtt, index, total) => {
    latencySamples.push({ t: index, mbps: rtt })
    onProgress?.({
      phase: 'latency',
      phaseProgress: (index + 1) / total,
      value: rtt,
      samples: [...latencySamples],
    })
  })

  // 2. Download (+ loaded latency in parallel) -------------------------------
  onPhase?.('download')
  const downloadSamples: ThroughputSample[] = []
  const { stats: download, loadedLatency: loadedSamples } = await measureDownload(
    signal,
    (sample) => {
      downloadSamples.push(sample)
      onProgress?.({
        phase: 'download',
        phaseProgress: Math.min(sample.t / cfg.download.durationMs, 1),
        value: sample.mbps,
        samples: [...downloadSamples],
      })
    },
  )

  // 3. Upload ----------------------------------------------------------------
  onPhase?.('upload')
  const uploadSamples: ThroughputSample[] = []
  const upload = await measureUpload(signal, (sample) => {
    uploadSamples.push(sample)
    onProgress?.({
      phase: 'upload',
      phaseProgress: Math.min(sample.t / cfg.upload.durationMs, 1),
      value: sample.mbps,
      samples: [...uploadSamples],
    })
  })

  const loadedLatency: LoadedLatencyStats | null = loadedSamples.length
    ? {
        avgMs: mean(loadedSamples),
        increaseMs: Math.max(mean(loadedSamples) - latency.minMs, 0),
        samples: loadedSamples,
      }
    : null

  onPhase?.('done')

  return {
    id: `${Date.now().toString(36)}-${nonce()}`,
    startedAt,
    latency,
    download,
    upload,
    loadedLatency,
    server: {
      origin: typeof window === 'undefined' ? '' : window.location.origin,
      region: options.serverRegion ?? null,
    },
  }
}
