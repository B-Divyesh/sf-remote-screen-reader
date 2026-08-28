# Anywhere Reader v1 handoff

Work order: `remote-screen-reader-build-1`

Completed: 2026-08-28

Deploy: static PWA from `dist/`

## What shipped

- A complete camera/photo → selected region → local OCR → changed-line speech workflow.
- Explicit in-context camera consent, permission/error recovery, photo fallback, keyboard-operable region corners, four region presets, stop/repeat speech, 24–52 px transcript zoom, and adjustable speech rate.
- English Tesseract OCR worker, SIMD core, and 10.4 MB model self-hosted under `/ocr`; they are lazy-loaded only after a read or “Prepare offline reading.” No captured frame or recognized text leaves the device.
- IndexedDB reading history, clear confirmation, and JSON export/import. The free product keeps five readings; all core accessibility, safety, speech, zoom, and data ownership controls remain free.
- One-time ₹499 Pro license contract through `https://api.sociobot.in/api/v1/products/remote-screen-reader/...`: hosted buy link, returned-token storage and URL stripping, daily cached verification, offline optimistic unlock, paste-to-restore, revoked-license fallback, 50 local readings, and ten named local region presets.
- Versioned service worker with complete first-install shell caching, cache-first local OCR/assets, network-first navigation, explicit offline fallback, and update toast. Manifest includes 192/512/maskable icons and standalone launch treatment.
- Product-specific “pocket phosphor” pixel/demoscene system, original generated/hand-authored assets, responsive 390 px layout, reduced-motion behavior, legal pages, README, MIT license, and no analytics/runtime CDNs.
- Capacitor 7 Android skeleton at `android/`, application ID `in.sociobot.remotescreenreader`, optional camera hardware declaration, runtime camera permission, dark Android theme, and product launcher/splash assets. Web assets were synced after the final build.

## Run and verify

```sh
npm install
npm test
npm run build
npx cap sync android
```

The deployment command is exactly `npm run build`; it produces `dist/index.html` at the required root.

Verification performed against the production build:

- `npm test`: 3/3 Vitest unit tests and 10/10 Playwright tests passed across desktop Chromium and Pixel 5/390 px profiles.
- Real integration test: uploaded a screen fixture, loaded the self-hosted OCR worker/model, recognized “ACCESS PANEL / SYSTEM READY,” and produced the transcript on both profiles.
- Offline test: waited for service-worker control, disabled the browser network with Playwright, reloaded successfully, and displayed the offline state on both profiles.
- Axe: no serious/critical violations; full default axe rules (including contrast) passed on home, privacy, and terms routes.
- Factory `verify-url.sh`: 200 response, 580 ms load, zero console/page errors, title and `lang=en`, one `<h1>`, `<main>` present, zero missing alt attributes, zero unlabeled buttons.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.5 s, total blocking time 0 ms, CLS 0.
- Bundles: initial JS 32.39 KB (11.88 KB gzip), CSS 21.18 KB (5.65 KB gzip), two requested WOFF2 font files total 38 KB, mobile hero WebP 19 KB, desktop hero WebP 52 KB. OCR is a user-triggered lazy path and is not part of first load.
- Evidence is retained in `.factory/evidence/` (`verify.json`, desktop/mobile screenshots, and `lighthouse.json`).

## Known gaps and next steps

- This static-deploy work order intentionally stops at the Capacitor project skeleton. The later Android work order must build/sign the APK with the factory keystore, test TalkBack and physical rear-camera behavior on representative Android devices, upload the artifact, and publish its SHA-256.
- V1 ships English OCR only. Additional languages require locally hosted traineddata, a language picker, and offline-storage disclosure.
- OCR and browser speech synthesis remain dependent on lighting, display glare, device performance, and installed system voices. The UI warns users to verify critical text.
- The factory must register `remote-screen-reader` and its ₹499 one-time price in the Sociobot production billing engine before checkout can complete. No product ID or payment-provider secret is embedded here.
- Protected/DRM video may appear blank by platform design; the product deliberately does not bypass that restriction.
