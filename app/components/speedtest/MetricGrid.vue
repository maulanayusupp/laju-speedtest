<script setup lang="ts">
// The four headline numbers. Renders live values while a run is in progress and
// final values once it completes, so the layout never jumps.
import type { SpeedTestResult, TestPhase } from '~/types'
import { gradeDownload, gradeJitter, gradeLatency, gradeUpload } from '~/services/grading.service'

const props = defineProps<{
  result: SpeedTestResult | null
  phase: TestPhase
  liveValue: number
}>()

const { t } = useI18n()
const { speed, latency, transferRate } = useFormat()

const placeholder = '—'

const tiles = computed(() => {
  const result = props.result
  const isLive = (phase: TestPhase) => props.phase === phase && !result

  const downloadValue = result
    ? speed(result.download.mbps)
    : isLive('download') ? speed(props.liveValue) : placeholder
  const uploadValue = result
    ? speed(result.upload.mbps)
    : isLive('upload') ? speed(props.liveValue) : placeholder
  const latencyValue = result ? latency(result.latency.minMs) : placeholder
  const jitterValue = result ? latency(result.latency.jitterMs) : placeholder

  return [
    {
      metric: 'download' as const,
      icon: 'download' as const,
      label: t('metrics.download'),
      value: downloadValue,
      unit: t('units.mbps'),
      grade: result ? gradeDownload(result.download.mbps) : null,
      hint: result ? t('metrics.transferHint', { value: transferRate(result.download.mbps) }) : null,
      active: props.phase === 'download',
    },
    {
      metric: 'upload' as const,
      icon: 'upload' as const,
      label: t('metrics.upload'),
      value: uploadValue,
      unit: t('units.mbps'),
      grade: result ? gradeUpload(result.upload.mbps) : null,
      hint: result ? t('metrics.transferHint', { value: transferRate(result.upload.mbps) }) : null,
      active: props.phase === 'upload',
    },
    {
      metric: 'latency' as const,
      icon: 'clock' as const,
      label: t('metrics.latency'),
      value: latencyValue,
      unit: t('units.ms'),
      grade: result ? gradeLatency(result.latency.minMs) : null,
      hint: result ? t('metrics.latencyHint', { value: latency(result.latency.avgMs) }) : null,
      active: props.phase === 'latency',
    },
    {
      metric: 'jitter' as const,
      icon: 'activity' as const,
      label: t('metrics.jitter'),
      value: jitterValue,
      unit: t('units.ms'),
      grade: result ? gradeJitter(result.latency.jitterMs) : null,
      hint: result && result.latency.lossRatio > 0
        ? t('metrics.lossHint', { value: Math.round(result.latency.lossRatio * 100) })
        : null,
      active: props.phase === 'latency',
    },
  ]
})
</script>

<template>
  <div class="metrics">
    <MetricTile
      v-for="tile in tiles"
      :key="tile.metric"
      :metric="tile.metric"
      :icon="tile.icon"
      :label="tile.label"
      :value="tile.value"
      :unit="tile.unit"
      :grade="tile.grade"
      :grade-label="tile.grade ? t(`grades.${tile.grade}`) : null"
      :hint="tile.hint"
      :active="tile.active"
    />
  </div>
</template>

<style lang="scss" scoped>
.metrics {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @include respond-to('lg') {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
