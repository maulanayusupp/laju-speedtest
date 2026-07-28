// =============================================================================
// Resolves the visitor's IPv4 / IPv6 addresses and connection facts.
// Client-only by design: the lookup depends on the browser's own connections,
// and running it during SSR would report the *server's* network instead.
// =============================================================================
import type { NetworkIdentity } from '~/types'
import { resolveNetworkIdentity } from '~/services/network.service'

const EMPTY: NetworkIdentity = {
  ipv4: { family: 4, address: null, source: 'probe', status: 'unavailable' },
  ipv6: { family: 6, address: null, source: 'probe', status: 'unavailable' },
  observed: { address: null, family: null, httpVersion: null },
  location: { city: null, region: null, country: null },
  serverRegion: null,
}

export function useNetworkIdentity() {
  const identity = ref<NetworkIdentity>(EMPTY)
  const isLoading = ref(true)

  async function refresh() {
    isLoading.value = true
    const config = useRuntimeConfig()
    try {
      identity.value = await resolveNetworkIdentity({
        ipv4: String(config.public.ipv4Probe ?? ''),
        ipv6: String(config.public.ipv6Probe ?? ''),
      })
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    void refresh()
  })

  /** True when the connection has a usable address in both families. */
  const isDualStack = computed(
    () => identity.value.ipv4.status === 'ok' && identity.value.ipv6.status === 'ok',
  )

  return { identity, isLoading, isDualStack, refresh }
}
