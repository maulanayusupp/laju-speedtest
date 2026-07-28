<script setup lang="ts">
// Inline callout used wherever a number needs a caveat. Making caveats a
// first-class component is how the "no over-claiming" rule stays visible.
import type { IconName } from '~/utils/iconPaths'

withDefaults(defineProps<{
  tone?: 'info' | 'warn'
  icon?: IconName
}>(), {
  tone: 'info',
  icon: 'info',
})
</script>

<template>
  <p class="note" :class="`note--${tone}`">
    <BaseIcon :name="icon" :size="16" />
    <span><slot /></span>
  </p>
</template>

<style lang="scss" scoped>
.note {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.7rem 0.9rem;
  border: 1px dashed var(--c-line-strong);
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--c-text-muted);
  background: rgb(255 255 255 / 0.015);

  svg {
    margin-top: 0.15rem;
  }
}

.note--warn {
  border-color: rgb(255 194 75 / 0.4);
  color: rgb(255 224 168 / 0.9);
}
</style>
