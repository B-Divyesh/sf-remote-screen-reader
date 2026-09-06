# Anywhere Reader repair handoff

**Work order:** `remote-screen-reader-repair-3`

**Result:** ready for strict review; no known open findings from review 1

**Live URL:** <https://remote-screen-reader.sociobot.in>

**Deployed implementation:** `0e7e6b956b429b4b70e5540fc4bf13cd8ebbea3d`

**Final deployment:** `36ef1c25-c5b7-4c47-adf2-5d21112b0b68`

**Previous reviewed implementation:** `6a777d3a508251d14a2ef3c28ab840c8f5eeb986`

## Result

All six findings in `.factory/review-1.md` were fixed at their causes. The 27
previously untested public claims are now declared and pass as separate outcome
checks from a clean clone. The repaired static build is deployed on the product
origin.

| Review 1 finding | Current disposition |
| --- | --- |
| No isolated sample demo | Fixed: `/demo` and `/?demo=1` use `demo:anywhere-reader` plus `demo:` settings, show seeded output and three readings, keep a persistent sample banner, reset, and discard the sample on Start for real. |
| No claims registry or claim tests | Fixed: `.factory/claims.json` declares 27 claims. Registry validation requires one unique `@claim:<id>` tag per entry. Every declared command passed from a clean clone. |
| No real 404 | Fixed: `/404` and unknown paths return HTTP 404 for GET and HEAD, render the designed page, set a distinct title, and link home and to the sample. The internal error file is `not-found.html` to avoid Static Web Apps treating `/404` as a successful extensionless file request. |
| Incomplete metadata | Fixed: canonical, route titles and descriptions, Open Graph, Twitter card, original 1200×630 social image, SVG favicon, and 180 px touch icon are present. |
| Missing copy audit and unclear headings | Fixed: the first screen names the job, audience, first action, privacy, offline use, and price in plain words. Mood headings were replaced. `.factory/copy-audit.md` records sentence counts and terminology. |
| 28 Android lint warnings | Fixed: current app lint report says `No issues found.` Obsolete resources and dependency declarations were corrected; generated-project handling is documented in the preparation script. |

Earlier Android-release, security-header, manifest MIME, cache, checkout,
license-verdict, and 44 px target findings remain resolved.

## Product changes

- Added a one-click sample screen reading with realistic access-panel, document,
  and kiosk history. The changed sample produces `Signed in as Guest` through
  the real local OCR path.
- Kept sample and real IndexedDB/local-storage namespaces separate. Reset and
  Start for real clear only sample data.
- Added a 27-entry claim registry, registry validator, one tagged outcome test
  per claim, and a command that runs every declared claim independently.
- Added true static route outputs, route-specific metadata, a designed 404,
  complete social metadata, sitemap entries, and product-derived social/touch
  assets.
- Reworked landing and section copy and added the required copy audit, demo
  documentation, catalog description, and README instructions.
- Updated the service-worker cache for the sample assets while preserving local
  offline OCR.
- Removed Android lint findings and rebuilt the Capacitor bundle and debug APK.

## Clean verification

A new clone of pushed SHA `0e7e6b956b429b4b70e5540fc4bf13cd8ebbea3d`
was used for the declared-claim run:

```sh
npm ci
npm run test:declared-claims
```

Result: all 27 declared claim commands passed. `npm ci` reported 0
vulnerabilities. Playwright is configured not to reuse another process on its
preview port, so a clean checkout cannot silently test a different working
tree.

The repository gates also passed:

```sh
npm test
npm run build
ANDROID_HOME=/work/.android-sdk ANDROID_SDK_ROOT=/work/.android-sdk npm run android:debug
ANDROID_HOME=/work/.android-sdk ANDROID_SDK_ROOT=/work/.android-sdk npm run android:check
npm run verify:live-browser
npm run verify:live-release
```

- Vitest: 6 passed.
- Playwright: 29 passed and 13 expected project skips. Claim tests intentionally
  run once in desktop Chromium; application checks run on desktop and mobile.
