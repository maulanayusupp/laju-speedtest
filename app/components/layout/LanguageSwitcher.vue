<script setup lang="ts">
// Two-state locale toggle. `switchLocalePath` preserves the current route, so
// switching language never sends the visitor back to the home page.
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const options = computed(() =>
  (locales.value as Array<{ code: string, name?: string }>).map((entry) => ({
    code: entry.code,
    label: entry.code.toUpperCase(),
    name: entry.name ?? entry.code,
  })),
)
</script>

<template>
  <div class="lang" role="group" :aria-label="$t('a11y.language')">
    <NuxtLink
      v-for="option in options"
      :key="option.code"
      class="lang__item"
      :class="{ 'is-active': option.code === locale }"
      :to="switchLocalePath(option.code)"
      :aria-current="option.code === locale ? 'true' : undefined"
      :title="option.name"
    >
      {{ option.label }}
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
.lang {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: rgb(255 255 255 / 0.03);
}

.lang__item {
  padding: 0.22rem 0.6rem;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--c-text-muted);
  transition:
    color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out);

  &:hover {
    color: var(--c-text);
  }

  &.is-active {
    color: #05070f;
    background: var(--c-text);
  }
}
</style>
