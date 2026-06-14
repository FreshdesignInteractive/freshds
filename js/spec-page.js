/* ============================================================
   FreshDS, Component spec page utilities
   Shared by every /pages/components/*.html page.
   Per-page code (DEFAULT_RULES, restoreDefaults, Supabase
   persistence) lives in each component's own script blocks.
   ============================================================ */

function setSpecMode(mode) {
  var vp = document.getElementById('spec-viewport');
  mode === 'dark' ? vp.setAttribute('data-mode', 'dark') : vp.removeAttribute('data-mode');
  document.querySelectorAll('.spec-mode-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('mode-btn-' + mode).classList.add('active');
}

function copyCode(btn) {
  var code = btn.closest('.code-block').dataset.code;
  navigator.clipboard.writeText(code).then(function() {
    btn.textContent = 'Copied';
    setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
  }).catch(function() {
    btn.textContent = 'Failed';
    setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
  });
}

function deleteRule(btn) {
  btn.closest('.spec-rule-li').remove();
}

function addRule(listId) {
  var list = document.getElementById(listId);
  var li = document.createElement('li');
  li.className = 'spec-rule-li';
  li.innerHTML =
    '<span class="spec-rule-bullet">•</span>' +
    '<span class="spec-rule-text" contenteditable="true"></span>' +
    '<span class="spec-rule-actions">' +
      '<button class="spec-rule-btn del" onclick="deleteRule(this)" title="Delete"><i class="ti ti-trash"></i></button>' +
    '</span>';
  list.appendChild(li);
  var text = li.querySelector('.spec-rule-text');
  text.focus();
  text.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); text.blur(); }
    if (e.key === 'Escape') { li.remove(); }
  });
}
