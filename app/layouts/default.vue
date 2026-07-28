<script setup lang="ts">
// Default layout: skip link + fixed header + page slot + footer.
const { t } = useI18n()
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main">{{ t('a11y.skip') }}</a>
    <AppHeader />
    <main id="main" class="app-main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}
</style>
