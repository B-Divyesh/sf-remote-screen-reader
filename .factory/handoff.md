# Anywhere Reader repair 4 handoff

## Status: web repair deployed; Android release still blocked

**Work order:** `remote-screen-reader-repair-4`  
**Live URL:** <https://remote-screen-reader.sociobot.in>  
**Deployed implementation SHA:** `58705fad75db8ecf67c2efb78cc001c68e38a6ad`  
**Live and local `index.html` SHA-256:**
`7b6a4d7c2ca8815c994f11b8807cff2a37711436dd1b640908c06400c8b989b4`

The web implementation resolves four of the five strict-review findings. It
does **not** yet resolve the public Android APK finding, so this work order
cannot honestly claim a strict-review PASS.

## What changed

- OCR now clears and zero-sizes its temporary canvas in `finally`, after both
  successful and failed recognition attempts. The selected source preview is
  intentionally separate and remains visible for the user.
- The privacy and consent text now describe that boundary accurately. The new
  public claim, `temporary-capture-cleared`, runs real local OCR and verifies
  the temporary pixel buffer is absent after success and after a forced worker
  failure.
- The phone sample no longer hides its `Read a screen` `h2`; a full mobile axe
  scan now reports zero violations rather than accepting only serious/critical
  findings.
- The offline fallback now uses CSP-allowed `/offline.css`, says `Reader is
  offline`, has its own route title, is included in the service-worker shell,
  and is listed in the copy audit.
- Local preview now serves the same global security headers as production, so
  the fallback CSP regression is exercised before deployment.
- The service worker cache was advanced to `reader-v4` so installed clients
  receive the new fallback stylesheet.
- Android packaging was advanced to version code 3 / package version 1.0.2
  for the replacement release candidate. The public page remains on the
  existing 1.0.1 release until a properly signed APK can be published.
- Added a release-equality check: it downloads the public APK, verifies its
  SHA-256, and compares every bundled reader file against the current
  Capacitor candidate. This prevents a reachable but outdated APK from passing
  again.

## Current findings and earlier-history disposition

| Item | Disposition |
| --- | --- |
| Published APK was pre-repair | **Open.** The new equality check fails because the live 1.0.1 APK lacks `demo-screen-changed.webp` and therefore cannot equal the current candidate. |
| OCR capture pixels remained | Fixed and covered by the new success-and-error-path outcome claim. |
| Phone demo heading order | Fixed; full live and local axe scans report zero violations. |
| Offline CSP blocked styles | Fixed; fresh live `/offline.html` has no console errors and applies the product stylesheet. |
| Offline metaphor copy | Fixed; direct heading and full fallback copy audit added. |
| Earlier demo, isolation, 404, metadata, copy-audit, target-size, policy, cache, checkout, license-cache, and lint findings | Remain resolved by current browser, package, and configuration checks. |

The product remains a static PWA plus Capacitor Android application. Backend
tenant isolation, SQLite restart persistence, health endpoints, and server
rate limits do not apply.

## Verification run

The documented clean setup was restored with `npm ci` (0 vulnerabilities),
then JDK 21 and Android SDK/build-tools 35 were installed in this disposable
worker.

| Command or check | Result |
| --- | --- |
| `npm run build` | Pass; `dist/` and the 31-file Android bundle match were produced. |
| `npm run verify:claims` | Pass; 28 public claims have one unique outcome test each. |
| `npm run test:unit` | Pass; 6/6 tests. |
| `npm test` | Fails only at the intentionally strengthened public-APK equality claim; the public artifact is older than the candidate. |
| `npm run test:declared-claims` | All 28 commands ran. 27 passed; `android-download` failed only because the public APK lacks the new demo asset. |
| `npm run android:debug` | Pass; debug APK package checks passed, SHA-256 `1dc0142c0ae01509575de82c81bae881d912e149f4c6f1b2f0f83d7223daab45`. |
| `npm run android:check` | Pass; Android lint report says `No issues found.` |
| `npm run android:release` | Expected block: the required factory signing inputs are unavailable in this worker. No unsigned or debug APK was published. |
| `npm run verify:live-browser` | Pass; fresh desktop and 390 px phone contexts found the job, audience, first action, sample/reset flow, zero axe violations, no console errors, visible focus, no overflow, and a styled fallback. |
| `/opt/fleet/lib/verify-url.sh` | Pass on `/` and `/offline.html`; evidence is in `/work/.evidence/repair-4-live-root/` and `/work/.evidence/repair-4-live-offline/`. |
| `npm run verify:live-release` | Fails at the same public-APK equality check after the checkout and release-metadata checks. |

Fresh live Lighthouse measured **99 Performance, 100 Accessibility, 100 Best
Practices, and 100 SEO** (LCP 1.37 s, CLS 0.00022, TBT 105 ms). The report is
`/work/.evidence/repair-4-lighthouse.json`. Initial JS is 46.24 KB raw / 16.63
KB gzip; CSS is 23.60 KB raw / 6.13 KB gzip.

Before scrolling in fresh desktop and phone contexts, the live page said:

- Job: **Read a visible screen with your phone**.
- Audience: blind and low-vision people using computers where screen-reader
  software cannot be installed.
- First action: **Try it with sample data**.

Both contexts entered the isolated sample in one click, displayed the
persistent sample label and prepared output, and Reset demo restored the
original sample. The declared isolation claim verifies sample changes never
alter real reader data.

## Android release blocker and next step

The current worker has no access to the factory Android release-signing inputs;
the factory Key Vault denies this identity. `android:release` correctly stops
before producing an unsigned release. Publishing a debug-signed replacement or
creating a new signing identity would break the release contract, so neither
was done.

To finish acceptance, a release-capable worker must provide the existing
factory signing material, run `npm run android:release`, upload the signed
1.0.2 APK and its checksum to the matching GitHub release, update
`public/android-release.json` and the page/README release links, then deploy
the static build. The existing `android-download` claim and
`npm run verify:live-release` will then prove the downloaded APK contains this
candidate rather than merely being reachable.

No physical Android device or paid transaction/refund was available. The
browser reader, package contents, local OCR, service-worker paths, and hosted
checkout redirect were checked; device camera/TalkBack/TTS and real payment
remain external verification limits.

## Billing and catalog

The live offer is **Anywhere Reader Pro**, INR 49,900 minor units (₹499) as a
one-time purchase. Its public metadata is in
`/work/.evidence/billing-offer.json`. The catalog description remains
verb-first, 101 characters, and is copied to
`/work/.evidence/catalog-description.txt`.
