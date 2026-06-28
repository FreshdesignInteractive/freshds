<!-- CC: use standard context only -->
# FreshDS, Claude Code Context

## Project
AI-native enterprise DS by Freshdesign. Uses OKLCH perceptual color scaling.

## Color architecture

### What JS owns
The JS engine (`freshds.js`) computes and writes to `:root`:
- `--scale-1..12`, neutral scale (Oklab interpolation between dark/light anchors). Step 1 = lightest, step 12 = darkest.
- `--primary-1..12`, `--secondary-1..12`, brand scales (OKLCH, step 9 = input hex)
- `--success/warning/danger/info-1..12`, status scales
- `--color-page-bg`, user-defined **absolute** page/navbar background. Default `#ffffff`. Never derived from the scale, changing the Light anchor does NOT affect this.
- `--color-input-surface`, user-defined **absolute** form control fill. Default `#ffffff`. Same rule.

These are the only values JS writes. Everything else is CSS.

### Data visualization color tokens (fixed palette)
`tokens/dataviz.css` defines a separate, **non-configurable** 8-color palette for charts and data display components. These tokens are hardcoded hex values, they do NOT derive from brand scales and are **not exposed in the Configurator**.

| Token prefix | Role | Use for |
|---|---|---|
| `--dv-{n}` | Primary fill | Bars, lines, dots, pie slices |
| `--dv-{n}-subtle` | Subtle fill | Area fills, row highlights, backgrounds |
| `--dv-{n}-label` | Label text | Annotations on top of subtle fills |

Series: `--dv-1` Indigo → `--dv-2` Tangerine → `--dv-3` Teal → `--dv-4` Plum → `--dv-5` Marigold → `--dv-6` Violet → `--dv-7` Fern → `--dv-8` Driftwood. Assign by series order, starting at `--dv-1`.

Light mode values defined on `:root`, dark mode overrides on `[data-mode="dark"]`, all in `tokens/dataviz.css`. Never add `--dv-*` tokens to the Configurator UI. Never let customers override them.

### What CSS owns
`tokens/theme.css` maps raw scale steps to semantic tokens:
- Light mode on `:root`, e.g. `--surface-bg: var(--color-page-bg)`
- Dark mode on `[data-mode="dark"]`, e.g. `--surface-bg: var(--scale-12)`

`[data-mode="dark"]` is set on `#app`. Any element with that attribute (including scoped preview containers) inherits all dark mode overrides.

### Rule: JS never sets semantic tokens
JS only sets raw scale steps and the two user-defined primitives (`--color-page-bg`, `--color-input-surface`). It never directly sets `--surface-bg`, `--text-primary`, `--color-interactive`, or any other Tier 2/3 token. CSS cascade and `theme.css` own all semantic mappings.

### Surface token hierarchy
| Token | Light mode | Dark mode | Use for |
|---|---|---|---|
| `--surface-bg` | `--color-page-bg` | `--scale-12` | Page background, navbar |
| `--surface-canvas` | `--scale-0` | `--scale-10` | Cards, panels, elevated surfaces |
| `--surface-input` | `--color-input-surface` | `--scale-11` | Form controls |
| `--surface-subtle` | `--scale-2` | `--scale-11` | Hover tints, section backgrounds |
| `--surface-overlay` | `--scale-3` | `--scale-9` | Dropdowns, modals |
| `--surface-border` | `--scale-4` | `--scale-8` | Default borders |
| `--surface-border-strong` | `--scale-5` | `--scale-7` | Emphasized borders |

### Dark mode token rules
- All dark mode overrides live in the `[data-mode="dark"]` block in `theme.css`, never in component files or JS.
- When adding a new semantic token, always add both the light-mode (`:root`) and dark-mode (`[data-mode="dark"]`) values in the same commit.
- Status main colors in dark mode use step 6 (L≈0.82, lighter than input, vivid on dark bg). Subtle uses step 12 (L≈0.15, very dark tinted fill). Border uses step 11 (L≈0.34, mid-tone). Text uses step 5 (L≈0.85) for success/danger/info; step 4 (L≈0.88) for warning to prevent yellow/amber washing out at high lightness.
- `--color-accent-text` dark = `var(--secondary-4)`.

**No hardcoded values anywhere — ever.** Every color, size, spacing, radius, shadow, and font value must reference a CSS custom property. The only permitted raw values are in `tokens/primitives.css` and `freshds.js`.

### Permitted exceptions
These are the only cases where `rgba(0,0,0,x)` / `rgba(255,255,255,x)` raw values are allowed outside `primitives.css`:
- **Box-shadows**, elevation shadows use `rgba(0,0,0,x)` because shadows are always dark regardless of theme.
- **Backdrop scrims**, modal/drawer overlays use `rgba(0,0,0,0.4–0.5)`, intentionally theme-neutral.
- **Frosted overlay UI**, the configurator's color-picker chevron pill and scale-chip step number badge use semi-transparent black/white to stay readable on any chip color. These are docs-only effects, not DS components.

Avatar identity colors use `--dv-1` through `--dv-8` (the data viz palette), not brand scale steps. These are fixed across all customer themes so each user always gets the same color. Do not change them back to brand scale steps.

### Component tokens added
- `--tooltip-bg` / `--tooltip-text`, inverted tooltip surface. Light mode: near-black bg / white text. Dark mode: near-white bg / near-black text.

## JS file ownership, non-negotiable

| File | Ships with DS? | Owns |
|---|---|---|
| `js/freshds.js` | **Yes**, in every export | Color math, `generateScale`, `generateNeutralScale`, `applyScalesToElement`, `loadFont`, `applyFont`, `SANS_FONTS`/`MONO_FONTS` |
| `js/freshds-site.js` | **No**, site only | Everything else: `ds` state, `SYSTEM_THEMES`, configurator UI, theme persistence, navigation, search, export functions, `toggleMode`, `pushToRoot` |

### Rules
- **Core (`freshds.js`)**: Pure functions only. No reference to `ds`, `SYSTEM_THEMES`, or any DOM element except `:root`/`<head>` (for font injection). No site-specific logic ever goes here.
- **Site (`freshds-site.js`)**: All application-layer code, configurator, theme management, navigation, search, dark mode toggle, export. If it references `ds` or the site DOM, it belongs here.
- All three HTML pages (`index.html`, `configurator.html`, `patterns.html`) load both scripts in order: core first, then site.
- The developer bundle export (`exportDeveloperBundle`) includes `js/freshds.js` but **never** `js/freshds-site.js`.
- The full site export (`exportDSSite`) includes both.
- The SDK export (`exportSDK`) is the primary customer download. See SDK assembly rules below.
- **New site features** (search, nav, configurator UI, pattern library logic) always go in `freshds-site.js`.
- **New DS engine capabilities** (new scale generators, new CSS variable utilities) always go in `freshds.js`.

