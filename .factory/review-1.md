# Read a visible screen with a phone — review 1

**Work order:** `remote-screen-reader-review-1`
**Reviewed implementation:** `6a777d3a508251d14a2ef3c28ab840c8f5eeb986`
**Documentation HEAD:** `cbc57a9716432d8c805bd756da0cedc2c2009d39`
**Live URL:** <https://remote-screen-reader.sociobot.in>
**Reviewed:** 2026-09-06 UTC

## Verdict

**FAIL — do not accept this review.**

There are **6 findings** and **27 untested public claims**. A PASS requires
zero findings at every severity and zero untested claims.

## Job, audience, and first action

Before scrolling, fresh desktop and 390 px phone sessions said the job is to
hear a selected visible computer screen through a phone. The audience is a
person using a locked-down computer where installing a screen reader is not
possible. The first prominent action is **Download Android APK**; the
secondary action is **Try the web reader**.

The live first screen has one `h1`, one `main`, `lang="en"`, and the title
`Anywhere Reader — hear any visible screen`. It does not offer the required
one-click sample action.

## Findings

### High

1. **There is no one-click demo sandbox.**
   The landing page has no `Try it with sample data` action. Fresh desktop and
   phone runs found no demo label, sample output, `Reset demo`, or `Start for
   real` control. `/demo` returns the ordinary landing/real reader, not an
   isolated sample. The ordinary reader needs a visitor's photo or camera, and
   its source uses the real IndexedDB database name `anywhere-reader`, with no
   demo namespace. As a result, the required realistic populated sample,
   persistent sample label, reset path, and proof that sample activity cannot
   change real data do not exist. `.factory/demo.md` is also missing.

2. **The claims contract is absent: 27 public claims are untested.**
   `.factory/claims.json` does not exist, so there are no declared
   `@claim:<id>` commands to run from a clean demo state. Existing untagged
   unit/Playwright tests do not make a public claim independently testable.
   The landing page and README make relied-on claims about local OCR, camera
   consent, no cloud transfer, no account, changed-line speech, offline OCR,
   export, free features, signed Android release, price, history limits, and
   saved regions. Counting duplicate wording once gives 27 distinct public
   claims. They must be either registered with an observable demo test or
   removed. This is an untested-claim failure, even though several underlying
   functions work.

### Medium

3. **Unknown routes do not have the required designed 404 page.**
   Fresh requests to `/404` and `/not-a-real-page` both returned HTTP 200 and
   rendered the landing page with its landing title and heading. The required
   real 404 route, distinct title, styled recovery path, and HTTP 404 response
   are absent. A deliberate HTTP 404 would be acceptable; this is a missing
   required route structure.

4. **Required route metadata is incomplete.**
   The live document has a title, description, theme color, manifest, and SVG
   favicon, but no canonical link, Open Graph tags, Twitter card tags, or
   180 px Apple touch icon. This fails the site-structure metadata contract.

### Low

5. **The required plain-words copy audit is missing, and several headings use
   mood/metaphor copy.**
   `.factory/copy-audit.md` is absent. The shipped headings include `Aim.
   Frame. Read.`, `From silent pixels to speech.`, and the label `SIGNAL PATH
   // 3 STEPS`; they do not name their sections in plain words as required.
   Replace them with task headings such as `Read a screen`, `How reading
   works`, and `Three steps`, then add the required sentence/terminology audit.

6. **Android lint warnings remain.**
   After the documented JDK 21 and Android SDK 35 were installed, `npm run
   android:check` passed with `0 errors, 28 warnings`. This is the earlier
   minor platform/resource hygiene issue, reduced from the 31 warnings in
   verification 2 but not resolved. It does not block the tested reader flow.

## What passed

- Fresh `npm ci` completed with 0 vulnerabilities.
- `npm test` passed: release configuration, 6 Vitest tests, and 14 Playwright
  tests on desktop and mobile.
- `npm run build` passed and generated `dist/`; Android bundle comparison
  passed.
- With JDK 21 and Android SDK 35 installed, `npm run android:debug` and
  `npm run android:check` passed. The debug APK was produced; lint has the 28
  warnings noted above.
- `npm run verify:live-browser` passed on fresh desktop and phone contexts:
  no console/page errors, no horizontal overflow, visible skip-link focus,
  reduced-motion behavior, same-origin initial requests, and zero serious or
  critical axe violations. Its mobile offline reload showed `Offline mode.`
- `npm run verify:live-release` passed: catalog price, hosted checkout
  redirect, Android release metadata, APK, and checksum were reachable.
- A fresh live photo-to-OCR run using `tests/fixtures/screen.png` produced
  `ACCESS PANEL`, `SYSTEM READY`, and `Press Enter to continue`; it reported
  `3 changed lines` and produced no console errors. This confirms the ordinary
  (not demo) reader path.
- The local and live `index.html` SHA-256 both equal
  `1840e772b4cea1c29d9067d2b82e6957ee32be634f1b2546d17c3c1db5998bf4`.
  The live image therefore matches the reviewed implementation; commits after
  `6a777d3` are report/verification documentation for runtime purposes.
- Live root headers include CSP, camera-only Permissions-Policy, referrer
  policy, `nosniff`, and HSTS. The manifest has the expected manifest MIME
  type. `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` load.

## Earlier findings and their current disposition

| Earlier item | Current disposition | Evidence |
| --- | --- | --- |
| No Android artifact/release (verification 1 and 2) | Resolved | Release check passes; current debug assembly and packaged-bundle check pass. |
| CSP, Permissions-Policy, manifest MIME type, immutable assets (verification 1) | Resolved | Live headers/configuration and manifest response checked. |
| Broken checkout and stale returned-license verdict (verification 2) | Resolved | `verify:live-release` passes; the token-cache regression is in the passing test suite. |
| Targets below 44 px (verification 2) | Resolved | Passing target-size Playwright test and live browser check on desktop/390 px. |
| Android lint warnings (verification 2/3) | Still open, low | Current Android check: 0 errors, 28 warnings. |
| Physical Android/TalkBack/audible TTS/purchase/refund limitations (verification 3) | Still limitations, not counted as defects | No device or authorized paid transaction was available; browser and package checks were repeated. |

## Scope notes

This is a static PWA/Android package, not a product backend. Tenant isolation,
restart persistence, health endpoints, and live request rate-limit responses
do not apply. No real purchase was made. The Android APK was built and checked
but not installed on a physical device. Offline reload was verified; the
earlier synthetic service-worker update result remains applicable because the
reviewed runtime implementation has not changed.

## Evidence

Fresh live screenshots and browser observations are in
`/work/.evidence/review-1/`. Command output was collected from the clean
repository after `npm ci`. The final required evidence copy is
`/work/.evidence/qa-report.md`.

## Required repair

1. Add `/demo` (or `?demo=1`) with a shipped realistic screen image, immediate
   populated OCR result, separate `demo:` storage, persistent sample banner,
   reset and start-real controls, `.factory/demo.md`, and a first-screen
   `Try it with sample data` action.
2. Add `.factory/claims.json` and one clean demo test for every public claim;
   remove claims that cannot be demonstrated.
3. Add a real designed 404 with an HTTP 404 response, complete required route
   metadata, plain section headings/copy audit, and resolve or explicitly
   maintain the remaining Android lint warnings.
