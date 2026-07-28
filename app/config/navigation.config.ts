// =============================================================================
// Route structure. Labels are i18n keys (`nav.<key>`), never literal text.
// Paths are locale-agnostic: components resolve them through `localePath()`.
// =============================================================================
import type { NavItem } from '~/types'

export const primaryNav: NavItem[] = [
  { key: 'test', to: '/' },
  { key: 'howItWorks', to: '/how-it-works' },
  { key: 'history', to: '/history' },
  { key: 'about', to: '/about' },
  { key: 'contact', to: '/contact' },
]

export const footerNav: Array<{ key: string, items: NavItem[] }> = [
  {
    key: 'product',
    items: [
      { key: 'test', to: '/' },
      { key: 'howItWorks', to: '/how-it-works' },
      { key: 'history', to: '/history' },
    ],
  },
  {
    key: 'company',
    items: [
      { key: 'about', to: '/about' },
      { key: 'contact', to: '/contact' },
    ],
  },
  {
    key: 'legal',
    items: [
      { key: 'compliance', to: '/compliance' },
      { key: 'privacy', to: '/privacy' },
      { key: 'terms', to: '/terms' },
    ],
  },
]
