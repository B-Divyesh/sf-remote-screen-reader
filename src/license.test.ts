import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureReturnedLicense, hasOptimisticUnlock, verifyLicense } from './license';

const TOKEN_KEY = 'sb_license:remote-screen-reader';
const VERDICT_KEY = `${TOKEN_KEY}:verdict`;

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

describe('license cache identity', () => {
  let storage: MemoryStorage;
  const replaceState = vi.fn();

  beforeEach(() => {
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('history', { replaceState });
    replaceState.mockReset();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('invalidates an old verdict when checkout returns a different token', async () => {
    storage.setItem(TOKEN_KEY, 'old-token');
    storage.setItem(VERDICT_KEY, JSON.stringify({ valid: false, checkedAt: Date.now(), token: 'old-token' }));
    vi.stubGlobal('location', { href: 'https://reader.test/?source=checkout&license=new-token#pro' });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ valid: true, reason: 'ok' }) });
    vi.stubGlobal('fetch', fetchMock);

    captureReturnedLicense();

    expect(storage.getItem(TOKEN_KEY)).toBe('new-token');
    expect(storage.getItem(VERDICT_KEY)).toBeNull();
    expect(replaceState).toHaveBeenCalledWith({}, '', '/?source=checkout#pro');
    await expect(verifyLicense()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('license=new-token'));
  });

  it('never applies a fresh verdict to a different stored token', async () => {
    storage.setItem(TOKEN_KEY, 'replacement-token');
    storage.setItem(VERDICT_KEY, JSON.stringify({ valid: false, checkedAt: Date.now(), token: 'previous-token' }));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ valid: true, reason: 'ok' }) });
    vi.stubGlobal('fetch', fetchMock);

    expect(hasOptimisticUnlock()).toBe(true);
    await expect(verifyLicense()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('reuses a current verdict only for its matching token', async () => {
    storage.setItem(TOKEN_KEY, 'same-token');
    storage.setItem(VERDICT_KEY, JSON.stringify({ valid: false, checkedAt: Date.now(), token: 'same-token' }));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(hasOptimisticUnlock()).toBe(false);
    await expect(verifyLicense()).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
