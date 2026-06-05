/* ============================================================
   FreshDS — Core engine
   Ships with every DS export. No site-specific code here.

   Provides:
     generateScale(hex)                        → 12-step OKLCH scale
     generateNeutralScale(darkHex, lightHex)   → 12-step Oklab scale
     applyScalesToElement(el, p, s, dark, light, suc, warn, dang, info)
     loadFont(family, query)
     applyFont(type, family)
     SANS_FONTS / MONO_FONTS                   → font catalog

   Site-specific code lives in freshds-site.js and is NOT exported
   in the developer bundle.
   ============================================================ */

// ── Font catalog ───────────────────────────────────────────────
var SANS_FONTS = {
  'Inter':             'Inter:wght@300;400;500;600',
  'Geist':             'Geist:wght@300;400;500;600',
  'Outfit':            'Outfit:wght@300;400;500;600',
  'Sora':              'Sora:wght@300;400;500;600',
  'Figtree':           'Figtree:wght@300;400;500;600',
  'DM Sans':           'DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600',
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@300;400;500;600',
  'Be Vietnam Pro':    'Be+Vietnam+Pro:wght@300;400;500;600',
  'Nunito':            'Nunito:wght@300;400;500;600',
  'Manrope':           'Manrope:wght@300;400;500;600'
};
var MONO_FONTS = {
  'JetBrains Mono': 'JetBrains+Mono:wght@400;500',
  'Fira Code':      'Fira+Code:wght@400;500',
  'IBM Plex Mono':  'IBM+Plex+Mono:wght@400;500',
  'Roboto Mono':    'Roboto+Mono:wght@400;500',
  'Inconsolata':    'Inconsolata:wght@400;500'
};

// ── OKLCH color math ───────────────────────────────────────────
// Standard pipeline: hex ↔ linear sRGB ↔ Oklab LMS ↔ Oklab ↔ OKLCH
// Based on Björn Ottosson's Oklab spec (no external dependencies)

function _toLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function _toGamma(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
function _hexToLinearRGB(hex) {
  return [
    _toLinear(parseInt(hex.slice(1,3),16) / 255),
    _toLinear(parseInt(hex.slice(3,5),16) / 255),
    _toLinear(parseInt(hex.slice(5,7),16) / 255)
  ];
}
function _linearRGBToOklab(r, g, b) {
  var l_ = Math.cbrt(0.4122214708*r + 0.5363325363*g + 0.0514459929*b);
  var m_ = Math.cbrt(0.2119034982*r + 0.6806995451*g + 0.1073969566*b);
  var s_ = Math.cbrt(0.0883024619*r + 0.2817188376*g + 0.6299787005*b);
  return {
    L:  0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_,
    a:  1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_,
    b:  0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_
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
    return Math.round(Math.max(0, Math.min(255, _toGamma(c) * 255)))
      .toString(16).padStart(2, '0');
  }).join('');
}
function hexToOklch(hex) {
  var lin = _hexToLinearRGB(hex);
  var lab = _linearRGBToOklab(lin[0], lin[1], lin[2]);
  var C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  var H = Math.atan2(lab.b, lab.a) * 180 / Math.PI;
  return { L: lab.L, C: C, H: (H + 360) % 360 };
}
function oklchToHex(L, C, H) {
  var Hr = H * Math.PI / 180;
  return _oklabToHex(L, C * Math.cos(Hr), C * Math.sin(Hr));
}

// ── Scale generators ───────────────────────────────────────────

// 12-step OKLCH brand scale. Step 9 = input color exactly.
// Steps 1–8 lighten toward near-white; steps 10–12 darken.
function generateScale(hex) {
  var lch = hexToOklch(hex);
  var C = lch.C, H = lch.H, Li = lch.L;
  var chromaTaper = { 1:0.08, 2:0.2, 3:0.5, 11:0.7, 12:0.5 };
  var scale = {};
  for (var i = 1; i <= 12; i++) {
    var L = i <= 9
      ? 0.98 + (Li - 0.98) * (i - 1) / 8
      : Li  + (0.15 - Li)  * (i - 9) / 3;
    var cm = chromaTaper[i] !== undefined ? chromaTaper[i] : 1;
    scale[i] = oklchToHex(Math.max(0, Math.min(1, L)), C * cm, H);
  }
  return scale;
}

// 12-step neutral scale via Oklab interpolation.
// Step 1 = light anchor exactly, step 12 = dark anchor exactly.
function generateNeutralScale(darkHex, lightHex) {
  var T = [1.000, 0.983, 0.956, 0.900, 0.811, 0.700, 0.567, 0.433, 0.300, 0.178, 0.078, 0.000];
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

// ── Apply scales to a DOM element ─────────────────────────────
// Writes --scale-1..12, --primary-1..12, --secondary-1..12, etc.
// Works on :root (whole site) or a scoped preview container.
function applyScalesToElement(el, p, s, dark, light, suc, warn, dang, info) {
  var neutral      = generateNeutralScale(dark, light);
  var primary      = generateScale(p);
  var secondary    = generateScale(s);
  var successScale = generateScale(suc  || '#22c55e');
  var warningScale = generateScale(warn || '#f59e0b');
  var dangerScale  = generateScale(dang || '#f43f5e');
  var infoScale    = generateScale(info || '#3b82f6');

  for (var i = 1; i <= 12; i++) {
    el.style.setProperty('--scale-'     + i, neutral[i]);
    el.style.setProperty('--primary-'   + i, primary[i]);
    el.style.setProperty('--secondary-' + i, secondary[i]);
    el.style.setProperty('--success-'   + i, successScale[i]);
    el.style.setProperty('--warning-'   + i, warningScale[i]);
    el.style.setProperty('--danger-'    + i, dangerScale[i]);
    el.style.setProperty('--info-'      + i, infoScale[i]);
  }
  el.style.setProperty('--primitive-primary',   p);
  el.style.setProperty('--primitive-secondary', s);
}

// ── Font loading & switching ───────────────────────────────────
var _loadedFonts = { 'Inter': true, 'JetBrains Mono': true };

function loadFont(family, query) {
  if (_loadedFonts[family]) return;
  var link = document.createElement('link');
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=' + query + '&display=swap';
  document.head.appendChild(link);
  _loadedFonts[family] = true;
}

function applyFont(type, family) {
  var catalog = type === 'sans' ? SANS_FONTS : MONO_FONTS;
  var query   = catalog[family];
  if (!query) return;
  loadFont(family, query);
  var prop = type === 'sans' ? '--font-sans' : '--font-mono';
  var stack = type === 'sans'
    ? "'" + family + "', system-ui, sans-serif"
    : "'" + family + "', monospace";
  document.documentElement.style.setProperty(prop, stack);
}
