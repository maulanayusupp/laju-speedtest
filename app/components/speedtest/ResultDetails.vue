<script setup lang="ts">
// The numbers behind the headline: responsiveness under load, how much data the
// run cost, and where it was measured. Context is what makes a result usable.
import type { SpeedTestResult } from '~/types'
import { gradeBufferbloat } from '~/services/grading.service'

const props = defineProps<{ result: SpeedTestResult }>()

const { t } = useI18n()
const { latency, bytes, number, percent } = useFormat()

const bufferbloat = computed(() => {
  const loaded = props.result.loadedLatency
  if (!loaded) return null
  return { grade: gradeBufferbloat(loaded.increaseMs), increase: loaded.increaseMs, avg: loaded.avgMs }
})

const rows = computed(() => {
  const result = props.result
  const totalBytes = result.download.bytes + result.upload.bytes
  return [
    {
      key: 'loadedLatency',
      value: result.loadedLatency ? `${latency(result.loadedLatency.avgMs)} ${t('units.ms')}` : t('connection.unknown'),
    },
    {
      key: 'idleLatency',
      value: `${latency(result.latency.minMs)} – ${latency(result.latency.maxMs)} ${t('units.ms')}`,
    },
    { key: 'loss', value: percent(result.latency.lossRatio) },
    { key: 'streams', value: `${number(result.download.streams, 0)} / ${number(result.upload.streams, 0)}` },
    { key: 'data', value: bytes(totalBytes) },
    { key: 'server', value: result.server.region ?? t('connection.localOrigin') },
  ]
})
</script>

<template>
  <BaseCard class="details" padding="md">
    <header class="details__head">
      <p class="details__title">{{ t('details.title') }}</p>
      <BaseBadge v-if="bufferbloat" :tone="bufferbloat.grade" dot>
        {{ t('details.bufferbloat') }}: {{ t(`grades.${bufferbloat.grade}`) }}
      </BaseBadge>
    </header>

    <p v-if="bufferbloat" class="details__bloat">
      {{ t('details.bufferbloatBody', { value: latency(bufferbloat.increase) }) }}
    </p>

    <dl class="details__grid">
      <div v-for="row in rows" :key="row.key" class="details__row">
        <dt>{{ t(`details.rows.${row.key}`) }}</dt>
        <dd>{{ row.value }}</dd>
      </div>
    </dl>
  </BaseCard>
</template>

<style lang="scss" scoped>
.details {
  display: grid;
  gap: 0.9rem;
}

.details__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.details__title {
  @include eyebrow;

  color: var(--c-text);
}

.details__bloat {
  max-width: 60ch;
  font-size: 0.85rem;
  color: var(--c-text-soft);
}

.details__grid {
  display: grid;
  gap: 0.35rem 1.5rem;
  margin: 0;

  @include respond-to('sm') {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.details__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.4rem;
  border-bottom: 1px dashed var(--c-line);
  font-size: 0.84rem;

  dt {
    color: var(--c-text-muted);
  }

  dd {
    margin: 0;
    font-family: $font-mono;
    font-size: 0.8rem;
    color: var(--c-text);
  }
}
</style>
