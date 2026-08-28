# Independent verification 3 — PASS

**Work order:** `remote-screen-reader-verify-3`

**Candidate:** `a451b2fd55bde85eb2c29b57eb45220173f8a55c` (`main`)

**Verified:** 2026-08-28 UTC

**Live URL:** <https://remote-screen-reader.sociobot.in>

**Acceptance artifact:** Android APK with matching PWA/web reader

## Verdict

**PASS — accept this candidate.**

Fresh verification resolves the earlier deployment-only failure. The public
release is a release-signed Android 1.0.1 APK, its complete embedded web bundle
matches the candidate, the live web deployment byte-matches the candidate, and
the production checkout is enabled. The smallest useful product completed the
photo → local OCR → changed-line result flow both online and offline. No
critical, high, or medium defects were found.

## Clean checkout and repository gates

Testing was performed in a newly created detached worktree at the exact
candidate. It was clean before `npm ci` and remained clean after all generated
build artifacts were reproduced.

| Gate | Fresh result |
| --- | --- |
| `npm ci` | PASS — 163 packages installed, 164 audited, 0 vulnerabilities |
| `npm test` | PASS — release configuration, 6/6 Vitest tests, and 14/14 Playwright tests on desktop Chromium and the 390 px mobile profile |
| `npm run build` | PASS — OCR preparation, `tsc --noEmit`, Vite production build, Capacitor sync, and byte comparison of 22 Android bundle files; `dist/` produced |
| `npm run android:debug` | PASS under OpenJDK 21 and Android SDK 35 — `assembleDebug` and package-content verification completed |
| `npm run android:check` | PASS — Android unit tasks and `lintDebug`; 0 errors, 28 warnings |
| `npm run verify:live-release` | PASS — production catalog, ₹499 price, Dodo checkout redirect, release metadata, APK, and checksum |
| `npm run verify:live-browser` | PASS — both viewports, axe, focus, reduced motion, response cleanliness, and offline reload |

There is no separate web lint script. Type checking is part of the exact
production build. Playwright is pinned to the supplied 1.58.2 browser version.

The clean debug APK is 18,757,571 bytes with SHA-256
`49b59d6794f9d1fb650233bef7e4f40c3e17c819cc32dd7705ee60d9fe825ca5`.
It contains the app shell, OCR worker, and uncompressed English OCR model.

## Independent end-to-end exercise

A fresh browser context exercised the live product independently of its test
suite.

- Camera consent began unchecked and kept `Allow camera` disabled. Granting
  consent revealed the workspace; a camera-unavailable path retained a clear
  photo fallback.
- Reading without an image reported `There is no screen image to read`.
  Supplying a text file reported the accepted image formats. A valid image
  worked immediately afterward.
- The representative screen photo was processed by the self-hosted Tesseract
  worker and returned `ACCESS PANEL`, `SYSTEM READY`, and
  `Press Enter to continue`. Re-reading the same pixels reported `No change`
  and did not repeat the previous lines.
- Keyboard `Shift+ArrowRight` moved the northwest region edge from 8% to 13%.
  The 52 px maximum text size and 0.6× minimum speech rate were applied and
  announced in their visible outputs.
- Malformed import JSON produced specific recovery guidance. Importing seven
  valid readings into the free tier retained exactly five. Export downloaded
  `anywhere-reader-2026-08-28.json`; the two-step clear removed all rows and
  announced success.
- A short restore token was rejected locally with guidance. A complete invalid
  token received HTTP 200 with `{valid:false, reason:"invalid"}` from the
  production API and left Pro locked. The regression for a newly returned
  token invalidating another token's cached verdict passed at both viewports.
- The free camera/OCR, changed-line, speech, zoom, history, import/export, and
  offline controls remain available without an account or license.

The automated browser has no usable audible system voice. Recognized text and
speech-failure guidance were verified, while actual device TTS remains a
physical-device check.

## PWA, persistence, and offline behavior

- IndexedDB readings survived the relevant page operations; the free five-row
  retention boundary, JSON ownership controls, and destructive confirmation
  all passed.
- Service-worker control created the versioned `reader-v2-shell` and
  `reader-v2-ocr` caches. After the OCR model had been used, a fully offline
  reload displayed `Offline mode.` and recognized the same three fixture lines
  with zero console, page, or failed-request errors.
- A local update harness served a synthetic second worker version. The new
  worker activated, the visible update toast appeared, the old cache was
  replaced by `reader-v3-shell`, and no browser errors occurred.
- The manifest has a versioned start URL, standalone display mode, 192/512 and
  maskable icons, and theme/background colors matching the documented visual
  system.

## Android release evidence

The public artifact and checksum were downloaded afresh from GitHub Release.

