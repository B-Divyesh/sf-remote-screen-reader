# Anywhere Reader visual system

## Thesis: pocket phosphor

Anywhere Reader is a bridge between a distant grid of silent pixels and a human voice. Its interface borrows the purposeful language of demoscene trackers, CRT phosphor, and camera focus marks: hard square corners, stepped shadows, visible coordinates, scan rows, and a bright cursor-yellow capture target. It should feel like a dedicated optical instrument, not an AI chatbot or a generic settings dashboard.

The pixel language is explanatory. The four-corner reticle means “this rectangle is read”; the marching sample cells mean “pixels become text”; the audio bars mean “text becomes speech.” Decoration recedes when capture starts so the camera and recognized words have priority.

## Palette

This is an explicitly single-mode dark instrument. A second light theme would increase screen glare while aiming a phone at a monitor and dilute the phosphor metaphor. Every page paints its background.

| Token | Value | Use |
| --- | --- | --- |
| `--void` | `#090c0b` | page and camera surround |
| `--panel` | `#111714` | raised working surfaces |
| `--panel-high` | `#18211c` | active controls and text wells |
| `--ink` | `#f5f7dc` | primary copy (18.1:1 on void) |
| `--muted` | `#b7c5b7` | secondary copy (10.3:1 on void) |
| `--signal` | `#d8ff3e` | capture/focus/action signal |
| `--signal-ink` | `#111500` | text on signal |
| `--cyan` | `#55e6d2` | speech/output state |
| `--success` | `#75ed8d` | ready/complete |
| `--warning` | `#ffd166` | recoverable attention |
| `--danger` | `#ff7b72` | permission and capture errors |
| `--grid` | `#2b3b32` | rules, grid, inactive boundaries |

Status is always paired with a word or icon, never conveyed by color alone. Focus uses a 3px signal outline plus a dark offset, exceeding 3:1 against every surface.

## Type

- Display and labels: `"Courier Prime"`, a self-hosted OFL monospace, bold where needed. Its squared rhythm carries the instrument voice and keeps changing OCR counts stable.
- Reading and controls: system UI (`system-ui`, Roboto, sans-serif), chosen for immediate Android legibility and zero font latency.
- Scale: 13px metadata, 16px labels, 18px body, 24px section title, clamp(36px–64px) hero. OCR output begins at 26px and can be enlarged to 48px. Long copy is limited to 68 characters with 1.55 leading.

## Spacing and form

The base unit is 4px, with an 8px working rhythm. Main gaps are 16/24/32/48px. Touch targets are at least 48px. Corners are 0–4px; panels use a one-pixel grid border and a 4px stepped shadow instead of soft elevation. Desktop uses a 12-column field; capture and transcript become two unequal columns. At 390px they stack and nonessential coordinate labels disappear.

## Interaction grammar

- The primary capture control is an unmistakable signal-yellow hold button. Pointer users may hold; keyboard and switch users press once to capture. A dedicated “Read screen” button always remains available.
- Consent appears in context before the browser permission prompt. Camera state has visible Ready, Reading, Paused, and Error labels announced through a polite live region.
- The region selector is a real four-handle rectangle over the preview. Handles are keyboard operable with arrow keys (Shift for larger steps). “Whole screen” resets it.
- The transcript emphasizes only changed lines, with previous results retained locally in a short, user-clearable history. Zoom changes only output scale, not app chrome.
- Paid Pro adds convenience only: longer local history and JSON export/import. Camera, OCR, speech, zoom, changed-line reading, and safety remain free.

## Motion

Transitions run 160–240ms and only animate opacity or transform. The capture reticle closes inward once when a reading begins; newly changed lines step in from four pixels below. There is no looping scan animation. With `prefers-reduced-motion: reduce`, transitions and smooth scrolling become instant and capture feedback is a static border/state label.

## Asset plan and provenance

- Hero illustration: an original generated pixel-art scene of a phone framing a computer screen, with abstract text blocks turning into an audio waveform. It explains the remote optical workflow; no people, brands, readable text, cloud symbols, or implication of controlling the target. Source and prompt sidecar live in `public/assets/src/`; optimized WebP is shipped.
- Icons, reticles, checker textures, waveform, and app mark are hand-authored SVG/CSS under this project and are original under the repository MIT license.
- Image prompt sheet: “Editorial demoscene pixel art, close-up oblique view of a small dark smartphone held in front of an anonymous desktop monitor, the phone camera frame selects several luminous abstract pixel rows and those rows transform into a compact audio waveform, black-green CRT world, phosphor lime and cool cyan with small warm amber accents, hard 1-bit dither shadows, crisp block pixels, purposeful accessibility instrument, dramatic screen glow, no person, no hands, no readable text, no letters, no logos, no brands, no cloud, no robots, no watermark, no gradients, no photorealism.”
- Generation: Azure OpenAI image generation through the factory `gen-image.sh`, 2026-08-28. Generated assets are original to Anywhere Reader; the footer discloses AI-assisted illustration.

