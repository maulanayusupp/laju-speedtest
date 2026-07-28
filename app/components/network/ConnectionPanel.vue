<script setup lang="ts">
// Everything we can honestly say about the visitor's connection.
//
// The two addresses come from different places and the panel says so: an
// IPv4-only and an IPv6-only hostname each report what they saw, which is the
// only way a web page can show both families at once.
import type { NetworkIdentity } from '~/types'

const props = defineProps<{
  identity: NetworkIdentity
  isLoading: boolean
}>()

const emit = defineEmits<{ refresh: [] }>()

const { t } = useI18n()
const localePath = useLocalePath()

const location = computed(() => {
  const parts = [props.identity.location.city, props.identity.location.region, props.identity.location.country]
    .filter(Boolean)
  return parts.length ? parts.join(', ') : null
})

const rows = computed(() => [
  { key: 'location', value: location.value },
  { key: 'protocol', value: props.identity.observed.httpVersion ? `HTTP/${props.identity.observed.httpVersion}` : null },
  { key: 'serverRegion', value: props.identity.serverRegion },
])

const ipv6Hint = computed(() => {
  if (props.identity.ipv6.status === 'ok') return null
  if (props.identity.ipv6.status === 'disabled') return t('connection.probeDisabled')
  return t('connection.noIpv6')
})
</script>

<template>
  <BaseCard class="connection" padding="md">
    <header class="connection__head">
      <div>
        <p class="connection__eyebrow">{{ t('connection.title') }}</p>
        <p class="connection__lead">{{ t('connection.lead') }}</p>
      </div>
      <button
        class="connection__refresh"
        type="button"
        :aria-label="t('connection.refresh')"
        :disabled="isLoading"
        @click="emit('refresh')"
      >
        <BaseIcon name="refresh" :size="16" />
      </button>
    </header>

    <div class="connection__addresses">
      <CopyField
        :label="t('connection.ipv4')"
        :value="identity.ipv4.address"
        :placeholder="isLoading ? t('common.loading') : t('connection.notDetected')"
        copy-key="ipv4"
        tone="cyan"
      />
      <div class="connection__ipv6">
        <CopyField
          :label="t('connection.ipv6')"
          :value="identity.ipv6.address"
          :placeholder="isLoading ? t('common.loading') : t('connection.notDetected')"
          copy-key="ipv6"
          tone="magenta"
        />
        <p v-if="ipv6Hint" class="connection__hint">{{ ipv6Hint }}</p>
      </div>
    </div>

    <dl class="connection__facts">
      <div v-for="row in rows" :key="row.key" class="connection__fact">
        <dt>{{ t(`connection.facts.${row.key}`) }}</dt>
        <dd>{{ row.value ?? t('connection.unknown') }}</dd>
      </div>
    </dl>

    <InfoNote>
      {{ t('connection.disclosure') }}
      <NuxtLink class="connection__link" :to="localePath('/privacy')">{{ t('connection.disclosureLink') }}</NuxtLink>
    </InfoNote>
  </BaseCard>
</template>

<style lang="scss" scoped>
.connection {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.connection__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.connection__eyebrow {
  @include eyebrow;

  color: var(--c-text);
}

.connection__lead {
  margin-top: 0.35rem;
  max-width: 42ch;
  font-size: 0.82rem;
  color: var(--c-text-muted);
}

.connection__refresh {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-sm);
  color: var(--c-text-muted);
  transition:
    color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);

  &:hover:not(:disabled) {
    color: var(--c-cyan);
    border-color: var(--c-cyan);
  }

  &:disabled {
    opacity: 0.4;
    cursor: progress;
  }
}

.connection__addresses {
  display: grid;
  gap: 0.6rem;
}

.connection__ipv6 {
  display: grid;
  gap: 0.35rem;
}

.connection__hint {
  padding-inline: 0.2rem;
  font-size: 0.74rem;
  color: var(--c-text-muted);
}

.connection__facts {
  display: grid;
  gap: 0.5rem;
  margin: 0;
}

.connection__fact {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.35rem;
  border-bottom: 1px dashed var(--c-line);
  font-size: 0.84rem;

  &:last-child {
    border-bottom: none;
  }

  dt {
    color: var(--c-text-muted);
  }

  dd {
    margin: 0;
    text-align: right;
    color: var(--c-text);
  }
}

.connection__link {
  color: var(--c-cyan);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
