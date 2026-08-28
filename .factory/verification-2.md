# Independent verification 2 — FAIL

**Work order:** `remote-screen-reader-verify-2`

**Candidate:** `1d35d6134026b0738021d4f852eec77eb169426f` (`main`)

**Verified:** 2026-08-28 UTC

**Live URL:** <https://remote-screen-reader.sociobot.in>
**Acceptance artifact:** Android

## Verdict

**FAIL — do not accept this candidate as a deployed Android product.**

The repaired repository now builds a self-contained debug APK, and the live
PWA's free reader is unusually solid: local OCR, changed-line detection,
failure recovery, persistence, offline OCR, accessibility, security headers,
and performance all passed independent checks. The release contract is still
not complete, however. No Android APK is published or linked from the live
product, the only locally produced package is debug-signed, and the advertised
one-time purchase link returns HTTP 404. Two additional acceptance defects
affect license activation and minimum target sizes.

## Clean local verification

The worktree was clean and already at the exact candidate before installation.

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 163 packages installed; 164 audited; 0 vulnerabilities |
| `npm test` | PASS — release-config check, 3/3 Vitest tests, and 10/10 Playwright tests across desktop Chromium and the 390 px mobile project |
| `npm run build` | PASS — OCR preparation, `tsc --noEmit`, Vite production build, Capacitor sync, and 22-file Android bundle comparison |
| `npm run android:debug` | PASS after provisioning JDK 21 and Android SDK 35 in the verifier host — Gradle `assembleDebug` and APK-content verification completed |
| `./gradlew testDebugUnitTest lintDebug` | PASS — Android unit task and lint completed; lint reported 0 errors and 31 warnings |
| Separate web lint script | None declared; TypeScript checking is part of the exact build |

The generated APK is 18,738,716 bytes and has SHA-256
`a474c97736ed1b692e6f0c9085d56795a8a248b572b73de52586544bd24b7c39`.
`aapt` reports package `in.sociobot.remotescreenreader`, version `1.0`, min SDK
23, target SDK 35, and camera/Internet permissions. The package contains the
app shell, OCR worker, and uncompressed English model. `apksigner` verifies v1
and v2 signatures, but the sole certificate is `CN=Android Debug`; this is a QA
artifact, not a distributable release.

Android lint's warnings are non-blocking individually but include manifest
element order, deprecated backup configuration, launcher/round-icon shape,
missing monochrome adaptive icons, duplicate icons, density inconsistency, and
unused resources.

## Independent live functional exercise

Fresh Chromium contexts were used rather than relying on the supplied tests.

- The representative photo produced `ACCESS PANEL`, `SYSTEM READY`, and
  `Press Enter to continue` through the real self-hosted Tesseract worker. A
  second identical read reported `No change` and did not repeat old lines.
- Consent was required before the camera button enabled. A camera-start
  failure offered photo fallback; reading with no source, selecting a text
  file, and importing invalid JSON each produced specific recovery guidance.
  A valid photo worked immediately afterward.
- Shift+ArrowRight moved the northwest reading-region corner from 8% to 13%.
  Zoom accepted its 52 px maximum and speech rate its 0.6x minimum.
- Two readings persisted across reload. Export produced
  `anywhere-reader-2026-08-28.json`. Importing seven valid rows into the free
  tier retained exactly five. The two-step clear confirmation removed all
  rows and announced success.
- Headless Chromium has no usable speech voice; the application retained the
  recognized text and displayed its explicit speech fallback. Actual audible
  speech remains a physical-device verification item.

No console errors, page errors, or failed requests occurred during the normal
desktop or mobile live runs. The OCR run requested only
`https://remote-screen-reader.sociobot.in`; there were no analytics, CDN font,
cloud OCR, or automatic third-party requests. Source inspection found only the
documented Sociobot license verification request as an optional external
runtime call. Frames stay in canvas/browser memory, and readings use IndexedDB.

## PWA, accessibility, responsive behavior, and performance

- Desktop 1440 × 1000 and mobile 390 × 844 both had no horizontal overflow,
  one `h1`, one `main`, `lang="en"`, and the correct title.
- The first Tab exposed `Skip to main content` with a visible 3 px lime focus
  outline. Keyboard region adjustment worked. Reduced-motion emulation matched
  and left no element with a transition or animation over 0.01 ms.
