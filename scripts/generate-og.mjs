// =============================================================================
// Build the social link-preview card (public/og-image.png) from an inline SVG.
//
// It must be a raster: WhatsApp, Facebook and X do not render SVG previews.
// Text uses generic system families because librsvg inside sharp resolves fonts
// through fontconfig, not through the browser's web fonts.
//
// Run: pnpm og
// =============================================================================
import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'public/og-image.png')

const WIDTH = 1200
const HEIGHT = 630
const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="spectrum" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#22e1ff"/>
      <stop offset="52%" stop-color="#6c5cff"/>
      <stop offset="100%" stop-color="#ff4fd8"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0.14" cy="0.05" r="0.7">
      <stop offset="0%" stop-color="#22e1ff" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#22e1ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0.9" cy="1" r="0.75">
      <stop offset="0%" stop-color="#ff4fd8" stop-opacity="0.26"/>
      <stop offset="100%" stop-color="#ff4fd8" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#05070f"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowA)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowB)"/>

  <!-- Measurement-paper grid -->
  <g stroke="#8ca5ff" stroke-opacity="0.07" stroke-width="1">
    ${Array.from({ length: 18 }, (_, i) => `<line x1="${i * 70}" y1="0" x2="${i * 70}" y2="${HEIGHT}"/>`).join('')}
    ${Array.from({ length: 10 }, (_, i) => `<line x1="0" y1="${i * 70}" x2="${WIDTH}" y2="${i * 70}"/>`).join('')}
  </g>

  <!-- Spectrum bloom ring, echoing the gauge in the product -->
  <g transform="translate(945 315)">
    <circle r="168" fill="none" stroke="#8ca5ff" stroke-opacity="0.16" stroke-width="1"/>
    ${Array.from({ length: 72 }, (_, i) => {
      const angle = (i / 72) * Math.PI * 2 - Math.PI / 2
      const magnitude = 12 + Math.abs(Math.sin(i / 5.5)) * 46 * (1 - i / 150)
      const x1 = Math.cos(angle) * 168
      const y1 = Math.sin(angle) * 168
      const x2 = Math.cos(angle) * (168 + magnitude)
      const y2 = Math.sin(angle) * (168 + magnitude)
      const opacity = (1 - i / 90).toFixed(3)
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="url(#spectrum)" stroke-opacity="${opacity}" stroke-width="5" stroke-linecap="round"/>`
    }).join('')}
    <text x="0" y="18" font-family="${SANS}" font-size="86" font-weight="700" fill="#eef2ff" text-anchor="middle" letter-spacing="-3">Mbps</text>
  </g>

  <!-- Wordmark -->
  <g transform="translate(84 92)">
    <path d="M0 46a23 23 0 1 1 46 0" fill="none" stroke="url(#spectrum)" stroke-width="6" stroke-linecap="round"/>
    <path d="M23 45 36 26" fill="none" stroke="#eef2ff" stroke-width="5" stroke-linecap="round"/>
    <circle cx="23" cy="45" r="5" fill="#eef2ff"/>
    <text x="62" y="52" font-family="${SANS}" font-size="42" font-weight="700" fill="#eef2ff" letter-spacing="-2">laju</text>
    <text x="128" y="52" font-family="${SANS}" font-size="42" font-weight="700" fill="#22e1ff">.</text>
  </g>

  <text x="84" y="300" font-family="${SANS}" font-size="66" font-weight="700" fill="#eef2ff" letter-spacing="-2">Tes kecepatan internet</text>
  <text x="84" y="374" font-family="${SANS}" font-size="66" font-weight="700" fill="#22e1ff" letter-spacing="-2">yang transparan</text>

  <text x="84" y="442" font-family="${SANS}" font-size="27" fill="#d6dfff" fill-opacity="0.74">Unduh · Unggah · Latensi · Jitter · IPv4 &amp; IPv6</text>

  <g transform="translate(84 492)">
    <rect width="330" height="52" rx="26" fill="none" stroke="#8ca5ff" stroke-opacity="0.28"/>
    <text x="26" y="34" font-family="${SANS}" font-size="23" fill="#d6dfff" fill-opacity="0.8">Metode terbuka, tanpa akun</text>
  </g>
</svg>`

async function run() {
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
  await writeFile(OUT, png)
  console.log(`✓ Wrote ${OUT} (${Math.round(png.length / 1024)} KB)`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
