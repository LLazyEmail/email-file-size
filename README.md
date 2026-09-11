# email-file-size

[![CI](https://github.com/LLazyemail/email-file-size/actions/workflows/ci.yml/badge.svg)](https://github.com/LLazyemail/email-file-size/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/email-file-size.svg)](https://www.npmjs.com/package/email-file-size)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Measure the size of email HTML and detect **Gmail clipping** risk.

Gmail clips messages whose HTML source exceeds **~102 KB**. This package gives you a simple, zero-dependency way to measure size and stay under the limit.

## Install

```bash
npm install email-file-size
# or
pnpm add email-file-size
# or
yarn add email-file-size
```

## Usage

```ts
import {
  analyzeEmailSize,
  getByteSize,
  isEmailClipped,
  isEmailSafe,
  GMAIL_CLIP_LIMIT,
  SAFE_EMAIL_LIMIT,
} from 'email-file-size';

const html = `<!DOCTYPE html>
<html>
  <body>
    <h1>Hello</h1>
    <p>Your newsletter content…</p>
  </body>
</html>`;

// Full analysis
const result = analyzeEmailSize(html);
console.log(result);
// {
//   bytes: 142,
//   human: "142 B",
//   isClipped: false,
//   isSafe: true,
//   percentOfLimit: 0.1
// }

// Quick checks
if (isEmailClipped(html)) {
  console.warn('This email will be clipped by Gmail');
}

if (!isEmailSafe(html)) {
  console.warn('Consider reducing size for better deliverability');
}

// Raw byte size
const bytes = getByteSize(html);
```

## API

| Export | Description |
|--------|-------------|
| `getByteSize(content: string): number` | UTF-8 byte length of the string |
| `formatBytes(bytes: number, decimals?: number): string` | Human-readable size (`"87.3 KB"`) |
| `analyzeEmailSize(html, options?)` | Full result object (see above) |
| `isEmailClipped(html, limit?)` | `true` if over Gmail limit |
| `isEmailSafe(html, safeLimit?)` | `true` if under recommended safe size |
| `GMAIL_CLIP_LIMIT` | `102 * 1024` (104 448 bytes) |
| `SAFE_EMAIL_LIMIT` | `90 * 1024` (recommended buffer) |

### Options for `analyzeEmailSize`

```ts
analyzeEmailSize(html, {
  limit: 102 * 1024,      // custom clip threshold
  safeLimit: 90 * 1024,   // custom safe threshold
});
```

## Why this matters

- Gmail shows **“[Message clipped] View entire message”** when the HTML exceeds ~102 KB.
- Tracking pixels, unsubscribe links and footers often sit at the bottom and get hidden.
- Keeping size under **90–95 KB** gives a comfortable safety margin.

## Publishing workflow

This package is set up for a clean publish cycle:

```bash
npm run typecheck   # TypeScript strict check
npm test            # Vitest
npm run build       # tsup → ESM + CJS + .d.ts
npm run release     # bump patch + publish
```

Or manually:

```bash
npm version patch   # or minor / major
npm publish --access public
```

## Development

```bash
npm install
npm run dev         # watch mode (tsup)
npm test            # run tests
npm run test:watch
```

## License

MIT © LLazyEmail
