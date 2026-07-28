<script setup lang="ts">
// Tabular history. A real <table> with scope-d headers so the data stays
// readable with a screen reader and can be copied into a spreadsheet.
import type { StoredResult } from '~/services/history.service'

defineProps<{ entries: StoredResult[] }>()

const { t } = useI18n()
const { speed, latency, dateTime } = useFormat()
</script>

<template>
  <div class="history-table">
    <table>
      <caption class="sr-only">{{ t('history.tableCaption') }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ t('history.columns.when') }}</th>
          <th scope="col">{{ t('metrics.download') }}</th>
          <th scope="col">{{ t('metrics.upload') }}</th>
          <th scope="col">{{ t('metrics.latency') }}</th>
          <th scope="col">{{ t('metrics.jitter') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in entries" :key="entry.id">
          <th scope="row">{{ dateTime(entry.startedAt) }}</th>
          <td class="is-download">{{ speed(entry.download.mbps) }}</td>
          <td class="is-upload">{{ speed(entry.upload.mbps) }}</td>
          <td>{{ latency(entry.latency.minMs) }}</td>
          <td>{{ latency(entry.latency.jitterMs) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.history-table {
  overflow-x: auto;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
}

table {
  min-width: 34rem;
  font-size: 0.86rem;
}

thead th {
  @include eyebrow;

  padding: 0.75rem 1rem;
  text-align: right;
  color: var(--c-text-muted);
  background: rgb(255 255 255 / 0.02);
  border-bottom: 1px solid var(--c-line);

  &:first-child {
    text-align: left;
  }
}

tbody th {
  padding: 0.7rem 1rem;
  text-align: left;
  font-weight: 500;
  color: var(--c-text-soft);
}

tbody td {
  padding: 0.7rem 1rem;
  text-align: right;
  font-family: $font-mono;
  font-size: 0.82rem;
  color: var(--c-text);
}

tbody tr {
  border-bottom: 1px solid var(--c-line);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgb(255 255 255 / 0.02);
  }
}

.is-download {
  color: var(--c-download);
}

.is-upload {
  color: var(--c-upload);
}
</style>
