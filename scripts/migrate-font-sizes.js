#!/usr/bin/env node
/**
 * One-time migration: replace hardcoded font-size px values with DS tokens.
 * Run once, then delete or keep for reference.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const MAP = {
  '9px':  'var(--font-size-3xs)',
  '10px': 'var(--font-size-2xs)',
  '11px': 'var(--font-size-xs)',
  '12px': 'var(--font-size-sm)',
  '13px': 'var(--font-size-md)',
  '14px': 'var(--font-size-lg)',
  '15px': 'var(--font-size-xl)',
};

// CSS property form: "font-size: 12px" or "font-size:12px"
// Inline style form: "font-size:12px" inside template literal strings
const CSS_RE   = /\bfont-size\s*:\s*(\d+px)\b/g;

const SKIP = [
  /^tokens\//,
  /^scripts\//,
  /^js\/freshds\.js$/,
];

function walk(dir, cb) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

const SCAN = ['components', 'styles'].map(d => path.join(ROOT, d));
const EXTS = new Set(['.css', '.js']);

let changed = 0, skipped = [];

for (const dir of SCAN) {
  if (!fs.existsSync(dir)) continue;
  walk(dir, file => {
    if (!EXTS.has(path.extname(file))) return;
    const rel = path.relative(ROOT, file);
    if (SKIP.some(p => p.test(rel))) return;

    const src = fs.readFileSync(file, 'utf8');
    const out = src.replace(CSS_RE, (match, px) => {
      const token = MAP[px];
      if (!token) { skipped.push(`${rel}: ${match}`); return match; }
      return match.replace(px, token);
    });

    if (out !== src) {
      fs.writeFileSync(file, out, 'utf8');
      const count = (src.match(CSS_RE) || []).length;
      console.log(`  updated  ${rel}  (${count} replacement${count !== 1 ? 's' : ''})`);
      changed++;
    }
  });
}

console.log(`\n✓ ${changed} file(s) updated.`);
if (skipped.length) {
  console.log(`\nUnmapped sizes (manual review needed):`);
  skipped.forEach(s => console.log('  ' + s));
}
