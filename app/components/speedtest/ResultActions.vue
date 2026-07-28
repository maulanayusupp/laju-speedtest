<script setup lang="ts">
// Post-run actions: copy a paste-ready summary, run again, review history.
import type { NetworkIdentity, SpeedTestResult } from '~/types'
import { buildResultSummary } from '~/services/report.service'

const props = defineProps<{
  result: SpeedTestResult
  identity: NetworkIdentity | null
}>()

const emit = defineEmits<{ restart: [] }>()

const { t } = useI18n()
const localePath = useLocalePath()
const { speed, latency, dateTime } = useFormat()
const { copy, copiedKey } = useClipboard(2200)

const isCopied = computed(() => copiedKey.value === 'summary')

function onCopy() {
  const summary = buildResultSummary(
    props.result,
    props.identity,
    {
      title: t('share.title'),
      download: t('metrics.download'),
      upload: t('metrics.upload'),
      latency: t('metrics.latency'),
      jitter: t('metrics.jitter'),
      loaded: t('metrics.loadedLatency'),
      ipv4: t('connection.ipv4'),
      ipv6: t('connection.ipv6'),
      measuredAt: t('share.measuredAt'),
      source: t('share.source'),
      unitMbps: t('units.mbps'),
      unitMs: t('units.ms'),
    },
    { speed, latency, dateTime },
  )
  void copy(summary, 'summary')
}
</script>

<template>
  <div class="actions">
    <BaseButton variant="primary" size="md" @click="emit('restart')">
      <template #icon><BaseIcon name="refresh" :size="18" /></template>
      {{ t('stage.again') }}
    </BaseButton>
    <BaseButton variant="outline" size="md" @click="onCopy">
      <template #icon><BaseIcon :name="isCopied ? 'check' : 'share'" :size="18" /></template>
      {{ isCopied ? t('share.copied') : t('share.copy') }}
    </BaseButton>
    <BaseButton variant="ghost" size="md" :to="localePath('/history')">
      <template #icon><BaseIcon name="chart" :size="18" /></template>
      {{ t('stage.viewHistory') }}
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
}
</style>
