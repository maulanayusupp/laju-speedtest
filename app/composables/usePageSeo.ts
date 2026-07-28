// =============================================================================
// Per-page SEO helper. Reactive to locale so title/description update on switch.
// Pairs with the global title template + hreflang set in app.vue.
// =============================================================================

interface PageSeoOptions {
  /** Absolute URL or a path under public/. Defaults to the brand OG card. */
  image?: string
  /** og:type — 'website' (default) or 'article' for long-form pages. */
  type?: string
  /** Set for utility pages that should not appear in search results. */
  noindex?: boolean
}

/**
 * Set reactive <title> and meta description + Open Graph / Twitter tags.
 * Pass getters so values re-evaluate when the locale (or data) changes.
 */
export function usePageSeo(
  title: () => string,
  description: () => string,
  options: PageSeoOptions = {},
) {
  const { image = '/og-image.png', type = 'website', noindex = false } = options
  const runtime = useRuntimeConfig()
  const siteUrl = runtime.public.siteUrl as string
  const ogImage = computed(() => (image.startsWith('http') ? image : `${siteUrl}${image}`))
  // Crawlers use this hint; infer it rather than hard-coding one format.
  const imageType = /\.jpe?g$/i.test(image) ? 'image/jpeg' : 'image/png'

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: type as 'website',
    ogImage,
    // Some older WhatsApp builds look for secure_url before og:image.
    ogImageSecureUrl: ogImage,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageType: imageType,
    ogImageAlt: title,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage,
    twitterImageAlt: title,
  })

  if (noindex) {
    useHead({ meta: [{ name: 'robots', content: 'noindex, follow' }] })
  }
}
