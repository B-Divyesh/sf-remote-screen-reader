const SLUG = 'remote-screen-reader';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${TOKEN_KEY}:verdict`;
const API = 'https://api.sociobot.in/api/v1';

interface Verdict { valid: boolean; checkedAt: number; reason?: string }

export function captureReturnedLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function saveLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function hasOptimisticUnlock(): boolean {
  if (!localStorage.getItem(TOKEN_KEY)) return false;
  const saved = localStorage.getItem(VERDICT_KEY);
  if (!saved) return true;
  try { return (JSON.parse(saved) as Verdict).valid; } catch { return true; }
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  const saved = localStorage.getItem(VERDICT_KEY);
  if (!force && saved) {
    const verdict = JSON.parse(saved) as Verdict;
    if (Date.now() - verdict.checkedAt < 86_400_000) return verdict.valid;
  }
  try {
    const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const result = await response.json() as { valid: boolean; reason?: string };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, reason: result.reason, checkedAt: Date.now() }));
    return result.valid;
  } catch {
    return hasOptimisticUnlock();
  }
}

export const CHECKOUT_URL = `${API}/products/${SLUG}/checkout`;
