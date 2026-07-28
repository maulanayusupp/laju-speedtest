<script setup lang="ts">
// =============================================================================
// The signature visual: a "spectrum bloom" rather than a car-dashboard dial.
//
// A rolling ring of radial bars records the last few seconds of measurement —
// newest at 12 o'clock, older trailing clockwise — so the reading has a shape
// and a memory instead of a single needle. Particles drift inward while
// downloading and outward while uploading, at a rate tied to the live value.
//
// Everything is drawn on one canvas; the number itself stays in the DOM (slot)
// so it remains selectable, translatable and readable by assistive tech.
// Under prefers-reduced-motion the animation loop is not started at all: the
// canvas is repainted only when a new measurement arrives.
// =============================================================================
import type { TestPhase } from '~/types'

const props = withDefaults(defineProps<{
  /** 0–1 position on the engine's non-linear scale. */
  fraction: number
  phase: TestPhase
  /** 0–1 progress of the current phase; drives the outer arc. */
  progress?: number
}>(), {
  progress: 0,
})

/** Bars in the rolling ring. */
const RING_SLOTS = 132
/** How often a new bar is committed, in ms. */
const RING_STEP_MS = 55
const PARTICLES = 40

interface Rgb { r: number, g: number, b: number }

/** Phase → hue pair (inner, outer) matching the design tokens. */
const PHASE_COLORS: Record<string, [Rgb, Rgb]> = {
  idle: [{ r: 108, g: 92, b: 255 }, { r: 34, g: 225, b: 255 }],
  latency: [{ r: 255, g: 194, b: 75 }, { r: 255, g: 132, b: 216 }],
  download: [{ r: 34, g: 225, b: 255 }, { r: 108, g: 92, b: 255 }],
  upload: [{ r: 255, g: 79, b: 216 }, { r: 139, g: 60, b: 224 }],
  done: [{ r: 184, g: 255, b: 60 }, { r: 34, g: 225, b: 255 }],
  error: [{ r: 255, g: 84, b: 112 }, { r: 255, g: 132, b: 216 }],
}

const wrapper = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let frame = 0
let observer: ResizeObserver | null = null
let cssSize = 0
let lastRingPush = 0
let displayFraction = 0

const ring = new Float32Array(RING_SLOTS)
const particles = Array.from({ length: PARTICLES }, (_, i) => ({
  angle: (i / PARTICLES) * Math.PI * 2 + Math.random(),
  radius: 0.45 + Math.random() * 0.55,
  speed: 0.15 + Math.random() * 0.45,
  size: 0.8 + Math.random() * 1.6,
}))

function colorsFor(phase: TestPhase): [Rgb, Rgb] {
  return PHASE_COLORS[phase] ?? PHASE_COLORS.idle!
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  }
}

