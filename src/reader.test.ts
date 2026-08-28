import { describe, expect, it } from 'vitest';
import { changedLines, clampRegion, cleanLines } from './reader';

describe('reader text comparison', () => {
  it('cleans OCR whitespace and ignores blank specks', () => {
    expect(cleanLines('  Open   file \n\n x\n Save  ')).toEqual(['Open file', 'Save']);
  });

  it('returns only newly visible lines, ignoring punctuation and case', () => {
    expect(changedLines('File\nREADY!', 'File\nReady\nExport complete')).toEqual(['Export complete']);
  });

  it('keeps the selection inside the preview', () => {
    expect(clampRegion({ x: 95, y: -4, width: 40, height: 110 })).toEqual({ x: 60, y: 0, width: 40, height: 100 });
  });
});
