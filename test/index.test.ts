import { describe, it, expect } from 'vitest';
import {
  getByteSize,
  formatBytes,
  analyzeEmailSize,
  isEmailClipped,
  isEmailSafe,
  GMAIL_CLIP_LIMIT,
  SAFE_EMAIL_LIMIT,
} from '../src/index';

describe('getByteSize', () => {
  it('returns 0 for empty string', () => {
    expect(getByteSize('')).toBe(0);
  });

  it('counts ASCII characters as 1 byte each', () => {
    expect(getByteSize('hello')).toBe(5);
  });

  it('counts multi-byte characters correctly (UTF-8)', () => {
    // "é" is 2 bytes in UTF-8
    expect(getByteSize('café')).toBe(5);
    // emoji is 4 bytes
    expect(getByteSize('👋')).toBe(4);
  });

  it('throws on non-string input', () => {
    // @ts-expect-error
    expect(() => getByteSize(null)).toThrow(TypeError);
  });
});

describe('formatBytes', () => {
  it('formats bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });
});

describe('analyzeEmailSize', () => {
  it('analyzes a small email', () => {
    const html = '<html><body><p>Hello world</p></body></html>';
    const result = analyzeEmailSize(html);

    expect(result.bytes).toBeGreaterThan(0);
    expect(result.isClipped).toBe(false);
    expect(result.isSafe).toBe(true);
    expect(result.percentOfLimit).toBeLessThan(1);
    expect(result.human).toMatch(/B|KB/);
  });

  it('detects content over the Gmail limit', () => {
    // Create a string larger than 102 KB
    const big = 'a'.repeat(GMAIL_CLIP_LIMIT + 100);
    const result = analyzeEmailSize(big);

    expect(result.isClipped).toBe(true);
    expect(result.isSafe).toBe(false);
    expect(result.percentOfLimit).toBeGreaterThan(100);
  });

  it('respects custom limits', () => {
    const html = 'a'.repeat(500);
    const result = analyzeEmailSize(html, { limit: 400, safeLimit: 300 });

    expect(result.isClipped).toBe(true);
    expect(result.isSafe).toBe(false);
  });
});

describe('isEmailClipped / isEmailSafe', () => {
  it('works with convenience helpers', () => {
    const small = '<p>hi</p>';
    const big = 'x'.repeat(GMAIL_CLIP_LIMIT + 1);

    expect(isEmailClipped(small)).toBe(false);
    expect(isEmailClipped(big)).toBe(true);

    expect(isEmailSafe(small)).toBe(true);
    expect(isEmailSafe(big)).toBe(false);
  });
});

describe('constants', () => {
  it('exports expected limits', () => {
    expect(GMAIL_CLIP_LIMIT).toBe(102 * 1024);
    expect(SAFE_EMAIL_LIMIT).toBe(90 * 1024);
  });
});
