<script setup lang="ts">
// The instrument-panel surface used by every boxed block on the site.
withDefaults(defineProps<{
  /** `flat` drops the lift shadow for dense grids. */
  tone?: 'default' | 'flat' | 'well'
  padding?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}>(), {
  tone: 'default',
  padding: 'md',
  interactive: false,
})
</script>

<template>
  <div class="card" :class="[`card--${tone}`, `card--pad-${padding}`, { 'is-interactive': interactive }]">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.card {
  @include panel;
}

.card--flat {
  box-shadow: none;
  background: rgb(255 255 255 / 0.02);
}

.card--well {
  background: var(--c-abyss);
  box-shadow: none;
}

.card--pad-sm {
  padding: 1rem;
}

.card--pad-md {
  padding: clamp(1.15rem, 2.4vw, 1.75rem);
}

.card--pad-lg {
  padding: clamp(1.5rem, 3.4vw, 2.5rem);
}

.is-interactive {
  transition:
    transform var(--dur) var(--ease-out),
    border-color var(--dur) var(--ease-out),
    box-shadow var(--dur) var(--ease-out);

  &:hover {
    transform: translateY(-3px);
    border-color: var(--c-line-strong);
    box-shadow: var(--shadow-lift);
  }
}
</style>
