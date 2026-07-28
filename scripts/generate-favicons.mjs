// =============================================================================
// Generate favicons + web app manifest from assets/favicon-source.svg using the
// `favicons` package. Outputs into public/. Also copies the source SVG as
// public/favicon.svg (crisp vector icon for modern browsers).
//
// Run: pnpm favicons
// =============================================================================
import { favicons } from 'favicons'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = resolve(root, 'assets/favicon-source.svg')
const OUT = resolve(root, 'public')

const configuration = {
  path: '/',
  appName: 'Laju Speed Test',
  appShortName: 'Laju',
  appDescription: 'A transparent internet speed test with IPv4 and IPv6 detection.',
  developerName: 'Laju',
  background: '#05070f',
  theme_color: '#05070f',
  display: 'standalone',
  start_url: '/',
  lang: 'id-ID',
  icons: {
    android: true,
    appleIcon: true,
    appleStartup: false,
    favicons: true,
    windows: false,
    yandex: false,
  },
}

async function run() {
  await mkdir(OUT, { recursive: true })
  const source = await readFile(SOURCE)
  const response = await favicons(source, configuration)

  await Promise.all(
    response.images.map((image) => writeFile(resolve(OUT, image.name), image.contents)),
  )

  // Write only the manifest; the <link> tags are declared in nuxt.config.
  // `favicons` names it manifest.webmanifest — match both spellings so a
  // future rename cannot silently skip the file (it did once).
  const manifest = response.files.find((file) => /\.(webmanifest|json)$/.test(file.name))
  if (!manifest) throw new Error('favicons produced no web app manifest')
  await writeFile(resolve(OUT, 'site.webmanifest'), manifest.contents)

  await copyFile(SOURCE, resolve(OUT, 'favicon.svg'))

  console.log(`✓ Generated ${response.images.length} favicon assets + site.webmanifest → public/`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
