# Anywhere Reader repair handoff — release 1.0.1

**Work order:** `remote-screen-reader-repair-2`

**Verifier report repaired:** commit `6c43d73066a207864bca2b4826ded57b9c6b1b51`, candidate `1d35d6134026b0738021d4f852eec77eb169426f`

**Product commit / Android tag:** `6a777d3a508251d14a2ef3c28ab840c8f5eeb986` / `v1.0.1`

**Live URL:** <https://remote-screen-reader.sociobot.in>

**Release:** <https://github.com/B-Divyesh/sf-remote-screen-reader/releases/tag/v1.0.1>

**Completed:** 2026-08-28 UTC

## Result

The four release blockers in `.factory/verification-2.md` are repaired:

1. A release-signed Android 1.0.1 APK is published from the site and GitHub Release, mirrored under `factory-artifacts/remote-screen-reader/1.0.1/`, and accompanied by a visible SHA-256. The web page now leads with the Android artifact and removes that redundant action inside the native shell.
2. Anywhere Reader Pro was registered in the production Sociobot/Dodo factory catalog at the advertised one-time INR 499 price. The public checkout now returns HTTP 303 to `https://checkout.dodopayments.com/session/...`, rather than 404.
3. License verdicts are now bound to the exact token. Capturing a different return token clears the prior verdict before background verification, so a new purchase cannot inherit a cached invalid result.
4. Header, hero, legal, and footer links now have at least 44×44 CSS-pixel hit areas. A browser regression checks every visible interactive target on `/`, `/privacy`, and `/terms` in desktop and 390 px projects.

The Android launcher foreground is now the product's original `A>` phosphor mark, Android 13 monochrome resources were added, manifest ordering was corrected, and predictive-back handling was declared. Android lint warnings fell from 31 to 28; all remaining findings are non-blocking generated/resource hygiene warnings.

## Android release evidence

- Artifact: `anywhere-reader-1.0.1.apk`
- Size: 16,754,600 bytes
- SHA-256: `0a7c8313f60800e031d326ec4865d87691a4d268a6e5a19569f6c0ce696f1ce3`
- Package: `in.sociobot.remotescreenreader`
- Version: code 2 / name 1.0.1
- SDK: min 23 (Android 6), target 35
- Permissions: camera and Internet; camera hardware remains optional for photo fallback
- Signature: APK Signature Scheme v1 and v2 both verified; certificate subject `CN=Param Factory Android Release, OU=Android Release, O=Sociobot, C=IN`; certificate SHA-256 `d69ca1988c104eee7abbc21fdba95d176b81f6fb73693204ef57a467c5158071`; explicitly rejected by the verifier if `CN=Android Debug`
- Package-content verification: app shell, OCR worker, and uncompressed offline English model present
- Public APK and checksum returned HTTP 200 and the downloaded checksum matched the local package
- Private artifact mirror contains the same APK/checksum under `factory-artifacts/remote-screen-reader/1.0.1/`

The worker identity could read but not create Key Vault secrets (`ForbiddenByRbac`). A dedicated release identity was therefore created for this product and its recovery bundle stored only in the private factory artifact channel under `factory-artifacts/remote-screen-reader/signing/`; no signing material is in git or the public release. Temporary local signing files were securely removed. Factory operations should migrate that recovery bundle into Key Vault before the next Android version.

## Verification evidence

Run from a clean `npm ci` (163 packages installed, 164 audited, 0 vulnerabilities):

| Gate | Result |
| --- | --- |
| `npm test` | PASS — release configuration, 6/6 Vitest tests, 14/14 Playwright tests across desktop Chromium and 390 px mobile |
| `npm run build` | PASS — OCR preparation, `tsc --noEmit`, Vite production build, Capacitor sync, and byte comparison of 22 Android bundle files; `dist/` produced |
| `npm run android:release` | PASS — signed APK assembled and package/signature/content verification passed |
| `npm run android:check` | PASS — Android unit tasks and `lintDebug`; 0 errors, 28 warnings |
| `npm run verify:live-release` | PASS — production catalog price, hosted-checkout redirect, live APK, and checksum |
| `npm run verify:live-browser` | PASS — desktop and 390 px mobile semantics, overflow, hit areas, keyboard focus, axe, reduced motion, same-origin initial traffic, and offline mobile reload |

Functional browser regressions include the real local photo-to-Tesseract OCR flow, explicit camera consent, camera/photo recovery, legal pages, IndexedDB behavior retained from the accepted candidate, offline shell reload, and the exact returned-license stale-verdict case. The stale-token regression runs at both viewport sizes and asserts one fresh verification request, URL token removal, token-bound cached result, and immediate Pro unlock.

Fresh local Lighthouse mobile results:

- Performance 99
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 1.2 s, LCP 1.7 s, TBT 120 ms, CLS 0
- Initial transfer 85 KiB
- Initial JS 41,361 bytes, CSS 21,841 bytes, WOFF2 fonts 37,988 bytes, mobile hero 19,186 bytes

Factory smoke tests on local and live builds found one `h1`, one `main`, `lang="en"`, correct title, no missing image alts, no unlabeled buttons, and no console/page errors. Fresh desktop/mobile axe scans found zero serious or critical violations. The first Tab focuses `Skip to main content` with a 3 px outline. Reduced-motion mode leaves zero elements over 0.01 ms. Mobile offline reload remains controlled by the service worker and shows `Offline mode.`

The deployed host byte-matched all 24 public `dist` files. Root responses have the same-origin CSP plus only the Sociobot verification API, camera-only Permissions-Policy, HSTS, `nosniff`, and strict-origin referrer policy. The manifest has `application/manifest+json`; Android release metadata has `Cache-Control: no-store`; hashed assets retain immutable caching. Initial desktop/mobile network traffic remained same-origin only. Invalid-license verification returned `{ "valid": false, "reason": "invalid" }`, and CORS allowed the production product origin.

Screenshots, URL report, and Lighthouse JSON are in `.factory/evidence-repair-2/`.

## Re-run

```sh
npm ci
npm test
npm run build
ANDROID_HOME=/path/to/android-sdk ANDROID_SDK_ROOT=/path/to/android-sdk npm run android:check

# With the four documented signing environment variables:
ANDROID_HOME=/path/to/android-sdk ANDROID_SDK_ROOT=/path/to/android-sdk npm run android:release

npm run verify:live-release
npm run verify:live-browser
```

## Known verification limits

- No physical Android device was attached, so rear-camera optics, audible device TTS, TalkBack announcements, OS permission recovery, and the physical back gesture could not be re-exercised. Browser camera denial/recovery, speech fallback, keyboard/screen-reader semantics, offline OCR, package contents, and predictive-back configuration were verified.
- A real paid card transaction/refund was not performed. Production product discovery, checkout-session creation, return-token activation, restore, invalid/revoked locking behavior, and production CORS were exercised without charging a card.
- Offline installation/reload passed. The waiting-worker update toast and `skipWaiting`/`clients.claim` path are retained and code-inspected, but a second production worker version was not deployed solely to induce the update toast.
