/**
 * email-file-size
 *
 * Utilities to measure the size of email HTML and detect Gmail clipping risk.
 * Gmail clips messages whose HTML source exceeds ~102 KB.
 */

/** Gmail clipping threshold in bytes (commonly referenced as 102 KB). */
export const GMAIL_CLIP_LIMIT = 102 * 1024; // 104 448 bytes

/** Recommended safe limit (leaves a small buffer). */
export const SAFE_EMAIL_LIMIT = 90 * 1024; // 92 160 bytes

export type SizeUnit = 'B' | 'KB' | 'MB';

export interface EmailSizeResult {
  /** Size in bytes (UTF-8). */
  bytes: number;
  /** Human-readable string, e.g. "87.3 KB". */
  human: string;
  /** Whether the content is likely to be clipped by Gmail. */
  isClipped: boolean;
  /** Whether the content is under the recommended safe limit. */
  isSafe: boolean;
  /** Percentage of the Gmail limit used (0–100+). */
  percentOfLimit: number;
}

/**
 * Returns the UTF-8 byte length of a string.
 * This is the metric Gmail uses for the HTML body size.
 */
export function getByteSize(content: string): number {
  if (typeof content !== 'string') {
    throw new TypeError('Expected a string');
  }
  // TextEncoder is available in modern Node and all browsers
  return new TextEncoder().encode(content).length;
}

/**
 * Formats a byte count into a human-readable string.
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B';
  }
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes: SizeUnit[] = ['B', 'KB', 'MB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(i === 0 ? 0 : decimals)} ${sizes[i]}`;
}

/**
 * Full analysis of email HTML size against Gmail limits.
 */
export function analyzeEmailSize(
  html: string,
  options: { limit?: number; safeLimit?: number } = {},
): EmailSizeResult {
  const limit = options.limit ?? GMAIL_CLIP_LIMIT;
  const safeLimit = options.safeLimit ?? SAFE_EMAIL_LIMIT;

  const bytes = getByteSize(html);
  const percentOfLimit = (bytes / limit) * 100;

  return {
    bytes,
    human: formatBytes(bytes),
    isClipped: bytes > limit,
    isSafe: bytes <= safeLimit,
    percentOfLimit: Math.round(percentOfLimit * 10) / 10,
  };
}

/**
 * Convenience check: returns true if the HTML is likely to be clipped by Gmail.
 */
export function isEmailClipped(html: string, limit = GMAIL_CLIP_LIMIT): boolean {
  return getByteSize(html) > limit;
}

/**
 * Convenience check: returns true if the HTML is under the recommended safe size.
 */
export function isEmailSafe(html: string, safeLimit = SAFE_EMAIL_LIMIT): boolean {
  return getByteSize(html) <= safeLimit;
}

// Default export for convenience
export default {
  GMAIL_CLIP_LIMIT,
  SAFE_EMAIL_LIMIT,
  getByteSize,
  formatBytes,
  analyzeEmailSize,
  isEmailClipped,
  isEmailSafe,
};