- Build: `dist/` produced; Android bundle comparison passed for 30 files.
- Initial JS: 45.98 KB raw / 16.56 KB gzip. Initial CSS: 23.60 KB raw /
  6.13 KB gzip. Mobile hero: 19,186 bytes. Fonts: 37.99 KB WOFF2 total.
- Android debug APK: build and package validation passed; SHA-256
  `4a1b225610f525fd784310babb9771b2c398314ea25bad3228cc099137f1af45`.
- Android unit/lint: passed. `android/app/build/reports/lint-results-debug.txt`
  says `No issues found.`

## Live verification

Fresh 1440×1000 desktop and 390×844 phone contexts identified, before
scrolling:

- Job: `Read a visible screen with your phone`.
- Audience: blind and low-vision people on computers where screen-reader
  software cannot be installed.
- First action: `Try it with sample data`.

Both contexts entered the sample in one click and showed `Demo — sample data,
nothing is saved`. The prepared output contained `ACCESS PANEL`, `SYSTEM
READY`, and `Press Enter to continue`. Desktop local OCR on the changed image
returned and spoke `Signed in as Guest`. Reset restored three sample readings,
the original output, region, zoom, and speech rate. Start for real returned to
a pre-seeded real reading unchanged. The flow made same-origin requests only
and emitted no console errors.

Further live checks:

- `/`, `/demo`, `/privacy`, and `/terms` return 200 with distinct titles and
  one page heading.
- `/404` and `/not-a-real-page` return 404 for GET; HEAD also returns 404. The
  rendered page title is `Page not found — Anywhere Reader`.
- `verify-url.sh` passed on home and demo with title, language, main landmark,
  alt text, button labels, and no console errors.
- Axe CLI reported 0 violations on home, demo, privacy, terms, and the 404.
- Desktop and phone live browser checks found no overflow, undersized links,
  reduced-motion animation, serious/critical axe issues, or unexpected initial
  origins. Mobile offline reload showed the offline state.
- Live offer/release checks confirmed ₹499 INR once, the hosted checkout
  redirect, Android 1.0.1 metadata, APK, and checksum.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.3 s, CLS 0, TBT 70 ms. Lab INP was not available because the
  run contained no sampled interaction.
- Local and live `index.html` SHA-256 values both equal
  `c59b97ec595e8164e5448b375a489bfbfa779f90f28f0c8f66ccbd0c60e7828e`.

Screenshots are under `/work/.evidence/repair-3-live/`. Machine reports are
under `/work/.evidence/repair-3-final-root/`,
`/work/.evidence/repair-3-final-demo/`, and
`/work/.evidence/lighthouse-live.json`.

## Billing and catalog

The public offer remains Anywhere Reader Pro at ₹499 INR as a one-time
purchase. It keeps up to 50 local readings and 10 named regions after license
verification. The free reader keeps its camera/photo OCR, changed-line speech,
zoom, history, and import/export features.

Public offer metadata is in `/work/.evidence/billing-offer.json`. The required
101-character verb-first catalog description is committed in
`.factory/catalog-description.txt` and copied to
`/work/.evidence/catalog-description.txt`.

## Remaining verification limits

No known product defect remains from the current or earlier reports. These
external checks were not performed:

- No physical Android device was available for a TalkBack, camera, audible
  speech, or lifecycle test. The browser speech call and native debug package
  were verified separately.
- No paid transaction, refund, or live entitlement was created. The registered
  public price and checkout redirect were checked, and license outcomes use
  recorded API responses in tests.
- The existing signed public APK remains version 1.0.1 and was checked by URL
  and SHA-256. This repair produced an updated debug APK but did not sign or
  publish a replacement release APK.

This product has no backend. Tenant isolation, server restart persistence,
health endpoints, and server-side 429/Retry-After checks do not apply. Product
state remains local in IndexedDB; no shared PostgreSQL or other service was
used.
