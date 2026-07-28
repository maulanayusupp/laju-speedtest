<script setup lang="ts">
// The number at the centre of the gauge. Kept in the DOM (not the canvas) so it
// is selectable, translatable and announced by screen readers as it changes.
import type { TestPhase } from '~/types'

const props = withDefaults(defineProps<{
  phase: TestPhase
  value: number
  /** Overrides the phase label, e.g. naming which metric is on the dial. */
  caption?: string
}>(), {
  caption: undefined,
})

const { t } = useI18n()
const { speed, latency } = useFormat()

const isLatencyPhase = computed(() => props.phase === 'latency')
const isIdle = computed(() => props.phase === 'idle')

const display = computed(() => {
  if (isIdle.value) return '—'
  return isLatencyPhase.value ? latency(props.value) : speed(props.value)
})

const unit = computed(() => (isLatencyPhase.value ? t('units.ms') : t('units.mbps')))

/**
 * Long readings (multi-gigabit links, or locales that group thousands) must not
 * grow into the gauge ring, so the type scale steps down by digit count.
 */
const lengthClass = computed(() => {
  const length = display.value.replace(/\D/g, '').length
  if (length >= 7) return 'is-longest'
  if (length >= 5) return 'is-long'
  return null
})

const label = computed(() => props.caption ?? t(`stage.phases.${props.phase}`))
</script>

<template>
  <div class="readout" :class="`readout--${phase}`">
    <p class="readout__caption">{{ label }}</p>
    <p class="readout__value" aria-live="polite" :aria-atomic="true">
      <span class="readout__number" :class="[lengthClass, { 'is-placeholder': isIdle }]">{{ display }}</span>
    </p>
    <p class="readout__unit">{{ unit }}</p>
  </div>
</template>

<style lang="scss" scoped>
.readout {
  --readout-accent: var(--c-cyan);

  display: grid;
  gap: 0.15rem;
  justify-items: center;
}

.readout--upload {
  --readout-accent: var(--c-magenta);
}

.readout--latency {
  --readout-accent: var(--c-amber);
}

.readout--done {
  --readout-accent: var(--c-lime);
}

.readout--error {
  --readout-accent: var(--c-rose);
}

.readout__caption {
  @include eyebrow;

  color: var(--readout-accent);
}

.readout__value {
  @include numeric;

  font-size: clamp(2.6rem, 11vw, 4.4rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--c-text);
  text-shadow: 0 0 40px rgb(34 225 255 / 0.18);
}

.readout__number.is-long {
  font-size: 0.72em;
}

.readout__number.is-longest {
  font-size: 0.56em;
}

// The idle em dash is a placeholder, not a measurement — it should not shout.
.readout__number.is-placeholder {
  font-size: clamp(2rem, 7vw, 3rem);
  color: var(--c-text-muted);
  text-shadow: none;
}

.readout__unit {
  @include eyebrow;

  color: var(--c-text-muted);
}
</style>
