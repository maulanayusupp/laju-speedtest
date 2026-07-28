<script setup lang="ts">
// Closing band: one honest promise and two ways to act on it.
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="cta reveal">
    <div class="cta__inner">
      <div class="cta__copy">
        <h2 class="cta__title">{{ t('cta.title') }}</h2>
        <p class="cta__lead">{{ t('cta.lead') }}</p>
      </div>
      <div class="cta__actions">
        <BaseButton variant="primary" size="lg" :to="localePath('/')">
          <template #icon><BaseIcon name="play" :size="18" /></template>
          {{ t('cta.primary') }}
        </BaseButton>
        <BaseButton variant="outline" size="lg" :to="localePath('/how-it-works')">
          {{ t('cta.secondary') }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.cta {
  @include container;
}

.cta__inner {
  @include panel(var(--radius-xl));

  display: grid;
  gap: 1.5rem;
  align-items: center;
  padding: clamp(1.75rem, 4.5vw, 3rem);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: auto -20% -60% auto;
    width: 34rem;
    height: 34rem;
    background: radial-gradient(closest-side, rgb(255 79 216 / 0.16), transparent 70%);
    pointer-events: none;
  }

  @include respond-to('md') {
    grid-template-columns: 1.5fr auto;
  }
}

.cta__copy {
  position: relative;
  display: grid;
  gap: 0.6rem;
  max-width: 52ch;
}

.cta__title {
  font-size: clamp(1.5rem, 3.4vw, 2.2rem);
}

.cta__lead {
  color: var(--c-text-soft);
}

.cta__actions {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
</style>
