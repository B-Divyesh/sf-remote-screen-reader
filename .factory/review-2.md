# Read a visible screen with a phone — review 2

**Work order:** `remote-screen-reader-review-2`  
**Verdict:** **FAIL**  
**Reviewed:** 2026-09-06 UTC  
**Live URL:** <https://remote-screen-reader.sociobot.in>  
**Implementation reviewed:** `0e7e6b956b429b4b70e5540fc4bf13cd8ebbea3d`  
**Documentation reviewed:** `5aac46961b5216cc7d6799508ed3eec83506186b`

## Result

**FAIL — 5 findings and 1 untested public claim.** A PASS requires zero
findings at every severity and zero untested claims.

The live web build is the reviewed implementation: its `index.html` and the
clean candidate build both have SHA-256
`c59b97ec595e8164e5448b375a489bfbfa779f90f28f0c8f66ccbd0c60e7828e`.
The public Android download is not that build.

## Job, audience, and first action

Before scrolling in fresh 1440 × 1000 desktop and 390 × 844 phone contexts:

- Job: **Read a visible screen with your phone.**
- Audience: blind and low-vision people using a computer where screen-reader
  software cannot be installed.
- First action: **Try it with sample data**, with the explanation that it opens
  a sample reading without using the camera.

Both first screens had one `h1`, one `main`, `lang="en"`, no horizontal
overflow, no console errors, a visible 3 px skip-link focus style, and only
same-origin initial requests.

## Findings

### High

1. **The public Android APK is the pre-repair product, not the reviewed
   implementation.** The live release metadata and checksum correctly identify
   signed APK `0a7c8313f60800e031d326ec4865d87691a4d268a6e5a19569f6c0ce696f1ce3`,
   but its packaged `assets/public/index.html` hash is
   `1840e772b4cea1c29d9067d2b82e6957ee32be634f1b2546d17c3c1db5998bf4`.
   That is the old build reviewed in review 1. The APK has 26 public files,
   lacks the demo images and `not-found.html`, contains the rejected headings
   `Aim. Frame. Read.` and `From silent pixels to speech.`, and contains no
   `Try it with sample data` or persistent demo label. The current clean debug
   APK instead packages the candidate hash `c59b97...`, both demo images, and
   `not-found.html`. The release checks only prove that an APK and checksum are
   reachable; they do not compare the published APK with the candidate. Since
   this is an Android product, the primary downloadable artifact still has the
   earlier high-severity demo failure.

### Medium

2. **The camera-frame disposal claim is false and has no claim test.** The live
   consent copy says frames “are discarded after text recognition.” After a
   successful sample OCR run, the hidden `#captureCanvas` still held a
   1800 × 621 image and produced a 155,826-character PNG data URL. The selected
   image also remained on screen. The pixels stay local, but they are not
   discarded after recognition. None of the 27 claim entries names or tests
   disposal. This is the one untested public claim counted in the verdict.

3. **The phone demo has an invalid visible heading outline.** At 390 px,
   `.demo-main .reader-section .section-heading` hides the `h2` named `Read a
   screen`, while `h3#captureTitle` remains visible. Axe reports the moderate
   `heading-order` violation on `#captureTitle`. The suite passes because its
   route scans count only serious and critical axe results. This fails the
   attached requirement for headings in order.

### Low

4. **The offline fallback violates its own content security policy.** A fresh
   load of `/offline.html` returns 200 but logs that its inline `<style>` was
   blocked by `style-src 'self'`. The required `verify-url.sh` therefore exits
   1 for this page, and the fallback renders as an unstyled browser-default
   page instead of the product's visual system.

5. **The offline fallback still uses a metaphor heading omitted from the copy
   audit.** Its `h1` is `Signal offline.` The plain-words contract requires a
   job/state heading without metaphor, and `.factory/copy-audit.md` does not
   include this public fallback copy. A heading such as `Reader is offline`
   would state the condition directly.

## Demo and live paths

The web demo otherwise worked end to end. One click opened `/demo` with the
persistent **Demo — sample data, nothing is saved** label, Reset demo, Start
for real, three realistic readings, and the prepared `ACCESS PANEL`, `SYSTEM
READY`, and `Press Enter to continue` output. The changed sample ran local OCR,
returned and spoke `Signed in as Guest`, and contacted only the product origin.
Reset restored all three sample readings and the original output. A real-data
sentinel and real speech-rate setting remained unchanged after clearing,
resetting, and leaving the demo.

