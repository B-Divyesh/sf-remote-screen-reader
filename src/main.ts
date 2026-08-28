import './style.css';
import { Capacitor } from '@capacitor/core';
import { CHECKOUT_URL, captureReturnedLicense, hasOptimisticUnlock, saveLicense, verifyLicense } from './license';
import { DEFAULT_REGION, changedLines, clampRegion, clearReadings, getReadings, saveReading, type Reading, type Region } from './reader';

const app = document.querySelector<HTMLDivElement>('#app')!;
const APK_DOWNLOAD_URL = 'https://github.com/B-Divyesh/sf-remote-screen-reader/releases/download/v1.0.1/anywhere-reader-1.0.1.apk';
const APK_CHECKSUM_URL = `${APK_DOWNLOAD_URL}.sha256`;

function icon(name: 'eye' | 'sound' | 'lock' | 'camera'): string {
  const paths = {
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    sound: '<path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9c1.5 1.6 1.5 4.4 0 6m3-9c3 3.2 3 8.8 0 12"/>',
    lock: '<rect x="5" y="10" width="14" height="11"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    camera: '<path d="M3 7h4l2-3h6l2 3h4v13H3Z"/><circle cx="12" cy="13" r="4"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}

function header(): string {
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="Anywhere Reader home"><span class="brand-mark" aria-hidden="true">A&gt;</span><span>Anywhere Reader</span></a>
    <nav aria-label="Main navigation">
      <a href="/#reader">Reader</a><a href="/#how">How it works</a><a href="/#pro">Pro</a>
    </nav>
    <button class="install-button secondary compact" id="installApp" hidden>Install app</button>
  </header>`;
}

function footer(): string {
  return `<footer><div><span class="brand-mark" aria-hidden="true">A&gt;</span><p>Built as a private optical fallback—not a replacement for a full screen reader.</p></div>
    <nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://github.com/B-Divyesh/sf-remote-screen-reader">Source</a></nav>
    <p class="fineprint">Original AI-assisted illustration. No analytics. No cloud OCR.</p></footer>`;
}

function renderLegal(kind: 'privacy' | 'terms'): void {
  const privacy = kind === 'privacy';
  document.title = `${privacy ? 'Privacy' : 'Terms'} — Anywhere Reader`;
  app.innerHTML = `${header()}<main id="main" class="legal"><p class="eyebrow">LEGAL // 2026-08-28</p><h1>${privacy ? 'Privacy, in plain language.' : 'Terms of use.'}</h1>
  ${privacy ? `<p class="lede">Your camera, recognized text, and spoken output stay on your device. Anywhere Reader has no account and no analytics.</p>
    <h2>What the app accesses</h2><p>Camera access starts only after you check the consent box and choose “Allow camera.” Frames are processed in your browser by a local OCR engine. They are not uploaded to us or any third party.</p>
    <h2>What is stored</h2><p>Recent recognized text, settings, and an optional license token are stored locally in your browser. The OCR language model is cached for offline use. You can clear reading history inside the app or clear the site’s storage in browser settings.</p>
    <h2>Purchase verification</h2><p>If you buy or restore Pro, your license token is sent to the Sociobot billing API solely to verify the purchase. Sociobot/Dodo is the merchant of record and handles checkout details; payment card data never reaches this app.</p>
    <h2>Your choices</h2><p>You can use photo upload instead of live camera, stop the camera at any time, use the free reader without a license, and export or delete your local reading history.</p>`
    : `<p class="lede">Anywhere Reader is an assistive fallback for reading visible interfaces. Use it only where camera capture is allowed.</p>
    <h2>Safe and permitted use</h2><p>Do not use Anywhere Reader to bypass protected content, authentication, DRM, workplace policy, monitoring controls, or another person’s privacy. The app does not click or control the target computer.</p>
    <h2>Accuracy and safety</h2><p>OCR and speech can make mistakes. Verify critical instructions, medical information, financial details, and destructive actions on the original screen or with a trusted person. The software is provided “as is” under the MIT License.</p>
    <h2>One-time Pro purchase</h2><p>Pro is a one-time ₹499 purchase for convenience features listed at checkout. Core reading, speech, zoom, and data export remain free. Sociobot/Dodo is the merchant of record. Refunds are handled by the merchant; a refund revokes its license.</p>
    <h2>Changes</h2><p>We may update these terms when the product changes. The date at the top identifies the current version.</p>`}
    <p><a class="text-link" href="/">← Return to the reader</a></p></main>${footer()}`;
}

function renderHome(): void {
  captureReturnedLicense();
  app.innerHTML = `${header()}
  <div class="network-banner" id="networkBanner" role="status" hidden><strong>Offline mode.</strong> Camera, saved OCR, and speech still work. Purchase verification will resume later.</div>
  <main id="main">
    <section class="hero" aria-labelledby="heroTitle">
      <div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span> PRIVATE OPTICAL READER // ANDROID PWA</p>
        <h1 id="heroTitle">Hear the screen.<br><span>Touch nothing on it.</span></h1>
        <p class="lede">Point your phone at a locked-down computer, select the part that changed, and hear it aloud. No install on the target. No cloud. No account.</p>
        <div class="hero-actions"><a class="primary" id="downloadAndroid" href="${APK_DOWNLOAD_URL}" aria-describedby="androidReleaseMeta">Download Android APK</a><a class="secondary" href="#reader">Try the web reader <span aria-hidden="true">↓</span></a><a class="text-link" href="#how">How it works</a></div>
        <p class="android-release-meta" id="androidReleaseMeta"><span>Android 6+</span><span>Release signed</span><a class="checksum-link" id="apkChecksum" href="${APK_CHECKSUM_URL}">SHA-256 checksum</a><code id="apkDigest">Checking release…</code></p>
        <ul class="proof-list" aria-label="Product guarantees"><li>${icon('lock')} On-device OCR</li><li>${icon('sound')} Changed lines only</li><li>${icon('eye')} Large text zoom</li></ul>
      </div>
      <figure class="hero-visual"><picture><source srcset="/assets/reader-bridge-768.webp 768w, /assets/reader-bridge.webp 1536w" sizes="(max-width: 900px) calc(100vw - 40px), 52vw" type="image/webp"><img src="/assets/reader-bridge.webp" width="1536" height="1024" fetchpriority="high" alt="Pixel art of a phone framing text rows on a computer screen and turning them into an audio waveform"></picture><figcaption><span>SCREEN</span><span>REGION 08:18—92:76</span><span>VOICE</span></figcaption></figure>
    </section>

    <section class="reader-section" id="reader" aria-labelledby="readerTitle">
      <div class="section-heading"><div><p class="eyebrow">READER // LOCAL MODE</p><h2 id="readerTitle">Aim. Frame. Read.</h2></div><p>Camera permission starts here—not on page load. Use live view or take a photo.</p></div>
      <div class="consent-panel" id="consentPanel">
        <div class="consent-icon">${icon('camera')}</div><div><h3>Before the camera opens</h3><p>Only point at a screen you’re allowed to photograph. Frames stay in this browser and are discarded after text recognition.</p>
          <label class="check"><input type="checkbox" id="consentCheck"><span>I understand and consent to camera capture on this device.</span></label>
          <div class="button-row"><button class="primary" id="allowCamera" disabled>Allow camera</button><label class="secondary file-button" for="photoInput">Use a photo instead</label><input class="visually-hidden" id="photoInput" type="file" accept="image/*" capture="environment"></div>
        </div>
      </div>

      <div class="workspace" id="workspace" hidden>
        <section class="capture-column" aria-labelledby="captureTitle"><div class="instrument-label"><h3 id="captureTitle">01 / Frame the screen</h3><span id="cameraState" class="state-chip">Camera ready</span></div>
          <div class="viewfinder" id="viewfinder">
            <video id="camera" autoplay playsinline muted aria-label="Live camera view"></video><img id="photoPreview" alt="Selected screen photo preview" hidden>
            <div class="empty-camera" id="emptyCamera">${icon('camera')}<p>No image yet</p><span>Start the camera or choose a photo</span></div>
            <div class="selection" id="selection" aria-label="Selected reading region"><button data-corner="nw" aria-label="Move top left corner"></button><button data-corner="ne" aria-label="Move top right corner"></button><button data-corner="sw" aria-label="Move bottom left corner"></button><button data-corner="se" aria-label="Move bottom right corner"></button><span>READ REGION</span></div>
            <canvas id="captureCanvas" hidden></canvas>
          </div>
          <p class="keyboard-hint">Move a corner with arrow keys. Hold Shift for larger steps.</p>
          <div class="region-presets" aria-label="Region presets"><span>Frame:</span><button data-region="focus" aria-pressed="true">Focus box</button><button data-region="top">Top half</button><button data-region="bottom">Bottom half</button><button data-region="whole">Whole screen</button></div>
          <div class="pro-region-tools" id="proRegionTools" hidden><label for="savedRegions">Pro saved regions</label><select id="savedRegions"><option value="">Choose a saved region</option></select><label class="visually-hidden" for="regionName">Region name</label><input id="regionName" maxlength="30" placeholder="Region name"><button class="secondary compact" id="saveRegion">Save current frame</button><p id="regionMessage" role="status"></p></div>
          <div class="button-row"><button class="secondary" id="toggleCamera">Stop camera</button><label class="secondary file-button" for="photoInput2">Choose photo</label><input class="visually-hidden" id="photoInput2" type="file" accept="image/*" capture="environment"></div>
        </section>

        <section class="output-column" aria-labelledby="outputTitle"><div class="instrument-label"><h3 id="outputTitle">02 / Hear what changed</h3><span id="readState" class="state-chip cyan">Waiting</span></div>
          <div class="read-controls"><button class="hold-button" id="readButton"><span class="hold-icon" aria-hidden="true">▶</span><span><strong>Read visible region</strong><small>Press once or hold</small></span></button><button class="square-button" id="stopSpeech" aria-label="Stop speaking">■</button></div>
          <div class="progress-wrap" id="progressWrap" hidden><div class="progress-track"><span id="progressBar"></span></div><p id="progressText">Loading on-device reader…</p></div>
          <div class="transcript" id="transcript" tabindex="0" aria-live="polite" aria-busy="false"><div class="empty-transcript" id="emptyTranscript">${icon('sound')}<p>Recognized words appear here.</p><span>On the next reading, only new or changed lines are spoken.</span></div><div id="changedOutput"></div><details id="fullDetails" hidden><summary>Show all recognized text</summary><p id="fullOutput"></p></details></div>
          <div class="output-settings"><label for="textZoom">Text size <output id="zoomValue">32px</output></label><input id="textZoom" type="range" min="24" max="52" value="32" step="2"><label for="speechRate">Speech rate <output id="rateValue">1×</output></label><input id="speechRate" type="range" min="0.6" max="1.6" value="1" step="0.1"></div>
          <div class="result-actions"><button class="text-button" id="repeatSpeech">Repeat</button><button class="text-button" id="copyText">Copy text</button><button class="text-button" id="exportHistory">Export history</button><label class="text-button import-button" for="importHistory">Import history</label><input class="visually-hidden" id="importHistory" type="file" accept="application/json,.json"></div>
        </section>
      </div>
      <div class="reader-message" id="readerMessage" role="alert" hidden></div>
      <div class="offline-prepare"><div>${icon('lock')}<div><strong>Going somewhere without a connection?</strong><p>Save the English text model once (about 12 MB). Camera frames still never leave your device.</p></div></div><button class="secondary" id="prepareOffline">Prepare offline reading</button></div>
    </section>

    <section class="how-section" id="how" aria-labelledby="howTitle"><div class="section-heading"><div><p class="eyebrow">SIGNAL PATH // 3 STEPS</p><h2 id="howTitle">From silent pixels to speech.</h2></div><p>Nothing is installed on or sent to the computer you are reading.</p></div>
      <ol class="signal-path"><li><span class="step-no">01</span><div class="step-pixel camera-pixel" aria-hidden="true"></div><h3>Aim</h3><p>Give one-time camera consent, then point at any permitted visible screen.</p></li><li><span class="step-no">02</span><div class="step-pixel frame-pixel" aria-hidden="true"></div><h3>Frame</h3><p>Use the high-contrast box to isolate a menu, message, cursor area, or changed panel.</p></li><li><span class="step-no">03</span><div class="step-pixel sound-pixel" aria-hidden="true"></div><h3>Read</h3><p>On-device OCR finds words. Your phone speaks only lines that were not in the last frame.</p></li></ol>
      <aside class="safety-note"><span aria-hidden="true">!</span><div><h3>An honest fallback</h3><p>OCR can misread text and cannot reveal DRM-protected or hidden content. Verify critical instructions. Anywhere Reader never clicks the target computer.</p></div></aside>
    </section>

    <section class="history-section" aria-labelledby="historyTitle"><div class="section-heading"><div><p class="eyebrow">LOCAL LOG // THIS DEVICE</p><h2 id="historyTitle">Recent readings.</h2></div><div class="button-row"><button class="text-button" id="refreshHistory">Refresh</button><button class="text-button danger" id="clearHistory">Clear history</button></div></div><div id="historyList" class="history-list"><p class="history-empty">Nothing saved yet. Your five most recent free readings will appear here.</p></div></section>

    <section class="pro-section" id="pro" aria-labelledby="proTitle"><div class="pro-copy"><p class="eyebrow">OPTIONAL UNLOCK // ONE TIME</p><h2 id="proTitle">Keep the reader free.<br>Make repeat work faster.</h2><p>Core camera reading, changed-line speech, zoom, and history export are always free. Pro adds 50-item local history and saved region presets for repeated workstations.</p><ul><li>50 local readings instead of 5</li><li>Save and name up to 10 reading regions</li><li>No account and no recurring speech quota</li></ul></div><div class="price-terminal"><div><span>ANYWHERE READER PRO</span><span id="licenseState">NOT UNLOCKED</span></div><p class="price"><sup>₹</sup>499 <small>one time</small></p><a class="primary wide" href="${CHECKOUT_URL}">Buy Pro securely</a><p class="merchant">Checkout and refunds by Sociobot/Dodo, merchant of record.</p><details><summary>Have a license? Restore it</summary><label for="licenseInput">License token</label><input id="licenseInput" type="text" autocomplete="off" spellcheck="false"><button class="secondary" id="restoreLicense" aria-label="Verify pasted license">Verify license</button><p id="licenseMessage" role="status"></p></details><p class="legal-links"><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p></div></section>
  </main>${footer()}
  <div class="update-toast" id="updateToast" role="status" hidden><span>A fresh reader is ready.</span><button id="applyUpdate">Update now</button></div>`;
  setupHome();
}

type OcrWorker = Awaited<ReturnType<(typeof import('tesseract.js'))['createWorker']>>;
let worker: OcrWorker | null = null;
let stream: MediaStream | null = null;
let region: Region = { ...DEFAULT_REGION };
let priorText = '';
let lastSpoken = '';
let proUnlocked = hasOptimisticUnlock();

function byId<T extends HTMLElement>(id: string): T { return document.getElementById(id) as T; }

function setupHome(): void {
  const consent = byId<HTMLInputElement>('consentCheck');
  consent.addEventListener('change', () => { byId<HTMLButtonElement>('allowCamera').disabled = !consent.checked; });
  byId('allowCamera').addEventListener('click', startCamera);
  byId('toggleCamera').addEventListener('click', toggleCamera);
  [byId<HTMLInputElement>('photoInput'), byId<HTMLInputElement>('photoInput2')].forEach(input => input.addEventListener('change', () => loadPhoto(input)));
  byId('readButton').addEventListener('click', readRegion);
  byId('stopSpeech').addEventListener('click', () => speechSynthesis.cancel());
  byId('repeatSpeech').addEventListener('click', () => speak(lastSpoken));
  byId('copyText').addEventListener('click', copyText);
  byId('exportHistory').addEventListener('click', exportHistory);
  byId<HTMLInputElement>('importHistory').addEventListener('change', importHistory);
  byId('prepareOffline').addEventListener('click', prepareOffline);
  byId('refreshHistory').addEventListener('click', renderHistory);
  byId('clearHistory').addEventListener('click', confirmClearHistory);
  byId('restoreLicense').addEventListener('click', restoreLicense);
  byId('saveRegion').addEventListener('click', saveCurrentRegion);
  byId<HTMLSelectElement>('savedRegions').addEventListener('change', loadSavedRegion);
  byId<HTMLInputElement>('textZoom').addEventListener('input', updateZoom);
  byId<HTMLInputElement>('speechRate').addEventListener('input', updateRate);
  document.querySelectorAll<HTMLButtonElement>('[data-region]').forEach(button => button.addEventListener('click', () => setPreset(button.dataset.region!)));
  document.querySelectorAll<HTMLButtonElement>('[data-corner]').forEach(button => {
    button.addEventListener('keydown', event => moveCorner(event, button.dataset.corner!));
    button.addEventListener('pointerdown', event => beginCornerDrag(event, button.dataset.corner!));
  });
  const savedRate = localStorage.getItem('reader:speech-rate');
  if (savedRate) byId<HTMLInputElement>('speechRate').value = savedRate;
  updateOnlineState();
  window.addEventListener('online', updateOnlineState);
  window.addEventListener('offline', updateOnlineState);
  updateZoom(); updateRate(); updateSelection(); renderHistory(); setupLicense(); setupInstall(); setupAndroidRelease(); registerServiceWorker();
}

interface AndroidRelease {
  version: string;
  downloadUrl: string;
  checksumUrl: string;
  sha256: string;
}

async function setupAndroidRelease(): Promise<void> {
  const metadata = byId('androidReleaseMeta');
  if (Capacitor.isNativePlatform()) {
    byId<HTMLAnchorElement>('downloadAndroid').hidden = true;
    metadata.hidden = true;
    return;
  }
  try {
    const response = await fetch('/android-release.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Release metadata unavailable');
    const release = await response.json() as AndroidRelease;
    if (!/^[a-f0-9]{64}$/.test(release.sha256) || /^0+$/.test(release.sha256)) throw new Error('Release checksum unavailable');
    byId<HTMLAnchorElement>('downloadAndroid').href = release.downloadUrl;
    byId<HTMLAnchorElement>('apkChecksum').href = release.checksumUrl;
    byId('apkDigest').textContent = release.sha256;
  } catch {
    byId('apkDigest').textContent = 'Checksum will appear when the release is published.';
  }
}

async function startCamera(): Promise<void> {
  showWorkspace();
  setMessage('');
  if (!navigator.mediaDevices?.getUserMedia) {
    setMessage('Live camera is not available in this browser. Choose “Use a photo instead.”');
    setCameraState('Photo mode');
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
    const video = byId<HTMLVideoElement>('camera');
    video.srcObject = stream;
    await video.play();
    video.hidden = false;
    byId('photoPreview').hidden = true;
    byId('emptyCamera').hidden = true;
    byId('toggleCamera').textContent = 'Stop camera';
    setCameraState('Camera live');
    video.focus();
  } catch (error) {
    const denied = error instanceof DOMException && error.name === 'NotAllowedError';
    setMessage(denied ? 'Camera permission was not granted. Allow it in browser settings, or choose a photo instead.' : 'The camera could not start. Close other camera apps or choose a photo instead.');
    setCameraState('Camera error');
  }
}

function showWorkspace(): void {
  byId('workspace').hidden = false;
  byId('consentPanel').hidden = true;
}

async function toggleCamera(): Promise<void> {
  if (stream) { stopCamera(); return; }
  await startCamera();
}

function stopCamera(): void {
  stream?.getTracks().forEach(track => track.stop());
  stream = null;
  byId<HTMLVideoElement>('camera').srcObject = null;
  byId('camera').hidden = true;
  if (byId<HTMLImageElement>('photoPreview').hidden) byId('emptyCamera').hidden = false;
  byId('toggleCamera').textContent = 'Restart camera';
  setCameraState('Camera stopped');
}

function loadPhoto(input: HTMLInputElement): void {
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { setMessage('That file is not an image. Choose a photo in JPEG, PNG, or WebP format.'); return; }
  showWorkspace(); stopCamera();
  const image = byId<HTMLImageElement>('photoPreview');
  image.onload = () => URL.revokeObjectURL(image.src);
  image.src = URL.createObjectURL(file);
  image.hidden = false;
  byId('emptyCamera').hidden = true;
  setCameraState('Photo ready');
  setMessage('');
}

async function initWorker(): Promise<OcrWorker> {
  if (worker) return worker;
  setProgress(true, 0.04, 'Loading the private text reader…');
  const { createWorker, OEM } = await import('tesseract.js');
  worker = await createWorker('eng', OEM.LSTM_ONLY, {
    workerPath: '/ocr/worker.min.js',
    corePath: '/ocr/tesseract-core.wasm.js',
    langPath: '/ocr/lang',
    // AAPT expands .gz files and removes their suffix inside an APK. The
    // Android bundle therefore carries the same language data uncompressed.
    gzip: !Capacitor.isNativePlatform(),
    logger: info => {
      if (typeof info.progress === 'number') setProgress(true, info.progress, humanProgress(info.status));
    },
  });
  await worker.setParameters({ preserve_interword_spaces: '1' });
  return worker;
}

function humanProgress(status: string): string {
  const names: Record<string, string> = { 'loading tesseract core': 'Starting on-device OCR…', 'initializing tesseract': 'Initializing the reader…', 'loading language traineddata': 'Saving English for offline use…', 'initializing api': 'Preparing recognition…', 'recognizing text': 'Reading the selected pixels…' };
  return names[status] || 'Preparing the private reader…';
}

async function prepareOffline(): Promise<void> {
  try {
    await initWorker();
    setProgress(false);
    setMessage('Offline reading is ready. The English model is saved on this device.', 'success');
    byId<HTMLButtonElement>('prepareOffline').textContent = 'Offline reading ready';
  } catch {
    setProgress(false);
    setMessage(navigator.onLine ? 'The offline model could not be saved. Check available storage and try again.' : 'Connect once to save the English model, then it will work offline.');
  }
}

async function readRegion(): Promise<void> {
  const video = byId<HTMLVideoElement>('camera');
  const image = byId<HTMLImageElement>('photoPreview');
  const sourceReady = !video.hidden && video.readyState >= 2 || !image.hidden && image.complete && image.naturalWidth > 0;
  if (!sourceReady) { setMessage('There is no screen image to read. Start the camera or choose a photo first.'); return; }
  const button = byId<HTMLButtonElement>('readButton');
  button.disabled = true;
  byId('transcript').setAttribute('aria-busy', 'true');
  setReadState('Reading…');
  setMessage('');
  try {
    const canvas = captureCrop(!video.hidden ? video : image);
    const ocr = await initWorker();
    const result = await ocr.recognize(canvas);
    const text = result.data.text.trim();
    if (!text) {
      setReadState('No text found');
      setMessage('No clear text was found in that region. Move closer, reduce glare, or choose a larger frame.');
      return;
    }
    const changed = priorText ? changedLines(priorText, text) : text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    showResult(text, changed);
    priorText = text;
    const words = changed.join('. ');
    lastSpoken = words || 'No visible text changed.';
    speak(lastSpoken);
    const reading: Reading = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), text, changed };
    await saveReading(reading, proUnlocked ? 50 : 5);
    await renderHistory();
    setReadState(changed.length ? `${changed.length} changed ${changed.length === 1 ? 'line' : 'lines'}` : 'No change');
  } catch (error) {
    console.error('Recognition failed', error);
    setReadState('Reader error');
    setMessage(navigator.onLine ? 'Text recognition did not finish. Keep the app open and try again.' : 'The OCR model is not saved yet. Reconnect once and choose “Prepare offline reading.”');
  } finally {
    button.disabled = false;
    byId('transcript').setAttribute('aria-busy', 'false');
    setProgress(false);
  }
}

function captureCrop(source: HTMLVideoElement | HTMLImageElement): HTMLCanvasElement {
  const canvas = byId<HTMLCanvasElement>('captureCanvas');
  const sourceWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
  const sourceHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
  const sx = Math.round(sourceWidth * region.x / 100);
  const sy = Math.round(sourceHeight * region.y / 100);
  const sw = Math.round(sourceWidth * region.width / 100);
  const sh = Math.round(sourceHeight * region.height / 100);
  const scale = Math.min(2, 1800 / Math.max(sw, sh));
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.filter = 'grayscale(1) contrast(1.45)';
  context.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function showResult(text: string, changed: string[]): void {
  byId('emptyTranscript').hidden = true;
  const output = byId('changedOutput');
  output.innerHTML = '';
  if (!changed.length) output.innerHTML = '<p class="no-change">No visible lines changed since the last reading.</p>';
  else changed.forEach(line => { const p = document.createElement('p'); p.textContent = line; output.append(p); });
  byId('fullDetails').hidden = false;
  byId('fullOutput').textContent = text;
}

function speak(text: string): void {
  if (!text || !('speechSynthesis' in window)) { setMessage('Speech output is not supported in this browser. The recognized text remains available above.'); return; }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Number(byId<HTMLInputElement>('speechRate').value);
  utterance.lang = 'en-US';
  utterance.onerror = event => { if (event.error !== 'canceled' && event.error !== 'interrupted') setMessage('Speech could not start. Check your device volume or text-to-speech settings.'); };
  speechSynthesis.speak(utterance);
}

function updateSelection(): void {
  region = clampRegion(region);
  const selection = byId('selection');
  selection.style.left = `${region.x}%`; selection.style.top = `${region.y}%`; selection.style.width = `${region.width}%`; selection.style.height = `${region.height}%`;
}

function setPreset(name: string): void {
  const presets: Record<string, Region> = { focus: DEFAULT_REGION, top: { x: 2, y: 2, width: 96, height: 48 }, bottom: { x: 2, y: 50, width: 96, height: 48 }, whole: { x: 0, y: 0, width: 100, height: 100 } };
  region = { ...presets[name] };
  document.querySelectorAll<HTMLButtonElement>('[data-region]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.region === name)));
  updateSelection();
}

function moveCorner(event: KeyboardEvent, corner: string): void {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  const step = event.shiftKey ? 5 : 1;
  const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
  const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
  resizeCorner(corner, dx, dy);
}

function beginCornerDrag(event: PointerEvent, corner: string): void {
  const startX = event.clientX; const startY = event.clientY; const initial = { ...region };
  const bounds = byId('viewfinder').getBoundingClientRect();
  const move = (next: PointerEvent) => { region = initial; resizeCorner(corner, (next.clientX - startX) / bounds.width * 100, (next.clientY - startY) / bounds.height * 100); };
  const end = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', end, { once: true });
}

function resizeCorner(corner: string, dx: number, dy: number): void {
  const right = region.x + region.width; const bottom = region.y + region.height;
  if (corner.includes('w')) { const x = Math.min(right - 12, Math.max(0, region.x + dx)); region.width = right - x; region.x = x; }
  if (corner.includes('e')) region.width = Math.max(12, Math.min(100 - region.x, region.width + dx));
  if (corner.includes('n')) { const y = Math.min(bottom - 12, Math.max(0, region.y + dy)); region.height = bottom - y; region.y = y; }
  if (corner.includes('s')) region.height = Math.max(12, Math.min(100 - region.y, region.height + dy));
  updateSelection();
}

function updateZoom(): void {
  const value = byId<HTMLInputElement>('textZoom').value;
  byId('zoomValue').textContent = `${value}px`;
  document.documentElement.style.setProperty('--reader-size', `${value}px`);
}

function updateRate(): void {
  const value = byId<HTMLInputElement>('speechRate').value;
  byId('rateValue').textContent = `${Number(value).toFixed(1).replace('.0', '')}×`;
  localStorage.setItem('reader:speech-rate', value);
}

async function copyText(): Promise<void> {
  if (!priorText) { setMessage('Read a screen region before copying text.'); return; }
  try { await navigator.clipboard.writeText(priorText); setMessage('Recognized text copied.', 'success'); }
  catch { setMessage('Copy was blocked. Select the recognized text manually instead.'); }
}

async function renderHistory(): Promise<void> {
  const container = byId('historyList');
  try {
    const readings = await getReadings();
    if (!readings.length) { container.innerHTML = `<p class="history-empty">Nothing saved yet. Your ${proUnlocked ? '50' : 'five'} most recent readings will appear here.</p>`; return; }
    container.innerHTML = '';
    readings.forEach(item => {
      const article = document.createElement('article');
      const time = new Date(item.createdAt);
      article.innerHTML = `<time datetime="${item.createdAt}">${time.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</time><p></p><span>${item.changed.length} changed ${item.changed.length === 1 ? 'line' : 'lines'}</span>`;
      article.querySelector('p')!.textContent = item.changed.join(' · ') || item.text.slice(0, 180);
      container.append(article);
    });
  } catch { container.innerHTML = '<p class="history-empty">Local history is unavailable in this browser mode.</p>'; }
}

async function confirmClearHistory(): Promise<void> {
  const button = byId<HTMLButtonElement>('clearHistory');
  if (button.dataset.confirm !== 'yes') { button.dataset.confirm = 'yes'; button.textContent = 'Confirm clear all'; setTimeout(() => { button.dataset.confirm = ''; button.textContent = 'Clear history'; }, 5000); return; }
  await clearReadings(); button.textContent = 'Clear history'; button.dataset.confirm = ''; await renderHistory(); setMessage('Local reading history cleared.', 'success');
}

async function exportHistory(): Promise<void> {
  const rows = await getReadings();
  const blob = new Blob([JSON.stringify({ product: 'Anywhere Reader', exportedAt: new Date().toISOString(), readings: rows }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `anywhere-reader-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(link.href);
}

async function importHistory(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text()) as { readings?: Reading[] };
    if (!Array.isArray(parsed.readings)) throw new Error('Missing readings');
    const valid = parsed.readings.filter(item => item && typeof item.id === 'string' && typeof item.createdAt === 'string' && typeof item.text === 'string' && Array.isArray(item.changed));
    if (!valid.length) throw new Error('No valid readings');
    for (const reading of valid.slice(0, proUnlocked ? 50 : 5).reverse()) await saveReading(reading, proUnlocked ? 50 : 5);
    await renderHistory();
    setMessage(`${Math.min(valid.length, proUnlocked ? 50 : 5)} local readings imported.`, 'success');
  } catch {
    setMessage('That JSON file is not an Anywhere Reader history export. Choose the original exported file.');
  } finally { input.value = ''; }
}

