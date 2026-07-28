// =============================================================================
// POST /api/speed/upload — accepts and discards a random payload.
//
// The body is drained chunk-by-chunk and never buffered, stored, or inspected:
// only the byte count is kept, and only to echo it back for verification. This
// is what makes the upload test privacy-safe (see the compliance page).
// =============================================================================

/** Hard ceiling per request, to bound cost if the endpoint is hit directly. */
const MAX_BYTES = 256 * 1024 * 1024

export default defineEventHandler(async (event) => {
  applyMeasurementHeaders(event)

  const request = event.node?.req
  let bytes = 0

  if (request) {
    // Node runtime: stream-drain so memory stays flat regardless of payload size.
    for await (const chunk of request) {
      bytes += (chunk as Buffer).length
      if (bytes > MAX_BYTES) {
        request.destroy()
        throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
      }
    }
  } else {
    // Non-Node runtime fallback (buffered by the platform).
    const raw = await readRawBody(event, false)
    bytes = raw?.length ?? 0
    if (bytes > MAX_BYTES) {
      throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
    }
  }

  return { bytes }
})
