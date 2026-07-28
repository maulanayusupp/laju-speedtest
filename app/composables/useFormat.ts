// =============================================================================
// Locale-aware formatting. Number grouping and decimal separators differ
// between ID ("1.234,5") and EN ("1,234.5"), so every displayed figure goes
// through here rather than through `toFixed()` in a template.
// =============================================================================
import { formatBytes, latencyDigits, mbpsToMBps, speedDigits } from '~/utils/format'

export function useFormat() {
  const { locale } = useI18n()

  const intlLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))

  function number(value: number, digits: number): string {
    return new Intl.NumberFormat(intlLocale.value, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Number.isFinite(value) ? value : 0)
  }

  /** Mbps with magnitude-appropriate precision (see utils/format). */
  function speed(mbps: number): string {
    return number(mbps, speedDigits(mbps))
  }

  /** Milliseconds, one decimal below 100 ms. */
  function latency(ms: number): string {
    return number(ms, latencyDigits(ms))
  }

  /** Megabytes per second — the number a download manager shows. */
  function transferRate(mbps: number): string {
    const value = mbpsToMBps(mbps)
    return number(value, value >= 10 ? 1 : 2)
  }

  function bytes(value: number): string {
    const { value: scaled, unit } = formatBytes(value)
    return `${number(scaled, scaled >= 100 ? 0 : 1)} ${unit}`
  }

  function percent(fraction: number): string {
    return new Intl.NumberFormat(intlLocale.value, {
      style: 'percent',
      maximumFractionDigits: fraction < 0.1 ? 1 : 0,
    }).format(Number.isFinite(fraction) ? fraction : 0)
  }

  function dateTime(iso: string): string {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat(intlLocale.value, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  return { number, speed, latency, transferRate, bytes, percent, dateTime, intlLocale }
}