- Fresh axe scans on initial desktop/mobile and the open mobile workspace found
  **zero serious or critical violations**. The factory URL smoke test found
  zero missing alts, unlabeled buttons, console errors, or page errors.
- The service worker controlled the page with versioned `reader-v2-shell` and
  `reader-v2-ocr` caches. Offline shell reload showed the page and `Offline
  mode.` banner. After `Prepare offline reading`, the worker/model/core were in
  the OCR cache and a fully offline photo OCR read returned all three expected
  lines without errors.
- A real second service-worker version was not deployed, so the update
  transition/toast could only be code-inspected, not induced end to end.
- Fresh mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.2 s, LCP 1.5 s, total blocking time 70 ms, CLS 0, initial
  transfer 80 KiB.
- Build budgets pass: initial JS 40,111 bytes, CSS 21,184 bytes, browser-selected
  WOFF2 fonts 37,988 bytes, and mobile hero 19,186 bytes. The 10.9 MB compressed
  English OCR model is lazy and explicitly cached for offline use.

Evidence is under [`.factory/evidence-2/`](evidence-2/), including the factory
URL report, desktop/mobile screenshots, and Lighthouse JSON.

## Deployment identity and browser response policy

The local and live `index.html` SHA-256 is
`d5da62a48d53745bfcbb136270e0be7aa9f8d71118c70ab4e10c52ca9d7a5f31`.
All 23 public build resources match their live bytes. The 24th `dist` file,
`staticwebapp.config.json`, is deployment configuration consumed by the host;
requesting that path receives the SPA fallback rather than the config file.

Live root responses are HTTP/2 200 with HSTS, strict-origin referrer policy,
`nosniff`, a same-origin CSP (plus only the Sociobot license API), and
`Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=(),
usb=()`. The manifest uses `application/manifest+json`. Fingerprinted assets
use `public, max-age=31536000, immutable`; HTML and the service worker use a
30-second revalidation policy. These repair targets pass.

## Defects

### Critical

1. **No installable Android release is deployed or handed to the user.** The
   live page contains zero APK/download links, guessed APK paths return the
   844-byte HTML shell, and `git ls-files` contains no APK. The only package
   produced from the candidate is locally generated and signed with the
   standard Android debug certificate. Consequently the Android artifact
   required by the brief cannot be installed from the product, and rear
   camera, TalkBack, back gesture, and real device speech remain unverified.

### High

2. **The advertised purchase is broken.** `Buy Pro securely` targets
   `https://api.sociobot.in/api/v1/products/remote-screen-reader/checkout`.
   A fresh live request returned HTTP 404 with
   `{"error":"enabled factory product","status":404}`. The product shows a
   price and buy action, so this is a broken user-facing flow, not an optional
   dormant integration.

### Medium

3. **A newly returned purchase token can stay falsely locked for 24 hours.**
   `captureReturnedLicense()` replaces the token but does not clear the cached
   verdict. With a current cached invalid verdict, opening
   `/?license=new-purchased-token` stripped the URL and stored the new token,
   but retained the old invalid verdict, made zero verification requests, and
   displayed `NOT UNLOCKED`. The cache must be invalidated when the returned
   token changes.

4. **Several live click targets miss the contract's 44 × 44 px minimum.** At
   390 px, the brand link measured 183 × 32, the hero `How it works` link
   120 × 18, and privacy/terms/source links measured 38–56 × 15–16. Desktop
   header navigation links were also only 16 px high. Axe does not classify
   these as serious, but the attached accessibility/design contract explicitly
   requires 44 px targets.

### Low

5. **Android platform polish has 31 lint warnings.** Most are generated
   Capacitor/resource hygiene, but the launcher shape, identical round icons,
   missing monochrome adaptive icon, and density warnings are visible platform
   quality issues.

## Required release actions

1. Produce a factory-signed release APK, publish it in the artifact channel,
   link it from the live product with a SHA-256, and install-test it on Android
   with rear camera, TalkBack, audible TTS, offline OCR, permission recovery,
   and the back gesture.
2. Enable the Sociobot product so the live checkout succeeds, then exercise a
   purchase/return/restore/revocation flow.
3. Clear the cached verdict when a different returned license is captured.
4. Expand all interactive hit areas to at least 44 × 44 CSS px and retest at
   390 px.
