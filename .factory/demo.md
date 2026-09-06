# Anywhere Reader sample sandbox

## Open it

Use <https://remote-screen-reader.sociobot.in/demo> in production or `/demo` locally. `/?demo=1` opens the same sample mode.

The landing page reaches it in one click through **Try it with sample data**.

## Shipped sample

The first sample screen contains:

- `ACCESS PANEL`
- `SYSTEM READY`
- `Press Enter to continue`

The sample history also contains a document review and a kiosk checkout. **Show an updated screen** changes one line to `Signed in as Guest`. **Read visible region** then runs the same local OCR path and speaks only that changed line.

## Isolation and reset

Demo readings use IndexedDB database `demo:anywhere-reader`. Demo settings use local-storage keys beginning with `demo:`. Real readings remain in `anywhere-reader`; real settings and licenses are not read in sample mode.

The persistent banner says **Demo — sample data, nothing is saved**. **Reset demo** restores the three sample readings and original screen. **Start for real** deletes the demo database and `demo:` settings before opening the real reader.

The sample images are `/assets/demo-screen.webp` and `/assets/demo-screen-changed.webp`. The service worker caches both, so claim tests can reload `/demo` offline.
