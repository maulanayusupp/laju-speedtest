<script setup lang="ts">
// Footer: navigation groups, the independence disclaimer, and the build facts
// that keep the project honest (measurement origin, storage location).
import { getBrand, getFooterNav } from '~/services/content.service'

const { t } = useI18n()
const localePath = useLocalePath()
const brand = getBrand()
const groups = getFooterNav()
// Collapse the range while the project is still in its first year.
const year = new Date().getFullYear()
const copyrightYears = computed(() =>
  year > brand.since ? `${brand.since}–${year}` : String(brand.since),
)
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <BrandLogo />
        <p class="footer__blurb">{{ t('footer.blurb') }}</p>
        <p class="footer__disclaimer">{{ t('footer.disclaimer') }}</p>
      </div>

      <div v-for="group in groups" :key="group.key" class="footer__group">
        <h2 class="footer__title">{{ t(`footer.groups.${group.key}`) }}</h2>
        <ul class="footer__list">
          <li v-for="item in group.items" :key="item.key">
            <NuxtLink class="footer__link" :to="localePath(item.to)">
              {{ t(`nav.${item.key}`) }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer__bar">
      <p class="footer__copy">
        © {{ copyrightYears }} {{ brand.name }} · {{ brand.locality }}
      </p>
      <p class="footer__note">{{ t('footer.localData') }}</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  margin-top: clamp(3rem, 8vw, 6rem);
  border-top: 1px solid var(--c-line);
  background: linear-gradient(180deg, rgb(8 12 24 / 0.4), rgb(8 12 24 / 0.9));
}

.footer__inner {
  @include container;

  display: grid;
  gap: clamp(2rem, 5vw, 3rem);
  padding-block: clamp(2.5rem, 6vw, 4rem);
  grid-template-columns: 1fr;

  @include respond-to('md') {
    grid-template-columns: 1.6fr repeat(3, 1fr);
  }
}

.footer__blurb {
  margin-top: 1rem;
  max-width: 34ch;
  font-size: 0.92rem;
  color: var(--c-text-soft);
}

.footer__disclaimer {
  margin-top: 0.85rem;
  max-width: 40ch;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--c-text-muted);
}

.footer__title {
  @include eyebrow;

  margin-bottom: 0.9rem;
  color: var(--c-text-muted);
  font-family: $font-body;
}

.footer__list {
  display: grid;
  gap: 0.6rem;
}

.footer__link {
  font-size: 0.92rem;
  color: var(--c-text-soft);
  transition: color var(--dur-fast) var(--ease-out);

  &:hover {
    color: var(--c-cyan);
  }
}

.footer__bar {
  @include container;

  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  justify-content: space-between;
  padding-block: 1.25rem;
  border-top: 1px solid var(--c-line);
  font-size: 0.78rem;
  color: var(--c-text-muted);
}
</style>
