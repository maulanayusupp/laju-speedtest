// =============================================================================
// GET /api/speed/download?bytes=<n> — streams incompressible random bytes.
//
// Why random: any repeating/zeroed payload can be compressed by an intermediary
// (or by HTTP content-encoding), which would inflate the measured throughput.
// One random chunk is generated at module load and repeated — that is still
// incompressible on the wire while costing no CPU per request.
//
// The response is streamed through a Node Readable so `pipe()` applies proper
// backpressure; the client aborts the request once its time budget is spent.
// =============================================================================
import { Readable } from 'node:stream'

/** Size of the repeated random block. 256 KiB keeps syscalls cheap. */
const CHUNK_BYTES = 256 * 1024

/** Hard ceiling per request, to bound cost if the endpoint is hit directly. */
const MAX_BYTES = 256 * 1024 * 1024

/** Default payload when the caller does not ask for a size. */
const DEFAULT_BYTES = 32 * 1024 * 1024

/** Generated once per server process. */
const RANDOM_CHUNK = createRandomChunk(CHUNK_BYTES)

function createRandomChunk(size: number): Buffer {
  const buffer = Buffer.allocUnsafe(size)
  // crypto.getRandomValues() is capped at 65 536 bytes per call.
  const step = 65536
  for (let offset = 0; offset < size; offset += step) {
    crypto.getRandomValues(
      new Uint8Array(buffer.buffer, buffer.byteOffset + offset, Math.min(step, size - offset)),
    )
  }
  return buffer
}

function* payload(total: number): Generator<Buffer> {
  let sent = 0
  while (sent < total) {
    const size = Math.min(CHUNK_BYTES, total - sent)
    sent += size
    yield size === CHUNK_BYTES ? RANDOM_CHUNK : RANDOM_CHUNK.subarray(0, size)
  }
}

export default defineEventHandler((event) => {
  const bytes = clampedInt(getQuery(event).bytes, DEFAULT_BYTES, 1024, MAX_BYTES)

  applyMeasurementHeaders(event)
  setResponseHeaders(event, {
    'content-type': 'application/octet-stream',
    'content-length': String(bytes),
    'content-disposition': 'attachment; filename="laju-payload.bin"',
  })

  return sendStream(event, Readable.from(payload(bytes)))
})
