// =============================================================================
// Reactive view over the locally stored test history. Reads on mount only —
// localStorage is unavailable during SSR, and pretending otherwise would cause
// a hydration mismatch.
// =============================================================================
import type { StoredResult } from '~/services/history.service'
import { clearHistory, historySeries, readHistory } from '~/services/history.service'

export function useTestHistory() {
  const entries = ref<StoredResult[]>([])
  const isReady = ref(false)

  function refresh() {
    entries.value = readHistory()
  }

  function clear() {
    entries.value = clearHistory()
  }

  onMounted(() => {
    refresh()
    isReady.value = true
  })

  const series = computed(() => historySeries(entries.value))

  const averages = computed(() => {
    if (entries.value.length === 0) return null
    const sum = entries.value.reduce(
      (acc, entry) => ({
        download: acc.download + entry.download.mbps,
        upload: acc.upload + entry.upload.mbps,
        latency: acc.latency + entry.latency.minMs,
      }),
      { download: 0, upload: 0, latency: 0 },
    )
    const count = entries.value.length
    return {
      download: sum.download / count,
      upload: sum.upload / count,
      latency: sum.latency / count,
    }
  })

  const best = computed(() => {
    if (entries.value.length === 0) return null
    return entries.value.reduce((top, entry) =>
      entry.download.mbps > top.download.mbps ? entry : top,
    )
  })

  return { entries, series, averages, best, isReady, refresh, clear }
}
