<script setup lang="ts">
// The mark is a speedometer read at a glance: an arc, a needle, a hub. The
// wordmark carries the brand spectrum. Both are inline SVG/text so they stay
// crisp at any size and inherit colour from the header state.
import { getBrand } from '~/services/content.service'

withDefaults(defineProps<{
  size?: 'sm' | 'md'
  /** Hide the wordmark and show only the mark (used in tight spaces). */
  markOnly?: boolean
}>(), {
  size: 'md',
  markOnly: false,
})

const brand = getBrand()
</script>

<template>
  <span class="logo" :class="[`logo--${size}`, { 'logo--mark-only': markOnly }]">
    <svg class="logo__mark" viewBox="0 0 32 32" role="img" :aria-label="brand.name">
      <defs>
        <linearGradient id="laju-mark-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="#22e1ff" />
          <stop offset="52%" stop-color="#6c5cff" />
          <stop offset="100%" stop-color="#ff4fd8" />
        </linearGradient>
      </defs>
      <path
        class="logo__arc"
        d="M4.5 23a11.5 11.5 0 1 1 23 0"
        fill="none"
        stroke="url(#laju-mark-gradient)"
        stroke-width="2.6"
        stroke-linecap="round"
      />
      <path
        class="logo__needle"
        d="M16 22.5 22.6 13"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
      />
      <circle class="logo__hub" cx="16" cy="22.5" r="2.3" fill="currentColor" />
    </svg>
    <span v-if="!markOnly" class="logo__word">
      {{ brand.wordmark }}<span class="logo__dot">.</span>
    </span>
  </span>
</template>

<style lang="scss" scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--c-text);
}

.logo__mark {
  width: 30px;
  height: 30px;
  filter: drop-shadow(0 0 12px rgb(34 225 255 / 0.35));
}

.logo__word {
  font-family: $font-display;
  font-weight: 700;
  font-size: 1.35rem;
  letter-spacing: -0.04em;
  line-height: 1;
}

.logo__dot {
  color: var(--c-cyan);
}

.logo--sm {
  .logo__mark {
    width: 24px;
    height: 24px;
  }

  .logo__word {
    font-size: 1.1rem;
  }
}

.logo--mark-only {
  gap: 0;
}

// The needle sweeps once when the logo appears — a single, restrained nod to
// what the product does.
@include motion-safe {
  .logo__needle {
    transform-origin: 16px 22.5px;
    animation: needle-sweep 1.6s var(--ease-out) 1;
  }
}

@keyframes needle-sweep {
  0% {
    transform: rotate(-70deg);
  }

  70% {
    transform: rotate(8deg);
  }

  100% {
    transform: rotate(0deg);
  }
}
</style>
