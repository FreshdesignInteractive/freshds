import { supabase } from '/js/supabase-client.js';

const path = window.location.pathname;
const isActive = (page) => {
  if (page === 'dashboard') return path.includes('dashboard') || path === '/' || path === '/index.html';
  if (page === 'configurator') return path.includes('configurator');
  if (page === 'components') return path.includes('app');
  if (page === 'patterns') return path.includes('patterns');
  return false;
};

// Paid-required tabs default to locked until profile confirms has_paid
function tab(key, label, href, locked) {
  const active = isActive(key);
  const lockIcon = locked ? '<i class="ti ti-lock sh-tab-lock"></i>' : '';
  const cls = ['sh-tab', active ? 'sh-tab-active' : '', locked ? 'sh-tab-locked' : ''].filter(Boolean).join(' ');
  // Locked tabs go to dashboard on click
  const dest = locked ? '/dashboard.html' : href;
  return `<a class="sh-tab-wrap" href="${dest}" data-key="${key}" data-real-href="${href}">`
       + `<span class="${cls}">${label}${lockIcon}</span></a>`;
}

const headerHTML = `<header class="site-header" id="site-header">
  <a class="sh-logo" href="/dashboard.html">
    <img src="/assets/freshdesign-logo.svg" alt="Freshdesign" height="26">
  </a>
  <nav class="sh-nav">
    ${tab('dashboard',    'Dashboard',       '/dashboard.html', false)}
    ${tab('configurator', 'Configurator',    '/configurator.html', true)}
    ${tab('components',   'Components',      '/app.html', true)}
    ${tab('patterns',     'Pattern Library', '/patterns.html', true)}
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

const mount = document.getElementById('sh-mount');
if (mount) {
  mount.outerHTML = headerHTML;
} else {
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

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

// Single profile fetch — avatar + payment status
(async function() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: p } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, has_paid')
      .eq('id', user.id)
      .single();

    // Avatar
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

    // Unlock paid tabs
    if (p?.has_paid) {
      document.querySelectorAll('.sh-tab-wrap[data-key]').forEach(function(wrap) {
        const key = wrap.getAttribute('data-key');
        if (key === 'dashboard') return;
        const realHref = wrap.getAttribute('data-real-href');
        wrap.setAttribute('href', realHref);
        const span = wrap.querySelector('.sh-tab');
        if (span) {
          span.classList.remove('sh-tab-locked');
          const lock = span.querySelector('.sh-tab-lock');
          if (lock) lock.remove();
        }
      });
    }
  } catch(e) {}
})();
