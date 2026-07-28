<script setup lang="ts">
// Bars, not a line: history entries are discrete events at irregular times, so
// spacing them evenly as a line would imply a trend that the data cannot claim.
// Heights are passed as CSS custom properties — the only permitted use of
// `:style` in this codebase (see CLAUDE.md §Styling).
const props = defineProps<{
  series: Array<{ at: string, download: number, upload: number, latency: number }>
}>()

const { t } = useI18n()
const { speed, dateTime } = useFormat()

const peak = computed(() =>
  props.series.reduce((max, point) => Math.max(max, point.download, point.upload), 1),
)

const bars = computed(() =>
  props.series.map((point) => ({
    at: point.at,
    label: dateTime(point.at),
    download: point.download,
    upload: point.upload,
    downloadHeight: `${Math.max((point.download / peak.value) * 100, 1.5)}%`,
    uploadHeight: `${Math.max((point.upload / peak.value) * 100, 1.5)}%`,
  })),
)
</script>

<template>
  <figure class="history-chart">
    <div class="history-chart__plot">
      <div
        v-for="bar in bars"
        :key="bar.at"
        class="history-chart__group"
        :title="`${bar.label} · ${speed(bar.download)} / ${speed(bar.upload)} ${t('units.mbps')}`"
      >
        <span class="history-chart__bar history-chart__bar--down" :style="{ '--h': bar.downloadHeight }" />
        <span class="history-chart__bar history-chart__bar--up" :style="{ '--h': bar.uploadHeight }" />
      </div>
    </div>
    <figcaption class="history-chart__legend">
      <span class="history-chart__key history-chart__key--down">{{ t('metrics.download') }}</span>
      <span class="history-chart__key history-chart__key--up">{{ t('metrics.upload') }}</span>
      <span class="history-chart__peak">
        {{ t('history.peak', { value: speed(peak), unit: t('units.mbps') }) }}
      </span>
    </figcaption>
  </figure>
</template>

<style lang="scss" scoped>
.history-chart {
  display: grid;
  gap: 0.85rem;
  margin: 0;
}

.history-chart__plot {
  display: flex;
  align-items: flex-end;
  gap: clamp(0.35rem, 1.4vw, 0.9rem);
  height: clamp(8rem, 22vw, 12rem);
  padding: 0.75rem;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  background:
    repeating-linear-gradient(
      to top,
      rgb(140 165 255 / 0.08) 0 1px,
      transparent 1px 25%
    );
  overflow-x: auto;
}

.history-chart__group {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  flex: 1 0 auto;
  min-width: 14px;
  height: 100%;
}

.history-chart__bar {
  width: 7px;
  height: var(--h, 2%);
  border-radius: var(--radius-xs) var(--radius-xs) 2px 2px;
  transition: height var(--dur-slow) var(--ease-out);
}

.history-chart__bar--down {
  background: var(--grad-download);
}

.history-chart__bar--up {
  background: var(--grad-upload);
}

.history-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.25rem;
  font-size: 0.78rem;
  color: var(--c-text-muted);
}

.history-chart__key {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  &::before {
    content: '';
    width: 10px;
    height: 6px;
    border-radius: 2px;
  }
}

.history-chart__key--down::before {
  background: var(--grad-download);
}

.history-chart__key--up::before {
  background: var(--grad-upload);
}
</style>
