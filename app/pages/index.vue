<script setup lang="ts">
// Home = the measurement stage. Everything below it explains the numbers rather
// than selling them.
const { t } = useI18n()
const localePath = useLocalePath()

usePageSeo(() => t('home.meta.title'), () => t('home.meta.description'))

useSchemaOrg([
  defineWebSite({ name: 'Laju', description: () => t('home.meta.description') }),
  defineWebPage({ '@type': 'WebPage' }),
])

useReveal()
</script>

<template>
  <div>
    <SpeedStage :title="t('home.hero.title')" :lead="t('home.hero.lead')" />

    <section class="section">
      <div class="container">
        <SectionHeading
          :eyebrow="t('home.why.eyebrow')"
          :title="t('home.why.title')"
          :lead="t('home.why.lead')"
        />
        <div class="home__features">
          <FeatureGrid />
        </div>
      </div>
    </section>

    <section class="section home__method">
      <div class="container">
        <div class="home__method-grid">
          <SectionHeading
            :eyebrow="t('home.method.eyebrow')"
            :title="t('home.method.title')"
            :lead="t('home.method.lead')"
          />
          <div class="home__method-actions">
            <BaseButton variant="outline" size="md" :to="localePath('/how-it-works')">
              <template #trailing><BaseIcon name="arrowRight" :size="18" /></template>
              {{ t('home.method.cta') }}
            </BaseButton>
          </div>
        </div>
        <InfoNote class="home__note">{{ t('home.method.note') }}</InfoNote>
      </div>
    </section>

    <CtaBand />
  </div>
</template>

<style lang="scss" scoped>
.home__features {
  margin-top: clamp(1.5rem, 3.5vw, 2.5rem);
}

.home__method-grid {
  display: grid;
  gap: 1.25rem;
  align-items: end;

  @include respond-to('md') {
    grid-template-columns: 1fr auto;
  }
}

.home__note {
  margin-top: 1.25rem;
  max-width: 74ch;
}
</style>
