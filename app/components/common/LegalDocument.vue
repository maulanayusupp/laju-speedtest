<script setup lang="ts">
// Renders a legal/compliance document from its config: one <section> per key,
// with the title and body pulled from i18n. Long bodies may contain blank-line
// separated paragraphs, which are split here rather than in the locale file.
import type { LegalDocumentConfig } from '~/types'

const props = defineProps<{
  document: LegalDocumentConfig
  /** ISO date of the last substantive revision. */
  updatedAt: string
}>()

const { t } = useI18n()
const { dateTime } = useFormat()

const sections = computed(() =>
  props.document.sections.map((section) => ({
    key: section.key,
    title: t(`${props.document.namespace}.sections.${section.key}.title`),
    paragraphs: t(`${props.document.namespace}.sections.${section.key}.body`)
      .split('\n\n')
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
  })),
)
</script>

<template>
  <div class="legal">
    <nav class="legal__toc" :aria-label="$t('a11y.sections')">
      <p class="legal__toc-title">{{ $t('common.onThisPage') }}</p>
      <ol class="legal__toc-list">
        <li v-for="(section, index) in sections" :key="section.key">
          <a :href="`#${section.key}`">
            <span class="legal__toc-index">{{ String(index + 1).padStart(2, '0') }}</span>
            {{ section.title }}
          </a>
        </li>
      </ol>
    </nav>

    <div class="legal__body">
      <p class="legal__updated">{{ $t('common.lastUpdated', { date: dateTime(updatedAt) }) }}</p>
      <section v-for="(section, index) in sections" :id="section.key" :key="section.key" class="legal__section">
        <h2 class="legal__title">
          <span class="legal__number">{{ String(index + 1).padStart(2, '0') }}</span>
          {{ section.title }}
        </h2>
        <p v-for="(paragraph, pIndex) in section.paragraphs" :key="pIndex" class="legal__paragraph">
          {{ paragraph }}
        </p>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.legal {
  @include container;

  display: grid;
  gap: clamp(2rem, 5vw, 3.5rem);
  padding-block: clamp(1.5rem, 4vw, 3rem) clamp(3rem, 8vw, 5rem);

  @include respond-to('lg') {
    grid-template-columns: 17rem 1fr;
    align-items: start;
  }
}

.legal__toc {
  @include panel(var(--radius-lg));

  padding: 1.25rem;

  @include respond-to('lg') {
    position: sticky;
    top: calc(var(--header-h) + 1.5rem);
  }
}

.legal__toc-title {
  @include eyebrow;

  margin-bottom: 0.85rem;
  color: var(--c-text-muted);
}

.legal__toc-list {
  display: grid;
  gap: 0.55rem;
  counter-reset: none;

  a {
    display: flex;
    gap: 0.6rem;
    font-size: 0.86rem;
    color: var(--c-text-soft);
    transition: color var(--dur-fast) var(--ease-out);

    &:hover {
      color: var(--c-cyan);
    }
  }
}

.legal__toc-index {
  font-family: $font-mono;
  font-size: 0.72rem;
  color: var(--c-text-muted);
}

.legal__updated {
  @include eyebrow;

  margin-bottom: 1.5rem;
  color: var(--c-text-muted);
}

.legal__section {
  padding-block: clamp(1.25rem, 3vw, 2rem);
  border-top: 1px solid var(--c-line);
  scroll-margin-top: calc(var(--header-h) + 1.5rem);

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }
}

.legal__title {
  display: flex;
  gap: 0.8rem;
  align-items: baseline;
  margin-bottom: 0.9rem;
  font-size: clamp(1.15rem, 2.2vw, 1.5rem);
}

.legal__number {
  font-family: $font-mono;
  font-size: 0.8rem;
  color: var(--c-cyan);
}

.legal__paragraph {
  max-width: 72ch;
  margin-bottom: 0.9rem;
  color: var(--c-text-soft);

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