Keyboard region movement, 200% text, reduced motion, offline demo reload,
copy/repeat speech, invalid-file and denied-camera recovery, history limits,
import/export, license recovery, and Pro boundaries passed in the clean suite.

## Claims

From the clean clone, `npm run test:declared-claims` ran all 27 commands in
`.factory/claims.json`; all 27 passed:

| Declared claims | Result |
| --- | --- |
| sample demo; demo isolation; local OCR; changed-line speech; no account/control; copy/repeat | PASS |
| camera consent; photo fallback; keyboard region; presets; text zoom; speech rate | PASS |
| free history; persistence; JSON import/export; clear; offline demo; offline OCR | PASS |
| Pro history; Pro regions; license recovery; license cache | PASS |
| Android bundle/download; one-time offer; hosted payment; route pages | PASS |

The overall claims result is still **FAIL** because the separate public
frame-disposal statement is absent from the registry and contradicted by the
runtime observation in finding 2.

## Clean-checkout and live evidence

The clone at documentation SHA `5aac469` had no local changes before testing.
These commands passed:

```sh
npm ci
npm run test:declared-claims
npm test
npm run build
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/work/remote-screen-reader-review2-sdk \
  ANDROID_SDK_ROOT=/work/remote-screen-reader-review2-sdk \
  npm run android:debug
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/work/remote-screen-reader-review2-sdk \
  ANDROID_SDK_ROOT=/work/remote-screen-reader-review2-sdk \
  npm run android:check
npm run verify:live-browser
npm run verify:live-release
```

- `npm ci`: 163 packages, 0 vulnerabilities.
- `npm test`: 6 Vitest tests and 29 Playwright tests passed; 13 expected
  project skips.
- Build: `dist/` produced; main JS 45.98 KB raw / 16.56 KB gzip, lazy OCR JS
  15.83 KB raw / 6.83 KB gzip, CSS 23.60 KB raw / 6.13 KB gzip, mobile hero
  19,186 bytes.
- Android: 30 bundled files matched `dist`; debug APK built and passed package
  checks; unit/lint completed with `No issues found.`
- Fresh live Lighthouse: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; LCP 1.3 s, CLS 0, TBT 40 ms. The root score does not
  cover the phone-only demo outline finding.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with distinct titles and
  one page heading. `/404` and an unknown path deliberately returned 404 for
  GET and HEAD with the designed recovery page. This expected 404 is not a
  defect.
- All ordinary home links resolved. The checkout redirect, ₹499 catalog
  price, APK URL, and checksum URL were live.

Evidence is under `/work/.evidence/review-2/`; the final evidence copy is
`/work/.evidence/qa-report.md`.

## Earlier finding disposition

| Earlier item | Current disposition |
| --- | --- |
| Missing isolated one-click demo | Resolved on the web candidate; still present in the public signed Android artifact (finding 1). |
| Missing claims registry and tests | 27 declared commands pass; one public privacy claim remains unlisted and false (finding 2). |
| Missing real HTTP 404 | Resolved on the live web site for GET and HEAD. |
| Incomplete route metadata | Resolved on the live web routes. |
| Missing copy audit and mood headings | Landing headings are fixed; the offline fallback and audit remain incomplete (finding 5). |
| Android lint warnings | Resolved; fresh lint says `No issues found.` |
| Earlier security-header, checkout, license-cache, and target-size findings | Resolved by current checks. |

## Scope and limits

This is a static PWA plus Capacitor Android app, not a backend. Tenant
isolation, server restart persistence, health endpoints, SQLite, and server
429/`Retry-After` checks do not apply. No physical Android device was available
for TalkBack, rear-camera optics, audible device speech, or back-gesture tests.
No real paid transaction or refund was made. Those environment limits are not
counted as findings. Cloud AI would conflict with this product's local OCR and
privacy scope, so there is no missed AI feature finding.

## Required repair

1. Sign and publish the current Android bundle, update release metadata and
   checksum, then compare the downloaded APK contents with the candidate.
2. Clear captured canvas pixels after OCR (including error paths), correct the
   disposal wording, and add a dedicated tagged claim test.
3. Keep a visible `h2` in the phone demo or change the visible subsection
   levels so the outline does not skip.
4. Move offline fallback styles to a CSP-allowed stylesheet, replace `Signal
   offline.` with a direct state heading, and include that copy in the audit.
