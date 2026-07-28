# CLAUDE.md — Project guide for AI assistants & contributors

> Keep this file in sync with reality. **Any change to code rules, features,
> pages, measurement behaviour, or content MUST also update: this file, the
> compliance/legal pages, and BOTH i18n locales (`en` + `id`).** Hard project
> rule (see §Rules).

## What this is

**Laju** (Indonesian for *pace*) is an independent, browser-based **internet
speed test**. It measures download, upload, latency and jitter against this
site's own server, shows the visitor's **IPv4 and IPv6** addresses, and — the
point of the whole project — explains where every number comes from and what it
cannot prove.

- **Not an ISP.** Laju is not affiliated with any operator, and says so in the
  footer and on the compliance page.
- **No accounts, no ads, no analytics.** Test history lives in the visitor's own
  `localStorage`; measurement payloads are random bytes the server discards.
- **Aesthetic:** *Signal Dark* — a night-lab instrument panel. Near-black indigo
  glass, hairline borders, one brand spectrum (cyan → indigo → magenta) used for
  every measurement. Dark theme only; there is no light mode.
- **Content is honest / no over-claiming.** Capability estimates are labelled as
  estimates, limits of the method have their own section, and no certification,
  award or accreditation is claimed anywhere.

## Stack (verified versions)

| Concern    | Choice                                              |
| ---------- | --------------------------------------------------- |
| Framework  | **Nuxt 4.5.1** (Vue 3.5, Nitro 2 / h3 1.15, Vite)   |
| Language   | TypeScript (strict)                                 |
| i18n       | `@nuxtjs/i18n` 10.5.0 — EN + **ID (default)**       |
| SEO        | `@nuxtjs/seo` 5.3.6 (sitemap, robots, schema.org)   |
| Styling    | **SCSS only** (`sass` 1.102.0), no inline CSS       |
| Favicons   | `favicons` 7.3.1 (build-time script)                |
| OG image   | `sharp` 0.35.3 (build-time script, raster PNG)      |
| Node       | ≥ 20.11                                             |

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build (validated)
pnpm preview      # run the built server (node .output/server/index.mjs)
pnpm generate     # static generation (note: measurement API needs a server)
pnpm favicons     # regenerate favicons from assets/favicon-source.svg
pnpm og           # regenerate public/og-image.png
pnpm i18n:check   # EN/ID key + placeholder parity (fails loudly on drift)
pnpm typecheck    # vue-tsc type check
```

## Directory map (Nuxt 4 `app/` srcDir)

```
app/
  app.vue                 # root: <html lang> + hreflang + title template
  error.vue               # 404 / 500 page
  assets/scss/            # design system (see §Styling)
  components/             # 31 components, auto-imported by FILENAME
    base/                 # BaseIcon, BaseButton, BaseCard, BaseBadge, CopyField
    common/               # SectionHeading, PageHero, InfoNote, LegalDocument,
                          #   FaqAccordion
    layout/               # AppHeader, AppFooter, BrandLogo, LanguageSwitcher
    home/                 # FeatureGrid, CtaBand
    speedtest/            # SpeedStage (composition root), SpeedGauge (canvas),
                          #   SpeedReadout, PhaseRail, MetricGrid, MetricTile,
                          #   TraceChart, CapabilityList, ResultDetails,
                          #   ResultActions
    network/              # ConnectionPanel (IPv4 / IPv6 + connection facts)
    history/              # HistoryChart, HistoryTable
    contact/              # ContactForm, ContactChannels
  composables/            # useSpeedTest, useNetworkIdentity, useTestHistory,
                          #   usePageSeo, useFormat, useContact, useClipboard,
                          #   useReveal
  config/                 # STRUCTURE, not text: brand, navigation, speedtest,
                          #   capabilities, content, legal
  layouts/default.vue     # skip link + header + <slot> + footer
  pages/                  # index, how-it-works, history, about, contact,
                          #   compliance, privacy, terms
  services/               # speedtest (engine), network, history, grading,
                          #   report, content, contact
  types/index.ts          # shared domain types
  utils/                  # iconPaths (SVG registry), format, stats
server/
  api/speed/{ping,download,upload}   # measurement endpoints
  api/network/ip                     # address our origin observes
  utils/measurement.ts               # no-store headers, region, clamping
