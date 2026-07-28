import { fileURLToPath } from 'node:url'

// Inject shared SCSS (variables + mixins — no CSS output) into every component's
// <style lang="scss"> block. Absolute path so Sass @use always resolves.
const scssShared = fileURLToPath(
  new URL('./app/assets/scss/_shared.scss', import.meta.url),
)

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://laju-speedtest.vercel.app'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n', '@nuxtjs/seo'],

  // Name components by filename only (ignore folder prefix) for concise tags.
  components: [{ path: '~/components', pathPrefix: false }],

  // Single centralized SCSS entrypoint. No inline styles anywhere in the app.
  css: ['~/assets/scss/main.scss'],

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap',
        },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      meta: [
        { name: 'theme-color', content: '#05070f' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  // @nuxtjs/seo site-wide identity (sitemap, robots, schema.org).
  site: {
    url: siteUrl,
    name: 'Laju',
    description:
      'Laju — tes kecepatan internet yang transparan: unduh, unggah, latensi, jitter, dan alamat IPv4 / IPv6 Anda.',
    defaultLocale: 'id',
  },

  // Dynamic OG-image rendering needs a native renderer we do not bundle; OG meta
  // tags are still set manually via usePageSeo against a pre-generated raster.
  ogImage: { enabled: false },

  // The measurement endpoints must never be cached, prerendered, or indexed.
  routeRules: {
    '/api/speed/**': { robots: false, headers: { 'cache-control': 'no-store, no-cache, must-revalidate, max-age=0' } },
    '/api/network/**': { robots: false, headers: { 'cache-control': 'no-store, no-cache, must-revalidate, max-age=0' } },
  },

  i18n: {
    baseUrl: siteUrl,
    strategy: 'prefix_except_default',
    defaultLocale: 'id',
    locales: [
      { code: 'id', language: 'id-ID', name: 'Bahasa Indonesia', file: 'id.json', dir: 'ltr' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json', dir: 'ltr' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
    bundle: {
      // Silences the v10 optimize-directive advisory; we use $t/useI18n, not v-t.
      optimizeTranslationDirective: false,
    },
  },

  runtimeConfig: {
    public: {
      siteUrl,
      contactEmail: process.env.NUXT_PUBLIC_CONTACT_EMAIL || 'maulanayusupp@gmail.com',
      contactPhone: process.env.NUXT_PUBLIC_CONTACT_PHONE || '+62 878-2276-6333',
      whatsapp: process.env.NUXT_PUBLIC_WHATSAPP || '6287822766333',
      // Third-party IPv4/IPv6-only echo endpoints used by the browser to reveal
      // BOTH address families (a single origin can only ever see one of them).
      // Disclosed on the privacy + compliance pages; set to '' to disable.
      ipv4Probe: process.env.NUXT_PUBLIC_IPV4_PROBE ?? 'https://ipv4.icanhazip.com',
      ipv6Probe: process.env.NUXT_PUBLIC_IPV6_PROBE ?? 'https://ipv6.icanhazip.com',
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "${scssShared}" as *;`,
        },
      },
    },
  },

  nitro: {
    // Measurement payloads are random bytes: compressing them wastes CPU and
    // would distort throughput numbers.
    compressPublicAssets: false,
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },
})
