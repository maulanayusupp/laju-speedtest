<script setup lang="ts">
// Terms of use, rendered from config + i18n by <LegalDocument>.
import { getLegalDocument } from '~/services/content.service'

const { t } = useI18n()
const document = getLegalDocument('terms')

/** Date of the last substantive revision to the text in the locale files. */
const UPDATED_AT = '2026-07-28T00:00:00.000Z'

usePageSeo(() => t('terms.meta.title'), () => t('terms.meta.description'), { type: 'article' })
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('terms.hero.eyebrow')"
      :title="t('terms.hero.title')"
      :lead="t('terms.hero.lead')"
    />
    <LegalDocument :document="document" :updated-at="UPDATED_AT" />
  </div>
</template>
