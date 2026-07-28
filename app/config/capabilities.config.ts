// =============================================================================
// "What this speed comfortably supports" — ESTIMATES, not promises.
//
// The thresholds below are conservative round numbers drawn from the sustained
// bandwidth that streaming, conferencing and cloud-gaming platforms commonly
// publish as their own recommendations. They describe ONE activity at a time on
// an otherwise idle line. Real behaviour also depends on latency, jitter, Wi-Fi
// quality and how many devices share the connection — which is exactly why the
// UI labels this block as an estimate and links to the methodology page.
// =============================================================================
import type { CapabilityCheck } from '~/types'

export const capabilityChecks: CapabilityCheck[] = [
  { id: 'browsing', downloadMbps: 3, icon: 'globe' },
  { id: 'videoCall', downloadMbps: 4, uploadMbps: 3, icon: 'users' },
  { id: 'hdVideo', downloadMbps: 8, icon: 'video' },
  { id: 'uhdVideo', downloadMbps: 25, icon: 'monitor' },
  { id: 'cloudGaming', downloadMbps: 25, uploadMbps: 2, icon: 'gamepad' },
  { id: 'largeFiles', downloadMbps: 100, uploadMbps: 20, icon: 'cloud' },
]