function rgba({ r, g, b }: Rgb, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function resize() {
  const element = wrapper.value
  const surface = canvas.value
  if (!element || !surface) return
  const rect = element.getBoundingClientRect()
  const size = Math.max(Math.min(rect.width, rect.height), 1)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  cssSize = size
  surface.width = Math.round(size * dpr)
  surface.height = Math.round(size * dpr)
  ctx = surface.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  draw(performance.now(), true)
}

function draw(now: number, immediate = false) {
  const context = ctx
  if (!context || cssSize === 0) return

  const size = cssSize
  const cx = size / 2
  const cy = size / 2
  // Ring geometry as a share of the canvas: base + bars + the progress arc must
  // stay under 0.5 so nothing is clipped at the edge.
  const baseRadius = size * 0.34
  const maxBar = size * 0.12
  const [inner, outer] = colorsFor(props.phase)
  const isActive = props.phase === 'latency' || props.phase === 'download' || props.phase === 'upload'

  // Ease the drawn value toward the measured one so the bloom breathes instead
  // of snapping on every sample.
  const target = Math.max(0, Math.min(props.fraction, 1))
  displayFraction = immediate ? target : displayFraction + (target - displayFraction) * 0.14

  // Commit a new bar on a fixed cadence, independent of frame rate.
  if (immediate || now - lastRingPush >= RING_STEP_MS) {
    lastRingPush = now
    ring.copyWithin(1, 0, RING_SLOTS - 1)
    const idleBreath = 0.05 + Math.sin(now / 900) * 0.02
    ring[0] = isActive || props.phase === 'done' ? displayFraction : Math.max(idleBreath, 0)
  }

  context.clearRect(0, 0, size, size)

  // --- 1. Halo -------------------------------------------------------------
  const haloRadius = baseRadius * (0.9 + displayFraction * 0.55)
  const halo = context.createRadialGradient(cx, cy, baseRadius * 0.15, cx, cy, haloRadius)
  halo.addColorStop(0, rgba(inner, 0.22 + displayFraction * 0.2))
  halo.addColorStop(1, rgba(inner, 0))
  context.fillStyle = halo
  context.beginPath()
  context.arc(cx, cy, haloRadius, 0, Math.PI * 2)
  context.fill()

  // --- 2. Guide circle ------------------------------------------------------
  context.strokeStyle = 'rgba(140, 165, 255, 0.13)'
  context.lineWidth = 1
  context.beginPath()
  context.arc(cx, cy, baseRadius, 0, Math.PI * 2)
  context.stroke()

  // --- 3. Bloom silhouette --------------------------------------------------
  context.beginPath()
  for (let i = 0; i < RING_SLOTS; i++) {
    const angle = -Math.PI / 2 + (i / RING_SLOTS) * Math.PI * 2
    const radius = baseRadius + (ring[i] ?? 0) * maxBar
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    if (i === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.closePath()
  context.fillStyle = rgba(mix(inner, outer, 0.4), 0.1)
  context.fill()

  // --- 4. Rolling bars ------------------------------------------------------
  context.lineCap = 'round'
  context.lineWidth = Math.max(size * 0.0075, 1.4)
  for (let i = 0; i < RING_SLOTS; i++) {
    const value = ring[i] ?? 0
    const angle = -Math.PI / 2 + (i / RING_SLOTS) * Math.PI * 2
    const age = i / RING_SLOTS
    const length = 3 + value * maxBar
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    context.strokeStyle = rgba(mix(inner, outer, value), (1 - age) * 0.85 + 0.08)
    context.beginPath()
    context.moveTo(cx + cos * baseRadius, cy + sin * baseRadius)
    context.lineTo(cx + cos * (baseRadius + length), cy + sin * (baseRadius + length))
    context.stroke()
  }

  // --- 5. Sweep head --------------------------------------------------------
  const headRadius = baseRadius + 3 + (ring[0] ?? 0) * maxBar
  context.fillStyle = rgba(outer, 0.95)
  context.beginPath()
  context.arc(cx, cy - headRadius, Math.max(size * 0.011, 2.4), 0, Math.PI * 2)
  context.fill()

  // --- 6. Phase progress arc ------------------------------------------------
  if (isActive) {
    const arcRadius = baseRadius + maxBar + size * 0.028
    context.lineWidth = Math.max(size * 0.011, 2)
    context.strokeStyle = 'rgba(140, 165, 255, 0.12)'
    context.beginPath()
    context.arc(cx, cy, arcRadius, 0, Math.PI * 2)
    context.stroke()

    const sweep = Math.max(0, Math.min(props.progress, 1)) * Math.PI * 2
    const gradient = context.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, rgba(inner, 0.95))
    gradient.addColorStop(1, rgba(outer, 0.95))
    context.strokeStyle = gradient
    context.beginPath()
    context.arc(cx, cy, arcRadius, -Math.PI / 2, -Math.PI / 2 + sweep)
    context.stroke()
  }

  // --- 7. Particles ---------------------------------------------------------
  const direction = props.phase === 'upload' ? 1 : -1
  const drift = (0.0009 + displayFraction * 0.0055) * (isActive ? 1 : 0.25)
  for (const particle of particles) {
    if (!immediate) {
      particle.radius += direction * drift * particle.speed * 16
      particle.angle += 0.0016 * particle.speed * (isActive ? 3 : 1)
      if (particle.radius < 0.22) particle.radius = 1
      if (particle.radius > 1) particle.radius = 0.22
    }
    const radius = baseRadius * (0.25 + particle.radius * 0.72)
    const x = cx + Math.cos(particle.angle) * radius
    const y = cy + Math.sin(particle.angle) * radius
    const fade = 1 - Math.abs(particle.radius - 0.6) * 0.9
    context.fillStyle = rgba(mix(inner, outer, particle.radius), Math.max(fade, 0.08) * 0.55)
    context.beginPath()
    context.arc(x, y, particle.size, 0, Math.PI * 2)
    context.fill()
  }
}

function loop(now: number) {
  draw(now)
  frame = requestAnimationFrame(loop)
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  resize()
  observer = new ResizeObserver(resize)
  if (wrapper.value) observer.observe(wrapper.value)

  if (prefersReducedMotion()) {
    // Repaint only when the measurement changes.
    watch(() => [props.fraction, props.phase, props.progress], () => draw(performance.now(), true))
  } else {
    frame = requestAnimationFrame(loop)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
})
</script>

<template>
  <div ref="wrapper" class="gauge">
    <canvas ref="canvas" class="gauge__canvas" aria-hidden="true" />
    <div class="gauge__center">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gauge {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 25rem);
  aspect-ratio: 1;
  margin-inline: auto;
}

.gauge__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.gauge__center {
  position: relative;
  display: grid;
  place-items: center;
  width: 58%;
  text-align: center;
}
</style>
