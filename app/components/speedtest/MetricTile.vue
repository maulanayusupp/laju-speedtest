<script setup lang="ts">
// One measurement, one colour, one grade. Used both live (during a run) and in
// the final result grid.
import type { Grade, MetricKey } from '~/types'
import type { IconName } from '~/utils/iconPaths'

withDefaults(defineProps<{
  metric: MetricKey
  icon: IconName
  label: string
  value: string
  unit: string
  grade?: Grade | null
  gradeLabel?: string | null
  /** Neutral badge shown instead of a grade when grading would be misleading. */
  note?: string | null
  hint?: string | null
  active?: boolean
}>(), {
  grade: null,
  gradeLabel: null,
  note: null,
  hint: null,
  active: false,
})
</script>

<template>
  <div class="tile" :class="[`tile--${metric}`, { 'is-active': active }]">
    <div class="tile__head">
      <span class="tile__icon"><BaseIcon :name="icon" :size="16" /></span>
      <span class="tile__label">{{ label }}</span>
    </div>
    <p class="tile__value">
      <span class="tile__number">{{ value }}</span>
      <span class="tile__unit">{{ unit }}</span>
    </p>
    <div class="tile__foot">
      <BaseBadge v-if="note" tone="neutral" dot>{{ note }}</BaseBadge>
      <BaseBadge v-else-if="grade && gradeLabel" :tone="grade" dot>{{ gradeLabel }}</BaseBadge>
      <span v-if="hint" class="tile__hint">{{ hint }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tile {
  --tile-accent: var(--c-text-muted);

  @include panel(var(--radius-md));

  display: grid;
  gap: 0.5rem;
  align-content: start;
  padding: 1rem 1.1rem;
  transition: border-color var(--dur) var(--ease-out);

  &::after {
    content: '';
    position: absolute;
    inset: auto 0 0 0;
    height: 2px;
    border-radius: var(--radius-pill);
    background: var(--tile-accent);
    opacity: 0;
    transition: opacity var(--dur) var(--ease-out);
  }

  &.is-active {
    border-color: var(--tile-accent);

    &::after {
      opacity: 0.8;
    }
  }
}

.tile--download {
  --tile-accent: var(--c-download);
}

.tile--upload {
  --tile-accent: var(--c-upload);
}

.tile--latency {
  --tile-accent: var(--c-latency);
}

.tile--jitter {
  --tile-accent: var(--c-jitter);
}

.tile__head {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--tile-accent);
}

.tile__label {
  @include eyebrow;

  color: var(--c-text-muted);
}

.tile__value {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.tile__number {
  @include numeric;

  font-size: clamp(1.5rem, 3.6vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--c-text);
}

.tile__unit {
  font-size: 0.78rem;
  color: var(--c-text-muted);
}

.tile__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.4rem;
}

.tile__hint {
  font-size: 0.74rem;
  color: var(--c-text-muted);
}
</style>