## Stack
- Fonts: Inter + JetBrains Mono (Google Fonts, SIL OFL)
- Icons: Tabler Icons CDN · <i class="ti ti-{name}"></i>
- Dark mode: data-mode="dark" on #app
- No build server · file:// · no ES modules

## Rules, non-negotiable
0. **No page-level overrides on templates or components.** Never override layout, spacing, padding, or component behaviour with inline styles or page-scoped CSS rules. If something looks wrong on a page, fix it in the shared stylesheet (`dashboard.css`, `onboarding.css`, etc.) or in the component itself. A page-level `<style>` block is only for page-specific structural rules (e.g. a unique layout unique to that one pattern), never for correcting something that should work globally.
1. **No em dashes, ever.** Never write `—` (U+2014) anywhere in FreshDS site or app: not in titles, labels, descriptions, panel headers, tooltips, or copy. Use a comma, colon, or period instead. In `<title>` tags use ` | ` as the separator. This applies to all HTML, JS strings, and CSS content values across the entire project.
2. **Always use DS components.** Any UI element that has a matching web component (`<fresh-*>`) must use it, never raw HTML equivalents.
2. **No component? Ask first.** If a needed component doesn't exist in the DS, stop and ask before building raw HTML or a workaround.
3. **DS tokens only.** Every color, size, spacing, radius, shadow, and font value must reference a CSS custom property. The only permitted raw values are in `tokens/primitives.css` and `freshds.js`. Never hardcode hex, px sizes outside those files, or any value that belongs in a token.
4. **Dark mode is always required.** Every new element, section, or component must be designed for both light and dark mode simultaneously. Semantic tokens (`--surface-*`, `--text-*`, `--color-*`, etc.) handle this automatically when used correctly. Verify both modes before considering anything done.
5. **Responsive is always required.** Every pattern and layout must work at all viewport sizes. Use the DS breakpoints (`--bp-sm` 480px, `--bp-md` 768px, `--bp-lg` 1024px). For auth/full-bleed layouts, the left image panel hides at ≤767px and the form takes full width.
6. **Use the DS grid system for page-level layouts.** Whenever building a multi-column page layout, use `.fds-container` + `.fds-grid` + `.fds-col-{n}`, never roll a custom `display: grid` for page-level composition. Exception: full-bleed layouts (e.g. auth split) where `fds-container` max-width would conflict with edge-to-edge image panels, use flex/grid with DS tokens directly. Component-internal and card-nested grids may also use custom CSS. Responsive column variants: `.fds-col-sm-{n}`, `.fds-col-md-{n}`, `.fds-col-lg-{n}`.

## Pattern library pages, non-negotiable rules

Pattern pages live in `patterns.html`. Every pattern is a real working layout built entirely from DS components and tokens.

### The reference image rule
Reference screenshots (Figma, other products, mockups) show the **intent** of a pattern, layout, hierarchy, content, not the implementation. They will not use FreshDS components. **Do not replicate the visual style of the reference; translate the pattern into FreshDS.**

That means:
- If the reference shows a custom button → use `<fresh-button>`
- If it shows a custom input → use `<fresh-input>`
- If it shows a badge/tag/chip → use `<fresh-badge>`
- If it shows a table → use `<fresh-data-table>`
- If it shows a card → use `<fresh-media-card>` or a `config-card`-style surface with DS tokens
- If it shows a stat number → use `<fresh-stat-card>`
- Match layout, spacing, and hierarchy using DS tokens and the grid system

### Before building a pattern, always check
1. List every UI element in the reference that needs a component.
2. Confirm each has a matching `<fresh-*>` component.
3. If any element has **no DS equivalent**, stop and flag it, do not substitute raw HTML. Ask whether to build the component first or skip that element.

### What counts as a missing component
- A UI element that cannot be reasonably composed from existing components + layout + tokens
- Do NOT flag standard layout structure (a two-column layout is not a missing component, use the grid)
- Do NOT flag text, headings, labels, those are raw HTML with DS token styles, always allowed

### Filter & Search pattern: mobile responsive behavior

The `cnt-filter-layout` / `cnt-filter-sidebar` pattern collapses badly on mobile (sidebar takes full width, results disappear). Every filter page MUST implement the mobile drawer pattern:

**On mobile (`max-width: 767px`):**
- The filter sidebar becomes a `position: fixed` left drawer (280px wide, `transform: translateX(-100%)` when closed)
- A FAB chip button appears in a thin strip below the search bar (or below the page header if there is no search bar), showing the active filter count
- Clicking the FAB opens the drawer; a dark backdrop covers the rest of the screen
- Results take full width because the sidebar is out of the normal flow

**Required CSS additions to the page `<style>` block** (these override `content.css` at `max-width: 767px`):
```css
.cf-filter-fab-row { display: none; align-items: center; padding: var(--space-2) var(--space-4); border-bottom: 1px solid var(--surface-border); background: var(--surface-canvas); flex-shrink: 0; }
.cf-filter-fab-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px var(--space-3); border: 1px solid var(--surface-border); border-radius: var(--radius-full); background: var(--surface-canvas); color: var(--text-secondary); font-size: var(--font-size-sm); font-weight: 500; font-family: var(--font-sans); cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.08); transition: background 150ms, color 150ms; }
.cf-filter-fab-badge { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: var(--color-interactive); color: #fff; font-size: 10px; font-weight: 700; }
.cf-filter-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 150; }
.cf-filter-backdrop.open { display: block; }
.cf-filter-drawer-hdr { display: none; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--surface-border); background: var(--surface-canvas); flex-shrink: 0; }
.cf-filter-drawer-hdr-title { font-size: var(--font-size-md); font-weight: 600; color: var(--text-primary); }
.cf-filter-drawer-hdr-close { width: 28px; height: 28px; border: none; border-radius: var(--radius-md); background: transparent; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: background 150ms; }

@media (max-width: 767px) {
  .cf-filter-fab-row { display: flex; }
  .cf-filter-drawer-hdr { display: flex; }
  .cnt-filter-sidebar {
    position: fixed !important; top: 0; left: 0; bottom: 0;
    width: 280px !important; padding: 0 !important;
    display: flex !important; flex-direction: column;
    border-right: 1px solid var(--surface-border) !important; border-bottom: none !important;
    transform: translateX(-100%); transition: transform 260ms cubic-bezier(0.4,0,0.2,1);
    z-index: 160; box-shadow: 4px 0 20px rgba(0,0,0,0.12);
  }
  .cnt-filter-sidebar.mobile-open { transform: translateX(0); }
  .cf-filter-drawer-body { flex: 1; overflow-y: auto; padding: var(--space-4); }
  .cnt-filter-layout { flex-direction: row !important; }
}
```

