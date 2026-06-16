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
- **New site features** (search, nav, configurator UI, pattern library logic) always go in `freshds-site.js`.
- **New DS engine capabilities** (new scale generators, new CSS variable utilities) always go in `freshds.js`.

## Stack
- Fonts: Inter + JetBrains Mono (Google Fonts, SIL OFL)
- Icons: Tabler Icons CDN · <i class="ti ti-{name}"></i>
- Dark mode: data-mode="dark" on #app
- No build server · file:// · no ES modules

## Rules, non-negotiable
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