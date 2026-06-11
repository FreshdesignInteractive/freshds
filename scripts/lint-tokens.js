#!/usr/bin/env node
/**
 * FreshDS Token Lint
 * Scans components/ and styles/ for hardcoded values that should be DS tokens.
 *
 * Usage:
 *   node scripts/lint-tokens.js           # scan all
 *
 * As a git pre-commit hook, add to .git/hooks/pre-commit:
 *   node scripts/lint-tokens.js || exit 1
 *
 * Three rule categories:
 *   hex-color   — raw hex (#rrggbb) used as a CSS value (not inside SVG paths in templates)
 *   font-size   — font-size set to a raw px value instead of var(--font-size-*)
 *   rgba-color  — rgba() used as a color fill (box-shadow/backdrop scrims are exempt)
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── Rules ───────────────────────────────────────────────────────────────────
const RULES = [
  {
    id:      'hex-color',
    // Match CSS property assignments using hex (not SVG fill/stroke attrs in strings)
    test(line) {
      // Skip if the hex appears only inside an SVG attribute string
      if (/(?:fill|stroke)=["']#[0-9a-fA-F]{3,8}["']/.test(line)) return false;
      // Skip if line is a string literal containing hex (template SVG path data)
      if (/^\s*['"`].*#[0-9a-fA-F]{3,8}.*['"`]/.test(line)) return false;
      // Flag if a CSS property value is a bare hex
      return /:\s*#[0-9a-fA-F]{3,8}\b/.test(line);
    },
    message: 'Hardcoded hex color — use a semantic token (tokens/theme.css) or primitive (tokens/primitives.css)',
  },
  {
    id:      'font-size-px',
    // font-size: <number>px  — must be var(--font-size-*)
    test(line) {
      return /font-size\s*:\s*\d+px/.test(line) && !/font-size\s*:\s*var\(/.test(line);
    },
    message: 'Hardcoded font-size — use var(--font-size-*) from tokens/primitives.css',
  },
  {
    id:      'rgba-color',
    // rgba() used as a fill/background/border/color — NOT for shadows or scrims
    test(line) {
      if (!line.includes('rgba(')) return false;
      // Permitted: box-shadow (elevation)
      if (/box-shadow.*rgba/.test(line)) return false;
      // Permitted: backdrop scrims (rgba(0,0,0,...) on background)
      if (/background(?:-color)?\s*:\s*rgba\(0\s*,\s*0\s*,\s*0/.test(line)) return false;
      // Permitted: frosted-overlay (rgba(255,255,255,...))
      if (/rgba\(255\s*,\s*255\s*,\s*255/.test(line)) return false;
      // Permitted: filter / drop-shadow / text-shadow
      if (/(?:filter|drop-shadow|text-shadow).*rgba/.test(line)) return false;
      // Permitted: very low-opacity textures (< 0.1) — stripe/grain effects
      if (/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.0/.test(line)) return false;
      // Permitted: frosted chip text (dark text on white frosted bg)
      if (/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[5-9]/.test(line)) return false;
      return true;
    },
    message: 'Hardcoded rgba() color — use a semantic token. (box-shadow, backdrop scrims, frosted overlays, textures are exempt)',
  },
];

// ── Files that are permitted to have raw values ─────────────────────────────
const SKIP_FILES = [
  /^tokens\//,        // primitives.css, theme.css, dataviz.css — source of truth
  /^js\/freshds\.js$/, // OKLCH engine — raw math by design
  /^scripts\//,       // this file
];

// ── Per-file, per-rule skips ─────────────────────────────────────────────────
// Patterns CSS and docs.css use page-level typography (16px–96px headings/body)
// that has no matching component token — they are layout/doc UI, not DS components.
const SKIP_RULE_FOR = {
  'font-size-px': [/^styles\/patterns\//, /^styles\/docs\.css$/],
};

// ── Per-line exemptions ─────────────────────────────────────────────────────
const LINE_EXEMPT = [
  /data-viz reference panel/i,      // comment marking the docs.css permitted block
  /Permitted exception/i,            // any comment that flags an explicit exception
  // docs.css dv-panel-light/dark — documented permitted exception (reference panels)
  /dv-panel(?:-light|-dark|-label|-swatch|-name|-hex)?/,
  /dv-bar-preview(?:-light|-dark|-label)?/,
  /@import url\(/,                   // CSS import strings
  /\/\//,                            // comment lines — don't flag comments
  /^\s*\*/,                          // block comment lines
];

// ── Walk helpers ────────────────────────────────────────────────────────────
function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

function relPath(full) { return path.relative(ROOT, full); }

function shouldSkip(rel) { return SKIP_FILES.some(p => p.test(rel)); }

function lineIsExempt(line) { return LINE_EXEMPT.some(r => r.test(line)); }

// ── Scan ────────────────────────────────────────────────────────────────────
const SCAN_DIRS = ['components', 'styles'].map(d => path.join(ROOT, d));
const EXTS      = new Set(['.css', '.js']);

let violations = [];

for (const dir of SCAN_DIRS) {
  if (!fs.existsSync(dir)) continue;
  walk(dir, (file) => {
    if (!EXTS.has(path.extname(file))) return;
    const rel = relPath(file);
    if (shouldSkip(rel)) return;

    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      if (lineIsExempt(line)) return;
      for (const rule of RULES) {
        const skipPatterns = SKIP_RULE_FOR[rule.id] || [];
        if (skipPatterns.some(p => p.test(rel))) continue;
        if (rule.test(line)) {
          violations.push({
            file:    rel,
            line:    idx + 1,
            content: line.trim(),
            rule:    rule.id,
            message: rule.message,
          });
        }
      }
    });
  });
}

// ── Report ──────────────────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log('✓ Token lint passed — no hardcoded values found.');
  process.exit(0);
}

// Group by file for readability
const byFile = {};
for (const v of violations) {
  (byFile[v.file] = byFile[v.file] || []).push(v);
}

console.error(`\n✗ Token lint: ${violations.length} violation(s) in ${Object.keys(byFile).length} file(s)\n`);
for (const [file, vs] of Object.entries(byFile)) {
  console.error(`  ${file}`);
  for (const v of vs) {
    console.error(`    line ${v.line}  [${v.rule}]`);
    console.error(`    ${v.content}`);
  }
  console.error('');
}
console.error(`Fix: replace hardcoded values with tokens from tokens/primitives.css or tokens/theme.css`);
process.exit(1);