**Required HTML additions:**
```html
<!-- FAB: place between search strip and cnt-filter-layout -->
<div class="cf-filter-fab-row" id="cf-filter-fab-row">
  <button class="cf-filter-fab-btn" onclick="openFilterDrawer()">
    <i class="ti ti-adjustments-horizontal"></i>
    Filters
    <span class="cf-filter-fab-badge">{activeCount}</span>
  </button>
</div>

<!-- Inside .cnt-filter-sidebar, as first child: -->
<div class="cf-filter-drawer-hdr">
  <span class="cf-filter-drawer-hdr-title">Filters</span>
  <button class="cf-filter-drawer-hdr-close" onclick="closeFilterDrawer()"><i class="ti ti-x"></i></button>
</div>
<div class="cf-filter-drawer-body">
  <!-- all cnt-filter-group elements go here -->
</div>

<!-- Backdrop: outside #app, before spec panel -->
<div class="cf-filter-backdrop" id="cf-filter-backdrop" onclick="closeFilterDrawer()"></div>
```

**Required JS:**
```js
function openFilterDrawer() {
  document.getElementById('cf-filter-sidebar').classList.add('mobile-open');
  document.getElementById('cf-filter-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeFilterDrawer() {
  document.getElementById('cf-filter-sidebar').classList.remove('mobile-open');
  document.getElementById('cf-filter-backdrop').classList.remove('open');
  document.body.style.overflow = '';
}
// Escape handler must call all four: _closeFlyout(); _closeTabDrop(); closeFilterDrawer(); spClose(); spCloseModal();
```

### Nav config integration — applies to ALL non-auth pattern pages (non-negotiable)

Every pattern page that shows a logged-in app shell MUST reflect the navigation model the user configured in `navigation.html`. This includes every section: dashboards, onboarding wizards, content, settings, collab, commerce, workflows, AI/chat, feedback — everything except auth pages.

**Auth pages are the only exception.** Auth pages (`auth-*.html`, login, signup, forgot-password, etc.) always show the logged-out navbar only. They never load nav-taxonomy or freshds-nav-apply.

**The 6 nav patterns a user can choose from:**
`persistent-sidebar`, `collapsible-sidebar`, `top-nav-tabs`, `hamburger-drawer`, `dual-level`, `command-palette`

Every non-auth pattern page must implement all 6 and switch between them in real time as the user changes their selection in `navigation.html`.

**Forbidden on any non-auth pattern page:**
- `<pattern-topbar>` / `pattern-topbar-v2.js`
- `<nav class="app-nav">` hardcoded sidebar
- Any hardcoded logo URLs or nav items

**How the system works:**
- User configures nav once in `navigation.html`; saved to `localStorage['freshds-nav-cfg']` as `{ nav_pattern, navbar_cfg, taxonomy }`
- `nav_pattern` values: `persistent-sidebar`, `collapsible-sidebar`, `top-nav-tabs`, `hamburger-drawer`, `dual-level`, `command-palette`
- `js/nav-taxonomy.js` provides: `DEFAULT_TAXONOMY`, `loadTaxonomy()`, `buildSidebarHtml(tax)`, `buildTabsJson(tax)`, `buildIconRailHtml(tax)`
- `js/freshds-nav-apply.js` reads `navbar_cfg` and applies logo + action icons to every `<fresh-navbar>` on the page automatically

**Required scripts** (load after all component JS):
```html
<script src="../js/nav-taxonomy.js"></script>
<script src="../js/freshds-nav-apply.js"></script>
```

**Required page CSS** (add to the page `<style>` block, replace `{p}` with page prefix):
```css
/* Logo dark/light switching */
.nav-logo-dark { display: none; }
[data-mode="dark"] .nav-logo-light { display: none; }
[data-mode="dark"] .nav-logo-dark  { display: block; }

/* Icon rail flyout (collapsible-sidebar collapsed state) */
.{p}-icon-flyout {
  position: fixed; left: 57px; top: 0; width: 200px;
  background: var(--surface-canvas); border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 28px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06);
  z-index: 90; display: none; overflow: hidden;
}
.{p}-icon-flyout.open { display: block; }
.{p}-flyout-label {
  padding: var(--space-2) var(--space-3) var(--space-1);
  font-size: var(--font-size-xs); font-weight: 600; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--text-tertiary);
  border-bottom: 1px solid var(--surface-border);
}
.{p}-flyout-item {
  display: flex; align-items: center; padding: 7px var(--space-3);
  font-size: var(--font-size-sm); font-family: var(--font-sans);
  color: var(--text-secondary); cursor: pointer;
  transition: background 100ms, color 100ms; -webkit-font-smoothing: antialiased;
}
.{p}-flyout-item:hover  { background: var(--surface-subtle); color: var(--text-primary); }
.{p}-flyout-item.active { background: var(--nav-active-bg); color: var(--nav-active-text); font-weight: 500; }

/* Tab strip (top-nav-tabs pattern) */
.{p}-tab-strip {
  background: var(--surface-nav); border-bottom: 1px solid var(--surface-border);
  padding: 0 var(--space-5); display: flex; align-items: center;
  height: 44px; flex-shrink: 0;
}
.{p}-tab-dropdown {
  position: fixed; top: 0; left: 0; min-width: 168px;
  background: var(--surface-canvas); border: 1px solid var(--surface-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 28px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06);
  z-index: 90; display: none; overflow: hidden; padding: var(--space-1) 0;
}
.{p}-tab-dropdown.open { display: block; }
.{p}-tab-drop-item {
  display: flex; align-items: center; padding: 7px var(--space-4);
  font-size: var(--font-size-sm); font-family: var(--font-sans);
  color: var(--text-secondary); cursor: pointer;
  transition: background 100ms, color 100ms; -webkit-font-smoothing: antialiased;
}
.{p}-tab-drop-item:hover  { background: var(--surface-subtle); color: var(--text-primary); }
.{p}-tab-drop-item.active { color: var(--nav-active-text); background: var(--nav-active-bg); font-weight: 500; }
```

**Required HTML shell** (replace `{p}` with a short page prefix, e.g. `cf` for content-filter, `dh` for dash-home):
```html
<div class="dash-shell">

  <fresh-navbar id="{p}-topbar" data-nav-logged-in search>
    <div slot="actions" data-nav-actions-logged-in></div>
  </fresh-navbar>

  <div id="{p}-tab-strip" class="{p}-tab-strip" style="display:none;">
    <fresh-topbar-menu id="{p}-top-tabs"></fresh-topbar-menu>
  </div>
  <div class="{p}-tab-dropdown" id="{p}-tab-dropdown"></div>

  <div class="dash-body">

    <fresh-sidebar id="{p}-sidebar" style="display:none;flex-shrink:0;height:100%;overflow:hidden;">
      <div id="{p}-nav-content"></div>
    </fresh-sidebar>

    <div class="{p}-icon-flyout" id="{p}-icon-flyout">
      <div class="{p}-flyout-label" id="{p}-flyout-label"></div>
      <div id="{p}-flyout-items"></div>
    </div>

    <main class="dash-main">
      <!-- page content here -->
    </main>

  </div>
</div>
```

