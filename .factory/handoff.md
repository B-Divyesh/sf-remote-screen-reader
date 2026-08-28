# Anywhere Reader verification handoff — FAIL

**Work order:** `remote-screen-reader-verify-2`

**Candidate:** `1d35d6134026b0738021d4f852eec77eb169426f`

**Live URL:** <https://remote-screen-reader.sociobot.in>
**Verified:** 2026-08-28 UTC

## Result

**FAIL — the free PWA reader and local Android debug build pass, but the
required deployed Android release is not complete.**

Full evidence and defect reproduction are in
[`.factory/verification-2.md`](verification-2.md).

Release blockers:

1. No release-signed APK is published or linked. The live URL is a PWA and the
   candidate only generates a local Android-debug-signed APK, leaving the
   actual Android camera, TalkBack, back gesture, and audible speech paths
   unverified.
2. The live `Buy Pro securely` endpoint returns HTTP 404.
3. A newly returned license can inherit a cached invalid verdict and remain
   locked without verification for up to 24 hours.
4. Several live navigation/legal links are below the required 44 × 44 px hit
   area.

## Passing evidence

- Clean `npm ci`: 0 vulnerabilities.
- `npm test`: release policy, 3/3 unit tests, and 10/10 desktop/mobile browser
  tests passed.
- `npm run build`: TypeScript, production web build, Capacitor sync, and the
  Android web-bundle verifier passed; `dist/` was produced.
- With JDK 21 and Android SDK 35 provisioned,
  `npm run android:debug` and `./gradlew testDebugUnitTest lintDebug` passed.
  The generated 18,738,716-byte debug APK SHA-256 was
  `a474c97736ed1b692e6f0c9085d56795a8a248b572b73de52586544bd24b7c39`.
  Android lint had 0 errors and 31 warnings.
- Independent live photo OCR, no-change reading, consent and invalid-input
  recovery, region keyboard control, range boundaries, five-row free history
  limit, persistence, export/import, and confirmed clear all worked.
- Offline shell reload and a fully offline OCR read after model preparation
  both passed. Runtime OCR traffic stayed same-origin; no analytics or cloud
  OCR requests occurred.
- Fresh axe scans found zero serious/critical findings on desktop, 390 px
  mobile, and the open mobile workspace. No console/page errors or horizontal
  overflow occurred. Reduced-motion behavior passed.
- Fresh mobile Lighthouse scored 100/100/100/100 with FCP 1.2 s, LCP 1.5 s,
  TBT 70 ms, and CLS 0. Initial JS/CSS/font/image budgets pass.
- The local and live `index.html` digest is
  `d5da62a48d53745bfcbb136270e0be7aa9f8d71118c70ab4e10c52ca9d7a5f31`;
  all public build resources matched. CSP, Permissions-Policy, manifest MIME,
  and immutable hashed-asset caching are live.

## Re-run

```sh
npm ci
npm test
npm run build
ANDROID_HOME=/path/to/android-sdk ANDROID_SDK_ROOT=/path/to/android-sdk npm run android:debug
cd android
ANDROID_HOME=/path/to/android-sdk ANDROID_SDK_ROOT=/path/to/android-sdk ./gradlew testDebugUnitTest lintDebug
```

Evidence artifacts are in `.factory/evidence-2/`. No product code was changed.
