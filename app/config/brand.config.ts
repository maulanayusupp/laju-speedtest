// =============================================================================
// Brand facts. Structure only — taglines and descriptions live in i18n.
// "Laju" is Indonesian for pace/speed; the project is an independent, open
// measurement tool, not an ISP and not affiliated with any provider.
// =============================================================================

export const brandConfig = {
  name: 'Laju',
  /** Used in the title template and the wordmark. */
  wordmark: 'laju',
  /** Short product name for manifests and OG. */
  productName: 'Laju Speed Test',
  /** Where the project is maintained from. */
  locality: 'Bandung, Indonesia',
  /** First public release year, for the footer copyright range. */
  since: 2026,
  /** Locale used to format dates when none is active yet. */
  fallbackLocale: 'id-ID',
} as const