interface SavedRegion { name: string; region: Region }

function savedRegions(): SavedRegion[] {
  try { return JSON.parse(localStorage.getItem('reader:saved-regions') || '[]') as SavedRegion[]; }
  catch { return []; }
}

function renderSavedRegions(): void {
  const select = byId<HTMLSelectElement>('savedRegions');
  select.innerHTML = '<option value="">Choose a saved region</option>';
  savedRegions().forEach((item, index) => { const option = document.createElement('option'); option.value = String(index); option.textContent = item.name; select.append(option); });
}

function saveCurrentRegion(): void {
  const input = byId<HTMLInputElement>('regionName');
  const message = byId('regionMessage');
  const name = input.value.trim();
  if (!name) { message.textContent = 'Give this region a short name first.'; input.focus(); return; }
  const rows = savedRegions();
  const existing = rows.findIndex(item => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
  const item = { name, region: { ...region } };
  if (existing >= 0) rows[existing] = item;
  else if (rows.length < 10) rows.push(item);
  else { message.textContent = 'Ten regions are already saved. Reuse a name to replace one.'; return; }
  localStorage.setItem('reader:saved-regions', JSON.stringify(rows));
  input.value = ''; message.textContent = `${name} saved on this device.`; renderSavedRegions();
}

function loadSavedRegion(): void {
  const value = byId<HTMLSelectElement>('savedRegions').value;
  if (value === '') return;
  const index = Number(value);
  if (!Number.isInteger(index)) return;
  const item = savedRegions()[index];
  if (!item) return;
  region = { ...item.region }; updateSelection();
  document.querySelectorAll<HTMLButtonElement>('[data-region]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  byId('regionMessage').textContent = `${item.name} loaded.`;
}

async function setupLicense(): Promise<void> {
  updateLicenseUi(proUnlocked);
  if (!localStorage.getItem('sb_license:remote-screen-reader')) return;
  const valid = await verifyLicense();
  proUnlocked = valid; updateLicenseUi(valid); await renderHistory();
  if (!valid) byId('licenseMessage').textContent = 'This license is no longer active. The free reader still works.';
}

async function restoreLicense(): Promise<void> {
  const input = byId<HTMLInputElement>('licenseInput'); const message = byId('licenseMessage');
  if (input.value.trim().length < 8) { message.textContent = 'Paste the complete license token from your receipt.'; return; }
  saveLicense(input.value); message.textContent = 'Checking license…';
  const valid = await verifyLicense(true); proUnlocked = valid; updateLicenseUi(valid); message.textContent = valid ? 'Pro restored on this device.' : 'That license could not be verified for Anywhere Reader.';
}

function updateLicenseUi(valid: boolean): void {
  byId('licenseState').textContent = valid ? 'PRO UNLOCKED' : 'NOT UNLOCKED';
  byId('licenseState').classList.toggle('unlocked', valid);
  byId('proRegionTools').hidden = !valid;
  if (valid) renderSavedRegions();
}

function updateOnlineState(): void { byId('networkBanner').hidden = navigator.onLine; }
function setCameraState(value: string): void { byId('cameraState').textContent = value; }
function setReadState(value: string): void { byId('readState').textContent = value; }
function setMessage(value: string, kind: 'error' | 'success' = 'error'): void { const box = byId('readerMessage'); box.hidden = !value; box.textContent = value; box.className = `reader-message ${kind}`; }
function setProgress(visible: boolean, amount = 0, label = ''): void { const wrap = byId('progressWrap'); wrap.hidden = !visible; byId('progressBar').style.width = `${Math.round(amount * 100)}%`; if (label) byId('progressText').textContent = label; }

function setupInstall(): void {
  let prompt: BeforeInstallPromptEvent | null = null;
  const button = byId<HTMLButtonElement>('installApp');
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); prompt = event as BeforeInstallPromptEvent; button.hidden = false; });
  button.addEventListener('click', async () => { if (!prompt) return; await prompt.prompt(); prompt = null; button.hidden = true; });
}

interface BeforeInstallPromptEvent extends Event { prompt(): Promise<void> }

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('/sw.js');
    if (registration.waiting && navigator.serviceWorker.controller) byId('updateToast').hidden = false;
    registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', () => { if (registration.waiting && navigator.serviceWorker.controller) byId('updateToast').hidden = false; }));
    byId('applyUpdate').addEventListener('click', () => { registration.waiting?.postMessage('SKIP_WAITING'); location.reload(); });
  });
}

const path = location.pathname.replace(/\/$/, '') || '/';
if (path === '/privacy' || path === '/terms') renderLegal(path.slice(1) as 'privacy' | 'terms');
else renderHome();
