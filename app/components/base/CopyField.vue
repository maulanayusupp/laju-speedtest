<script setup lang="ts">
// A monospaced value with a copy affordance — used for IP addresses and for the
// shareable result summary.
const props = defineProps<{
  label: string
  value: string | null
  /** Shown instead of the value when it is null. */
  placeholder: string
  copyKey: string
  tone?: 'cyan' | 'magenta' | 'neutral'
}>()

const { t } = useI18n()
const { copy, copiedKey } = useClipboard()

const isCopied = computed(() => copiedKey.value === props.copyKey)
const canCopy = computed(() => Boolean(props.value))

function onCopy() {
  if (props.value) void copy(props.value, props.copyKey)
}
</script>

<template>
  <div class="copy-field" :class="`copy-field--${tone ?? 'neutral'}`">
    <span class="copy-field__label">{{ label }}</span>
    <div class="copy-field__row">
      <code class="copy-field__value" :class="{ 'is-empty': !value }">
        {{ value ?? placeholder }}
      </code>
      <button
        v-if="canCopy"
        class="copy-field__button"
        type="button"
        :aria-label="isCopied ? t('common.copied') : t('common.copy')"
        @click="onCopy"
      >
        <BaseIcon :name="isCopied ? 'check' : 'copy'" :size="16" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.copy-field {
  --field-accent: var(--c-text-muted);

  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 0.02);
  transition: border-color var(--dur) var(--ease-out);

  &:hover {
    border-color: var(--c-line-strong);
  }
}

.copy-field--cyan {
  --field-accent: var(--c-cyan);
}

.copy-field--magenta {
  --field-accent: var(--c-magenta);
}

.copy-field__label {
  @include eyebrow;

  color: var(--field-accent);
}

.copy-field__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
}

.copy-field__value {
  font-family: $font-mono;
  font-size: 0.95rem;
  color: var(--c-text);
  overflow-wrap: anywhere;

  &.is-empty {
    color: var(--c-text-muted);
    font-size: 0.85rem;
  }
}

.copy-field__button {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  color: var(--c-text-muted);
  transition:
    color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out);

  &:hover {
    color: var(--field-accent);
    background: var(--c-surface-2);
  }
}
</style>