**Required inline JS** (complete, copy verbatim, replace `{p}` throughout):
```js
var _currentPattern = 'persistent-sidebar';
var _flyoutIdx = -1;

function _readNavCfg() {
  var cfg = { nav_pattern: 'persistent-sidebar', taxonomy: [] };
  try { var s = localStorage.getItem('freshds-nav-cfg'); if (s) Object.assign(cfg, JSON.parse(s)); } catch(e) {}
  return cfg;
}

function _getTax(cfg) {
  return (Array.isArray(cfg.taxonomy) && cfg.taxonomy.length > 0)
    ? cfg.taxonomy
    : (typeof DEFAULT_TAXONOMY !== 'undefined' ? DEFAULT_TAXONOMY : []);
}

function _buildIconRail(tax) {
  var html = '<fresh-nav-group label="Nav" open>';
  tax.forEach(function(item, idx) {
    var ic = item.icon ? ' icon="' + item.icon + '"' : '';
    html += '<fresh-nav-item' + ic + (idx === 0 ? ' active' : '') +
            ' data-tax-idx="' + idx + '">' + (item.label || '') + '</fresh-nav-item>';
  });
  return html + '</fresh-nav-group>';
}

function _applyNavPattern() {
  var cfg  = _readNavCfg();
  var tax  = _getTax(cfg);
  _currentPattern = cfg.nav_pattern || 'persistent-sidebar';

  var navbar   = document.getElementById('{p}-topbar');
  var sidebar  = document.getElementById('{p}-sidebar');
  var tabStrip = document.getElementById('{p}-tab-strip');

  sidebar.style.display  = 'none';
  tabStrip.style.display = 'none';
  sidebar.removeAttribute('collapsed');
  navbar.removeAttribute('hamburger');
  _closeFlyout();
  document.getElementById('{p}-tab-dropdown').classList.remove('open');

  if (_currentPattern === 'persistent-sidebar') {
    sidebar.style.display = '';
    document.getElementById('{p}-nav-content').innerHTML = buildSidebarHtml(tax);
  } else if (_currentPattern === 'collapsible-sidebar') {
    sidebar.style.display = '';
    navbar.setAttribute('hamburger', '');
    document.getElementById('{p}-nav-content').innerHTML = buildSidebarHtml(tax);
  } else if (_currentPattern === 'top-nav-tabs') {
    tabStrip.style.display = '';
    var tabsEl = document.getElementById('{p}-top-tabs');
    tabsEl.setAttribute('tabs', buildTabsJson(tax));
    if (tax[0]) tabsEl.setAttribute('active', tax[0].id);
  }
}

function _closeFlyout() {
  _flyoutIdx = -1;
  document.getElementById('{p}-icon-flyout').classList.remove('open');
}

function _openFlyout(idx, anchorEl) {
  var cfg     = _readNavCfg();
  var tax     = _getTax(cfg);
  var section = tax[idx];
  var kids    = (section && section.children) || [];
  if (!kids.length) { _closeFlyout(); return; }
  _flyoutIdx = idx;
  document.getElementById('{p}-flyout-label').textContent = section.label || '';
  document.getElementById('{p}-flyout-items').innerHTML = kids.map(function(child, ci) {
    return '<div class="{p}-flyout-item' + (ci === 0 ? ' active' : '') + '">' + (child.label || '') + '</div>';
  }).join('');
  var rect   = anchorEl.getBoundingClientRect();
  var flyout = document.getElementById('{p}-icon-flyout');
  flyout.style.top = rect.top + 'px';
  flyout.classList.add('open');
  requestAnimationFrame(function() {
    var fh = flyout.offsetHeight, vh = window.innerHeight;
    if (rect.top + fh > vh - 8) flyout.style.top = Math.max(8, vh - fh - 8) + 'px';
  });
}

var _tabDropKey = null, _tabPrevActive = '', _tabClickX = 0;

function _closeTabDrop() {
  _tabDropKey = null;
  document.getElementById('{p}-tab-dropdown').classList.remove('open');
}

function _openTabDrop(key, x) {
  var cfg  = _readNavCfg();
  var tax  = _getTax(cfg);
  var item = null;
  for (var i = 0; i < tax.length; i++) { if (tax[i].id === key) { item = tax[i]; break; } }
  var kids = (item && item.children) || [];
  if (!kids.length) { _closeTabDrop(); return; }
  _tabDropKey = key;
  var drop     = document.getElementById('{p}-tab-dropdown');
  var stripBot = document.getElementById('{p}-tab-strip').getBoundingClientRect().bottom;
  drop.innerHTML = kids.map(function(child, ci) {
    return '<div class="{p}-tab-drop-item' + (ci === 0 ? ' active' : '') + '">' + (child.label || '') + '</div>';
  }).join('');
  drop.style.top = stripBot + 'px';
  drop.style.left = '0';
  drop.classList.add('open');
  requestAnimationFrame(function() {
    var w = drop.offsetWidth, vw = window.innerWidth;
    drop.style.left = Math.max(8, Math.min(x - w / 2, vw - w - 8)) + 'px';
  });
}

document.addEventListener('DOMContentLoaded', function() {
  _applyNavPattern();
  if (window.FreshNavApply) window.FreshNavApply.apply();

  /* Hamburger toggle */
  document.getElementById('{p}-topbar').addEventListener('hamburger-click', function() {
    if (_currentPattern !== 'collapsible-sidebar') return;
    var sb  = document.getElementById('{p}-sidebar');
    var tax = _getTax(_readNavCfg());
    if (sb.hasAttribute('collapsed')) {
      sb.removeAttribute('collapsed');
      document.getElementById('{p}-nav-content').innerHTML = buildSidebarHtml(tax);
      _closeFlyout();
    } else {
      sb.setAttribute('collapsed', '');
      document.getElementById('{p}-nav-content').innerHTML = _buildIconRail(tax);
    }
  });

  /* Icon rail click: open flyout */
  document.getElementById('{p}-nav-content').addEventListener('nav-click', function(e) {
    if (_currentPattern !== 'collapsible-sidebar') return;
    var sb = document.getElementById('{p}-sidebar');
    if (!sb.hasAttribute('collapsed')) return;
    var item = e.target;
    if (!item || item.tagName.toLowerCase() !== 'fresh-nav-item') return;
    var idx = parseInt(item.dataset.taxIdx, 10);
    if (isNaN(idx)) return;
    Array.prototype.slice.call(document.querySelectorAll('#{p}-nav-content fresh-nav-item'))
      .forEach(function(el, i) { if (i === idx) el.setAttribute('active', ''); else el.removeAttribute('active'); });
    if (idx === _flyoutIdx) { _closeFlyout(); return; }
    _openFlyout(idx, item);
  });
  document.getElementById('{p}-nav-content').addEventListener('click', function(e) { e.stopPropagation(); });
  document.getElementById('{p}-icon-flyout').addEventListener('click', function(e) { e.stopPropagation(); });

  /* Tab strip: mousedown captures clientX BEFORE _select() rebuilds shadow DOM.
     WHY: fresh-topbar-menu._select() is called inside the shadow DOM button's click
     listener, which fires BEFORE the outer click listener. _select() calls
     setAttribute('active', key) → attributeChangedCallback → _render() which does
     shadowRoot.innerHTML = ... destroying all old buttons. By the time the outer
     click listener fires, the shadow DOM has new elements whose layout may not yet
     be flushed, making getBoundingClientRect() unreliable. e.clientX on the click
     event can also return 0 in this context. mousedown fires before _select() is
     ever called, so e.clientX is always the real mouse position.
     DO NOT change this to click-only or use shadowRoot.querySelector for positioning. */
  document.getElementById('{p}-top-tabs').addEventListener('mousedown', function(e) {
    _tabClickX = e.clientX;
  });
  document.getElementById('{p}-top-tabs').addEventListener('click', function(e) {
    if (_currentPattern !== 'top-nav-tabs') return;
    e.stopPropagation();
    var activeNow = this.getAttribute('active');
    if (activeNow !== _tabPrevActive) {
      _tabPrevActive = activeNow;
      _openTabDrop(activeNow, _tabClickX);
    } else {
      if (_tabDropKey === activeNow) _closeTabDrop();
      else _openTabDrop(activeNow, _tabClickX);
    }
  });
  document.getElementById('{p}-tab-dropdown').addEventListener('click', function(e) { e.stopPropagation(); });

  document.addEventListener('click', function() { _closeFlyout(); _closeTabDrop(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { _closeFlyout(); _closeTabDrop(); spClose(); spCloseModal(); }
  });
});

/* Live sync: picks up changes from navigation.html in real time */
window.addEventListener('storage', function(e) {
  if (e.key !== 'freshds-nav-cfg') return;
  _applyNavPattern();
  if (window.FreshNavApply) window.FreshNavApply.apply();
});

var _lastNavCfgStr = null;
(function _poll() {
  var s = localStorage.getItem('freshds-nav-cfg') || '';
  if (s !== _lastNavCfgStr) {
    _lastNavCfgStr = s;
    _applyNavPattern();
    if (window.FreshNavApply) window.FreshNavApply.apply();
  }
  setTimeout(_poll, 400);
}());

window.addEventListener('pageshow', function(e) {
  if (e.persisted) {
    _applyNavPattern();
    if (window.FreshNavApply) window.FreshNavApply.apply();
  }
});
```

