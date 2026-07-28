// =============================================================================
// Builds the plain-text summary that the "copy result" button puts on the
// clipboard. Kept out of the component so the wording can be reused (share
// sheets, support emails) and unit-tested without a DOM.
// =============================================================================
import type { NetworkIdentity, SpeedTestResult } from '~/types'

export interface SummaryLabels {
  title: string
  download: string
  upload: string
  latency: string
  jitter: string
  loaded: string
  ipv4: string
  ipv6: string
  measuredAt: string
  source: string
  unitMbps: string
  unitMs: string
}

export interface SummaryFormatters {
  speed: (mbps: number) => string
  latency: (ms: number) => string
  dateTime: (iso: string) => string
}

/**
 * A compact, paste-anywhere report. Deliberately includes where and when the
 * measurement was taken — a speed number without context is not evidence.
 */
export function buildResultSummary(
  result: SpeedTestResult,
  identity: NetworkIdentity | null,
  labels: SummaryLabels,
  format: SummaryFormatters,
): string {
  const lines: string[] = [
    labels.title,
    `${labels.download}: ${format.speed(result.download.mbps)} ${labels.unitMbps}`,
    `${labels.upload}: ${format.speed(result.upload.mbps)} ${labels.unitMbps}`,
    `${labels.latency}: ${format.latency(result.latency.minMs)} ${labels.unitMs}`,
    `${labels.jitter}: ${format.latency(result.latency.jitterMs)} ${labels.unitMs}`,
  ]

  if (result.loadedLatency) {
    lines.push(`${labels.loaded}: ${format.latency(result.loadedLatency.avgMs)} ${labels.unitMs}`)
  }

  if (identity?.ipv4.address) lines.push(`${labels.ipv4}: ${identity.ipv4.address}`)
  if (identity?.ipv6.address) lines.push(`${labels.ipv6}: ${identity.ipv6.address}`)

  lines.push(`${labels.measuredAt}: ${format.dateTime(result.startedAt)}`)
  lines.push(labels.source)

  return lines.join('\n')
}
