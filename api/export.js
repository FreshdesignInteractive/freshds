const { createClient } = require('@supabase/supabase-js');
const JSZip = require('jszip');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fvfveljfslfxcxrepfid.supabase.co';
// Publishable key — safe to embed, same value already in supabase-client.js
const SUPABASE_ANON_KEY = 'sb_publishable_Cyts4seRFYkwB7LR_mBzKw_glcS8BTe';

const DEFAULT_THEME = {
  primary: '#1f2328', secondary: '#6b7280',
  scaleDark: '#1f2328', scaleLight: '#ffffff',
  success: '#22c55e', warning: '#f59e0b', danger: '#f43f5e', info: '#3b82f6', aiAction: '#0d9488',
  pageBg: '#ffffff', inputSurface: '#ffffff',
  fontSans: 'Inter', fontMono: 'JetBrains Mono',
  density: 'default', mode: 'light',
  elev1: '3', elev2: '12', elev3: '24',
  radiusSm: '4', radiusMd: '8', radiusLg: '12', radiusXl: '20'
};

const DENSITY_PRESETS = {
  compact:     { 1:'3px', 2:'6px',  3:'10px', 4:'12px', 5:'16px', 6:'20px', 8:'28px', 10:'34px', 12:'42px' },
  default:     { 1:'4px', 2:'8px',  3:'12px', 4:'16px', 5:'20px', 6:'24px', 8:'32px', 10:'40px', 12:'48px' },
  comfortable: { 1:'5px', 2:'10px', 3:'15px', 4:'20px', 5:'26px', 6:'30px', 8:'42px', 10:'52px', 12:'62px' }
};

