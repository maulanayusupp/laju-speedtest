<script setup lang="ts">
// Error page. Rendered outside the default layout, so it brings its own chrome.
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error?.statusCode === 404)
const code = computed(() => String(props.error?.statusCode ?? 500))
</script>

<template>
  <div class="error">
    <div class="error__inner">
      <BrandLogo />
      <p class="error__code">{{ code }}</p>
      <h1 class="error__title">{{ isNotFound ? t('error.notFoundTitle') : t('error.genericTitle') }}</h1>
      <p class="error__lead">{{ isNotFound ? t('error.notFoundBody') : t('error.genericBody') }}</p>
      <BaseButton variant="primary" size="lg" :to="localePath('/')" @click="clearError({ redirect: '/' })">
        <template #icon><BaseIcon name="arrowRight" :size="18" /></template>
        {{ t('error.back') }}
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 2rem 1.25rem;
}

.error__inner {
  display: grid;
  gap: 1rem;
  justify-items: center;
  max-width: 34rem;
  text-align: center;
}

.error__code {
  @include numeric;

  font-size: clamp(3.5rem, 14vw, 6rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.06em;

  @include spectrum-text;
}

.error__lead {
  color: var(--c-text-soft);
}
</style>
