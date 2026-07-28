// =============================================================================
// The only door between `config/*` and the UI. Components never import a config
// module directly — they call these accessors, so the content source can move
// to a CMS or API later without touching a single component.
// =============================================================================
import type { CapabilityCheck, LegalDocumentConfig, NavItem } from '~/types'
import { brandConfig } from '~/config/brand.config'
import { speedTestConfig } from '~/config/speedtest.config'
import { capabilityChecks } from '~/config/capabilities.config'
import {
  aboutValues,
  contactChannels,
  faqItems,
  homeFeatures,
  methodologyLimits,
  methodologySteps,
} from '~/config/content.config'
import {
  complianceDataMatrix,
  complianceDocument,
  privacyDocument,
  termsDocument,
} from '~/config/legal.config'
import { footerNav, primaryNav } from '~/config/navigation.config'

export function getBrand() {
  return brandConfig
}

export function getPrimaryNav(): NavItem[] {
  return primaryNav
}

export function getFooterNav() {
  return footerNav
}

export function getHomeFeatures() {
  return homeFeatures
}

export function getMethodologySteps() {
  return methodologySteps
}

export function getMethodologyLimits() {
  return methodologyLimits
}

export function getFaqItems() {
  return faqItems
}

export function getAboutValues() {
  return aboutValues
}

export function getContactChannels() {
  return contactChannels
}

export function getCapabilityChecks(): CapabilityCheck[] {
  return capabilityChecks
}

export function getComplianceMatrix() {
  return complianceDataMatrix
}

/**
 * The engine parameters published on /how-it-works. Read straight from the
 * measurement config so the documented method can never drift from the code.
 */
export function getMeasurementParameters() {
  return {
    latencySamples: speedTestConfig.latency.samples,
    latencyWarmupSamples: speedTestConfig.latency.warmupSamples,
    downloadSeconds: speedTestConfig.download.durationMs / 1000,
    uploadSeconds: speedTestConfig.upload.durationMs / 1000,
    downloadStreams: speedTestConfig.download.streams,
    uploadStreams: speedTestConfig.upload.streams,
    downloadWarmupSeconds: speedTestConfig.download.warmupMs / 1000,
    uploadWarmupSeconds: speedTestConfig.upload.warmupMs / 1000,
    gaugeMaxMbps: speedTestConfig.gaugeMaxMbps,
  }
}

export function getLegalDocument(name: 'privacy' | 'terms' | 'compliance'): LegalDocumentConfig {
  if (name === 'privacy') return privacyDocument
  if (name === 'terms') return termsDocument
  return complianceDocument
}