### Pages patterns: spec panel + copy prompt (non-negotiable)

Every Pages pattern MUST include a Configure panel (spec panel) with zone toggles and editable AI rules, plus a Copy prompt modal. This is what the "Configure" button in the demo bar opens. See `patterns/dash-home.html` and `patterns/content-filter.html` as working references.

**Add to the demo bar** (after the dark mode button, before the separator and collapse button):
```html
<div class="demo-sep"></div>
<button class="demo-spec-btn" onclick="spOpen()" aria-label="Configure pattern">
  <i class="ti ti-layout-sidebar-right"></i> Configure
</button>
```

**Add to the page `<style>` block** (hardcoded dark values — spec panel is intentionally theme-independent):
```css
.demo-spec-btn { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 4px; border: none; border-radius: var(--radius-full); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 150ms, color 150ms; -webkit-font-smoothing: antialiased; }
.demo-spec-btn:hover { background: var(--surface-subtle); color: var(--text-primary); }
.demo-spec-btn i { font-size: 13px; }
.sp-panel { position: fixed; top: 0; right: -340px; width: 320px; height: 100vh; display: flex; flex-direction: column; background: #141720; border-left: 1px solid #242836; z-index: 300; transition: right 280ms cubic-bezier(0.4,0,0.2,1); font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif; -webkit-font-smoothing: antialiased; color: #e8ecf4; font-size: 13px; }
.sp-panel.open { right: 0; }
.sp-hdr { display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 52px; border-bottom: 1px solid #242836; flex-shrink: 0; background: #0f1219; }
.sp-hdr-title { font-size: 13px; font-weight: 600; color: #e8ecf4; letter-spacing: -0.01em; }
.sp-hdr-close { width: 28px; height: 28px; border: none; border-radius: 6px; background: transparent; color: #6b7591; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; transition: background 150ms, color 150ms; }
.sp-hdr-close:hover { background: #1e2333; color: #e8ecf4; }
.sp-body { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #2a3049 transparent; }
.sp-body::-webkit-scrollbar { width: 4px; } .sp-body::-webkit-scrollbar-thumb { background: #2a3049; border-radius: 4px; }
.sp-section { padding: 14px 0 4px; } .sp-section + .sp-section { border-top: 1px solid #1c2030; padding-top: 16px; }
.sp-section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.09em; color: #7282a8; padding: 0 16px 8px; }
.sp-zone-row { display: flex; align-items: center; gap: 10px; padding: 7px 16px; transition: background 120ms; }
.sp-zone-row:hover { background: #1a1f30; }
.sp-zone-label { flex: 1; font-size: 12px; font-weight: 500; color: #b0bace; }
.sp-toggle { position: relative; width: 32px; height: 18px; flex-shrink: 0; }
.sp-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
.sp-toggle-track { position: absolute; inset: 0; background: #2a3049; border-radius: 9px; transition: background 200ms; cursor: pointer; }
.sp-toggle input:checked + .sp-toggle-track { background: #6c63ff; }
.sp-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: transform 200ms; pointer-events: none; }
.sp-toggle input:checked ~ .sp-toggle-thumb { transform: translateX(14px); }
.sp-rules-hdr { display: flex; align-items: center; gap: 8px; margin: 0 12px 4px; padding: 8px 12px; background: #1a1f30; border-radius: 8px; }
.sp-rules-hdr-icon { font-size: 13px; color: #6c63ff; flex-shrink: 0; }
.sp-rules-hdr-name { flex: 1; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #8b95b4; }
.sp-rules-hdr-hint { font-size: 10px; font-weight: 500; color: #6c63ff; }
.sp-cat { padding: 10px 16px 4px; }
.sp-cat-label { font-size: 10px; font-weight: 700; letter-spacing: 0.07em; color: #7282a8; margin-bottom: 6px; }
.sp-rule { display: flex; align-items: flex-start; gap: 8px; padding: 4px 6px; margin: 0 -6px; border-radius: 5px; transition: background 120ms; }
.sp-rule:hover { background: #1c2134; } .sp-rule:focus-within { background: rgba(140,130,255,0.18); }
.sp-rule-dot { width: 5px; height: 5px; border-radius: 50%; background: #6c63ff; flex-shrink: 0; margin-top: 7px; }
.sp-rule-text { flex: 1; font-size: 12px; line-height: 1.6; color: #b0bace; outline: none; word-break: break-word; min-width: 0; cursor: text; }
.sp-rule-text:focus { color: #e8ecf4; }
.sp-rule-del { width: 22px; height: 22px; border: none; border-radius: 4px; background: transparent; color: #8890c0; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; opacity: 0.45; flex-shrink: 0; margin-top: 2px; transition: opacity 150ms, background 150ms, color 150ms; }
.sp-rule:hover .sp-rule-del { opacity: 1; } .sp-rule-del:hover { background: rgba(255,80,100,0.18); color: #ff6080; }
.sp-add-rule { display: inline-flex; align-items: center; gap: 5px; margin-top: 4px; padding: 3px 0; font-size: 11px; color: #6272a0; cursor: pointer; border: none; background: transparent; font-family: inherit; transition: color 150ms; }
.sp-add-rule:hover { color: #9490ff; }
.sp-bottom { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border-top: 1px solid #242836; background: #0f1219; flex-shrink: 0; }
.sp-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: 6px; border: 1px solid #242836; background: #1a1f30; color: #9aa3be; font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer; white-space: nowrap; transition: background 150ms, color 150ms, border-color 150ms; }
.sp-btn i { font-size: 12px; } .sp-btn:hover { background: #1e2438; color: #e8ecf4; border-color: #3a4160; }
.sp-btn-icon { width: 34px; height: 34px; padding: 0; justify-content: center; flex-shrink: 0; }
.sp-btn-primary { margin-left: auto; background: #6c63ff; border-color: #6c63ff; color: #ffffff; }
.sp-btn-primary:hover { background: #7b74ff; border-color: #7b74ff; }
.sp-modal-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 400; align-items: center; justify-content: center; }
.sp-modal-backdrop.open { display: flex; }
.sp-modal { background: #141720; border: 1px solid #242836; border-radius: 12px; width: 600px; max-width: calc(100vw - 40px); max-height: 80vh; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif; }
.sp-modal-hdr { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #242836; font-size: 13px; font-weight: 600; color: #e8ecf4; flex-shrink: 0; }
.sp-modal-close { width: 26px; height: 26px; border: none; border-radius: 5px; background: transparent; color: #6b7591; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: background 150ms, color 150ms; }
.sp-modal-close:hover { background: #1e2333; color: #e8ecf4; }
.sp-modal-body { flex: 1; overflow-y: auto; padding: 14px 16px; min-height: 220px; }
.sp-modal-pre { background: #0f1219; border: 1px solid #242836; border-radius: 8px; padding: 14px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; line-height: 1.65; color: #9aa3be; white-space: pre-wrap; word-break: break-word; margin: 0; }
.sp-modal-foot { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 10px 12px; border-top: 1px solid #242836; flex-shrink: 0; }
.sp-copy-ok { font-size: 12px; color: #6c63ff; opacity: 0; transition: opacity 200ms; }
.sp-copy-ok.show { opacity: 1; }
```

