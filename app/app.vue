<script setup lang="ts">
// Root component: sets <html lang> + hreflang alternates reactively via
// useLocaleHead, plus the global title template.
import { getBrand } from '~/services/content.service'

const head = useLocaleHead()
const { t } = useI18n()
const brand = getBrand()

useHead({
  htmlAttrs: computed(() => head.value.htmlAttrs ?? {}),
  link: computed(() => head.value.link ?? []),
  meta: computed(() => head.value.meta ?? []),
  titleTemplate: (title) =>
    title ? `${title} — ${brand.name}` : `${brand.name} — ${t('meta.tagline')}`,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
