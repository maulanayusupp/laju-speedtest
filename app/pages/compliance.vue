<script setup lang="ts">
// Compliance: the data-handling matrix first (what actually happens), then the
// written commitments. Kept in step with the code by project rule — any change
// to measurement, storage or third parties must update this page too.
import { getComplianceMatrix, getLegalDocument } from '~/services/content.service'

const { t } = useI18n()
const config = useRuntimeConfig()

const document = getLegalDocument('compliance')
const matrix = getComplianceMatrix()

/** Date of the last substantive revision to the text in the locale files. */
const UPDATED_AT = '2026-07-28T00:00:00.000Z'

usePageSeo(() => t('compliance.meta.title'), () => t('compliance.meta.description'), { type: 'article' })

/** The exact third-party endpoints this deployment calls, read from config. */
const probes = computed(() =>
  [String(config.public.ipv4Probe ?? ''), String(config.public.ipv6Probe ?? '')].filter(Boolean),
)
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('compliance.hero.eyebrow')"
      :title="t('compliance.hero.title')"
      :lead="t('compliance.hero.lead')"
    />

    <section class="section compliance__matrix-section">
      <div class="container">
        <SectionHeading
          :eyebrow="t('compliance.matrix.eyebrow')"
          :title="t('compliance.matrix.title')"
          :lead="t('compliance.matrix.lead')"
        />

        <div class="matrix">
          <table>
            <caption class="sr-only">{{ t('compliance.matrix.caption') }}</caption>
            <thead>
              <tr>
                <th scope="col">{{ t('compliance.matrix.columns.item') }}</th>
                <th scope="col">{{ t('compliance.matrix.columns.purpose') }}</th>
                <th scope="col">{{ t('compliance.matrix.columns.location') }}</th>
                <th scope="col">{{ t('compliance.matrix.columns.retention') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in matrix" :key="row">
                <th scope="row">{{ t(`compliance.matrix.rows.${row}.item`) }}</th>
                <td>{{ t(`compliance.matrix.rows.${row}.purpose`) }}</td>
                <td>{{ t(`compliance.matrix.rows.${row}.location`) }}</td>
                <td>{{ t(`compliance.matrix.rows.${row}.retention`) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="compliance__probes">
          <p class="compliance__probes-title">{{ t('compliance.probes.title') }}</p>
          <ul v-if="probes.length" class="compliance__probes-list">
            <li v-for="probe in probes" :key="probe">
              <code>{{ probe }}</code>
            </li>
          </ul>
          <p v-else class="compliance__probes-empty">{{ t('compliance.probes.disabled') }}</p>
          <InfoNote>{{ t('compliance.probes.note') }}</InfoNote>
        </div>
      </div>
    </section>

    <LegalDocument :document="document" :updated-at="UPDATED_AT" />
  </div>
</template>

<style lang="scss" scoped>
.matrix {
  margin-top: clamp(1.25rem, 3vw, 2rem);
  overflow-x: auto;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
}

table {
  min-width: 44rem;
  font-size: 0.85rem;
}

thead th {
  @include eyebrow;

  padding: 0.8rem 1rem;
  text-align: left;
  color: var(--c-text-muted);
  background: rgb(255 255 255 / 0.02);
  border-bottom: 1px solid var(--c-line);
}

tbody th {
  padding: 0.85rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
}

tbody td {
  padding: 0.85rem 1rem;
  color: var(--c-text-soft);
  vertical-align: top;
}

tbody tr {
  border-bottom: 1px solid var(--c-line);

  &:last-child {
    border-bottom: none;
  }
}

.compliance__probes {
  display: grid;
  gap: 0.7rem;
  margin-top: 1.5rem;
  max-width: 60rem;
}

.compliance__probes-title {
  @include eyebrow;

  color: var(--c-text);
}

.compliance__probes-list {
  display: grid;
  gap: 0.4rem;

  code {
    font-family: $font-mono;
    font-size: 0.85rem;
    color: var(--c-cyan);
  }
}

.compliance__probes-empty {
  font-size: 0.86rem;
  color: var(--c-text-muted);
}
</style>