**Add this HTML** outside `#app`, just before the first `<script src=...>` tag:
```html
<aside class="sp-panel" id="sp-panel" aria-label="Pattern spec" aria-hidden="true">
  <div class="sp-hdr">
    <span class="sp-hdr-title">Configure</span>
    <button class="sp-hdr-close" onclick="spClose()" aria-label="Close"><i class="ti ti-x"></i></button>
  </div>
  <div class="sp-body">
    <div class="sp-section">
      <div class="sp-section-label">ZONES</div>
      <div id="sp-zones"></div>
    </div>
    <div class="sp-section">
      <div class="sp-section-label">GLOBAL TEMPLATE RULES</div>
      <div class="sp-rules-hdr">
        <i class="ti ti-sparkles sp-rules-hdr-icon"></i>
        <span class="sp-rules-hdr-name">AI RULES: {PAGE NAME}</span>
        <span class="sp-rules-hdr-hint">Click to edit</span>
      </div>
      <div id="sp-cats"></div>
    </div>
  </div>
  <div class="sp-bottom">
    <button class="sp-btn sp-btn-icon" id="sp-share-btn" onclick="spShare()" title="Share link" aria-label="Share link">
      <i class="ti ti-link"></i>
    </button>
    <button class="sp-btn sp-btn-primary" onclick="spStartBuilding()">
      Configure <i class="ti ti-arrow-right"></i>
    </button>
  </div>
</aside>

<div class="sp-modal-backdrop" id="sp-modal-backdrop" onclick="spCloseModal()">
  <div class="sp-modal" onclick="event.stopPropagation()">
    <div class="sp-modal-hdr">
      <span>Claude Code Prompt</span>
      <button class="sp-modal-close" onclick="spCloseModal()"><i class="ti ti-x"></i></button>
    </div>
    <div class="sp-modal-body"><pre class="sp-modal-pre" id="sp-modal-pre"></pre></div>
    <div class="sp-modal-foot">
      <span class="sp-copy-ok" id="sp-copy-ok">Copied to clipboard</span>
      <button class="sp-btn sp-btn-primary" onclick="spCopyPrompt()">
        <i class="ti ti-copy"></i> Copy prompt
      </button>
    </div>
  </div>
</div>
```

**Add zone IDs** to every major toggleable section of the page HTML:
```html
<div id="{p}-search-strip" class="...">...</div>
<div id="{p}-filter-sidebar" class="...">...</div>
<div id="{p}-results-card" class="...">...</div>
<div id="{p}-pagination-row" style="...">...</div>
```

