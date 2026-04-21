import { describe, expect, it } from 'vitest';
import { LANGUAGES, findLanguage } from './languages';

describe('languages', () => {
  it('exports a non-empty list with unique codes', () => {
    expect(LANGUAGES.length).toBeGreaterThan(20);
    const codes = new Set(LANGUAGES.map((l) => l.code));
    expect(codes.size).toBe(LANGUAGES.length);
  });

  it('each entry has code, nameEn, nameNative, flag', () => {
    for (const l of LANGUAGES) {
      expect(l.code).toMatch(/^[a-z-]+$/);
      expect(l.nameEn.length).toBeGreaterThan(0);
      expect(l.nameNative.length).toBeGreaterThan(0);
      expect(l.flag.length).toBeGreaterThan(0);
    }
  });

  it('findLanguage matches on code', () => {
    const results = findLanguage('en');
    expect(results.find((l) => l.code === 'en')).toBeTruthy();
  });

  it('findLanguage matches on English name (case-insensitive)', () => {
    const results = findLanguage('THAI');
    expect(results.find((l) => l.code === 'th')).toBeTruthy();
  });

  it('findLanguage matches on native name', () => {
    const results = findLanguage('日本');
    expect(results.find((l) => l.code === 'ja')).toBeTruthy();
  });

  it('findLanguage returns all when query is empty', () => {
    expect(findLanguage('').length).toBe(LANGUAGES.length);
  });
});
