# Anywhere Reader

Anywhere Reader is a private phone-hosted fallback reader for blind and low-vision people who must use a computer where they cannot install a screen reader. Point the phone at a permitted visible interface, frame the relevant region, and hear only the lines that changed.

Live product: <https://remote-screen-reader.sociobot.in>

Android release: [Anywhere Reader 1.0.1 APK](https://github.com/B-Divyesh/sf-remote-screen-reader/releases/download/v1.0.1/anywhere-reader-1.0.1.apk) · [SHA-256](release/anywhere-reader-1.0.1.apk.sha256)

## What v1 does

- Uses a live rear camera or a chosen photo; permission is requested only after explicit consent.
- Runs English OCR in a local Tesseract worker. Camera frames and recognized text are never sent to a server.
- Speaks changed lines with the device's built-in speech synthesizer and provides 24–52 px high-contrast text.
- Offers pointer, touch, and keyboard-operable region controls plus useful focus/top/bottom/full-screen presets.
- Saves a short reading history in IndexedDB, with clear and JSON export controls.
- Installs as an offline PWA. The user can explicitly cache the 10.4 MB English OCR model.
- Includes a versioned Capacitor Android web bundle under `android/` so a checkout packages the same reader that is deployed on the web.
- Supports an optional one-time Pro license through the Sociobot billing API. Core reading, speech, zoom, and export are not paywalled.

It does not control the target computer, reveal hidden or DRM-protected content, or replace a full accessibility-tree screen reader. OCR can be wrong; critical text should be verified.

## Develop

Requires Node.js 20 or newer. Android packaging additionally requires JDK 21
and Android SDK platform/build-tools 35 (`ANDROID_HOME` or `ANDROID_SDK_ROOT`
must point to that SDK).

```sh
npm install
npm run dev
```

The OCR runtime and English model are self-hosted in `public/ocr/`; there are no runtime CDNs, analytics, or third-party scripts.

## Test and build

```sh
npm test
npm run build
npm run android:debug
npm run android:check
```

`npm test` runs unit coverage for OCR line comparison and Playwright flows on desktop Chromium and a 390 px mobile profile. The browser suite checks the real photo → local OCR → transcript path, consent behavior, legal pages, axe accessibility, console cleanliness, and an explicitly offline reload.

The exact static deployment command is `npm run build`. It type-checks and
builds the web app, synchronizes it into Capacitor, and byte-compares every
bundled file against `dist/`. Static output lands in `dist/` with
`dist/index.html` at its root. `staticwebapp.config.json` is emitted with a
same-origin CSP, camera-only Permissions-Policy, standard web-manifest MIME
type, and immutable caching for fingerprinted Vite assets.

`npm run android:debug` performs that production build, creates
`android/app/build/outputs/apk/debug/app-debug.apk`, and verifies that the APK
contains the app shell, OCR worker, and offline English model. The debug APK is
a QA artifact. `npm run android:check` also runs Android unit tests and lint.

`npm run android:release` requires `ANDROID_KEYSTORE_PATH`,
`ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`.
It refuses an unsigned release, verifies APK Signature Scheme v2, rejects the
standard Android debug certificate, and prints the package SHA-256. Signing
material is never stored in this repository. Release APKs and signing recovery
material are kept in the factory's private artifact channel; public APKs and
checksums are attached to the matching GitHub release.

To resynchronize without assembling an APK:

```sh
npm run sync:android
```

The normalized Android application ID is `in.sociobot.remotescreenreader`
because Android package names cannot contain the slug's hyphens.

## Product and privacy notes

The researched product brief is in [`.factory/brief.json`](.factory/brief.json), the product-specific pixel/demoscene design system and asset provenance are in [`.factory/design.md`](.factory/design.md), and verification details are in [`.factory/handoff.md`](.factory/handoff.md).

Privacy and terms are served at `/privacy` and `/terms`. Source code is MIT licensed; generated and hand-authored product assets are released with the project under the same license.
