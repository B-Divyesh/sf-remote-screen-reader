# Anywhere Reader

Anywhere Reader is a private phone-hosted fallback reader for blind and low-vision people who must use a computer where they cannot install a screen reader. Point the phone at a permitted visible interface, frame the relevant region, and hear only the lines that changed.

Live product: <https://remote-screen-reader.sociobot.in>

## What v1 does

- Uses a live rear camera or a chosen photo; permission is requested only after explicit consent.
- Runs English OCR in a local Tesseract worker. Camera frames and recognized text are never sent to a server.
- Speaks changed lines with the device's built-in speech synthesizer and provides 24–52 px high-contrast text.
- Offers pointer, touch, and keyboard-operable region controls plus useful focus/top/bottom/full-screen presets.
- Saves a short reading history in IndexedDB, with clear and JSON export controls.
- Installs as an offline PWA. The user can explicitly cache the 10.4 MB English OCR model.
- Includes a Capacitor Android project skeleton under `android/`; a later factory work order builds and signs the APK.
- Supports an optional one-time Pro license through the Sociobot billing API. Core reading, speech, zoom, and export are not paywalled.

It does not control the target computer, reveal hidden or DRM-protected content, or replace a full accessibility-tree screen reader. OCR can be wrong; critical text should be verified.

## Develop

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

The OCR runtime and English model are self-hosted in `public/ocr/`; there are no runtime CDNs, analytics, or third-party scripts.

## Test and build

```sh
npm test
npm run build
```

`npm test` runs unit coverage for OCR line comparison and Playwright flows on desktop Chromium and a 390 px mobile profile. The browser suite checks the real photo → local OCR → transcript path, consent behavior, legal pages, axe accessibility, console cleanliness, and an explicitly offline reload.

The exact deployment command is `npm run build`. Static output lands in `dist/` with `dist/index.html` at its root.

To sync a fresh production build into the Android wrapper:

```sh
npm run build
npx cap sync android
```

The normalized Android application ID is `in.sociobot.remotescreenreader` because Android package names cannot contain the slug's hyphens. APK signing and distribution are intentionally out of scope for this static-deploy work order.

## Product and privacy notes

The researched product brief is in [`.factory/brief.json`](.factory/brief.json), the product-specific pixel/demoscene design system and asset provenance are in [`.factory/design.md`](.factory/design.md), and verification details are in [`.factory/handoff.md`](.factory/handoff.md).

Privacy and terms are served at `/privacy` and `/terms`. Source code is MIT licensed; generated and hand-authored product assets are released with the project under the same license.
