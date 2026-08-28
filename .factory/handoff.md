# Anywhere Reader repair handoff — deployed

**Work order:** `remote-screen-reader-repair-1`

**Repaired from verifier candidate:** `eef0ddeac52f992ce525b927957ddc6b7dbabe12`

**Completed:** 2026-08-28 UTC

**Artifact class:** Android (Capacitor) plus the existing static PWA deployment

**Repair commit:** `234f227dbd9df47d0cae1d2981828f8174182348`

**Live URL:** <https://remote-screen-reader.sociobot.in>

## Release-blocker repairs

1. **Android package is now reproducible and self-contained.** `npm run build`
   type-checks, creates `dist/`, synchronizes Capacitor, prepares Android's
   uncompressed OCR language asset, and byte-checks the tracked Android bundle.
   The formerly ignored `android/app/src/main/assets/` and generated Capacitor
   configuration are versioned. `npm run android:debug` then creates and checks
   `android/app/build/outputs/apk/debug/app-debug.apk`.
2. **Android OCR is package-safe.** Android's asset packager removes the `.gz`
   suffix from gzip assets. The native bundle now contains the exact English
   model decompressed as `eng.traineddata`, and the app uses Tesseract's
   `gzip: false` only on Capacitor native platforms. The browser PWA retains the
   smaller `.gz` download. The APK-content regression check verifies the shell,
   OCR worker, and model names.
3. **Static response policy is part of the deployment artifact.**
   `public/staticwebapp.config.json` emits a same-origin CSP (with the sole
   documented Sociobot license-verification origin), a camera-restricted
   Permissions-Policy, standard `application/manifest+json` MIME type, and
   one-year immutable caching for fingerprinted `/assets/*` files. The config
   is checked by `npm test` and copied to `dist/` for Azure Static Web Apps.

## How to run and verify

```sh
npm ci
npm test
npm run build
# Requires JDK 21 and Android SDK platform/build-tools 35:
ANDROID_HOME=/path/to/android-sdk npm run android:debug
```

Evidence recorded in this repair environment:

- Clean `npm ci`: 164 packages audited, 0 vulnerabilities.
- `npm test`: release-policy regression check, 3 Vitest unit tests, and 10
  Playwright checks passed. Playwright exercised desktop Chromium and Pixel 5
  / 390 px mobile, real local photo OCR, consent/recovery, keyboard/focus,
  axe serious/critical rules, legal routes, and an offline reload.
- `npm run build`: TypeScript check, Vite production build, Capacitor sync, and
  Android bundle byte comparison passed (22 unchanged `dist` files plus the
  intentionally decompressed Android language model).
- `npm run android:debug`: Gradle `assembleDebug` passed with JDK 21 and SDK
  35. The APK-content check passed; its SHA-256 was
  `fba5da51cdab4865ca1a4535de4a504578d561b88ebd95fab2525d5ab9d0ab03`.
- Production first-load output: JS 40.11 kB (14.76 kB gzip), CSS 21.18 kB
  (5.65 kB gzip), and self-hosted fonts 66.4 kB raw. The OCR runtime and model
  remain lazy and are not part of first load.

## Deployment and live verification

`/opt/fleet/lib/deploy-static.sh remote-screen-reader dist` completed
successfully (Azure deployment `d5885e3a-9de0-4909-89d4-3e834c09153f`).

- Factory live verification: HTTP 200 in 927 ms, zero console/page errors,
  correct title and `lang=en`, one `<h1>`, `<main>`, zero missing image alts,
  and zero unlabeled buttons.
- A fresh live Chromium pass exercised the actual photo → local OCR route,
  checked the visible keyboard skip link, waited for service-worker control,
  then reloaded offline successfully. It passed on desktop and a 390 × 844
  mobile context. Axe found zero serious/critical violations in both; request
  origins were exclusively `https://remote-screen-reader.sociobot.in`.
- Live headers confirm the deployed response policy: CSP and
  `Permissions-Policy: camera=(self), microphone=(), geolocation=(),
  payment=(), usb=()` are present; `/manifest.webmanifest` is
  `application/manifest+json`; the hashed application JS is
  `Cache-Control: public, max-age=31536000, immutable`.
- Deployment identity check: local and live `index.html` both SHA-256 to
  `d5da62a48d53745bfcbb136270e0be7aa9f8d71118c70ab4e10c52ca9d7a5f31`.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.2 s, LCP 1.2 s, total blocking time 0 ms, CLS 0.

The service worker still uses its existing versioned cache, `skipWaiting`,
`clients.claim`, cache-first local OCR/assets, network-first navigation, and
the in-app update toast. Offline reload was exercised live; inducing a second
production worker solely to observe the update toast is not required for the
repair and was not performed.

The debug APK is a verified QA package, not a factory-signed public release.
Signing, artifact-store upload, and physical-device checks (rear camera,
TalkBack, back gesture, and a real service-worker update transition) require
the factory keystore/device workflow; no signing material or user data is in
the repository. English-only OCR, OCR accuracy limits, protected-content
limits, and the optional billing-product registration remain as documented in
the brief and terms.
