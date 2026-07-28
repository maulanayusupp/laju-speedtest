<script setup lang="ts">
// One button primitive for links, router links and real buttons. Choosing the
// element from the props keeps semantics correct without duplicating styles.
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  to?: string
  href?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  block?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  to: undefined,
  href: undefined,
  type: 'button',
  disabled: false,
  block: false,
})

const tag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'button'
})

const bindings = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href, rel: 'noopener', target: '_blank' }
  return { type: props.type, disabled: props.disabled }
})
</script>

<template>
  <component
    :is="tag"
    v-bind="bindings"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block, 'is-disabled': disabled }]"
  >
    <slot name="icon" />
    <span class="btn__label"><slot /></span>
    <slot name="trailing" />
  </component>
</template>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  font-family: $font-body;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform var(--dur-fast) var(--ease-out),
    background-color var(--dur) var(--ease-out),
    border-color var(--dur) var(--ease-out),
    box-shadow var(--dur) var(--ease-out),
    color var(--dur) var(--ease-out);

  &:active:not(.is-disabled) {
    transform: translateY(1px);
  }

  &.is-disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.btn--block {
  display: flex;
  width: 100%;
}

.btn--sm {
  padding: 0.4rem 0.85rem;
  font-size: 0.82rem;
}

.btn--md {
  padding: 0.62rem 1.25rem;
  font-size: 0.92rem;
}

.btn--lg {
  padding: 0.85rem 1.9rem;
  font-size: 1rem;
}

.btn--primary {
  background: var(--grad-spectrum);
  color: #05070f;
  box-shadow: 0 10px 30px rgb(34 225 255 / 0.18);

  &:hover:not(.is-disabled) {
    box-shadow: 0 14px 38px rgb(108 92 255 / 0.32);
  }
}

.btn--outline {
  border-color: var(--c-line-strong);
  color: var(--c-text);
  background: rgb(255 255 255 / 0.02);

  &:hover:not(.is-disabled) {
    border-color: var(--c-cyan);
    color: var(--c-cyan);
  }
}

.btn--ghost {
  color: var(--c-text-soft);

  &:hover:not(.is-disabled) {
    color: var(--c-text);
    background: var(--c-surface-2);
  }
}

.btn--danger {
  border-color: rgb(255 84 112 / 0.4);
  color: var(--c-rose);

  &:hover:not(.is-disabled) {
    background: rgb(255 84 112 / 0.12);
  }
}
</style>
