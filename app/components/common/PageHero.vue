<script setup lang="ts">
// Compact hero for inner pages. The home page uses the measurement stage
// instead, so this stays deliberately quiet.
defineProps<{
  eyebrow: string
  title: string
  lead?: string
}>()
</script>

<template>
  <section class="page-hero">
    <div class="page-hero__inner">
      <p class="page-hero__eyebrow">{{ eyebrow }}</p>
      <h1 class="page-hero__title">{{ title }}</h1>
      <p v-if="lead" class="page-hero__lead">{{ lead }}</p>
      <slot />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.page-hero {
  position: relative;
  padding-top: calc(var(--header-h) + clamp(2.5rem, 7vw, 5rem));
  padding-bottom: clamp(1.5rem, 4vw, 3rem);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto auto 50%;
    width: min(60rem, 120%);
    height: 22rem;
    transform: translateX(-50%);
    background: radial-gradient(closest-side, rgb(108 92 255 / 0.22), transparent 72%);
    pointer-events: none;
  }
}

.page-hero__inner {
  @include container;

  position: relative;
  display: grid;
  gap: 1rem;
  max-width: 60rem;
}

.page-hero__eyebrow {
  @include eyebrow;

  color: var(--c-cyan);
}

.page-hero__lead {
  max-width: 60ch;
  font-size: clamp(1.02rem, 1.8vw, 1.2rem);
  color: var(--c-text-soft);
}
</style>
