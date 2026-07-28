<script setup lang="ts">
// Why this test is different, in four claims we can actually back up.
import type { IconName } from '~/utils/iconPaths'
import { getHomeFeatures } from '~/services/content.service'

const features = getHomeFeatures()
</script>

<template>
  <ul class="features">
    <li v-for="feature in features" :key="feature.id" class="reveal">
      <BaseCard class="features__card" tone="flat" padding="md" interactive>
        <span class="features__icon"><BaseIcon :name="feature.icon as IconName" :size="20" /></span>
        <h3 class="features__title">{{ $t(`home.features.${feature.id}.title`) }}</h3>
        <p class="features__body">{{ $t(`home.features.${feature.id}.body`) }}</p>
      </BaseCard>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.features {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}

.features__card {
  display: grid;
  gap: 0.6rem;
  align-content: start;
  height: 100%;
}

.features__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  color: var(--c-cyan);
  background: linear-gradient(140deg, rgb(34 225 255 / 0.16), rgb(108 92 255 / 0.1));
}

.features__title {
  font-size: 1.05rem;
}

.features__body {
  font-size: 0.9rem;
  color: var(--c-text-soft);
}
</style>
