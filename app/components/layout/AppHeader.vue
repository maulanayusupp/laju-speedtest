<script setup lang="ts">
// Fixed header. Transparent over the hero, frosted once the page scrolls, and
// collapsed into a sheet on small screens.
import { getPrimaryNav } from '~/services/content.service'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const nav = getPrimaryNav()
const isScrolled = ref(false)
const isMenuOpen = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 12
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// Any navigation closes the sheet — including a click on the current route.
watch(() => route.fullPath, () => {
  isMenuOpen.value = false
})
</script>

<template>
  <header class="header" :class="{ 'is-scrolled': isScrolled, 'is-open': isMenuOpen }">
    <div class="header__inner">
      <NuxtLink class="header__brand" :to="localePath('/')" :aria-label="t('nav.test')">
        <BrandLogo />
      </NuxtLink>

      <nav class="header__nav" :aria-label="t('a11y.primaryNav')">
        <NuxtLink
          v-for="item in nav"
          :key="item.key"
          class="header__link"
          :to="localePath(item.to)"
        >
          {{ t(`nav.${item.key}`) }}
        </NuxtLink>
      </nav>

      <div class="header__actions">
        <LanguageSwitcher />
        <button
          class="header__toggle"
          type="button"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-nav"
          :aria-label="isMenuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')"
          @click="isMenuOpen = !isMenuOpen"
        >
          <BaseIcon :name="isMenuOpen ? 'close' : 'menu'" :size="22" />
        </button>
      </div>
    </div>

    <nav id="mobile-nav" class="header__sheet" :aria-label="t('a11y.primaryNav')">
      <NuxtLink
        v-for="item in nav"
        :key="item.key"
        class="header__sheet-link"
        :to="localePath(item.to)"
      >
        <span>{{ t(`nav.${item.key}`) }}</span>
        <BaseIcon name="arrowRight" :size="18" />
      </NuxtLink>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: z('header');
  border-bottom: 1px solid transparent;
  transition:
    background-color var(--dur) var(--ease-out),
    border-color var(--dur) var(--ease-out),
    backdrop-filter var(--dur) var(--ease-out);

  &.is-scrolled,
  &.is-open {
    @include glass;

    border-bottom-color: var(--c-line);
  }
}

.header__inner {
  @include container($container-wide);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: var(--header-h);
}

.header__brand {
  display: inline-flex;
  align-items: center;
}

.header__nav {
  display: none;
  align-items: center;
  gap: 0.35rem;

  @include respond-to('lg') {
    display: flex;
  }
}

.header__link {
  position: relative;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-pill);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--c-text-soft);
  transition: color var(--dur-fast) var(--ease-out);

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0.05rem;
    width: 0;
    height: 2px;
    border-radius: var(--radius-pill);
    background: var(--grad-spectrum);
    transform: translateX(-50%);
    transition: width var(--dur) var(--ease-out);
  }

  &:hover {
    color: var(--c-text);
  }

  &.router-link-active {
    color: var(--c-text);

    &::after {
      width: 42%;
    }
  }
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.header__toggle {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-sm);
  color: var(--c-text);

  @include respond-to('lg') {
    display: none;
  }
}

.header__sheet {
  display: grid;
  overflow: hidden;
  max-height: 0;
  transition: max-height var(--dur-slow) var(--ease-out);

  @include respond-to('lg') {
    display: none;
  }

  .is-open & {
    max-height: 24rem;
    border-top: 1px solid var(--c-line);
  }
}

.header__sheet-link {
  @include container($container-wide);

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 0.95rem;
  font-family: $font-display;
  font-size: 1.05rem;
  color: var(--c-text-soft);
  border-bottom: 1px solid var(--c-line);

  &:last-child {
    border-bottom: none;
  }

  &.router-link-active {
    color: var(--c-cyan);
  }
}
</style>
