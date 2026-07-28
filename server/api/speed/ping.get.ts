// =============================================================================
// GET /api/speed/ping — the smallest possible uncached response.
//
// Used to measure round-trip latency, jitter and request loss from the browser.
// It returns 204 with no body so the timing reflects the network path plus TLS
// session reuse, not payload transfer. It is HTTP, not ICMP: the number is a
// request/response round trip and will read slightly higher than `ping`.
// =============================================================================
export default defineEventHandler((event) => {
  applyMeasurementHeaders(event)
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return sendNoContent(event, 204)
})