**Add the spec JS** inside the existing `<script>` block, after the live-sync code:
```js
var SP_ZONES = [
  { key: 'zone-key', label: 'Display Label', el: '{p}-element-id', on: true },
  /* one entry per toggleable section */
];

var SP_RULES = {
  'LAYOUT': [ 'rule string', 'rule string' ],
  'SECTION NAME': [ 'rule string' ],
  /* one category per main content area */
};

function spOpen() {
  document.getElementById('sp-panel').classList.add('open');
  document.getElementById('sp-panel').setAttribute('aria-hidden', 'false');
  _spRenderZones(); _spRenderCats();
  var u = new URL(location.href); u.searchParams.set('spec', 'open');
  history.replaceState(null, '', u.toString());
}
function spClose() {
  document.getElementById('sp-panel').classList.remove('open');
  document.getElementById('sp-panel').setAttribute('aria-hidden', 'true');
  var u = new URL(location.href); u.searchParams.delete('spec');
  history.replaceState(null, '', u.toString());
}
function _spRenderZones() {
  var el = document.getElementById('sp-zones'); el.innerHTML = '';
  SP_ZONES.forEach(function(z) {
    var row = document.createElement('div'); row.className = 'sp-zone-row';
    row.innerHTML = '<span class="sp-zone-label">' + z.label + '</span>' +
      '<label class="sp-toggle"><input type="checkbox"' + (z.on ? ' checked' : '') + '>' +
      '<span class="sp-toggle-track"></span><span class="sp-toggle-thumb"></span></label>';
    row.querySelector('input').addEventListener('change', function() {
      z.on = this.checked;
      var t = document.getElementById(z.el); if (t) t.style.display = z.on ? '' : 'none';
    });
    el.appendChild(row);
  });
}
function _spRenderCats() {
  var el = document.getElementById('sp-cats'); el.innerHTML = '';
  Object.keys(SP_RULES).forEach(function(cat) {
    var wrap = document.createElement('div'); wrap.className = 'sp-cat';
    _spBuildCat(cat, wrap); el.appendChild(wrap);
  });
}
function _spBuildCat(cat, wrap) {
  wrap.innerHTML = '';
  var label = document.createElement('div'); label.className = 'sp-cat-label'; label.textContent = cat;
  wrap.appendChild(label);
  SP_RULES[cat].forEach(function(rule, ri) { wrap.appendChild(_spRuleRow(cat, ri, rule, wrap)); });
  var addBtn = document.createElement('button'); addBtn.className = 'sp-add-rule';
  addBtn.innerHTML = '<i class="ti ti-plus"></i> Add rule';
  addBtn.addEventListener('click', function() {
    SP_RULES[cat].push('New rule'); _spBuildCat(cat, wrap);
    var texts = wrap.querySelectorAll('.sp-rule-text'); var last = texts[texts.length - 1];
    if (last) { last.focus(); var r = document.createRange(); r.selectNodeContents(last); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
  });
  wrap.appendChild(addBtn);
}
function _spRuleRow(cat, ri, text, wrap) {
  var row = document.createElement('div'); row.className = 'sp-rule';
  var dot = document.createElement('span'); dot.className = 'sp-rule-dot';
  var span = document.createElement('span'); span.className = 'sp-rule-text';
  span.contentEditable = 'true'; span.textContent = text;
  span.addEventListener('input', function() { SP_RULES[cat][ri] = span.textContent; });
  var del = document.createElement('button'); del.className = 'sp-rule-del';
  del.innerHTML = '<i class="ti ti-trash"></i>'; del.setAttribute('aria-label', 'Delete rule');
  del.addEventListener('click', function() { SP_RULES[cat].splice(ri, 1); _spBuildCat(cat, wrap); });
  row.appendChild(dot); row.appendChild(span); row.appendChild(del); return row;
}
function spShare() {
  var u = new URL(location.href); u.searchParams.set('spec', 'open');
  var btn = document.getElementById('sp-share-btn');
  navigator.clipboard.writeText(u.toString()).then(function() {
    var orig = btn.innerHTML; btn.innerHTML = '<i class="ti ti-check"></i>';
    setTimeout(function() { btn.innerHTML = orig; }, 1800);
  }).catch(function() {});
}
function spStartBuilding() {
  var lines = ['Build a {Page Name} page using the FreshDS design system.', ''];
  Object.keys(SP_RULES).forEach(function(cat) {
    lines.push('## ' + cat);
    SP_RULES[cat].forEach(function(rule) { lines.push('- ' + rule); });
    lines.push('');
  });
  lines.push('## ACTIVE ZONES');
  SP_ZONES.forEach(function(z) { lines.push('- ' + z.label + ': ' + (z.on ? 'SHOWN' : 'HIDDEN')); });
  document.getElementById('sp-modal-pre').textContent = lines.join('\n');
  document.getElementById('sp-modal-backdrop').classList.add('open');
}
function spCloseModal() { document.getElementById('sp-modal-backdrop').classList.remove('open'); }
function spCopyPrompt() {
  navigator.clipboard.writeText(document.getElementById('sp-modal-pre').textContent).then(function() {
    var ok = document.getElementById('sp-copy-ok'); ok.classList.add('show');
    setTimeout(function() { ok.classList.remove('show'); }, 1800);
  }).catch(function() {});
}
if (new URL(location.href).searchParams.get('spec') === 'open') {
  document.addEventListener('DOMContentLoaded', spOpen);
}
```

**`SP_ZONES` guidelines:** one entry per major toggleable content section (not the nav itself). Each zone has a `key` (kebab), `label` (display), `el` (element ID in HTML), and `on: true`.

**`SP_RULES` guidelines:** one key per logical section of the page (always start with `'LAYOUT'`). Rules are plain-English strings describing how to build each section using FreshDS components. The first line of `spStartBuilding()` should name the actual page: `'Build a Home Dashboard page...'` / `'Build a Filter and Search page...'` etc.

## Component doc page format (index.html)

Every component page lives inside `<div class="fds-page" id="page-{name}">` in `index.html`. Use this exact structure, no custom classes, no invented markup.

### Shell
```html
<div class="fds-page" id="page-{name}">
  <div class="page-header">
    <div class="page-eyebrow">{Category}</div>   <!-- e.g. Core UI, Feedback, Navigation -->
    <h1 class="page-title">{Component name}</h1>
    <p class="page-desc">{One or two sentences: what it is and when to use it.}</p>
  </div>

  <!-- sections follow -->
</div>
```

### Section wrapper (every block)
```html
<div class="page-section">
  <div class="page-section-title">{Section name}</div>  <!-- rendered UPPERCASE automatically -->
  <!-- content -->
</div>
```

### Live demo box
```html
<div class="demo-surface">                          <!-- row, wraps, padding built in -->
  <fresh-component ...></fresh-component>
</div>

<div class="demo-surface col">                      <!-- column layout -->
  ...
</div>
```

### Standard section order
1. **Variants**, one `demo-surface` showing all visual variants side by side.
2. **Sizes**, `sm`, `md`, `lg` (only if the component has a size attribute).
3. **States**, default, disabled, loading, error, etc.
4. **All variants × all sizes**, grid: one row per size, all variants across (only for components with both variant + size axes).
5. **Attributes**, `usage-table` (see below).
6. **Events**, `usage-table` (only if the component fires custom events).
7. **Tokens**, `token-pill` chips (see below).

