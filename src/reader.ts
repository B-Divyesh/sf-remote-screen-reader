export interface Region { x: number; y: number; width: number; height: number }

export interface Reading {
  id: string;
  createdAt: string;
  text: string;
  changed: string[];
}

export const DEFAULT_REGION: Region = { x: 8, y: 18, width: 84, height: 58 };

export function cleanLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 1);
}

function comparable(line: string): string {
  return line.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function changedLines(previous: string, current: string): string[] {
  const before = new Set(cleanLines(previous).map(comparable));
  return cleanLines(current).filter(line => !before.has(comparable(line)));
}

export function clampRegion(region: Region): Region {
  const width = Math.min(100, Math.max(12, region.width));
  const height = Math.min(100, Math.max(12, region.height));
  return {
    x: Math.min(100 - width, Math.max(0, region.x)),
    y: Math.min(100 - height, Math.max(0, region.y)),
    width,
    height,
  };
}

const DB_NAME = 'anywhere-reader';
const STORE = 'readings';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveReading(reading: Reading, limit: number): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(reading);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  const all = await getReadings();
  if (all.length > limit) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      all.slice(limit).forEach(item => tx.objectStore(STORE).delete(item.id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  db.close();
}

export async function getReadings(): Promise<Reading[]> {
  const db = await openDb();
  const rows = await new Promise<Reading[]>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function clearReadings(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
