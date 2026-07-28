<script setup lang="ts">
// Small status pill. `tone` maps to the semantic measurement colours so a grade
// looks the same wherever it appears.
withDefaults(defineProps<{
  tone?: 'neutral' | 'excellent' | 'good' | 'fair' | 'poor' | 'download' | 'upload'
  dot?: boolean
}>(), {
  tone: 'neutral',
  dot: false,
})
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <span v-if="dot" class="badge__dot" />
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.65rem;
  border: 1px solid currentcolor;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.5;
  background: rgb(255 255 255 / 0.03);
}

.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentcolor;
}

.badge--neutral {
  color: var(--c-text-muted);
}

.badge--excellent {
  color: var(--c-lime);
}

.badge--good {
  color: var(--c-cyan);
}

.badge--fair {
  color: var(--c-amber);
}

.badge--poor {
  color: var(--c-rose);
}

.badge--download {
  color: var(--c-download);
}

.badge--upload {
  color: var(--c-upload);
}
</style>
