# Read a visible screen with a phone — verification 5

**Work order:** `remote-screen-reader-verify-5`

**Verdict:** **FAIL**

**Verified:** 2026-09-06 UTC

**Live URL:** <https://remote-screen-reader.sociobot.in>

**Implementation reviewed:** `58705fad75db8ecf67c2efb78cc001c68e38a6ad`

**Documentation reviewed:** `805fbccc89b9078854d5b8540a4ba0c54e5e59ce`

## Result

**FAIL — 1 finding and 0 untested public claims.** A PASS requires zero
findings at every severity and zero untested claims.

The live web application matches the reviewed implementation. A clean build
and the live `index.html` both have SHA-256
`7b6a4d7c2ca8815c994f11b8807cff2a37711436dd1b640908c06400c8b989b4`.
Commits after `58705fa` change only factory documentation and the live-browser
verification script, not the product image.

The web repair is complete, but the primary Android download is still the old
signed 1.0.1 package. It does not contain the current sample experience or
equal the 1.0.2 candidate. The product therefore cannot pass strict Android
acceptance.

## Finding

### High

1. **The public signed APK is older than the reviewed implementation.** The
   public metadata names Android 1.0.1, and Android package inspection reports
   `versionCode=2` and `versionName=1.0.1`. Its SHA-256 is correctly published
   as `0a7c8313f60800e031d326ec4865d87691a4d268a6e5a19569f6c0ce696f1ce3`,
   and APK signature verification succeeds. Integrity is not the problem.
   Content equality is: the public APK lacks
   `assets/public/assets/demo-screen-changed.webp`, lacks the current designed
   not-found page and sample bundle, and packages an `index.html` with SHA-256
   `1840e772b4cea1c29d9067d2b82e6957ee32be634f1b2546d17c3c1db5998bf4`.
   It still contains the rejected headings `Aim. Frame. Read.` and `From silent
   pixels to speech.` and has no one-click sample label. The current Android
   1.0.2/versionCode 3 candidate packages the same current reader as the live
   web site, whose `index.html` hash is `7b6a4d...`. The required
   `android-download` claim is false for the public artifact.

## Job, audience, and first action

Before scrolling in fresh 1440 × 1000 desktop and 390 × 844 phone contexts,
the live page stated:

- **Job:** Read a visible screen with your phone.
- **Audience:** Blind and low-vision people using computers where
  screen-reader software cannot be installed.
- **First action:** **Try it with sample data**, with the explanation that it
  opens a sample reading without using the camera.

Both viewports had one `h1`, one `main`, no horizontal overflow, no unexpected
console or page errors, full visible focus, no motion under reduced-motion
preferences, and zero axe violations.

## Demo and real-data isolation

The first action opened `/demo` in one click. Desktop and phone both showed the
persistent **Demo — sample data, nothing is saved** label, **Reset demo**,
**Start for real**, three realistic saved readings, and this prepared result:

```text
ACCESS PANEL
SYSTEM READY
Press Enter to continue
```

**Show an updated screen** followed by **Read visible region** ran live local
OCR and returned `Signed in as Guest`. The temporary capture canvas was 0 × 0
after recognition. Every request during the flow stayed on the product origin.
Reset restored the three readings and original result. A real-namespace
reading and speech-rate sentinel remained unchanged after demo reading, reset,
and Start for real.

The sample reloaded while the fresh phone context was offline, retained its
label and populated result, and showed `Offline mode.` The separate fallback
page was styled, had the title `Reader is offline — Anywhere Reader`, and
logged no error.

Evidence: `/work/.evidence/verify-5-live/`,
`/work/.evidence/verify-5-live-root/`, and
`/work/.evidence/verify-5-live-offline/`.

## Declared claims

A fresh clone at documentation SHA `805fbcc` received `npm ci` with 0 reported
vulnerabilities. Registry validation found 28 claims and one tagged outcome
test for each. `npm run test:declared-claims` ran all 28 commands.

| Result | Claims |
| --- | --- |
| PASS — declared command | sample demo, demo isolation, local private OCR, temporary capture clearing, changed-line speech, no account/control, copy/repeat, camera consent, photo recovery, keyboard region, presets, text zoom, speech rate, free history, persistence, JSON export/import, clear history, offline demo, offline OCR, Pro history, Pro regions, license recovery, license cache, Android bundle, route pages |
| FAIL — claim is false | Android download/current-candidate equality |
| PASS outcome; declared command fails before its assertion | ₹499 one-time Pro offer; hosted payment |

The runner therefore reports **3 of 28 declared claim commands failed**, not
27/28 passing. All three select the same combined Playwright test, whose first
step checks APK equality and stops at the stale package. Independent live
requests confirmed the two later outcomes: the catalog returns INR 49,900
minor units, checkout returns 303 to the Dodo hosted-checkout origin, and the
app has no card fields. Thus there are no untested public claims, but the
declared commands and overall claim gate still fail because of finding 1.

No additional claim-like sentence on the landing page, legal pages, offline
fallback, or README was found outside the tested claim set. The local-only OCR
design is appropriate for this brief; a cloud model would conflict with its
privacy requirement rather than add missed leverage.

