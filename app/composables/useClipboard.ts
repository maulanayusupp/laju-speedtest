// =============================================================================
// Copy-to-clipboard with a short "copied" acknowledgement, plus a fallback for
// browsers/contexts where the async Clipboard API is unavailable (non-HTTPS).
// =============================================================================

export function useClipboard(resetAfterMs = 1800) {
  const copiedKey = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null

  function legacyCopy(text: string): boolean {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.classList.add('sr-only')
    document.body.appendChild(area)
    area.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    document.body.removeChild(area)
    return ok
  }

  async function copy(text: string, key = 'default'): Promise<boolean> {
    if (!text) return false
    let ok = false
    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      ok = legacyCopy(text)
    }
    if (ok) {
      copiedKey.value = key
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        copiedKey.value = null
      }, resetAfterMs)
    }
    return ok
  }

  onScopeDispose(() => {
    if (timer) clearTimeout(timer)
  })

  return { copy, copiedKey }
}