i18n/locales/{en,id}.json            # ALL user-facing text (366 keys each)
public/                              # generated favicons, manifest, og-image
scripts/                             # generate-favicons, generate-og, check-i18n
assets/favicon-source.svg            # favicon source of truth
```

Components are auto-imported by **filename** (`pathPrefix: false`), so folder
names never appear in tags: `<BaseButton>`, `<SpeedGauge>`, `<MetricTile>`.

## Architecture conventions

- **Config → Services → Composables/Components.** Components (and pages) never
  import `config/*` directly; they read through `services/*.service.ts`. This is
  why `/how-it-works` gets its published parameters from
  `getMeasurementParameters()` rather than from the config module — documentation
  therefore cannot drift from the engine.
- **Structure vs. text.** `config/*` holds structure (ids, routes, thresholds,
  durations, icon names). Every human-readable string lives in i18n by key.
- **The engine is framework-free.** `services/speedtest.service.ts` is plain
  async TypeScript over `fetch` / `XMLHttpRequest` with callbacks — no Vue
  imports. `useSpeedTest()` is the thin reactive wrapper that also appends the
  finished result to local history.
- **Helpers = composables.** `usePageSeo`, `useFormat` (locale-aware numbers),
  `useNetworkIdentity`, `useTestHistory`, `useClipboard`, `useContact`,
  `useReveal`.
- **Grades are opinions, not certifications.** `services/grading.service.ts`
  turns numbers into `excellent | good | fair | poor` using thresholds from
  `config/speedtest.config.ts`. Never present a grade as an official rating.

## Measurement design (why it works this way)

| Concern | Decision |
| ------- | -------- |
| Units | Decimal megabits per second (10⁶ bits), the unit ISPs advertise in. |
| Payload | **Random bytes**, generated once per server process and repeated. Incompressible, so no intermediary can inflate the result. |
| Caching | Every measurement response sends `no-store` / `cdn-cache-control: no-store`, and every request URL carries a nonce. A cached payload would report a fantasy speed. |
| Download | `download.streams` parallel `fetch` readers; bytes counted as they land; workers loop until the deadline so any link speed is covered. |
| Upload | `XMLHttpRequest`, because `fetch` exposes no upload progress. Progress leads the wire (socket buffers), hence the **longer upload warm-up**. |
| Warm-up | Bytes in the first `warmupMs` are charted but excluded from the average (TCP slow start, buffer fill). |
| Latency | Series of `204` round trips with a gap between them. HTTP, not ICMP — reads slightly higher than `ping`. Jitter = mean absolute difference between *consecutive* probes. |
| Loaded latency | Probes fired **during** the download → the bufferbloat signal, graded separately. |
| Backpressure | The download route streams through a Node `Readable` so `pipe()` applies backpressure instead of buffering in memory. |
| Aborts | **Expected, never errors.** Every stream is cancelled when the window closes. `upload.post.ts` drains with explicit `data`/`end`/`aborted`/`error`/`close` listeners (a `for await` loop throws `ECONNRESET` and h3 logs it as an unhandled request error); `download.get.ts` pipes by hand and settles on the response's `close`, so nothing dangles and nothing is logged. |
| Limits | Both throughput routes cap a single request at 256 MiB. |
| Local origin | When the page is served from localhost/LAN (`isLocalOrigin()` in the network service), the stage shows a warn-tone notice: the payload never leaves the machine, so the number is loopback throughput, not internet speed. This is the normal dev state and the case most likely to be misread. |

**IPv4 + IPv6.** A web page cannot ask the OS for its addresses; it can only ask
a server which address it saw, and one server only ever sees one family. So the
browser calls one **IPv4-only** and one **IPv6-only** hostname
(`NUXT_PUBLIC_IPV4_PROBE` / `NUXT_PUBLIC_IPV6_PROBE`, default
`ipv4.icanhazip.com` / `ipv6.icanhazip.com`, both CORS-enabled). Setting either
env var to an empty string disables that lookup. `/api/network/ip` is the
trustworthy half — our own origin — and its value is promoted into an empty slot
**only when it is a public address** (never `::1`, RFC 1918 or link-local).
These third parties are disclosed on the privacy **and** compliance pages, and
the compliance page prints the live endpoint list from runtime config.

## Styling (SCSS, no inline CSS — hard rule)

- `_variables.scss` (build-time vars) + `_mixins.scss` (`z()`, `respond-to`,
  `respond-below`, `container`, `panel`, `glass`, `focus-ring`, `eyebrow`,
  `numeric`, `spectrum-text`, `section-padding`, `motion-safe`,
  `visually-hidden`) are injected into every component `<style>` via
  `nuxt.config` → `vite.css.preprocessorOptions.scss.additionalData`
  (`@use "_shared.scss" as *`).
- Partials pulled into `main.scss` via `@use` (`_typography`, `_base`,
  `_utilities`) **must `@use 'variables'/'mixins'` themselves** — additionalData
  only reaches Vite entry files, not `@use`-loaded partials.
- Runtime/theme values are **CSS custom properties** in `_tokens.scss`
  (`var(--c-cyan)`, `var(--c-download)`, `var(--grad-spectrum)`, …).
- `@include panel` is the signature surface used by every boxed block.
- **Never** use `style="..."` for visual declarations. The **only** permitted
  `:style` use is passing **CSS custom properties** that scoped SCSS consumes —
  currently `--fill` (PhaseRail), `--h` (HistoryChart) and `--swatch`
  (TraceChart legend). Visual rules stay in SCSS.
- Canvas components (`SpeedGauge`, `TraceChart`) resolve colours from the design
  tokens at paint time (`getComputedStyle`), so no hex literal is duplicated
  outside `_tokens.scss` — except the phase hue table in `SpeedGauge`, which is
  documented in place and must be kept in step with the tokens.

## Accessibility & motion

- Skip link, semantic landmarks, visible focus rings, real `<table>` markup for
  data, `<details>` for the FAQ, `aria-live` on the live readout and phase.
- `prefers-reduced-motion` is honoured globally in `_reset.scss`, by the
  `.reveal` utility, and by `SpeedGauge`, which does not start its animation
  loop at all and repaints only when a measurement arrives.
- No formal WCAG audit has been done, and the compliance page says so rather
  than claiming a conformance level.

## i18n

- Locales in `i18n/locales/{en,id}.json`; **ID is the default** (no prefix),
  EN lives under `/en/*` (`strategy: 'prefix_except_default'`).
- Keys mirror page/section structure. **Keep EN and ID in lockstep** — same keys
  and same interpolation placeholders (**366 keys each**). `pnpm i18n:check`
  verifies both and exits non-zero on drift.
- Interpolations in use: `{date}`, `{value}`, `{unit}`, `{down}`, `{up}`,
  `{name}`, `{reply}`, `{topic}`, `{message}`. A literal `@` must be escaped as
  `{'@'}` in vue-i18n messages — avoid it in copy.

## SEO

- Per-page: `usePageSeo(titleGetter, descGetter, { image, type, noindex })` —
  reactive to locale; sets title/description + OG + Twitter tags. `/history` is
  `noindex` (it is a personal, device-local view).
- Global title template + hreflang/`<html lang>` in `app.vue` via `useLocaleHead`.
- Structured data via `useSchemaOrg` (WebSite/WebPage on home, Organization on
  about).
- Sitemap/robots by `@nuxtjs/seo`. All routes are static, so no dynamic sitemap
  source is needed. `/api/**` measurement routes are excluded from robots and
  forced `no-store` via `routeRules`.
- Site URL from `NUXT_PUBLIC_SITE_URL` (default `https://laju-speedtest.vercel.app`).
- **og:image must stay raster** — crawlers do not render SVG. `public/og-image.png`
  (1200×630, ~195 KB) is generated by `pnpm og`.

## Deployment notes

- The download route streams up to hundreds of MB per request. On a serverless
  host this counts toward execution time and egress; a dedicated measurement
  origin is the right move if traffic grows (tracked in TODO.md).
- `serverRegion()` reads `VERCEL_REGION` / `FLY_REGION` / `AWS_REGION` and is
  surfaced in the UI as the test-server region; it is `null` locally, which the
  UI renders as "local server" rather than inventing a location.

## Rules (do not break)

1. **No inline CSS.** SCSS only, centralized as above (custom-property `:style`
   pass-through is the sole exception).
2. **Multilingual parity.** Update EN + ID together for every text change, and
   run `pnpm i18n:check`.
3. **Sync on change.** Every code/rule/feature change updates this file, the
   compliance/legal pages, and both locales.
4. **Evidence over assumption.** Verify versions, APIs and network behaviour
   before relying on them.
5. **No over-claiming.** No fake certifications, awards, guarantees, rankings,
   or precision the method cannot support. Estimates must be labelled.
6. **Measurement honesty.** If the engine's behaviour changes, `/how-it-works`
   and `/compliance` change in the same commit.
7. **Privacy by default.** No analytics, no result upload, no IP logging in
   application code. New third-party calls must be added to the compliance
   matrix and the privacy page first.
8. **Commits.** Author = **Maulana Yusup Abdullah <maulanayusupp@gmail.com>**.
   **No AI/Claude co-author trailer.** Commit **and push** after each change.

## Backlog

See [TODO.md](./TODO.md).
