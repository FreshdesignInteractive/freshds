/* ── nav-taxonomy.js ──────────────────────────────────────────────────
   Shared utility for all nav preview pages.
   Reads the user's saved taxonomy from freshds-nav-cfg and provides
   builder functions for each nav pattern.
   ──────────────────────────────────────────────────────────────────── */

var DEFAULT_TAXONOMY = [
  {
    id: 'tx-home',
    label: 'Home',
    icon: 'ti-home',
    children: [
      { id: 'tx-home-c1', label: 'Dashboard' },
      { id: 'tx-home-c2', label: 'Activity' }
    ]
  },
  {
    id: 'tx-projects',
    label: 'Projects',
    icon: 'ti-folder',
    children: [
      { id: 'tx-projects-c1', label: 'All projects' },
      { id: 'tx-projects-c2', label: 'My work' },
      { id: 'tx-projects-c3', label: 'Archived' }
    ]
  },
  {
    id: 'tx-team',
    label: 'Team',
    icon: 'ti-users',
    children: [
      { id: 'tx-team-c1', label: 'Members' },
      { id: 'tx-team-c2', label: 'Roles' }
    ]
  },
  {
    id: 'tx-settings',
    label: 'Settings',
    icon: 'ti-settings',
    children: [
      { id: 'tx-settings-c1', label: 'Account' },
      { id: 'tx-settings-c2', label: 'Security' },
      { id: 'tx-settings-c3', label: 'Billing' }
    ]
  }
];

function _txEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* Read taxonomy from localStorage, fall back to DEFAULT_TAXONOMY */
function loadTaxonomy() {
  try {
    var s = localStorage.getItem('freshds-nav-cfg');
    if (s) {
      var stored = JSON.parse(s);
      if (Array.isArray(stored.taxonomy) && stored.taxonomy.length > 0) {
        return stored.taxonomy;
      }
    }
  } catch (e) {}
  return DEFAULT_TAXONOMY;
}

/* Sidebar (persistent / collapsible / hamburger):
   primary = fresh-nav-group with icon, children = fresh-nav-items (text only) */
function buildSidebarHtml(tax) {
  if (!tax || tax.length === 0) return '';
  return tax.map(function(item, idx) {
    var iconAttr = item.icon ? ' icon="' + _txEsc(item.icon) + '"' : '';
    var openAttr = idx === 0 ? ' open' : '';
    var children = (item.children || []).map(function(child, ci) {
      return '<fresh-nav-item' + (idx === 0 && ci === 0 ? ' active' : '') + '>' +
             _txEsc(child.label || '') + '</fresh-nav-item>';
    }).join('');
    return '<fresh-nav-group label="' + _txEsc(item.label || '') + '"' + iconAttr + openAttr + '>' +
           children + '</fresh-nav-group>';
  }).join('');
}

/* Top-nav tabs: primary items become tab objects for fresh-topbar-menu */
function buildTabsJson(tax) {
  return JSON.stringify((tax || []).map(function(item) {
    return { key: item.id, label: item.label || 'Section' };
  }));
}

/* Dual-level: each primary = section div, children = nav-items inside that section */
function buildDualLevelSections(tax) {
  if (!tax || tax.length === 0) return '';
  return tax.map(function(item, idx) {
    var isFirst = idx === 0;
    var children = (item.children || []).map(function(child, ci) {
      return '<fresh-nav-item' + (isFirst && ci === 0 ? ' active' : '') + '>' +
             _txEsc(child.label || '') + '</fresh-nav-item>';
    }).join('');
    return '<div class="section-nav' + (isFirst ? ' active' : '') + '" id="snav-' + _txEsc(item.id) + '">' +
           '<fresh-nav-group label="' + _txEsc(item.label || '') + '" open>' +
           children + '</fresh-nav-group></div>';
  }).join('');
}

/* Command palette icon rail: primary items as icon-only nav items */
function buildIconRailHtml(tax) {
  if (!tax || tax.length === 0) return '';
  return '<fresh-nav-group label="Main" open>' +
    (tax || []).map(function(item, idx) {
      var iconAttr = item.icon ? ' icon="' + _txEsc(item.icon) + '"' : '';
      return '<fresh-nav-item' + iconAttr + (idx === 0 ? ' active' : '') + '>' +
             _txEsc(item.label || '') + '</fresh-nav-item>';
    }).join('') +
    '</fresh-nav-group>';
}

/* Command palette flat list: children grouped under their parent label and icon */
function buildPaletteItems(tax) {
  var items = [];
  (tax || []).forEach(function(item) {
    var icon  = item.icon || 'ti-circle';
    var group = item.label || 'Section';
    if (!item.children || item.children.length === 0) {
      items.push({ label: item.label || 'Section', icon: icon, group: '' });
    } else {
      item.children.forEach(function(child) {
        items.push({ label: child.label || 'Page', icon: icon, group: group });
      });
    }
  });
  return items;
}
