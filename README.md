# Anywhere Reader

Anywhere Reader reads a permitted visible computer screen with a phone. It is for blind and low-vision people who cannot install screen-reader software on the computer.

Live product: <https://remote-screen-reader.sociobot.in>

Sample reader: <https://remote-screen-reader.sociobot.in/demo>

Android 1.0.1: [download the APK](https://github.com/B-Divyesh/sf-remote-screen-reader/releases/download/v1.0.1/anywhere-reader-1.0.1.apk) · [check its SHA-256](release/anywhere-reader-1.0.1.apk.sha256)

## What it does

- Reads English text from a live rear camera or a chosen screen photo.
- Requests live camera access only after the user gives consent.
- Runs OCR in the app and sends no screen image to cloud OCR.
- Speaks only lines that changed after the first reading.
- Enlarges recognized text from 24 to 52 pixels.
- Moves the selected region with touch, a pointer, or arrow keys.
- Keeps five local readings in the free reader.
- Exports, imports, copies, and clears local reading data.
- Opens the sample and reads its prepared OCR assets offline after setup.

The app reads visible pixels only. It does not control the target computer or reveal hidden or DRM-protected content. OCR can be wrong, so users should verify critical text.

## Try the isolated sample

Open `/demo` or choose **Try it with sample data** on the first screen. The demo loads a prepared access panel, three realistic readings, and an updated screen to read.

Demo readings use the IndexedDB database `demo:anywhere-reader`. Demo settings use `demo:` local-storage keys. Reset and Start for real clear only that sample namespace. Details are in [`.factory/demo.md`](.factory/demo.md).

## Pro purchase

The free reader includes camera reading, changed-line speech, zoom, JSON export, and five local readings. Anywhere Reader Pro costs ₹499 once. A verified license keeps up to 50 local readings and saves up to 10 named regions.

Checkout and license checks use the Sociobot billing API. A returned license is stored under `sb_license:remote-screen-reader` and checked at most once per day. Payment details do not enter this app. Privacy and terms are served at `/privacy` and `/terms`.

## Develop

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

The OCR worker, English model, fonts, images, and icons are self-hosted. The product has no analytics or third-party runtime scripts.

## Test every public claim

```sh
npm run verify:claims
npm run test:claims
npm test
npm run build
```

The public claim registry is [`.factory/claims.json`](.factory/claims.json). Each entry selects one tagged browser outcome test. The suite uses `/demo` and shipped sample data from a clean browser state.

`npm test` also runs unit tests and desktop/mobile browser checks. These cover invalid input, recovery, keyboard controls, accessibility, reduced motion, privacy requests, legal pages, route metadata, the 404 response, and offline reload.

## Build Android

Android packaging needs JDK 21 and Android SDK platform and build-tools 35. Set `ANDROID_HOME` or `ANDROID_SDK_ROOT` to that SDK.

```sh
npm run android:debug
npm run android:check
```

`npm run build` produces `dist/`, synchronizes the same web bundle into Capacitor, and compares the bundled files. The Android application ID is `in.sociobot.remotescreenreader`.

Signed release builds also require the four factory signing environment variables documented by `npm run android:release`. Signing material is never stored in this repository.

## Deploy

Build the static artifact, then deploy only `dist/` with the factory static deployment wrapper. The repository does not manage DNS, billing registration, or shared infrastructure.

The visual system and asset provenance are in [`.factory/design.md`](.factory/design.md). Verification results and remaining limits are in [`.factory/handoff.md`](.factory/handoff.md). The source and original product assets use the MIT license.
