// =============================================================================
// Legal / compliance document structure. Each entry names an i18n namespace and
// the ordered section keys inside it. Adding a section here means adding
// `<namespace>.sections.<key>.{title,body}` to BOTH locales — the i18n parity
// script (`pnpm i18n:check`) will fail the build if one is missing.
// =============================================================================
import type { LegalDocumentConfig } from '~/types'

export const privacyDocument: LegalDocumentConfig = {
  namespace: 'privacy',
  sections: [
    { key: 'summary' },
    { key: 'whatWeMeasure' },
    { key: 'ipAddresses' },
    { key: 'thirdParties' },
    { key: 'storage' },
    { key: 'cookies' },
    { key: 'analytics' },
    { key: 'children' },
    { key: 'rights' },
    { key: 'changes' },
    { key: 'contact' },
  ],
}

export const termsDocument: LegalDocumentConfig = {
  namespace: 'terms',
  sections: [
    { key: 'acceptance' },
    { key: 'service' },
    { key: 'accuracy' },
    { key: 'acceptableUse' },
    { key: 'availability' },
    { key: 'intellectualProperty' },
    { key: 'liability' },
    { key: 'law' },
    { key: 'changes' },
    { key: 'contact' },
  ],
}

/**
 * The data-handling matrix shown on /compliance. One row per thing the site
 * touches; the columns (purpose, where it lives, how long) come from i18n as
 * `compliance.matrix.rows.<id>.{purpose,location,retention}`.
 */
export const complianceDataMatrix = [
  'measurementPayloads',
  'observedIp',
  'probeIp',
  'localHistory',
  'localePreference',
  'platformLogs',
] as const

export const complianceDocument: LegalDocumentConfig = {
  namespace: 'compliance',
  sections: [
    { key: 'scope' },
    { key: 'dataMinimisation' },
    { key: 'ipDisclosure' },
    { key: 'thirdParties' },
    { key: 'measurementHonesty' },
    { key: 'accessibility' },
    { key: 'security' },
    { key: 'openness' },
    { key: 'limitations' },
    { key: 'contact' },
  ],
}
