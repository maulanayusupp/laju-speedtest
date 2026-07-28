<script setup lang="ts">
// "What this speed comfortably supports." Estimates for ONE activity at a time
// on an idle line — the caveat is part of the component, not a footnote.
import type { IconName } from '~/utils/iconPaths'
import { getCapabilityChecks } from '~/services/content.service'

const props = defineProps<{
  downloadMbps: number
  uploadMbps: number
}>()

const { t } = useI18n()
const checks = getCapabilityChecks()

const items = computed(() =>
  checks.map((check) => {
    const downloadOk = props.downloadMbps >= check.downloadMbps
    const uploadOk = check.uploadMbps === undefined || props.uploadMbps >= check.uploadMbps
    return {
      id: check.id,
      icon: check.icon as IconName,
      requirement: check.uploadMbps
        ? t('capabilities.requirementBoth', { down: check.downloadMbps, up: check.uploadMbps })
        : t('capabilities.requirementDown', { down: check.downloadMbps }),
      passed: downloadOk && uploadOk,
    }
  }),
)
</script>

<template>
  <div class="capabilities">
    <ul class="capabilities__list">
      <li
        v-for="item in items"
        :key="item.id"
        class="capabilities__item"
        :class="{ 'is-passed': item.passed }"
      >
        <span class="capabilities__icon"><BaseIcon :name="item.icon" :size="18" /></span>
        <span class="capabilities__body">
          <span class="capabilities__label">{{ t(`capabilities.items.${item.id}`) }}</span>
          <span class="capabilities__requirement">{{ item.requirement }}</span>
        </span>
        <span class="capabilities__state">
          <BaseIcon :name="item.passed ? 'check' : 'close'" :size="16" />
          <span class="sr-only">
            {{ item.passed ? t('capabilities.supported') : t('capabilities.notSupported') }}
          </span>
        </span>
      </li>
    </ul>
    <InfoNote>{{ t('capabilities.disclaimer') }}</InfoNote>
  </div>
</template>

<style lang="scss" scoped>
.capabilities {
  display: grid;
  gap: 0.9rem;
}

.capabilities__list {
  display: grid;
  gap: 0.4rem;
}

.capabilities__item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 0.015);
  color: var(--c-text-muted);

  &.is-passed {
    border-color: rgb(184 255 60 / 0.28);
    color: var(--c-text-soft);

    .capabilities__state {
      color: var(--c-lime);
    }

    .capabilities__icon {
      color: var(--c-lime);
    }
  }
}

.capabilities__icon {
  display: grid;
  place-items: center;
  color: var(--c-text-muted);
}

.capabilities__body {
  display: grid;
}

.capabilities__label {
  font-size: 0.9rem;
  color: var(--c-text);
}

.capabilities__requirement {
  font-size: 0.74rem;
  color: var(--c-text-muted);
}

.capabilities__state {
  display: grid;
  place-items: center;
  color: var(--c-text-muted);
}
</style>
