<script setup lang="ts">
// Local history. Nothing on this page has ever left the browser, and the page
// says so plainly — including the button that erases it.
const { t } = useI18n()
const localePath = useLocalePath()
const { speed, latency } = useFormat()

usePageSeo(() => t('history.meta.title'), () => t('history.meta.description'), { noindex: true })

const { entries, series, averages, best, isReady, clear } = useTestHistory()

const summary = computed(() => {
  if (!averages.value || !best.value) return []
  return [
    { key: 'runs', value: String(entries.value.length) },
    { key: 'avgDownload', value: `${speed(averages.value.download)} ${t('units.mbps')}` },
    { key: 'avgUpload', value: `${speed(averages.value.upload)} ${t('units.mbps')}` },
    { key: 'avgLatency', value: `${latency(averages.value.latency)} ${t('units.ms')}` },
    { key: 'best', value: `${speed(best.value.download.mbps)} ${t('units.mbps')}` },
  ]
})
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('history.hero.eyebrow')"
      :title="t('history.hero.title')"
      :lead="t('history.hero.lead')"
    />

    <section class="section history">
      <div class="container">
        <ClientOnly>
          <template v-if="isReady && entries.length > 0">
            <div class="history__summary">
              <div v-for="item in summary" :key="item.key" class="history__stat">
                <span class="history__stat-label">{{ t(`history.summary.${item.key}`) }}</span>
                <span class="history__stat-value">{{ item.value }}</span>
              </div>
            </div>

            <div class="history__chart">
              <HistoryChart :series="series" />
            </div>

            <div class="history__table">
              <HistoryTable :entries="entries" />
            </div>

            <div class="history__foot">
              <InfoNote class="history__note">{{ t('history.storageNote') }}</InfoNote>
              <BaseButton variant="danger" size="md" @click="clear">
                <template #icon><BaseIcon name="trash" :size="18" /></template>
                {{ t('history.clear') }}
              </BaseButton>
            </div>
          </template>

          <BaseCard v-else-if="isReady" class="history__empty" padding="lg">
            <BaseIcon name="chart" :size="28" />
            <h2 class="history__empty-title">{{ t('history.empty.title') }}</h2>
            <p class="history__empty-body">{{ t('history.empty.body') }}</p>
            <BaseButton variant="primary" size="md" :to="localePath('/')">
              <template #icon><BaseIcon name="play" :size="18" /></template>
              {{ t('history.empty.cta') }}
            </BaseButton>
          </BaseCard>

          <template #fallback>
            <p class="history__loading">{{ t('common.loading') }}</p>
          </template>
        </ClientOnly>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.history__summary {
  display: grid;
  gap: 0.6rem;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  margin-bottom: 1.25rem;
}

.history__stat {
  display: grid;
  gap: 0.2rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 0.02);
}

.history__stat-label {
  @include eyebrow;

  color: var(--c-text-muted);
}

.history__stat-value {
  @include numeric;

  font-size: 1.15rem;
  color: var(--c-text);
}

.history__chart,
.history__table {
  margin-bottom: 1.25rem;
}

.history__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
}

.history__note {
  flex: 1 1 22rem;
}

.history__empty {
  display: grid;
  gap: 0.75rem;
  justify-items: center;
  text-align: center;
  color: var(--c-text-muted);
}

.history__empty-title {
  font-size: 1.25rem;
}

.history__empty-body {
  max-width: 46ch;
  color: var(--c-text-soft);
}

.history__loading {
  font-size: 0.9rem;
  color: var(--c-text-muted);
}
</style>
