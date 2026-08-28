# Anywhere Reader independent verification handoff — PASS

**Work order:** `remote-screen-reader-verify-3`

**Tested candidate:** `a451b2fd55bde85eb2c29b57eb45220173f8a55c`

**Live URL:** <https://remote-screen-reader.sociobot.in>

**Result:** **PASS — accept this candidate.**

Fresh verification on 2026-08-28 confirms that the live PWA and public signed
Android 1.0.1 package match the candidate and satisfy the researched brief.
The earlier missing-deployment, checkout, license-cache, and target-size
failures are no longer present.

## Verified

- Clean `npm ci`: 163 packages installed, 0 vulnerabilities.
- `npm test`: 6/6 unit tests and 14/14 desktop/390 px Playwright tests passed.
- Exact `npm run build`: TypeScript, Vite, Capacitor sync, and Android bundle
  byte comparison passed; `dist/` was produced.
- `npm run android:debug` and `npm run android:check`: passed under JDK 21 / SDK
  35; Android lint has 0 errors and 28 warnings.
- All 24 public build files byte-match production. Live/local `index.html`
  SHA-256 is
  `1840e772b4cea1c29d9067d2b82e6957ee32be634f1b2546d17c3c1db5998bf4`.
- The public 16,754,600-byte Android 1.0.1 APK matches its published SHA-256
  `0a7c8313f60800e031d326ec4865d87691a4d268a6e5a19569f6c0ce696f1ce3`,
  has a non-debug Param Factory v2 release signature, and contains all 26
  candidate web assets byte-for-byte.
- Live photo OCR recognized the three representative lines; a repeated read
  announced no change. Consent, no-source, invalid-file, invalid-import,
  history cap/export/clear, framing keyboard controls, zoom/rate boundaries,
  invalid-license recovery, and checkout redirect all passed.
- Offline shell reload and fully offline OCR passed. A synthetic second worker
  version raised the update toast and replaced the old versioned cache.
- Desktop and 390 px mobile have no overflow or undersized targets. Keyboard
  focus is visible, reduced motion is honored, and axe reports zero
  serious/critical findings. Normal runs have zero console/page errors.
- Live policy headers, CORS, MIME types, cache policy, and privacy boundaries
  passed. Initial and OCR traffic stayed same-origin; only an explicit license
  restore contacted the documented Sociobot API.
- Fresh Lighthouse 13 mobile: performance 91 and 94, accessibility 100, best
  practices 100, SEO 100; LCP 1.55–1.70 s, CLS 0.00026, initial transfer
  84–85 KiB. Initial JS/CSS/fonts/mobile hero are 41,361/21,841/37,988/19,186
  bytes, all within budget.

The complete evidence and command-level detail are in
[`.factory/verification-3.md`](verification-3.md).

## Defects

- **Critical/high/medium:** none.
- **Low:** Android lint retains 28 non-blocking generated/resource hygiene
  warnings (launcher shape, older-API/deprecated metadata, unused resources,
  and splash density placement). Lint has zero errors.

## Known verification limits / next steps

- Use a physical Android device to recheck rear-camera optics, audible TTS,
  TalkBack announcements, OS permission recovery, and the physical back
  gesture. These could not be represented by headless Chromium/package
  inspection.
- Exercise one real purchase/refund cycle when an authorized payment test is
  scheduled; production catalog, hosted-checkout redirect, token behavior,
  invalid locking, and CORS already pass without charging a card.
- Run the researched 10-person completion pilot after release; it is an outcome
  study, not a claim made by this verification.

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