## Build, Android, and release checks

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 163 packages installed; 0 vulnerabilities reported. |
| `npm run verify:claims` | PASS — 28 claims, one outcome test each. |
| `npm test` | **FAIL** — release/config and 6/6 unit tests pass; Playwright reports 31 passed, 14 intentionally skipped, and the one stale-APK test failed. |
| `npm run build` | PASS — `dist/` produced and 31 Android bundle files matched it. |
| `npm run android:debug` | PASS after installing JDK 21 and Android SDK 35; debug APK content checks passed, SHA-256 `47b2c71e7e589515601e4c4539a00a4b8fd884499c07fb6c78ca77e6bc3dbfb7`. |
| `npm run android:check` | PASS — Android unit/lint tasks completed; lint says `No issues found.` |
| `npm run android:release` | Expected signing block — the four factory release-signing inputs are unavailable; no unsigned replacement was produced or published. |
| `npm run verify:live-browser` | PASS — fresh desktop/phone first screens, sample/reset, full axe, focus, reduced motion, responsive layout, and offline fallback. |
| `npm run verify:live-release` | **FAIL** — public APK is missing the current sample asset. |
| `/opt/fleet/lib/verify-url.sh` on `/` and `/offline.html` | PASS — correct title/lang/main/alt structure and no console errors. |

The production build ships 46.24 KB of initial JavaScript (16.63 KB gzip),
15.83 KB of lazy OCR JavaScript (6.83 KB gzip), and 23.60 KB CSS (6.13 KB
gzip). Fresh mobile Lighthouse scored **100 Performance, 100 Accessibility,
100 Best Practices, and 100 SEO**, with 1.3 s LCP, 0 CLS, and 70 ms TBT.

## Routes, accessibility, privacy, and recovery

- `/`, `/demo`, `/privacy`, `/terms`, and `/offline.html` return 200 with
  distinct runtime titles and one page heading. An unknown URL deliberately
  returns HTTP 404 for GET and HEAD, renders `Page not found — Anywhere
  Reader`, and offers recovery links. The browser's expected 404 resource log
  is not a defect.
- Full axe scans found zero violations on home, demo, privacy, terms,
  not-found, and offline pages. Keyboard, focus, 200% text, reduced motion,
  44 px targets, mobile heading order, dialog/confirmation behavior, and
  screen-reader names/states pass the live and clean browser checks.
- Normal OCR, changed-line output, invalid-file rejection, denied-camera
  recovery, region boundaries, history limits, invalid import, clear
  confirmation, license restore/revocation/cache, and offline recovery pass.
- All page links resolve. The APK and checksum links return 200; checkout
  returns the expected 303. Manifest MIME type, immutable asset caching,
  no-store release metadata, CSP, camera-only Permissions-Policy, referrer
  policy, `nosniff`, and HSTS are present.
- There are no analytics, CDN scripts, CDN fonts, cloud OCR calls, accounts,
  or real-data writes from the demo. Service-worker update handling is present
  and inspected; no public update-timing promise is made.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| No downloadable Android artifact | Superseded: a signed 1.0.1 APK exists, but it is now stale and remains finding 1. |
| Missing isolated one-click demo | Resolved on the live web candidate; still absent from the public APK under finding 1. |
| Missing claims registry/tests | Resolved: 28 registered claims; the stale APK causes the current claim failures. |
| Camera-frame pixels remained after OCR | Resolved on success and failure paths; live canvas is 0 × 0 after OCR. |
| Phone demo heading skipped a level | Resolved; full phone axe scan has zero violations. |
| Offline CSP blocked styling and fallback used metaphor copy | Resolved; stylesheet loads, copy is plain, and the fallback audit passes. |
| Missing real HTTP 404 and route metadata | Resolved; expected 404, titles, canonical/social metadata, icons, sitemap, and robots are present. |
| Missing copy audit and metaphor headings | Resolved on the current web candidate; old headings remain only in the stale APK. |
| Missing CSP/Permissions-Policy/manifest MIME and immutable caching | Resolved in live response policy. |
| Broken checkout and stale returned-license verdict | Resolved by live checkout and token-cache tests. |
| Targets below 44 px | Resolved on desktop and phone. |
| Android lint warnings | Resolved; fresh lint reports no issues. |

## Scope and limits

This is a static PWA plus Capacitor Android app, not a backend. Tenant
isolation, SQLite restart persistence, health endpoints, and server
429/`Retry-After` behavior do not apply.

No physical Android device was available for rear-camera optics, audible
device speech, TalkBack, OS permission recovery, or back-gesture testing. No
real purchase/refund was made. These are environment limits rather than
untested public claims: the debug package, browser semantics, camera/error
logic, speech calls, hosted redirect, and license state transitions were
exercised where this worker could do so.

## Required action

A release-capable worker must sign the current 1.0.2/versionCode 3 candidate
with the existing factory identity, publish its APK and checksum, update the
release metadata and download copy, deploy that static build, then rerun all
28 declared commands and `npm run verify:live-release`. Do not publish the
debug APK or create a replacement signing identity.
