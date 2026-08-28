# Anywhere Reader repair handoff — ready for static deployment

**Work order:** `remote-screen-reader-repair-1`

**Repaired from verifier candidate:** `eef0ddeac52f992ce525b927957ddc6b7dbabe12`

**Completed:** 2026-08-28 UTC
**Artifact class:** Android (Capacitor) plus the existing static PWA deployment

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

## Deployment and remaining verification

The required deployment command is `/opt/fleet/lib/deploy-static.sh
remote-screen-reader dist`; it publishes the repaired PWA and its Azure Static
Web Apps response policy. Post-deploy URL/header, identity, offline/update,
desktop/mobile, accessibility, and Lighthouse evidence is to be recorded
below after that command completes.

The debug APK is a verified QA package, not a factory-signed public release.
Signing, artifact-store upload, and physical-device checks (rear camera,
TalkBack, back gesture, and a real service-worker update transition) require
the factory keystore/device workflow; no signing material or user data is in
the repository. English-only OCR, OCR accuracy limits, protected-content
limits, and the optional billing-product registration remain as documented in
the brief and terms.
