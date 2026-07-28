// =============================================================================
// Scroll reveal. Adds `.is-revealed` to `.reveal` elements the first time they
// enter the viewport; the transition itself lives in _utilities.scss and is
// automatically skipped under prefers-reduced-motion.
// =============================================================================

export function useReveal(selector = '.reveal') {
  const root = ref<HTMLElement | null>(null)

  onMounted(() => {
    const scope: ParentNode = root.value ?? document
    const targets = Array.from(scope.querySelectorAll<HTMLElement>(selector))
    if (targets.length === 0) return

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-revealed'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    targets.forEach((el) => observer.observe(el))
    onScopeDispose(() => observer.disconnect())
  })

  return { root }
}
