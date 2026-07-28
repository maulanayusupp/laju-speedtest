# TODO — Laju

Backlog for the speed test. Anything shipped from here must also update
`CLAUDE.md`, the compliance/legal pages, and **both** locales (`pnpm i18n:check`).

## Next up

- [ ] **Dedicated measurement origin.** Serving hundreds of MB per run from the
      same serverless function that renders the site is fine for now but will get
      expensive. Move `/api/speed/*` to a small always-on box or an edge worker
      with a byte budget, and show its real region in the UI.
- [ ] **Server selection.** Offer two or three measurement origins (e.g. Jakarta,
      Singapore) and let the visitor pick, so the result is not tied to one path.
      Requires the origin work above.
- [ ] **Share card image.** Render a per-result PNG (like `pnpm og`, but with the
      measured numbers) so a result can be posted as an image, not only as text.
- [ ] **Permalink for a result.** Encode the headline numbers in a query string
      so a result can be linked without storing anything server-side.
- [ ] **Packet-loss estimate.** The latency phase already counts failed probes;
      surface it as its own metric once the sample size is large enough to mean
      something (today it is only shown as a hint when non-zero).

## Measurement quality

- [ ] **Reconcile upload bytes against the server.** `XMLHttpRequest.upload`
      progress counts bytes handed to the socket, so the request that is still
      in flight when the window closes contributes buffered-but-unsent bytes.
      `/api/speed/upload` already echoes `{ bytes }` per completed request — use
      that to bound the counted total instead of trusting progress events alone.
      This is the main reason our upload figure can read a little high on slow
      links (documented today as a limit on `/how-it-works`).

- [ ] **Adaptive duration.** Stop early when throughput has been stable for N
      seconds; on very slow links, extend a little instead of reporting a
      warm-up artefact.
- [ ] **Concurrency ramp.** Start with one stream and add more until throughput
      stops improving, rather than a fixed count. Better on both ends of the
      speed range.
- [ ] **Separate loaded-latency phase for upload.** Bufferbloat during upload is
      often worse than during download, and is not measured today.
- [ ] **Report `navigator.connection` when present** (effective type, save-data)
      as context — clearly labelled as a browser hint, not a measurement.
- [ ] **Regression tests for the engine.** The statistics helpers in
      `app/utils/stats.ts` are pure and deserve unit tests; the engine itself can
      be tested against a stub server with a shaped delay.

## Product

- [ ] **Scheduled re-tests.** Opt-in, browser-only: run a test every N minutes
      while a tab is open and chart the day, to catch evening congestion.
- [ ] **Export history** as CSV/JSON from the History page (it is the visitor's
      own data; there should be a door out).
- [ ] **Compare two runs** side by side from the history table.
- [ ] **Explain-my-result view.** Given the four numbers, describe in plain
      language what is likely limiting the connection — carefully hedged.

## Content & i18n

- [ ] **Third locale (Sundanese or Javanese)** once the copy has settled.
- [ ] **Glossary page** for latency / jitter / bufferbloat / Mbps vs MB/s,
      linked from the metric tiles.
- [ ] Keep the capability thresholds under review and cite the specific
      published sources on `/how-it-works` rather than describing them as
      "commonly published".

## Engineering

- [ ] **Rate limiting** on `/api/speed/*` (per-IP token bucket) before the site
      gets any real traffic; the terms already reserve the right to do it.
- [ ] **Self-host the fonts** to remove the Google Fonts third party — that would
      let the compliance page drop a row.
- [ ] **Formal accessibility audit** so the compliance page can state a real
      conformance level instead of "no audit has been performed".
- [ ] `pnpm typecheck` in CI, plus `pnpm i18n:check` and `pnpm build` on every
      push.
