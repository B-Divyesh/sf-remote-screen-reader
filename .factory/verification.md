# Independent verification — FAIL

**Work order:** `remote-screen-reader-verify-1`<br>
**Candidate:** `eef0ddeac52f992ce525b927957ddc6b7dbabe12` (`main`)<br>
**Verified:** 2026-08-28 UTC<br>
**Live URL:** <https://remote-screen-reader.sociobot.in>

## Verdict

**FAIL — do not accept as the required Android release.**

The deployed static PWA is healthy and is an exact byte-for-byte deployment of
the candidate's `dist/` output. It provides a working, private browser-based
reader flow. However, the researched brief and repository contract require an
Android artifact. This candidate contains only a Capacitor project skeleton:
there is no APK and no embedded web bundle under
`android/app/src/main/assets/public/`. The documented additional `npx cap sync
android` step is not part of `npm run build`, and therefore the checked-out
candidate is not a buildable/releasable Android product as submitted. The
available verification environment also has no `java` executable, so
`./gradlew assembleDebug` could not be run to compensate for that missing
artifact.

## Evidence collected

### Reproducible local gates

All commands were run from a clean checkout at the candidate commit after
`npm ci` (164 packages audited; 0 vulnerabilities).

| Check | Result |
| --- | --- |
| `npm test` | PASS — 3/3 Vitest tests and 10/10 Playwright tests (desktop Chromium and the supplied Pixel 5 / 390 px project) |
| `npm run build` | PASS — runs `prepare:ocr`, `tsc --noEmit`, and Vite; `dist/` produced |
| Separate lint/type command | None is declared; TypeScript checking is included in the build |
| `./gradlew assembleDebug` | BLOCKED — `java: command not found`; additionally, the checked-in Android source has no `src/main/assets/public` bundle |

The supplied Playwright run's final status was `passed`. Browser tests covered
the photo-to-OCR path, consent UI, legal routes, axe, and offline reload on
both configured profiles.

### Independent functional exercise

On a separately started production preview, I uploaded
`tests/fixtures/screen.png`, used the real self-hosted Tesseract worker, and
received `ACCESS PANEL`, `SYSTEM READY`, and `Press Enter to continue`. A
second identical read reported `No change` and retained both local history
entries. No console or page errors occurred.

At a 390 px mobile viewport, keyboard-only testing found the skip link by Tab
with a visible 3 px outline. The consent checkbox enabled camera access; the
denied-camera path showed `Camera error`; an attempt to use a text file showed
the useful image-format error; choosing a valid photo recovered successfully.
The four-corner region handle moved with Arrow and Shift+Arrow. The app also
gave the expected no-source recovery message before a photo/camera existed.

On live desktop and 390 px mobile pages: exactly one `h1` and one `main` were
present, `lang="en"` and title were correct, no horizontal overflow occurred,
and reduced-motion computed transitions were effectively instant (`.01ms`).
Fresh axe scans found **zero serious or critical violations** in both profiles.
No console/page errors were observed on initial live load.

### PWA, privacy, and network

- On the live host, service worker control was established at `/sw.js`; after
  `context.setOffline(true)`, a reload rendered the home heading and the
  visible `Offline mode.` status with no errors.
- Update behavior was code-inspected: the versioned worker calls
  `skipWaiting`/`clients.claim`, and the page exposes an update toast when a
  waiting registration is detected. A real update transition could not be
  induced without changing the deployed worker.
- A fresh real OCR session requested only the local origin, specifically the
  lazy OCR engine and `/ocr/worker.min.js`, `/ocr/tesseract-core.wasm.js`, and
  `/ocr/lang/eng.traineddata.gz`. Initial live load likewise requested only
  `https://remote-screen-reader.sociobot.in`.
- Source inspection finds camera frames and reading history in browser APIs
  (camera, IndexedDB, localStorage, speech synthesis). The only intentional
  optional external runtime call is the Sociobot license verification endpoint
  after a license is stored. There are no analytics or CDN scripts/fonts.

### Live deployment identity, headers, and performance

- SHA-256 comparison of every file under locally generated `dist/` against the
  equivalent live URL produced **no mismatches**. The root `index.html` digest
  was `10e693bbec570dfde10de698c04631eb9bf99fab61f0ae7d1b36f5c0ecde1d26`
  both locally and live.
- Live root response: HTTP/2 200, `content-type: text/html`,
  `cache-control: public, must-revalidate, max-age=30`, HSTS, strict-origin
  referrer policy, and `X-Content-Type-Options: nosniff`.
- Lighthouse against the live URL (headless Chromium): Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.2 s,
  TBT 0 ms, CLS 0.
- Build inventory: initial application JS 32.39 kB (11.88 kB gzip), CSS
  21.18 kB (5.65 kB gzip), requested WOFF2 fonts 37.99 kB total, and mobile
  hero image 19.19 kB. These pass the stated first-load budgets. The lazy
  on-device OCR model/runtime is roughly 17.8 MB, deliberately excluded from
  initial load and loaded only by a reader action.

## Defects

### Critical

1. **No verified/releasable Android artifact.** The acceptance contract says
   artifact class `android` and requires the Android app that performs the
   camera/OCR/speech job. Candidate `eef0dde` has no APK and no bundled web
   assets in `android/app/src/main/assets/public/`; its README explicitly
   defers build/signing to a later work order. The required Gradle verification
   cannot run here because Java is absent. This PWA deployment cannot establish
   that the Android camera, speech, offline, back gesture, and TalkBack paths
   work.

### Medium

2. **Live security/browser policy baseline is incomplete.** The live responses
   have HSTS/referrer/nosniff, but no `Content-Security-Policy` and no
   `Permissions-Policy` restricting camera use. `/manifest.webmanifest` is
   served as `application/octet-stream`, not a web-manifest MIME type. These
   did not break Chromium PWA behavior in this test but should be fixed before
   release.

3. **Hashed static assets receive only `max-age=30`.** The live host sends this
   short mutable cache policy even for fingerprinted JS/CSS/image/OCR files;
   it misses the requested long-lived immutable asset caching and makes the
   offline/cache strategy less efficient than intended.

### Verification limitation (not counted as a product defect)

- A real service-worker *update* transition and physical Android/TalkBack/rear
  camera test require a second deployed worker/APK and Android tooling/device.
  Offline reload was tested successfully; update handling was inspected.

## Required next steps

1. Build and sync the Capacitor project in an Android-capable environment,
   produce `assembleDebug` (and the factory-signed release artifact), then
   install it on a real Android device for camera, TalkBack, offline update,
   permission-recovery, and back-gesture QA.
2. Make the Android build/sync an actual reproducible release command and
   retain/upload the APK plus SHA-256.
3. Configure correct manifest MIME type, CSP, camera Permissions-Policy, and
   immutable caching for hashed static assets; re-run this verification.
