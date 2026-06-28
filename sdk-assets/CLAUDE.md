# FreshDS SDK — Rules for Claude Code

You are helping build a product UI using the FreshDS design system. These rules are non-negotiable.

## The one rule that matters most

**Never write raw HTML for anything FreshDS already covers.** No `<button>`, `<input>`, `<table>`, `<select>`, `<dialog>`, `<details>`, or custom modal/drawer/tooltip divs. Every one of those has a `<fresh-*>` equivalent. Use it.

## Component inventory

Every component is a standard web component. Use the tag name exactly as listed.

### Core inputs
| What you need | Use this |
|---|---|
| Button | `<fresh-button>` |
| Text / email / password input | `<fresh-input>` |
| Dropdown select | `<fresh-select>` |
| Checkbox | `<fresh-checkbox>` |
| Radio button | `<fresh-radio>` |
| Toggle switch | `<fresh-toggle>` |
| Slider | `<fresh-slider>` |
| Form field wrapper (label + error) | `<fresh-form-field>` |
| Button with dropdown | `<fresh-dropdown-button>` |

### Feedback & status
| What you need | Use this |
|---|---|
| Badge / tag / chip | `<fresh-badge>` |
| Alert / banner | `<fresh-alert>` |
| Toast notification | `<fresh-toast>` |
| Tooltip | `<fresh-tooltip>` |
| Progress bar | `<fresh-progress>` |
| Skeleton loader | `<fresh-skeleton>` |
| Spinner | `<fresh-spinner>` |
| Empty state | `<fresh-empty-state>` |

### Navigation
| What you need | Use this |
|---|---|
| Top navigation bar | `<fresh-navbar>` |
| Side navigation | `<fresh-sidebar>` |
| Tab strip | `<fresh-tabs>` |
| Simple tabs (no router) | `<fresh-simple-tabs>` |
| Top-level navigation menu | `<fresh-topbar-menu>` |
| Breadcrumb | `<fresh-breadcrumb>` |
| Pagination | `<fresh-pagination>` |
| Multi-step stepper | `<fresh-stepper>` |

### Containers & overlays
| What you need | Use this |
|---|---|
| Card | `<fresh-card>` |
| Media card (image + content) | `<fresh-media-card>` |
| Modal / dialog | `<fresh-modal>` |
| Drawer / side panel | `<fresh-drawer>` |
| Accordion / collapsible | `<fresh-accordion>` |
| Popover / flyout | `<fresh-popover>` |
| Data table | `<fresh-table>` |

### Data display
| What you need | Use this |
|---|---|
| Avatar | `<fresh-avatar>` |
| Stat / metric card | `<fresh-stat-card>` |
| Advanced data table | `<fresh-data-table>` |
| Chart | `<fresh-chart>` |
| Timeline | `<fresh-timeline>` |

### AI components
| What you need | Use this |
|---|---|
| Prompt / chat input | `<fresh-prompt-input>` |
| AI response bubble | `<fresh-ai-response>` |
| Thinking indicator | `<fresh-thinking>` |
| Confidence badge | `<fresh-confidence-badge>` |
| Citation chip | `<fresh-citation-chip>` |
| Suggestion card | `<fresh-suggestion-card>` |
| Model selector | `<fresh-model-selector>` |
| Token usage meter | `<fresh-token-meter>` |
| Feedback row (thumbs) | `<fresh-feedback>` |
| Diff viewer | `<fresh-diff-viewer>` |
| Prompt history | `<fresh-prompt-history>` |
| AI mode toggle | `<fresh-ai-mode-toggle>` |

## Token rules

Every color, spacing, size, radius, and shadow must use a CSS custom property. Never hardcode hex values, pixel sizes, or raw colors outside of `systems/tokens/`.

```css
/* Always */
color: var(--text-primary);
background: var(--surface-canvas);
padding: var(--space-4);
border-radius: var(--radius-md);

/* Never */
color: #1a1a1a;
background: white;
padding: 16px;
border-radius: 8px;
```

Key token groups: `--text-*`, `--surface-*`, `--color-*`, `--space-*`, `--radius-*`, `--font-size-*`, `--font-weight-*`.

## Path convention

All pages live in `projects/<project-name>/`. Scripts and styles are always referenced via:

```html
../../systems/tokens/primitives.css
../../systems/js/freshds.js
../../systems/components/core/fresh-button.js
```

Never use absolute paths or CDN URLs for DS files. Never change this depth — all project subfolders are exactly two levels from the SDK root.

## Dark mode

Always design for both light and dark simultaneously. Use semantic tokens (`--surface-*`, `--text-*`) — they switch automatically. Never use `prefers-color-scheme` media queries. Dark mode is toggled via `data-mode="dark"` on `#app`.

## Creating a new project

When the user asks to create a new project, always do these steps in order:

1. Create the folder `projects/<project-name>/`
2. Create `projects/<project-name>/CLAUDE.md` — copy the structure from `projects/sample-project/CLAUDE.md` and ask the user for the product name, description, and who the users are before writing it
3. Only then create any pages inside the folder

Never create a project folder without a `CLAUDE.md`. It is the context Claude needs to make good decisions for that project. A project without one will produce generic, disconnected output.

## Adding a new page

1. Go to freshdesign.com and download the pattern you want as a starting point
2. Drop the `.html` file into your project folder (`projects/<project-name>/`)
3. Tell Claude which file to work on and what to change
4. Open the result in a browser to preview — no build step needed

## How to open this SDK in Claude Code

**Always open the `freshds-sdk/` root folder** — not a project subfolder. Claude Code reads `CLAUDE.md` from the folder you open and all subfolders simultaneously. Opening the root means Claude loads both these DS rules and your project-specific context at the same time.
