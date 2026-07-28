<script setup lang="ts">
// Direct channels. Values come from runtimeConfig via `useContact`, so a
// deployment can change them without touching code or translations.
import type { IconName } from '~/utils/iconPaths'
import { getContactChannels } from '~/services/content.service'

const { t } = useI18n()
const { channelValue, channelHref } = useContact()

const channels = getContactChannels()
</script>

<template>
  <ul class="channels">
    <li v-for="channel in channels" :key="channel.id">
      <a class="channels__item" :href="channelHref(channel.id)" rel="noopener">
        <span class="channels__icon"><BaseIcon :name="channel.icon as IconName" :size="18" /></span>
        <span class="channels__body">
          <span class="channels__label">{{ t(`contact.channels.${channel.id}.label`) }}</span>
          <span class="channels__value">{{ channelValue(channel.id) }}</span>
          <span class="channels__hint">{{ t(`contact.channels.${channel.id}.hint`) }}</span>
        </span>
        <BaseIcon class="channels__go" name="arrowRight" :size="18" />
      </a>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.channels {
  display: grid;
  gap: 0.6rem;
}

.channels__item {
  @include panel(var(--radius-md));

  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.1rem;
  transition:
    border-color var(--dur) var(--ease-out),
    transform var(--dur) var(--ease-out);

  &:hover {
    border-color: var(--c-cyan);
    transform: translateY(-2px);

    .channels__go {
      color: var(--c-cyan);
      transform: translateX(3px);
    }
  }
}

.channels__icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  color: var(--c-cyan);
  background: rgb(34 225 255 / 0.08);
}

.channels__body {
  display: grid;
  gap: 0.1rem;
}

.channels__label {
  @include eyebrow;

  color: var(--c-text-muted);
}

.channels__value {
  font-family: $font-mono;
  font-size: 0.92rem;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.channels__hint {
  font-size: 0.78rem;
  color: var(--c-text-muted);
}

.channels__go {
  color: var(--c-text-muted);
  transition:
    color var(--dur) var(--ease-out),
    transform var(--dur) var(--ease-out);
}
</style>
