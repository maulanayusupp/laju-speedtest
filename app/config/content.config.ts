// =============================================================================
// Structure for the marketing / explanatory sections. Only ids and icons live
// here; every string is an i18n key derived from the id.
// =============================================================================

/** Feature cards on the home page (`home.features.<id>.{title,body}`). */
export const homeFeatures = [
  { id: 'dualStack', icon: 'globe' },
  { id: 'loadedLatency', icon: 'activity' },
  { id: 'noAccount', icon: 'lock' },
  { id: 'openMethod', icon: 'code' },
] as const

/** Ordered steps on /how-it-works (`howItWorks.steps.<id>.{title,body}`). */
export const methodologySteps = [
  { id: 'latency', icon: 'clock', metric: 'latency' },
  { id: 'download', icon: 'download', metric: 'download' },
  { id: 'loaded', icon: 'activity', metric: 'jitter' },
  { id: 'upload', icon: 'upload', metric: 'upload' },
] as const

/** Honest caveats listed on /how-it-works (`howItWorks.limits.<id>`). */
export const methodologyLimits = [
  'singleServer',
  'browserOverhead',
  'wifi',
  'vpn',
  'sharedLine',
  'uploadReporting',
] as const

/** FAQ entries (`faq.items.<id>.{q,a}`). Shown on /how-it-works. */
export const faqItems = [
  'whyDifferent',
  'ipv6Missing',
  'whatIsJitter',
  'whatIsBufferbloat',
  'dataUsage',
  'isDataStored',
  'bestPractice',
] as const

/** Values listed on /about (`about.values.<id>.{title,body}`). */
export const aboutValues = [
  { id: 'transparency', icon: 'eye' },
  { id: 'privacy', icon: 'shield' },
  { id: 'accessibility', icon: 'users' },
] as const

/** Contact channels (`contact.channels.<id>.{label,hint}`). */
export const contactChannels = [
  { id: 'email', icon: 'mail' },
  { id: 'whatsapp', icon: 'message' },
  { id: 'phone', icon: 'phone' },
] as const
