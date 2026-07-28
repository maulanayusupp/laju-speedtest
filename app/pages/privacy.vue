<script setup lang="ts">
// Privacy notice, rendered from config + i18n by <LegalDocument>.
import { getLegalDocument } from '~/services/content.service'

const { t } = useI18n()
const document = getLegalDocument('privacy')

/** Date of the last substantive revision to the text in the locale files. */
const UPDATED_AT = '2026-07-28T00:00:00.000Z'

usePageSeo(() => t('privacy.meta.title'), () => t('privacy.meta.description'), { type: 'article' })
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('privacy.hero.eyebrow')"
      :title="t('privacy.hero.title')"
      :lead="t('privacy.hero.lead')"
    />
    <LegalDocument :document="document" :updated-at="UPDATED_AT" />
  </div>
</template>