### Attributes / Events table (`usage-table`)
```html
<table class="usage-table">
  <thead>
    <tr><th>Attribute</th><th>Values</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>variant</td>
      <td><code>primary</code> <code>secondary</code> <code>ghost</code></td>
      <td><code>primary</code></td>
      <td>Visual intent of the action</td>
    </tr>
    <tr><td>disabled</td><td>boolean</td><td></td><td>Prevents interaction</td></tr>
  </tbody>
</table>
```
- Wrap each allowed value in `<code>`, they render as small pill chips.
- Use `` (em dash) for attributes with no default (boolean flags).
- Events table: columns are **Event · Detail · Description** (drop the Default column).

### Token chips
```html
<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">
  <span class="token-pill">
    <span class="token-dot" style="background:var(--btn-primary-bg)"></span>
    --btn-primary-bg
  </span>
  <!-- repeat for each token the component uses -->
</div>
```
- Set `background` on `token-dot` to the actual token so the colour swatch is live.
- For near-white tokens add `border:1px solid var(--surface-border)` to the dot so it's visible on a light background.

### Nav registration
After adding a page, also:
1. Add `<div class="nav-item" onclick="navigate('{name}')">Display name</div>` to the correct group in the left nav.
2. Add `<script src="components/{category}/{name}.js"></script>` near the bottom of `index.html` (and in `configurator.html` if the component is used in the live preview).

## Build status
All 60 components fully built (doc page + web component).

| Component | Status |
|-----------|--------|
| DS shell + Configurator | ✅ index.html |
| Foundation (all 4)      | ✅ index.html |
| Core UI (all 8)         | ✅ components/core/ |
| Feedback (all 8)        | ✅ components/feedback/ |
| Navigation (all 6)      | ✅ components/navigation/ |
| Simple tabs             | ✅ components/navigation/fresh-simple-tabs.js |
| Containers (all 6)      | ✅ components/containers/ |
| Media card              | ✅ components/containers/fresh-media-card.js |
| Avatar                  | ✅ components/data/fresh-avatar.js |
| Stat card               | ✅ components/data/fresh-stat-card.js |
| Data table              | ✅ components/data/fresh-data-table.js |
| Chart wrapper           | ✅ components/data/fresh-chart.js |
| Timeline                | ✅ components/data/fresh-timeline.js |
| Prompt input            | ✅ components/ai/fresh-prompt-input.js |
| AI response bubble      | ✅ components/ai/fresh-ai-response.js |
| Thinking indicator      | ✅ components/ai/fresh-thinking.js |
| Confidence badge        | ✅ components/ai/fresh-confidence-badge.js |
| Citation chip           | ✅ components/ai/fresh-citation-chip.js |
| Suggestion card         | ✅ components/ai/fresh-suggestion-card.js |
| Model selector          | ✅ components/ai/fresh-model-selector.js |
| Token meter             | ✅ components/ai/fresh-token-meter.js |
| Feedback row            | ✅ components/ai/fresh-feedback.js |
| Diff viewer             | ✅ components/ai/fresh-diff-viewer.js |
| Prompt history          | ✅ components/ai/fresh-prompt-history.js |
| AI mode toggle          | ✅ components/ai/fresh-ai-mode-toggle.js |

## SDK assembly rules

The SDK (`freshds-sdk.zip`) is the primary customer download. It is a local workspace, not a self-contained design system. The customer's DS (tokens, themes, component docs, patterns) lives on freshdesign.com. The SDK gives them the engine and scaffolding to build pages locally with AI tools.

### What goes in the SDK

The source of truth is `SDK_FILES` in `api/export.js`. It is an explicit whitelist — only listed files are zipped. When adding files to the SDK, add them to this list. Never rely on glob/wildcard inclusion.

**Always include:**
- `systems/tokens/` — all three token files (primitives, theme, dataviz)
- `systems/styles/reset.css`, `grid.css`, `components/core.css`
- `systems/styles/patterns/*.css` — ALL pattern stylesheets, every one. Customers download individual pattern HTML files as starting points; those files reference pattern CSS. If a new pattern category is added, its CSS must be added to `SDK_FILES` immediately.
- `systems/js/freshds.js` — the DS engine
- `systems/js/nav-taxonomy.js` + `freshds-nav-apply.js` — required by all pattern pages that use navigation
- All component JS files under `systems/components/` — every category (core, feedback, navigation, containers, data, ai)
- `readme.html` — standalone getting-started guide
- `projects/sample-project/welcome.html` — the pre-cleaned sample page
- `projects/sample-project/CLAUDE.md` — project-level instruction template

**Never include:**
- `systems/js/freshds-site.js` — site-only code, references internal DS state
- `api/` — serverless functions, not for local use
- `app/` — the FreshDS docs app pages
- `projects/patterns/` — pattern library pages are on freshdesign.com, not in the SDK
- Any file containing auth guards, demo bars, or spec panel markup (see stripping rule below)

### HTML stripping rule — non-negotiable

Every HTML file that enters the SDK zip must be stripped of site-only infrastructure. This applies to:
- The pre-built `projects/sample-project/welcome.html`
- Custom pattern files created for specific customers
- Any future pattern page added to `SDK_FILES`

`_stripSiteGuards()` in `api/export.js` handles this automatically for all HTML in the SDK export. It removes:
- `<script src="*auth-guard*">`, `<script src="*paid-guard*">`, `<script src="*cloud-sync*">`
- `<script src="*pattern-bar*">`
- `<div class="demo-bar">` and its contents
- `<aside class="sp-panel">` and its contents
- `<div class="sp-modal-backdrop">` and its contents
- `<link href="*spec-panel*">`

Do not bypass this. Do not manually pre-clean HTML files as a substitute — the stripping pass in `api/export.js` is the authoritative gate.

### Custom patterns (future)

When customers commission custom patterns, they follow the exact same rules as built-in patterns:
1. The pattern HTML lives in `projects/patterns/` on the site (never at SDK root)
2. The stripped version is what ships in the SDK — either as a replacement `sample-project/welcome.html` or as an additional file under `projects/sample-project/`
3. Add the file path to `SDK_FILES` in `api/export.js`
4. The pattern's CSS belongs in `systems/styles/patterns/` — create a new file if it's a new category, or extend an existing one. Either way, ensure it's in `SDK_FILES`.
5. `_stripSiteGuards()` will clean it automatically at export time — no manual stripping needed.

### CLAUDE.md files in the SDK

The SDK ships two CLAUDE.md files:
- `freshds-sdk/CLAUDE.md` — DS rules for builders (always use `<fresh-*>` components, token-only values, path conventions). This is a trimmed, builder-focused version of this file. Do not include site-maintenance or export rules here.
- `freshds-sdk/projects/sample-project/CLAUDE.md` — project context template. Short. Customers copy and edit it for each new project.

Both must be in `SDK_FILES`. When DS rules change (new components, deprecated tokens, new patterns), update both `CLAUDE.md` files in sync.