// ── Color math (ported from freshds.js, no DOM) ────────────────────────────
function _toLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function _toGamma(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
function _hexToLinearRGB(hex) {
  return [
    _toLinear(parseInt(hex.slice(1, 3), 16) / 255),
    _toLinear(parseInt(hex.slice(3, 5), 16) / 255),
    _toLinear(parseInt(hex.slice(5, 7), 16) / 255)
  ];
}
function _linearRGBToOklab(r, g, b) {
  var l_ = Math.cbrt(0.4122214708*r + 0.5363325363*g + 0.0514459929*b);
  var m_ = Math.cbrt(0.2119034982*r + 0.6806995451*g + 0.1073969566*b);
  var s_ = Math.cbrt(0.0883024619*r + 0.2817188376*g + 0.6299787005*b);
  return {
    L: 0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_,
    a: 1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_,
    b: 0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_
  };
}
function _oklabToLinearRGB(L, a, b) {
  var l_ = L + 0.3963377774*a + 0.2158037573*b;
  var m_ = L - 0.1055613458*a - 0.0638541728*b;
  var s_ = L - 0.0894841775*a - 1.2914855480*b;
  l_ = l_*l_*l_; m_ = m_*m_*m_; s_ = s_*s_*s_;
  return [
     4.0767416621*l_ - 3.3077115913*m_ + 0.2309699292*s_,
    -1.2684380046*l_ + 2.6097574011*m_ - 0.3413193965*s_,
    -0.0041960863*l_ - 0.7034186147*m_ + 1.7076147010*s_
  ];
}
function _oklabToHex(L, a, b) {
  var rgb = _oklabToLinearRGB(L, a, b);
  return '#' + rgb.map(function(c) {
    return Math.round(Math.max(0, Math.min(255, _toGamma(c) * 255))).toString(16).padStart(2, '0');
  }).join('');
}
function _hexToOklch(hex) {
  var lin = _hexToLinearRGB(hex);
  var lab = _linearRGBToOklab(lin[0], lin[1], lin[2]);
  var C   = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  var H   = Math.atan2(lab.b, lab.a) * 180 / Math.PI;
  return { L: lab.L, C: C, H: (H + 360) % 360 };
}
function _oklchToHex(L, C, H) {
  var Hr = H * Math.PI / 180;
  return _oklabToHex(L, C * Math.cos(Hr), C * Math.sin(Hr));
}
function generateScale(hex) {
  var lch = _hexToOklch(hex);
  var C = lch.C, H = lch.H, Li = lch.L;
  var chromaTaper = { 1:0.08, 2:0.2, 3:0.5, 11:0.7, 12:0.5 };
  var scale = {};
  for (var i = 1; i <= 12; i++) {
    var L = i <= 9
      ? 0.98 + (Li - 0.98) * (i - 1) / 8
      : Li  + (0.15 - Li)  * (i - 9) / 3;
    var cm = chromaTaper[i] !== undefined ? chromaTaper[i] : 1;
    scale[i] = _oklchToHex(Math.max(0, Math.min(1, L)), C * cm, H);
  }
  return scale;
}
function generateNeutralScale(darkHex, lightHex) {
  var T   = [1.000, 0.983, 0.956, 0.900, 0.811, 0.700, 0.567, 0.433, 0.300, 0.178, 0.078, 0.000];
  var linD = _hexToLinearRGB(darkHex),  labD = _linearRGBToOklab(linD[0], linD[1], linD[2]);
  var linL = _hexToLinearRGB(lightHex), labL = _linearRGBToOklab(linL[0], linL[1], linL[2]);
  var scale = {};
  for (var i = 0; i < 12; i++) {
    var t = T[i];
    scale[i + 1] = _oklabToHex(
      labD.L + t * (labL.L - labD.L),
      labD.a + t * (labL.a - labD.a),
      labD.b + t * (labL.b - labD.b)
    );
  }
  return scale;
}
function _buildElevShadow(blurStr) {
  var n = parseInt(blurStr) || 0;
  if (n <= 0) return 'none';
  var y1    = Math.max(1, Math.round(n / 3));
  var y2    = Math.max(1, Math.round(n / 6));
  var blur2 = Math.max(1, Math.round(n / 3));
  var a1    = Math.min(0.20, 0.06 + n * 0.002).toFixed(3);
  return '0 ' + y1 + 'px ' + n + 'px rgba(0,0,0,' + a1 + '), 0 ' + y2 + 'px ' + blur2 + 'px rgba(0,0,0,0.04)';
}

// ── CSS generation ─────────────────────────────────────────────────────────
function _generateThemeVarsCss(t) {
  var neutral  = generateNeutralScale(t.scaleDark, t.scaleLight);
  var primary  = generateScale(t.primary);
  var second   = generateScale(t.secondary);
  var success  = generateScale(t.success);
  var warning  = generateScale(t.warning);
  var danger   = generateScale(t.danger);
  var info     = generateScale(t.info);
  var ai       = generateScale(t.aiAction);

  function block(prefix, scale) {
    var out = '';
    for (var i = 1; i <= 12; i++) out += '  --' + prefix + '-' + i + ': ' + scale[i] + ';\n';
    return out;
  }

  var preset = DENSITY_PRESETS[t.density] || DENSITY_PRESETS.default;
  var spacingLines = Object.keys(preset).map(function(k) {
    return '  --space-' + k + ': ' + preset[k] + ';';
  }).join('\n') + '\n';

  return (
    '/* (c) Freshdesign Interactive, Inc. Do not redistribute.\n' +
    '   FreshDS, Generated theme variables\n' +
    '   Primary  : ' + t.primary   + '\n' +
    '   Secondary: ' + t.secondary + '\n' +
    '   Generated: ' + new Date().toISOString() + '\n' +
    '   Override any value directly, all components inherit via var(). */\n\n' +
    ':root {\n' +
    '  /* Neutral scale (dark: ' + t.scaleDark + ' / light: ' + t.scaleLight + ') */\n' +
    block('scale',     neutral) +
    '\n  /* Primary: ' + t.primary + ' */\n' +
    block('primary',   primary) +
    '\n  /* Secondary: ' + t.secondary + ' */\n' +
    block('secondary', second) +
    '\n  /* Status */\n' +
    block('success', success) +
    block('warning', warning) +
    block('danger',  danger) +
    block('info',    info) +
    block('ai',      ai) +
    '\n  /* Primitive aliases */\n' +
    '  --primitive-primary:   ' + t.primary   + ';\n' +
    '  --primitive-secondary: ' + t.secondary + ';\n' +
    '\n  /* Page background */\n' +
    '  --color-page-bg:      ' + t.pageBg       + ';\n' +
    '  --color-input-surface:' + t.inputSurface + ';\n' +
    '\n  /* Elevation */\n' +
    '  --elev-1: ' + _buildElevShadow(t.elev1) + ';\n' +
    '  --elev-2: ' + _buildElevShadow(t.elev2) + ';\n' +
    '  --elev-3: ' + _buildElevShadow(t.elev3) + ';\n' +
    '\n  /* Border radius */\n' +
    '  --radius-sm:  ' + t.radiusSm + 'px;\n' +
    '  --radius-md:  ' + t.radiusMd + 'px;\n' +
    '  --radius-lg:  ' + t.radiusLg + 'px;\n' +
    '  --radius-xl:  ' + t.radiusXl + 'px;\n' +
    '  --radius-full: 9999px;\n' +
    '\n  /* Spacing (' + t.density + ') */\n' +
    spacingLines +
    '\n  /* Typography */\n' +
    "  --font-sans: '" + t.fontSans + "', system-ui, sans-serif;\n" +
    "  --font-mono: '" + t.fontMono + "', monospace;\n" +
    '}'
  );
}

function _injectThemeSeed(html, t) {
  var seed = '<script>/* FreshDS baked theme */\n' +
    'try{localStorage.setItem(\'freshds-theme\',' + JSON.stringify(JSON.stringify(t)) + ');}catch(e){}\n' +
    '<\/script>';
  return html.replace('<head>', '<head>\n' + seed);
}

function _generateReadme(isSite, t) {
  return (
    '# FreshDS ' + (isSite ? 'Documentation Site' : 'Developer Bundle') + '\n\n' +
    'Primary: `' + t.primary   + '`\n' +
    'Secondary: `' + t.secondary + '`\n' +
    'Generated: ' + new Date().toISOString() + '\n\n' +
    '## Quick start\n\n' +
    '```html\n' +
    '<!-- 1. Load tokens -->\n' +
    '<link rel="stylesheet" href="tokens/primitives.css">\n' +
    '<link rel="stylesheet" href="tokens/theme-vars.css">\n' +
    '<link rel="stylesheet" href="tokens/theme.css">\n\n' +
    '<!-- 2. Load grid (optional) -->\n' +
    '<link rel="stylesheet" href="styles/grid.css">\n\n' +
    '<!-- 3. Register web components -->\n' +
    '<script src="js/freshds.js"><\/script>\n' +
    '<script src="components/core/fresh-button.js"><\/script>\n' +
    '<!-- repeat for each component -->\n' +
    '```\n\n' +
    '## Files\n\n' +
    '- `tokens/theme-vars.css` - your computed brand scales (edit here to override)\n' +
    '- `tokens/theme.css` - semantic token mappings (surface, text, color-interactive)\n' +
    '- `tokens/primitives.css` - base primitives\n' +
    '- `js/freshds.js` - color math engine (needed to re-generate scales at runtime)\n' +
    '- `components/` - web components, one file per component\n'
  );
}

// ── Static file lists ──────────────────────────────────────────────────────
const DEVKIT_FILES = [
  'tokens/primitives.css',
  'tokens/theme.css',
  'tokens/dataviz.css',
  'styles/grid.css',
  'styles/components/core.css',
  'js/freshds.js',
  'components/core/fresh-button.js',
  'components/core/fresh-input.js',
  'components/core/fresh-select.js',
  'components/core/fresh-checkbox.js',
  'components/core/fresh-radio.js',
  'components/core/fresh-toggle.js',
  'components/core/fresh-slider.js',
  'components/core/fresh-form-field.js',
  'components/core/fresh-dropdown-button.js',
  'components/feedback/fresh-badge.js',
  'components/feedback/fresh-alert.js',
  'components/feedback/fresh-toast.js',
  'components/feedback/fresh-tooltip.js',
  'components/feedback/fresh-progress.js',
  'components/feedback/fresh-skeleton.js',
  'components/feedback/fresh-spinner.js',
  'components/feedback/fresh-empty-state.js',
  'components/navigation/fresh-navbar.js',
  'components/navigation/fresh-sidebar.js',
  'components/navigation/fresh-tabs.js',
  'components/navigation/fresh-topbar-menu.js',
  'components/navigation/fresh-breadcrumb.js',
  'components/navigation/fresh-pagination.js',
  'components/navigation/fresh-stepper.js',
  'components/containers/fresh-card.js',
  'components/containers/fresh-modal.js',
  'components/containers/fresh-drawer.js',
  'components/containers/fresh-accordion.js',
  'components/containers/fresh-popover.js',
  'components/containers/fresh-media-card.js',
  'components/data/fresh-avatar.js',
  'components/data/fresh-stat-card.js',
  'components/data/fresh-data-table.js',
  'components/data/fresh-chart.js',
  'components/data/fresh-timeline.js',
  'components/ai/fresh-prompt-input.js',
  'components/ai/fresh-ai-response.js',
  'components/ai/fresh-thinking.js',
  'components/ai/fresh-confidence-badge.js',
  'components/ai/fresh-citation-chip.js',
  'components/ai/fresh-suggestion-card.js',
  'components/ai/fresh-model-selector.js',
  'components/ai/fresh-token-meter.js',
  'components/ai/fresh-feedback.js',
  'components/ai/fresh-diff-viewer.js',
  'components/ai/fresh-prompt-history.js',
  'components/ai/fresh-ai-mode-toggle.js'
];

const FULLSITE_EXTRA_FILES = [
  'CLAUDE.md',
  'styles/layout.css',
  'styles/docs.css',
  'js/freshds-site.js',
  'js/pattern-bar.js',
  'js/pattern-topbar-v2.js',
  'favicon.svg',
  'components.html',
  'patterns.html',
  'patterns/ai-agent-feed.html','patterns/ai-chat.html','patterns/ai-config.html',
  'patterns/ai-feedback.html','patterns/ai-history.html','patterns/ai-knowledge.html',
  'patterns/ai-memory.html','patterns/ai-model-sel.html','patterns/ai-playground.html',
  'patterns/ai-prompt.html','patterns/ai-review.html','patterns/ai-stream.html',
  'patterns/ai-suggested.html','patterns/ai-thread.html','patterns/ai-tool-log.html',
  'patterns/auth-2fa.html','patterns/auth-email-sent.html','patterns/auth-expired.html',
  'patterns/auth-forgot-password.html','patterns/auth-invite.html','patterns/auth-locked.html',
  'patterns/auth-login.html','patterns/auth-reset.html','patterns/auth-signup.html',
  'patterns/auth-sso.html','patterns/auth-verify.html',
  'patterns/collab-activity.html','patterns/collab-comments.html','patterns/collab-embeds.html',
  'patterns/collab-mentions.html','patterns/collab-permissions.html','patterns/collab-presence.html',
  'patterns/collab-share.html','patterns/collab-team.html','patterns/collab-workspace.html',
  'patterns/commerce-checkout.html','patterns/commerce-compare.html','patterns/commerce-confirm.html',
  'patterns/commerce-gates.html','patterns/commerce-invoice.html','patterns/commerce-payment.html',
  'patterns/commerce-pricing.html','patterns/commerce-trial.html','patterns/commerce-upsell.html',
  'patterns/content-audit.html','patterns/content-bulk.html','patterns/content-calendar.html',
  'patterns/content-detail.html','patterns/content-filter.html','patterns/content-form.html',
  'patterns/content-import.html','patterns/content-kanban.html','patterns/content-list.html',
  'patterns/content-table.html','patterns/content-timeline.html','patterns/content-versions.html',
  'patterns/dash-activity.html','patterns/dash-ai-insights.html','patterns/dash-analytics.html',
  'patterns/dash-home.html','patterns/dash-metrics.html','patterns/dash-notifications.html',
  'patterns/dash-realtime.html','patterns/dash-reports.html','patterns/dash-status.html',
  'patterns/dash-usage.html',
  'patterns/flow-agent.html','patterns/flow-approval.html','patterns/flow-history.html',
  'patterns/flow-integration.html','patterns/flow-pipeline.html','patterns/flow-rules.html',
  'patterns/flow-scheduled.html','patterns/flow-trigger.html','patterns/flow-webhook.html',
  'patterns/flow-wizard.html',
  'patterns/onb-ai-setup.html','patterns/onb-checklist.html','patterns/onb-empty-first.html',
  'patterns/onb-import.html','patterns/onb-integration.html','patterns/onb-profile.html',
  'patterns/onb-role.html','patterns/onb-team-invite.html','patterns/onb-tour.html',
  'patterns/onb-usecase.html','patterns/onb-welcome.html','patterns/onb-workspace.html',
  'patterns/settings-api.html','patterns/settings-billing.html','patterns/settings-danger.html',
  'patterns/settings-general.html','patterns/settings-notifs.html','patterns/settings-privacy.html',
  'patterns/settings-profile.html','patterns/settings-security.html','patterns/settings-theme.html',
  'patterns/settings-upgrade.html','patterns/settings-usage.html',
  'patterns/support-confirm.html','patterns/support-empty.html','patterns/support-error.html',
  'patterns/support-feedback.html','patterns/support-help.html','patterns/support-nps.html',
  'patterns/support-progress.html','patterns/support-skeleton.html','patterns/support-success.html',
  'patterns/support-toast.html','patterns/support-tooltip.html',
  'styles/patterns/ai-chat.css','styles/patterns/auth.css','styles/patterns/collab.css',
  'styles/patterns/commerce.css','styles/patterns/content.css','styles/patterns/dashboard.css',
  'styles/patterns/feedback.css','styles/patterns/onboarding.css','styles/patterns/settings.css',
  'styles/patterns/workflow.css'
];

// ── Handler ────────────────────────────────────────────────────────────────
async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7);

  // Validate the JWT — works with either key
  const supabaseAuth = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
  );
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' });

  // Read profile as the user — identical to how the dashboard reads it,
  // so RLS grants access and has_paid is always correct
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: 'Bearer ' + token } }
  });
  const { data: profile, error: profileErr } = await supabaseUser
    .from('profiles')
    .select('has_paid, theme_config')
    .eq('id', user.id)
    .single();
  if (profileErr) console.error('[export] profile read failed:', profileErr.message);

  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  const isAdmin  = adminIds.includes(user.id);

  if (!isAdmin && (!profile || !profile.has_paid)) {
    return res.status(403).json({ error: 'Subscription required' });
  }

  const type       = req.query.type === 'fullsite' ? 'fullsite' : 'devkit';
  const isFullSite = type === 'fullsite';
  const t          = Object.assign({}, DEFAULT_THEME, profile.theme_config || {});
  const root       = isFullSite ? 'FreshDS/' : 'freshds-bundle/';

  // Fetch static files from the CDN (same deployment) in parallel
  const proto   = req.headers['x-forwarded-proto'] || 'https';
  const host    = req.headers['x-forwarded-host']  || req.headers.host;
  const baseUrl = proto + '://' + host;

  const allFiles = isFullSite ? DEVKIT_FILES.concat(FULLSITE_EXTRA_FILES) : DEVKIT_FILES;
  const fetched  = await Promise.all(
    allFiles.map(function(relPath) {
      return fetch(baseUrl + '/' + relPath)
        .then(function(r) { return r.ok ? r.text().then(function(text) { return { relPath, text }; }) : null; })
        .catch(function() { return null; });
    })
  );

  const zip = new JSZip();
  zip.file(root + 'tokens/theme-vars.css', _generateThemeVarsCss(t));

  fetched.forEach(function(file) {
    if (!file) return;
    var content = file.text;
    if (file.relPath.endsWith('.html') && isFullSite) content = _injectThemeSeed(content, t);
    zip.file(root + file.relPath, content);
  });

  zip.file(root + 'README.md', _generateReadme(isFullSite, t));

  const buffer   = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const filename = isFullSite ? 'FreshDS.zip' : 'freshds-bundle.zip';

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
  res.send(buffer);
}

module.exports = handler;
