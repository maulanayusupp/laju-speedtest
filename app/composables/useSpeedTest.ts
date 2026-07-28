// =============================================================================
// Reactive wrapper around the measurement engine. Owns nothing but state: all
// the actual measuring lives in `services/speedtest.service.ts`.
// =============================================================================
import type { SpeedTestResult, TestPhase, ThroughputSample } from '~/types'
import { speedTestConfig as cfg } from '~/config/speedtest.config'
import { appendHistory } from '~/services/history.service'
import { runSpeedTest } from '~/services/speedtest.service'

/** Share of the overall progress bar owned by each phase. Sums to 1. */
const PHASE_WEIGHT: Record<'latency' | 'download' | 'upload', number> = {
  latency: 0.12,
  download: 0.48,
  upload: 0.4,
}

export function useSpeedTest() {
  const phase = ref<TestPhase>('idle')
  const phaseProgress = ref(0)
  /** Live reading for the active phase: Mbps while transferring, ms while pinging. */
  const liveValue = ref(0)
  const liveSamples = ref<ThroughputSample[]>([])
  const downloadSeries = ref<ThroughputSample[]>([])
  const uploadSeries = ref<ThroughputSample[]>([])
  const result = ref<SpeedTestResult | null>(null)
  const errorKey = ref<string | null>(null)

  let controller: AbortController | null = null

  const isRunning = computed(() =>
    phase.value === 'latency' || phase.value === 'download' || phase.value === 'upload',
  )

  const overallProgress = computed(() => {
    if (phase.value === 'done') return 1
    if (!isRunning.value) return 0
    const order: Array<keyof typeof PHASE_WEIGHT> = ['latency', 'download', 'upload']
    const current = phase.value as keyof typeof PHASE_WEIGHT
    const completed = order
      .slice(0, order.indexOf(current))
      .reduce((sum, key) => sum + PHASE_WEIGHT[key], 0)
    return Math.min(completed + PHASE_WEIGHT[current] * phaseProgress.value, 1)
  })

  /** The gauge's 0–1 needle position, on the engine's non-linear scale. */
  const gaugePosition = computed(() => {
    if (phase.value === 'latency') return Math.min(phaseProgress.value, 1)
    return gaugeFraction(liveValue.value, cfg.gaugeMaxMbps)
  })

  function reset() {
    phase.value = 'idle'
    phaseProgress.value = 0
    liveValue.value = 0
    liveSamples.value = []
    downloadSeries.value = []
    uploadSeries.value = []
    result.value = null
    errorKey.value = null
  }

  async function start(options: { serverRegion?: string | null } = {}) {
    if (isRunning.value) return
    reset()
    controller = new AbortController()

    try {
      const outcome = await runSpeedTest({
        signal: controller.signal,
        serverRegion: options.serverRegion ?? null,
        onPhase: (next) => {
          phase.value = next
          phaseProgress.value = 0
          liveValue.value = 0
          liveSamples.value = []
        },
        onProgress: (progress) => {
          phaseProgress.value = progress.phaseProgress
          liveValue.value = progress.value
          liveSamples.value = progress.samples
          if (progress.phase === 'download') downloadSeries.value = progress.samples
          if (progress.phase === 'upload') uploadSeries.value = progress.samples
        },
      })

      if (controller.signal.aborted) {
        phase.value = 'idle'
        return
      }

      result.value = outcome
      phase.value = 'done'
      appendHistory(outcome)
    } catch (error) {
      if (controller?.signal.aborted) {
        phase.value = 'idle'
        return
      }
      errorKey.value = error instanceof Error ? error.message : 'unknown'
      phase.value = 'error'
    } finally {
      controller = null
    }
  }

  function stop() {
    controller?.abort()
    controller = null
    phase.value = 'idle'
    phaseProgress.value = 0
    liveValue.value = 0
  }

  // A navigation mid-test must not leave sockets running in the background.
  onScopeDispose(() => controller?.abort())

  // Refs are returned as-is (not `readonly`): the caller is a single page that
  // owns this instance, and deep-readonly wrappers only fight the prop types.
  return {
    phase,
    phaseProgress,
    liveValue,
    liveSamples,
    downloadSeries,
    uploadSeries,
    result,
    errorKey,
    isRunning,
    overallProgress,
    gaugePosition,
    start,
    stop,
    reset,
  }
}
