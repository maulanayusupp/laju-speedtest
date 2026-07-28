// =============================================================================
// Turns raw measurements into qualitative grades. Components call these instead
// of importing thresholds directly, so the scale can be retuned in exactly one
// place (config/speedtest.config.ts).
//
// Grades describe the *experience* a number usually supports. They are opinions
// about comfort, not certifications, and the UI labels them as such.
// =============================================================================
import type { Grade, SpeedTestResult } from '~/types'
import { gradeHigher, gradeLower } from '~/config/speedtest.config'

export function gradeDownload(mbps: number): Grade {
  return gradeHigher('download', mbps)
}

export function gradeUpload(mbps: number): Grade {
  return gradeHigher('upload', mbps)
}

export function gradeLatency(ms: number): Grade {
  return gradeLower('latency', ms)
}

export function gradeJitter(ms: number): Grade {
  return gradeLower('jitter', ms)
}

/** Extra delay added when the line is saturated — the bufferbloat signal. */
export function gradeBufferbloat(increaseMs: number): Grade {
  return gradeLower('bufferbloat', increaseMs)
}

/** The weakest of the four headline grades — used for the one-line verdict. */
export function overallGrade(result: SpeedTestResult): Grade {
  const order: Grade[] = ['excellent', 'good', 'fair', 'poor']
  const grades: Grade[] = [
    gradeDownload(result.download.mbps),
    gradeUpload(result.upload.mbps),
    gradeLatency(result.latency.minMs),
    gradeJitter(result.latency.jitterMs),
  ]
  return grades.reduce((worst, grade) =>
    order.indexOf(grade) > order.indexOf(worst) ? grade : worst,
  )
}
