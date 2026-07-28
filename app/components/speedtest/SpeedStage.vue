<script setup lang="ts">
// The measurement stage: the whole product in one screen. It owns no logic of
// its own — `useSpeedTest` runs the test, `useNetworkIdentity` resolves the
// addresses, and this component arranges them.
import { getMeasurementParameters } from '~/services/content.service'
import { isLocalOrigin } from '~/services/network.service'

defineProps<{
  title: string
  lead: string
}>()

const { t } = useI18n()
const engine = getMeasurementParameters()

const {
  phase,
  phaseProgress,
  liveValue,
  downloadSeries,
  uploadSeries,
  result,
  errorKey,
  isRunning,
  overallProgress,
  gaugePosition,
  start,
  stop,
} = useSpeedTest()

const { identity, isLoading, refresh } = useNetworkIdentity()

const traceSeries = computed(() => [
  {
    key: 'download',
    label: t('metrics.download'),
    colorToken: '--c-download',
    samples: downloadSeries.value,
  },
  {
    key: 'upload',
    label: t('metrics.upload'),
    colorToken: '--c-upload',
    samples: uploadSeries.value,
  },
])

const showTrace = computed(() => phase.value === 'done' || downloadSeries.value.length > 1)

/**
 * Once the run finishes, the live value has decayed to zero as the last upload
 * stream drained. Show the download result instead — that is the number people
 * came for, and the gauge should settle on it rather than on nothing.
 */
const headlineValue = computed(() =>
  phase.value === 'done' && result.value ? result.value.download.mbps : liveValue.value,
)

const gaugeFractionValue = computed(() =>
  phase.value === 'done' && result.value
    ? gaugeFraction(result.value.download.mbps, engine.gaugeMaxMbps)
    : gaugePosition.value,
)

/** On completion the caption must name which number is on the dial. */
const headlineCaption = computed(() =>
  phase.value === 'done' ? t('metrics.download') : undefined,
)

/**
 * Served from this machine or the LAN? Then the run never leaves the network
 * and the figure is not an internet speed. Say so before the number is read,
 * not in a footnote afterwards.
 */
const isLocalMeasurement = ref(false)
onMounted(() => {
  isLocalMeasurement.value = isLocalOrigin(window.location.hostname)
})

function onStart() {
  void start({ serverRegion: identity.value.serverRegion })
}
</script>

<template>
  <section class="stage">
    <div class="stage__inner">
      <div class="stage__intro">
        <h1 class="stage__title">{{ title }}</h1>
        <p class="stage__lead">{{ lead }}</p>
      </div>

      <div class="stage__gauge">
        <SpeedGauge :fraction="gaugeFractionValue" :phase="phase" :progress="phaseProgress">
          <SpeedReadout :phase="phase" :value="headlineValue" :caption="headlineCaption" />
        </SpeedGauge>

        <div class="stage__controls">
          <BaseButton v-if="!isRunning && phase !== 'done'" variant="primary" size="lg" @click="onStart">
            <template #icon><BaseIcon name="play" :size="18" /></template>
            {{ t('stage.start') }}
          </BaseButton>

          <BaseButton v-else-if="isRunning" variant="outline" size="lg" @click="stop">
            <template #icon><BaseIcon name="close" :size="18" /></template>
            {{ t('stage.stop') }}
          </BaseButton>

          <ResultActions
            v-else-if="result"
            :result="result"
            :identity="identity"
            @restart="onStart"
          />
        </div>

        <PhaseRail :phase="phase" :progress="overallProgress" />

        <p v-if="phase === 'error'" class="stage__error" role="alert">
          {{ t('stage.error') }}
          <span v-if="errorKey" class="stage__error-code">({{ errorKey }})</span>
        </p>

        <p class="sr-only" aria-live="polite">{{ t(`stage.phases.${phase}`) }}</p>

        <InfoNote v-if="isLocalMeasurement" class="stage__local-note" tone="warn" icon="alert">
          {{ t('stage.localOrigin') }}
        </InfoNote>
      </div>

      <aside class="stage__aside">
        <ConnectionPanel :identity="identity" :is-loading="isLoading" @refresh="refresh" />
      </aside>

      <div class="stage__metrics">
        <MetricGrid
          :result="result"
          :phase="phase"
          :live-value="liveValue"
          :local="isLocalMeasurement"
        />
      </div>

      <div v-if="showTrace" class="stage__trace">
        <TraceChart :series="traceSeries" :unit="t('units.mbps')" />
      </div>

      <template v-if="result">
        <div class="stage__details">
          <ResultDetails :result="result" />
        </div>
        <div class="stage__capabilities">
          <BaseCard padding="md">
            <p class="stage__capabilities-title">{{ t('capabilities.title') }}</p>
            <!-- Estimating what a loopback figure "supports" would be nonsense. -->
            <CapabilityList
              v-if="!isLocalMeasurement"
              :download-mbps="result.download.mbps"
              :upload-mbps="result.upload.mbps"
            />
            <InfoNote v-else tone="warn" icon="alert">{{ t('capabilities.localNotice') }}</InfoNote>
          </BaseCard>
        </div>
      </template>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.stage {
  padding-top: calc(var(--header-h) + clamp(1.5rem, 4vw, 3rem));
  padding-bottom: clamp(2rem, 5vw, 3.5rem);
}

.stage__inner {
  @include container($container-wide);

  display: grid;
  gap: clamp(1.25rem, 3vw, 2rem);
  grid-template-columns: minmax(0, 1fr);

  // Named areas keep the connection panel beside the intro *and* the gauge, so
  // the first screen has no dead space on wide displays.
  @include respond-to('lg') {
    grid-template-columns: minmax(0, 1.5fr) minmax(21rem, 1fr);
    grid-template-areas:
      'intro aside'
      'gauge aside'
      'metrics metrics'
      'trace trace'
      'details capabilities';
    align-items: start;
  }
}

.stage__intro {
  display: grid;
  gap: 0.7rem;
  max-width: 46ch;
}

.stage__title {
  font-size: clamp(1.75rem, 3.6vw, 2.55rem);
}

.stage__lead {
  font-size: clamp(0.98rem, 1.6vw, 1.1rem);
  color: var(--c-text-soft);
}

.stage__gauge {
  display: grid;
  gap: 1.15rem;
  justify-items: center;
}

.stage__controls {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  min-height: 3rem;
}

.stage__local-note {
  max-width: 34rem;
}

.stage__error {
  font-size: 0.86rem;
  color: var(--c-rose);
  text-align: center;
}

.stage__error-code {
  font-family: $font-mono;
  font-size: 0.76rem;
  opacity: 0.75;
}

.stage__aside {
  display: grid;
  align-content: start;
}

// Area assignments live here, not on the elements: `grid-area: <name>` outside
// this query would collapse every block into one cell on small screens, where
// the container has no named areas at all.
@include respond-to('lg') {
  .stage__intro {
    grid-area: intro;
  }

  .stage__gauge {
    grid-area: gauge;
  }

  .stage__aside {
    grid-area: aside;
    position: sticky;
    top: calc(var(--header-h) + 1.25rem);
  }

  .stage__metrics {
    grid-area: metrics;
  }

  .stage__trace {
    grid-area: trace;
  }

  .stage__details {
    grid-area: details;
  }

  .stage__capabilities {
    grid-area: capabilities;
  }
}

.stage__capabilities-title {
  @include eyebrow;

  margin-bottom: 0.9rem;
  color: var(--c-text);
}
</style>