- Artifact: `anywhere-reader-1.0.1.apk`
- Size: 16,754,600 bytes
- SHA-256: `0a7c8313f60800e031d326ec4865d87691a4d268a6e5a19569f6c0ce696f1ce3`
- Package: `in.sociobot.remotescreenreader`
- Version: code 2 / name 1.0.1
- SDK: min 23, target/compile 35
- Permissions: camera and Internet; camera hardware is optional
- Signature: APK Signature Scheme v1 and v2 verified; signer
  `CN=Param Factory Android Release, OU=Android Release, O=Sociobot, C=IN`;
  certificate SHA-256
  `d69ca1988c104eee7abbc21fdba95d176b81f6fb73693204ef57a467c5158071`;
  it is not the Android debug certificate
- All 26 files under the candidate's synchronized
  `android/app/src/main/assets/public/` byte-match their files inside the
  downloaded APK, including the local OCR worker and English model

The product page links the immutable APK and checksum. Release metadata is
served with `Cache-Control: no-store`.

## Deployment identity, privacy, and browser policy

All 24 public `dist/` files byte-match the live deployment. The excluded 25th
file is `staticwebapp.config.json`, which is host configuration rather than a
public asset. Local and live `index.html` share SHA-256
`1840e772b4cea1c29d9067d2b82e6957ee32be634f1b2546d17c3c1db5998bf4`.

The live root returns HTTP/2 200 with HSTS, `nosniff`,
`strict-origin-when-cross-origin`, `frame-ancestors 'none'`, a same-origin CSP
whose sole runtime API exception is `https://api.sociobot.in`, and
`Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=(),
usb=()`. The web manifest uses `application/manifest+json`; hashed assets use
one-year immutable caching; HTML and the service worker use 30-second
revalidation.

Initial desktop/mobile loads and the full OCR flow contacted only the product
origin. The only optional third-party runtime request observed was the
documented Sociobot license verification call. There are no analytics, cloud
OCR requests, CDN fonts/scripts, or automatic external requests. Camera frames
remain in browser/canvas memory, readings are stored in IndexedDB, settings and
the optional license are local storage, and `/privacy` and `/terms` accurately
describe those boundaries.

## Accessibility, responsive design, and performance

- At 1440 × 1000 and 390 × 844 the page has `lang="en"`, a descriptive title,
  one `h1`, one `main`, no horizontal overflow, 18 px/17 px body text, and no
  visible interactive target below 44 × 44 CSS px.
- The first Tab focuses `Skip to main content` with a visible 3 px lime outline.
  Region handles respond to arrow keys and Shift-modified steps. No keyboard
  trap was encountered.
- Fresh axe scans on the desktop home, mobile home, legal pages, and populated
  reader workspace found zero serious or critical violations. Normal runs had
  zero console/page errors.
- Reduced-motion emulation left zero elements with a transition or animation
  longer than 0.01 ms. The single-mode dark palette is explicitly justified in
  `.factory/design.md`; axe found no contrast failure.
- Fresh Lighthouse 13.0.1 mobile runs scored **91 and 94 performance**, **100
  accessibility**, **100 best practices**, and **100 SEO**. LCP was
  1.55–1.70 s, FCP 1.20 s, CLS 0.00026, and initial transfer 84–85 KiB.
- Production budgets pass: initial JS 41,361 bytes, CSS 21,841 bytes, selected
  WOFF2 fonts 37,988 bytes, and the mobile hero 19,186 bytes. The 10.9 MB
  compressed English OCR model is lazy and explicitly cached for offline use.

## Defects by severity

### Critical

None.

### High

None.

### Medium

None.

### Low

1. Android lint reports 28 non-blocking resource/platform-hygiene warnings.
   They include legacy launcher/round-icon shape checks, the API-33 predictive
   back attribute being ignored on older devices, deprecated backup metadata,
   unused generated resources, and splash density placement. There are zero
   lint errors and no warning blocks the tested function or package.

## Verification limits

- No physical Android device was attached. Rear-camera optics, audible device
  TTS, TalkBack announcements, OS-level permission recovery, and the physical
  back gesture were not re-exercised. Browser permission/error behavior,
  keyboard/screen-reader semantics, offline OCR, APK identity/signature, and
  packaged assets were verified.
- No real card was charged and no refund was issued. Product discovery, the
  production Dodo checkout-session redirect, return-token behavior, restore,
  invalid-token locking, and CORS were exercised without a purchase.
- The 10-person pilot success measure is a post-release user study and was not
  represented as completed by this repository verification.

## Re-run

```sh
npm ci
npm test
npm run build

ANDROID_HOME=/path/to/android-sdk ANDROID_SDK_ROOT=/path/to/android-sdk npm run android:debug
ANDROID_HOME=/path/to/android-sdk ANDROID_SDK_ROOT=/path/to/android-sdk npm run android:check

npm run verify:live-release
npm run verify:live-browser
```
