<script setup lang="ts">
// About: who makes this, why it exists, and what it deliberately does not do.
import type { IconName } from '~/utils/iconPaths'
import { getAboutValues, getBrand } from '~/services/content.service'

const { t } = useI18n()
const brand = getBrand()
const values = getAboutValues()

usePageSeo(() => t('about.meta.title'), () => t('about.meta.description'), { type: 'article' })
useReveal()

useSchemaOrg([
  defineOrganization({
    name: brand.name,
    description: () => t('about.meta.description'),
  }),
])
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('about.hero.eyebrow')"
      :title="t('about.hero.title')"
      :lead="t('about.hero.lead')"
    />

    <section class="section">
      <div class="container about__grid">
        <div class="about__story">
          <p v-for="index in 3" :key="index" class="about__paragraph">
            {{ t(`about.story.p${index}`) }}
          </p>
        </div>

        <BaseCard class="about__facts" padding="md">
          <p class="about__facts-title">{{ t('about.facts.title') }}</p>
          <dl class="about__facts-list">
            <div class="about__fact">
              <dt>{{ t('about.facts.maintainer') }}</dt>
              <dd>{{ t('about.facts.maintainerValue') }}</dd>
            </div>
            <div class="about__fact">
              <dt>{{ t('about.facts.based') }}</dt>
              <dd>{{ brand.locality }}</dd>
            </div>
            <div class="about__fact">
              <dt>{{ t('about.facts.since') }}</dt>
              <dd>{{ brand.since }}</dd>
            </div>
            <div class="about__fact">
              <dt>{{ t('about.facts.independence') }}</dt>
              <dd>{{ t('about.facts.independenceValue') }}</dd>
            </div>
          </dl>
        </BaseCard>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <SectionHeading
          :eyebrow="t('about.values.eyebrow')"
          :title="t('about.values.title')"
        />
        <ul class="values">
          <li v-for="value in values" :key="value.id" class="reveal">
            <BaseCard class="values__card" tone="flat" padding="md">
              <span class="values__icon"><BaseIcon :name="value.icon as IconName" :size="20" /></span>
              <h3 class="values__title">{{ t(`about.values.items.${value.id}.title`) }}</h3>
              <p class="values__body">{{ t(`about.values.items.${value.id}.body`) }}</p>
            </BaseCard>
          </li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container container--narrow">
        <BaseCard padding="lg" tone="well">
          <SectionHeading
            :eyebrow="t('about.notDoing.eyebrow')"
            :title="t('about.notDoing.title')"
            :lead="t('about.notDoing.lead')"
          />
          <ul class="not-doing">
            <li v-for="index in 4" :key="index">
              <BaseIcon name="close" :size="16" />
              <span>{{ t(`about.notDoing.items.i${index}`) }}</span>
            </li>
          </ul>
        </BaseCard>
      </div>
    </section>

    <CtaBand />
  </div>
</template>

<style lang="scss" scoped>
.about__grid {
  display: grid;
  gap: clamp(1.5rem, 4vw, 2.5rem);

  @include respond-to('lg') {
    grid-template-columns: 1.6fr 1fr;
    align-items: start;
  }
}

.about__paragraph {
  max-width: 68ch;
  margin-bottom: 1rem;
  color: var(--c-text-soft);
}

.about__facts-title {
  @include eyebrow;

  margin-bottom: 1rem;
  color: var(--c-text);
}

.about__facts-list {
  display: grid;
  gap: 0.5rem;
  margin: 0;
}

.about__fact {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.5rem;
  border-bottom: 1px dashed var(--c-line);
  font-size: 0.86rem;

  &:last-child {
    border-bottom: none;
  }

  dt {
    color: var(--c-text-muted);
  }

  dd {
    margin: 0;
    text-align: right;
    color: var(--c-text);
  }
}

.values {
  margin-top: clamp(1.25rem, 3vw, 2rem);
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

.values__card {
  display: grid;
  gap: 0.55rem;
  align-content: start;
  height: 100%;
}

.values__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  color: var(--c-magenta);
  background: rgb(255 79 216 / 0.1);
}

.values__title {
  font-size: 1.05rem;
}

.values__body {
  font-size: 0.9rem;
  color: var(--c-text-soft);
}

.not-doing {
  margin-top: 1.25rem;
  display: grid;
  gap: 0.6rem;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    font-size: 0.9rem;
    color: var(--c-text-soft);
  }

  svg {
    margin-top: 0.25rem;
    color: var(--c-rose);
  }
}
</style>
