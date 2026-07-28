<script setup lang="ts">
// The methodology page. This is the page that makes the numbers trustworthy:
// what is measured, in what order, with which parameters — and what the result
// cannot tell you.
import type { IconName } from '~/utils/iconPaths'
import {
  getFaqItems,
  getMeasurementParameters,
  getMethodologyLimits,
  getMethodologySteps,
} from '~/services/content.service'

const { t } = useI18n()
const { number } = useFormat()

usePageSeo(() => t('howItWorks.meta.title'), () => t('howItWorks.meta.description'), { type: 'article' })
useReveal()

const steps = getMethodologySteps()
const limits = getMethodologyLimits()
const faq = getFaqItems()

// Parameters are read from the engine config through the content service, so
// this page can never drift from what the test actually does.
const engine = getMeasurementParameters()

const parameters = computed(() => [
  { key: 'latencySamples', value: number(engine.latencySamples, 0) },
  { key: 'downloadDuration', value: `${number(engine.downloadSeconds, 0)} ${t('units.seconds')}` },
  { key: 'uploadDuration', value: `${number(engine.uploadSeconds, 0)} ${t('units.seconds')}` },
  { key: 'downloadStreams', value: number(engine.downloadStreams, 0) },
  { key: 'uploadStreams', value: number(engine.uploadStreams, 0) },
  {
    key: 'warmup',
    value: `${number(engine.downloadWarmupSeconds, 1)} / ${number(engine.uploadWarmupSeconds, 1)} ${t('units.seconds')}`,
  },
])
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('howItWorks.hero.eyebrow')"
      :title="t('howItWorks.hero.title')"
      :lead="t('howItWorks.hero.lead')"
    />

    <section class="section">
      <div class="container">
        <ol class="steps">
          <li v-for="(step, index) in steps" :key="step.id" class="steps__item reveal">
            <BaseCard class="steps__card" padding="md">
              <span class="steps__index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="steps__icon" :class="`steps__icon--${step.metric}`">
                <BaseIcon :name="step.icon as IconName" :size="20" />
              </span>
              <h2 class="steps__title">{{ t(`howItWorks.steps.${step.id}.title`) }}</h2>
              <p class="steps__body">{{ t(`howItWorks.steps.${step.id}.body`) }}</p>
            </BaseCard>
          </li>
        </ol>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <SectionHeading
          :eyebrow="t('howItWorks.parameters.eyebrow')"
          :title="t('howItWorks.parameters.title')"
          :lead="t('howItWorks.parameters.lead')"
        />
        <dl class="params">
          <div v-for="parameter in parameters" :key="parameter.key" class="params__row">
            <dt>{{ t(`howItWorks.parameters.rows.${parameter.key}`) }}</dt>
            <dd>{{ parameter.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <SectionHeading
          :eyebrow="t('howItWorks.limits.eyebrow')"
          :title="t('howItWorks.limits.title')"
          :lead="t('howItWorks.limits.lead')"
        />
        <ul class="limits">
          <li v-for="limit in limits" :key="limit" class="limits__item">
            <BaseIcon name="alert" :size="16" />
            <span>{{ t(`howItWorks.limits.items.${limit}`) }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container container--narrow">
        <SectionHeading
          :eyebrow="t('faq.eyebrow')"
          :title="t('faq.title')"
          align="center"
        />
        <div class="faq-wrap">
          <FaqAccordion namespace="faq.items" :items="faq" />
        </div>
      </div>
    </section>

    <CtaBand />
  </div>
</template>

<style lang="scss" scoped>
.steps {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

.steps__card {
  display: grid;
  gap: 0.55rem;
  align-content: start;
  height: 100%;
}

.steps__index {
  font-family: $font-mono;
  font-size: 0.75rem;
  color: var(--c-text-muted);
}

.steps__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  color: var(--c-cyan);
  background: rgb(34 225 255 / 0.1);
}

.steps__icon--upload {
  color: var(--c-upload);
  background: rgb(255 79 216 / 0.1);
}

.steps__icon--latency {
  color: var(--c-latency);
  background: rgb(255 194 75 / 0.1);
}

.steps__icon--jitter {
  color: var(--c-jitter);
  background: rgb(108 92 255 / 0.14);
}

.steps__title {
  font-size: 1.05rem;
}

.steps__body {
  font-size: 0.9rem;
  color: var(--c-text-soft);
}

.params {
  margin-top: clamp(1.25rem, 3vw, 2rem);
  display: grid;
  gap: 0 2rem;

  @include respond-to('md') {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.params__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.7rem;
  border-bottom: 1px dashed var(--c-line);
  font-size: 0.9rem;

  dt {
    color: var(--c-text-soft);
  }

  dd {
    margin: 0;
    font-family: $font-mono;
    font-size: 0.84rem;
    color: var(--c-cyan);
  }
}

.limits {
  margin-top: clamp(1.25rem, 3vw, 2rem);
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
}

.limits__item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  color: var(--c-text-soft);

  svg {
    margin-top: 0.2rem;
    color: var(--c-amber);
  }
}

.faq-wrap {
  margin-top: clamp(1.25rem, 3vw, 2rem);
}
</style>
