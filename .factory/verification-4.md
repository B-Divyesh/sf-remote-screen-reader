# Read a visible screen with a phone — verification 4

**Work order:** `remote-screen-reader-verify-4`  
**Verdict:** **PASS**  
**Verified:** 2026-09-06 UTC  
**Live URL:** <https://remote-screen-reader.sociobot.in>  
**Implementation reviewed:** `0e7e6b956b429b4b70e5540fc4bf13cd8ebbea3d`  
**Documentation reviewed:** `fe939973a0d2d0eca9baae0ef81cefac41883931`

## Result

There are **zero findings** at every severity and **zero untested public
claims**. The live site matches the reviewed implementation: both the local
candidate build and the live `index.html` have SHA-256
`c59b97ec595e8164e5448b375a489bfbfa779f90f28f0c8f66ccbd0c60e7828e`.

The documentation-only commit after the implementation changes only
`.factory/handoff.md`; it does not require a different product-image review.

## Job, audience, and first action

Before scrolling in fresh 1440 × 1000 desktop and fresh 390 px phone browser
contexts, the first screen stated:

- **Job:** Read a visible screen with your phone.
- **Audience:** Blind and low-vision people using a computer where
  screen-reader software cannot be installed.
- **First action:** **Try it with sample data**, which says it opens a sample
  reading without using the camera.

Both first loads had one `h1`, one `main`, no console/page errors, and only
same-origin initial requests. Evidence: `/work/.evidence/verify-4-live/`.

## Demo and real reader paths

`/demo` opened the isolated sample on the fresh phone. It showed the persistent
**Demo — sample data, nothing is saved** banner, **Reset demo**, **Start for
real**, the prepared `ACCESS PANEL`, `SYSTEM READY`, and `Press Enter to
continue` result, a realistic three-item history, and **Show an updated
screen**. The screenshot is
`/work/.evidence/verify-4-live/phone-demo.png`.

The declared isolation outcome test seeded real data, performed demo changes,
cleared and reset the sample, then started for real. It proved that real data
and real settings remained unchanged. The local OCR outcome test processed the
changed sample to `Signed in as Guest`, sent only same-origin requests, and
verified copy and repeat-speech controls.

## Claims and clean checkout

A fresh clone at `fe93997` received `npm ci` successfully (0 reported
vulnerabilities). `npm run test:declared-claims` ran every command in
`.factory/claims.json`; all **27/27** passed. Registry validation also reports
27 public claims with one unique tagged observable outcome test per claim.

| Claims | Result |
| --- | --- |
| sample demo; demo isolation; local private OCR; changed-line speech; no account/control; copy/repeat | PASS |
| camera consent; photo fallback; keyboard region; region presets; text zoom; speech rate | PASS |
| free history; history persistence; JSON export/import; clear history; offline demo; offline OCR | PASS |
| Pro history; Pro regions; license recovery; license cache | PASS |
| Android bundle/download; one-time Pro offer; hosted payment; route pages | PASS |

The broader clean gate also passed:

```sh
npm test
```

It reported release and claim-registry checks, 6/6 Vitest tests, 29/29
Playwright tests, and 13 intentional non-Chromium skips.

## Build, Android, and live checks

```sh
npm run build
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/work/.android-sdk ANDROID_SDK_ROOT=/work/.android-sdk \
  npm run android:debug
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
  ANDROID_HOME=/work/.android-sdk ANDROID_SDK_ROOT=/work/.android-sdk \
  npm run android:check
npm run verify:live-browser
npm run verify:live-release
```

All passed after installing the documented JDK 21 and Android SDK 35 into the
disposable verifier environment. The build produced `dist/`; the Android
bundle comparison found 30 matching files; the debug APK was built; Android
lint says `No issues found.` Live release verification confirmed the Android
1.0.1 package/checksum and the ₹499 one-time hosted checkout redirect.

Fresh live browser checks passed at desktop and 390 px: no horizontal overflow,
no undersized links, visible 3 px skip-link focus, zero serious/critical axe
issues, no initial third-party requests, and an offline reload with the
offline status. A separate full axe run had **zero violations** on `/`,
`/demo`, `/privacy`, `/terms`, and `/404`. Keyboard controls, invalid photo,
camera-denied recovery, local history, license recovery/cache, legal routes,
and the offline sample/OCR paths are covered by the successful clean test
suite.

`/`, `/demo`, `/privacy`, and `/terms` return 200 with their distinct titles.
`/404` and an unknown path return deliberate HTTP 404 responses for GET and
HEAD, render `Page not found — Anywhere Reader`, and provide home/sample
recovery. This expected 404 is not a defect. All ordinary site links and the
Android/checksum/checkout destinations resolved successfully.

The live response has the expected CSP, camera-only Permissions-Policy,
referrer policy, `nosniff`, HSTS, and a web-manifest MIME type. It uses no
analytics, CDN fonts/scripts, or cloud OCR. The optional billing verification
endpoint is invoked only for a stored license.

Fresh Lighthouse (Chromium headless shell) measured **98 Performance, 100
Accessibility, 100 Best Practices, and 100 SEO**; LCP was 1.4 s and CLS 0.
The prior 100-performance run is not reproduced exactly in this different
lab/browser invocation, but the current result remains above the required
budget and there is no public 100-score promise.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Missing isolated one-click sample demo | Resolved and independently exercised. |
| Missing claims registry and claim tests | Resolved: 27 declared claims, all tested from the clean demo sandbox. |
| Missing real HTTP 404 | Resolved: designed page and expected HTTP 404 for GET and HEAD. |
| Incomplete route metadata | Resolved: distinct titles, canonical/social metadata, touch icon, manifest, sitemap, and robots routes are present. |
| Missing copy audit and mood headings | Resolved: audit exists; first screen and section headings use plain task language. |
| Android lint warnings | Resolved: fresh lint output says `No issues found.` |
| Earlier Android artifact, policy/cache, checkout/license-cache, and target-size findings | Resolved by current package, header, checkout, regression, and mobile checks. |

## Limits not counted as findings

No physical Android device was available for rear-camera optics, audible device
speech, TalkBack, OS permission recovery, or back-gesture testing. No real
paid transaction/refund was created. The installed/debug package, browser
accessibility semantics, hosted checkout redirect, documented license flows,
and all local/runtime paths available in this environment were verified.

This is a static PWA plus Capacitor Android package, not a backend product.
Tenant isolation, server restart persistence, health endpoints, and server
429/`Retry-After` checks do not apply.
