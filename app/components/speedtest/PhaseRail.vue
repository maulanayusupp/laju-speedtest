<script setup lang="ts">
// Horizontal rail showing where the run is: which phases are done, which is
// live, and what is still ahead. Doubles as the accessible progress indicator.
import type { TestPhase } from '~/types'

const props = defineProps<{
  phase: TestPhase
  progress: number
}>()

const { t } = useI18n()

const steps: Array<{ key: 'latency' | 'download' | 'upload', icon: 'clock' | 'download' | 'upload' }> = [
  { key: 'latency', icon: 'clock' },
  { key: 'download', icon: 'download' },
  { key: 'upload', icon: 'upload' },
]

const order = ['latency', 'download', 'upload'] as const

function stateOf(key: (typeof order)[number]): 'pending' | 'active' | 'done' {
  if (props.phase === 'done') return 'done'
  const currentIndex = order.indexOf(props.phase as (typeof order)[number])
  const index = order.indexOf(key)
  if (currentIndex === -1) return 'pending'
  if (index < currentIndex) return 'done'
  return index === currentIndex ? 'active' : 'pending'
}
</script>

<template>
  <div class="rail">
    <div
      class="rail__track"
      role="progressbar"
      :aria-valuenow="Math.round(progress * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="t('stage.progressLabel')"
    >
      <span class="rail__fill" :style="{ '--fill': `${Math.round(progress * 1000) / 10}%` }" />
    </div>
    <ol class="rail__steps">
      <li
        v-for="step in steps"
        :key="step.key"
        class="rail__step"
        :class="`is-${stateOf(step.key)}`"
      >
        <BaseIcon :name="step.icon" :size="16" />
        <span>{{ t(`stage.steps.${step.key}`) }}</span>
      </li>
    </ol>
  </div>
</template>

<style lang="scss" scoped>
.rail {
  display: grid;
  gap: 0.85rem;
  width: min(100%, 34rem);
  margin-inline: auto;
}

.rail__track {
  position: relative;
  height: 3px;
  border-radius: var(--radius-pill);
  background: var(--c-line);
  overflow: hidden;
}

.rail__fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--fill, 0%);
  border-radius: inherit;
  background: var(--grad-spectrum);
  transition: width var(--dur) linear;
}

.rail__steps {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.rail__step {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--c-text-muted);
  transition: color var(--dur) var(--ease-out);

  &.is-active {
    color: var(--c-cyan);
  }

  &.is-done {
    color: var(--c-text-soft);
  }
}
</style>
