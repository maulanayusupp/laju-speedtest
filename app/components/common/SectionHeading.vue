<script setup lang="ts">
// Eyebrow + title + lead, the standard opening of every content section.
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  lead?: string
  align?: 'start' | 'center'
  level?: 'h2' | 'h3'
}>(), {
  eyebrow: undefined,
  lead: undefined,
  align: 'start',
  level: 'h2',
})
</script>

<template>
  <header class="heading" :class="`heading--${align}`">
    <p v-if="eyebrow" class="heading__eyebrow">{{ eyebrow }}</p>
    <component :is="level" class="heading__title">{{ title }}</component>
    <p v-if="lead" class="heading__lead">{{ lead }}</p>
  </header>
</template>

<style lang="scss" scoped>
.heading {
  display: grid;
  gap: 0.75rem;
  max-width: 62ch;
}

.heading--center {
  justify-items: center;
  margin-inline: auto;
  text-align: center;
}

.heading__eyebrow {
  @include eyebrow;

  color: var(--c-cyan);
}

.heading__lead {
  font-size: clamp(1rem, 1.6vw, 1.1rem);
  color: var(--c-text-soft);
}
</style>
