// =============================================================================
// POST /api/speed/upload — accepts and discards a random payload.
//
// The body is drained chunk-by-chunk and never buffered, stored, or inspected:
// only the byte count is kept, and only to echo it back for verification. This
// is what makes the upload test privacy-safe (see the compliance page).
//
// Aborts are NORMAL here, not failures: the engine stops every in-flight upload
// the moment the measurement window closes, so the browser resets the socket
// mid-body. The drain therefore uses explicit listeners rather than `for await`,
// which would throw ECONNRESET and surface as an unhandled request error.
// =============================================================================
import type { IncomingMessage } from 'node:http'

/** Hard ceiling per request, to bound cost if the endpoint is hit directly. */
const MAX_BYTES = 256 * 1024 * 1024

interface DrainResult {
  bytes: number
  /** True when the client went away before the body finished. */
  aborted: boolean
  /** True when the ceiling was hit and we cut the connection ourselves. */
  tooLarge: boolean
}

function drain(request: IncomingMessage): Promise<DrainResult> {
  return new Promise((resolve) => {
    let bytes = 0
    let settled = false

    const finish = (result: DrainResult) => {
      if (settled) return
      settled = true
      resolve(result)
    }

    request.on('data', (chunk: Buffer) => {
      bytes += chunk.length
      if (bytes > MAX_BYTES) {
        request.destroy()
        finish({ bytes, aborted: false, tooLarge: true })
      }
    })
    request.on('end', () => finish({ bytes, aborted: false, tooLarge: false }))
    // 'aborted', 'error' and 'close' all mean the same thing for us: the client
    // stopped talking. None of them is worth logging.
    request.on('aborted', () => finish({ bytes, aborted: true, tooLarge: false }))
    request.on('error', () => finish({ bytes, aborted: true, tooLarge: false }))
    request.on('close', () => finish({ bytes, aborted: true, tooLarge: false }))
  })
}

export default defineEventHandler(async (event) => {
  applyMeasurementHeaders(event)

  const request = event.node?.req
  if (!request) {
    // Non-Node runtime fallback (body buffered by the platform).
    const raw = await readRawBody(event, false)
    const bytes = raw?.length ?? 0
    if (bytes > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
    return { bytes }
  }

  const result = await drain(request)

  if (result.tooLarge) {
    throw createError({ statusCode: 413, statusMessage: 'Payload too large' })
  }

  if (result.aborted || !event.node.res.writable) {
    // The socket is already gone; writing a body would be pointless. Marking the
    // event handled stops h3 from trying to serialise a response into it.
    event._handled = true
    return
  }

  return { bytes: result.bytes }
})
