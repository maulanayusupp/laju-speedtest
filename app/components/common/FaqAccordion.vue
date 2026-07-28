<script setup lang="ts">
// Native <details> so keyboard and screen-reader behaviour comes for free.
defineProps<{
  /** i18n key prefix; each id resolves to `<namespace>.<id>.q` / `.a`. */
  namespace: string
  items: readonly string[]
}>()
</script>

<template>
  <div class="faq">
    <details v-for="item in items" :key="item" class="faq__item">
      <summary class="faq__question">
        <span>{{ $t(`${namespace}.${item}.q`) }}</span>
        <BaseIcon class="faq__chevron" name="chevron" :size="18" />
      </summary>
      <p class="faq__answer">{{ $t(`${namespace}.${item}.a`) }}</p>
    </details>
  </div>
</template>

<style lang="scss" scoped>
.faq {
  display: grid;
  gap: 0.6rem;
}

.faq__item {
  @include panel(var(--radius-md));

  padding: 0 1.15rem;
  overflow: hidden;

  &[open] {
    border-color: var(--c-line-strong);

    .faq__chevron {
      transform: rotate(180deg);
      color: var(--c-cyan);
    }
  }
}

.faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1.05rem;
  font-family: $font-display;
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-text);
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }
}

.faq__chevron {
  color: var(--c-text-muted);
  transition:
    transform var(--dur) var(--ease-out),
    color var(--dur) var(--ease-out);
}

.faq__answer {
  padding-bottom: 1.15rem;
  max-width: 74ch;
  font-size: 0.94rem;
  color: var(--c-text-soft);
}
</style>
