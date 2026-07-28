<script setup lang="ts">
// Contact. No inbox on the server: the form hands the message to the visitor's
// own mail client, and the channels are plain deep links.
const { t } = useI18n()

usePageSeo(() => t('contact.meta.title'), () => t('contact.meta.description'))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('contact.hero.eyebrow')"
      :title="t('contact.hero.title')"
      :lead="t('contact.hero.lead')"
    />

    <section class="section">
      <div class="container contact__grid">
        <div class="contact__form">
          <BaseCard padding="lg">
            <SectionHeading
              :title="t('contact.form.title')"
              :lead="t('contact.form.lead')"
              level="h2"
            />
            <div class="contact__form-body">
              <ContactForm />
            </div>
          </BaseCard>
        </div>

        <aside class="contact__aside">
          <ContactChannels />
          <InfoNote>{{ t('contact.responseNote') }}</InfoNote>
        </aside>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.contact__grid {
  display: grid;
  gap: clamp(1.25rem, 3vw, 2rem);
  align-items: start;

  @include respond-to('lg') {
    grid-template-columns: 1.4fr 1fr;
  }
}

.contact__form-body {
  margin-top: 1.5rem;
}

.contact__aside {
  display: grid;
  gap: 0.9rem;
}
</style>
