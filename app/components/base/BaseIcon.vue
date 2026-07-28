<script setup lang="ts">
// Single source of SVG markup. Icons are stroke outlines from utils/iconPaths;
// colour is inherited from the parent via `currentColor`.
import type { IconName } from '~/utils/iconPaths'
import { iconPaths } from '~/utils/iconPaths'

const props = withDefaults(defineProps<{
  name: IconName
  /** Rendered box in pixels; the stroke scales with it. */
  size?: number
  strokeWidth?: number
  label?: string
}>(), {
  size: 20,
  strokeWidth: 1.6,
  label: undefined,
})

const path = computed(() => iconPaths[props.name])
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke-width="strokeWidth"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : 'presentation'"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label"
  >
    <title v-if="label">{{ label }}</title>
    <path :d="path" />
  </svg>
</template>

<style lang="scss" scoped>
.icon {
  flex: 0 0 auto;
  overflow: visible;
}
</style>
