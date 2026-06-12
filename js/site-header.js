import { supabase } from '/js/supabase-client.js';

// Detect active page
const path = window.location.pathname;
const isActive = (page) => {
  if (page === 'dashboard') return path.includes('dashboard') || path === '/' || path === '/index.html';
  if (page === 'configurator') return path.includes('configurator');
  if (page === 'components') return path.includes('app');
  if (page === 'patterns') return path.includes('patterns');
  return false;
};

function tab(key, label, href) {
  return `<a class="sh-tab${isActive(key) ? ' sh-tab-active' : ''}" href="${href}">${label}</a>`;
}

const headerHTML = `<header class="site-header" id="site-header">
  <a class="sh-logo" href="/dashboard.html">
    <img src="/assets/freshdesign-logo.svg" alt="Freshdesign" height="26">
  </a>
  <nav class="sh-nav">
    ${tab('dashboard',    'Dashboard',       '/dashboard.html')}
    ${tab('configurator', 'Configurator',    '/configurator.html')}
    ${tab('components',   'Components',      '/app.html')}
    ${tab('patterns',     'Pattern Library', '/patterns.html')}
  </nav>
  <div class="sh-right">
    <div class="sh-av-wrap" id="sh-av-wrap">
      <button class="sh-av" id="sh-av" onclick="window.__shToggle()"></button>
      <div class="sh-av-dd" id="sh-av-dd">
        <div class="sh-dd-name" id="sh-dd-name">…</div>
        <button class="sh-dd-item" onclick="window.__shSignOut()">
          <i class="ti ti-logout"></i> Sign out
        </button>
      </div>
    </div>
  </div>
</header>`;

// Inject: use #sh-mount placeholder if available, else prepend to body
const mount = document.getElementById('sh-mount');
if (mount) {
  mount.outerHTML = headerHTML;
} else {
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

// Auth globals (called from inline onclick)
window.__shSignOut = async function() {
  await supabase.auth.signOut();
  window.location.replace('/');
};

window.__shToggle = function() {
  const dd = document.getElementById('sh-av-dd');
  if (dd) dd.classList.toggle('open');
};

document.addEventListener('click', function(e) {
  const wrap = document.getElementById('sh-av-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const dd = document.getElementById('sh-av-dd');
    if (dd) dd.classList.remove('open');
  }
});

// Populate avatar from Supabase
(async function() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: p } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();
    const name = p?.full_name || user.email || '';
    const initial = name.trim().charAt(0).toUpperCase() || '?';
    const avEl = document.getElementById('sh-av');
    const nmEl = document.getElementById('sh-dd-name');
    if (avEl) {
      if (p?.avatar_url) {
        avEl.innerHTML = `<img src="${p.avatar_url}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
      } else {
        avEl.textContent = initial;
      }
    }
    if (nmEl) nmEl.textContent = name || user.email;
  } catch(e) {}
})();
