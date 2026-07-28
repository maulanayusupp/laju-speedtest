<script setup lang="ts">
// A compact throughput trace: what the connection actually did over the run,
// not just its average. Spiky lines mean an unstable link even when the
// headline number looks fine — that is the whole point of showing it.
//
// Canvas draws only geometry; every label is DOM text so it stays translatable
// and respects the reader's font size.
import type { ThroughputSample } from '~/types'

interface Series {
  key: string
  label: string
  /**
   * Design-token name (e.g. `--c-download`). The token is the single source of
   * truth: SCSS uses it directly for the legend swatch, and the canvas resolves
   * it to a hex value at paint time. No colour literal is duplicated here.
   */
  colorToken: string
  samples: ThroughputSample[]
}

const props = defineProps<{
  series: Series[]
  unit: string
}>()

const wrapper = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null

function resolveToken(token: string): string {
  if (typeof window === 'undefined') return '#22e1ff'
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  return value || '#22e1ff'
}

const peaks = computed(() =>
  props.series.map((entry) => ({
    key: entry.key,
    label: entry.label,
    colorToken: entry.colorToken,
    peak: entry.samples.reduce((max, sample) => Math.max(max, sample.mbps), 0),
  })),
)

const scaleMax = computed(() => {
  const max = peaks.value.reduce((top, entry) => Math.max(top, entry.peak), 0)
  return max > 0 ? max * 1.12 : 1
})

const hasData = computed(() => props.series.some((entry) => entry.samples.length > 1))

function draw() {
  const surface = canvas.value
  const box = wrapper.value
  if (!surface || !box) return

  const rect = box.getBoundingClientRect()
  const width = Math.max(rect.width, 1)
  const height = Math.max(rect.height, 1)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  surface.width = Math.round(width * dpr)
  surface.height = Math.round(height * dpr)

  const ctx = surface.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  // Horizontal guides at 25 % steps.
  ctx.strokeStyle = 'rgba(140, 165, 255, 0.1)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i + 0.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  const max = scaleMax.value

  for (const entry of props.series) {
    const samples = entry.samples
    if (samples.length < 2) continue
    const color = resolveToken(entry.colorToken)

    const span = samples[samples.length - 1]!.t - samples[0]!.t || 1
    const start = samples[0]!.t
    const pointAt = (sample: ThroughputSample) => ({
      x: ((sample.t - start) / span) * width,
      y: height - Math.min(sample.mbps / max, 1) * (height - 6) - 3,
    })

    // Filled area under the curve.
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, `${color}44`)
    gradient.addColorStop(1, `${color}00`)
    ctx.beginPath()
    ctx.moveTo(0, height)
    samples.forEach((sample) => {
      const { x, y } = pointAt(sample)
      ctx.lineTo(x, y)
    })
    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // The line itself.
    ctx.beginPath()
    samples.forEach((sample, index) => {
      const { x, y } = pointAt(sample)
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 1.8
    ctx.lineJoin = 'round'
    ctx.stroke()
  }
}

onMounted(() => {
  draw()
  observer = new ResizeObserver(draw)
  if (wrapper.value) observer.observe(wrapper.value)
  watch(() => props.series, draw, { deep: true })
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <figure class="trace">
    <div ref="wrapper" class="trace__canvas-wrap">
      <canvas ref="canvas" class="trace__canvas" aria-hidden="true" />
      <p v-if="!hasData" class="trace__empty">{{ $t('stage.noTrace') }}</p>
    </div>
    <figcaption class="trace__legend">
      <span v-for="entry in peaks" :key="entry.key" class="trace__legend-item">
        <span class="trace__swatch" :style="{ '--swatch': `var(${entry.colorToken})` }" />
        {{ entry.label }}
        <span class="trace__peak">{{ $t('stage.peak') }} {{ Math.round(entry.peak) }} {{ unit }}</span>
      </span>
    </figcaption>
  </figure>
</template>

<style lang="scss" scoped>
.trace {
  display: grid;
  gap: 0.7rem;
  margin: 0;
}

.trace__canvas-wrap {
  position: relative;
  height: clamp(7rem, 18vw, 10rem);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 0.015);
  overflow: hidden;
}

.trace__canvas {
  width: 100%;
  height: 100%;
}

.trace__empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 0.82rem;
  color: var(--c-text-muted);
}

.trace__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.25rem;
  font-size: 0.78rem;
  color: var(--c-text-soft);
}

.trace__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.trace__swatch {
  width: 10px;
  height: 3px;
  border-radius: var(--radius-pill);
  background: var(--swatch);
}

.trace__peak {
  color: var(--c-text-muted);
}
</style>
