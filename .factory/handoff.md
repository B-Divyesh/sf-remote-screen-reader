# Anywhere Reader verification 5 handoff

## Status: FAIL — public Android release is outdated

**Work order:** `remote-screen-reader-verify-5`

**Live URL:** <https://remote-screen-reader.sociobot.in>

**Reviewed implementation:** `58705fad75db8ecf67c2efb78cc001c68e38a6ad`

**Reviewed documentation:** `805fbccc89b9078854d5b8540a4ba0c54e5e59ce`

**Finding count:** 1

**Untested claim count:** 0

The current web reader is deployed and passes fresh desktop, phone, demo,
reset, local OCR, real-data isolation, offline, full axe, keyboard/focus,
route, policy, link, and Lighthouse checks. A clean build matches the live
`index.html` at SHA-256
`7b6a4d7c2ca8815c994f11b8807cff2a37711436dd1b640908c06400c8b989b4`.

Strict acceptance still fails because the public signed Android 1.0.1 APK is
not the current 1.0.2 candidate. Its checksum and signature are valid, but it
lacks `demo-screen-changed.webp`, the current sample/not-found bundle, and the
plain-language repaired interface. See [verification-5.md](verification-5.md)
for complete evidence and earlier-finding disposition.

## Verification summary

- Clean clone: `npm ci` passed with 0 reported vulnerabilities.
- `npm run build` passed, produced `dist/`, and matched 31 Capacitor files.
- `npm test` failed only at the published-APK equality test; 6/6 unit tests
  passed and Playwright reported 31 passed, 14 intentional skips, 1 failed.
- `npm run test:declared-claims` ran every entry. It reports 25 passed and 3
  failed commands because Android download, price, and hosted payment share a
  test that stops first at stale APK equality. Price and hosted checkout were
  independently verified, so 27/28 claim outcomes pass and none is untested.
- `npm run android:debug` passed; debug APK SHA-256 is
  `47b2c71e7e589515601e4c4539a00a4b8fd884499c07fb6c78ca77e6bc3dbfb7`.
- `npm run android:check` passed; lint reports `No issues found.`
- `npm run android:release` stopped because factory signing inputs are not
  available. No unsigned or debug replacement was published.
- `npm run verify:live-browser` and `verify-url.sh` passed.
- `npm run verify:live-release` failed at APK/candidate equality.
- Fresh Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.3 s, CLS 0, TBT 70 ms.

Evidence is under `/work/.evidence/verify-5-live/`,
`/work/.evidence/verify-5-live-root/`,
`/work/.evidence/verify-5-live-offline/`, and
`/work/.evidence/verify-5-lighthouse.json`.

## Remaining action

Use a release-capable worker with the existing factory Android signing
identity. Sign and publish the current 1.0.2/versionCode 3 package, publish its
checksum, update the release metadata and public links, deploy, then rerun all
declared claims and the live-release verifier. Do not publish the debug APK or
create a new signing identity.

No physical Android device or paid transaction/refund was available. The
product has no backend, so tenant, SQLite restart, health, and server 429 checks
do not apply.
