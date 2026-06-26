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
      { id: 'tx-home-c2', label: 'Overview' },
      { id: 'tx-home-c3', label: 'Activity' }
    ]
  },
  {
    id: 'tx-work',
    label: 'Work',
    icon: 'ti-layout-dashboard',
    children: [
      { id: 'tx-work-c1', label: 'My tasks' },
      { id: 'tx-work-c2', label: 'Projects' },
      { id: 'tx-work-c3', label: 'Calendar' },
      { id: 'tx-work-c4', label: 'Archived' }
    ]
  },
  {
    id: 'tx-reports',
    label: 'Reports',
    icon: 'ti-chart-bar',
    children: [
      { id: 'tx-reports-c1', label: 'Summary' },
      { id: 'tx-reports-c2', label: 'Analytics' },
      { id: 'tx-reports-c3', label: 'Exports' }
    ]
  },
  {
    id: 'tx-team',
    label: 'Team',
    icon: 'ti-users',
    children: [
      { id: 'tx-team-c1', label: 'Members' },
      { id: 'tx-team-c2', label: 'Roles' },
      { id: 'tx-team-c3', label: 'Invitations' }
    ]
  },
  {
    id: 'tx-settings',
    label: 'Settings',
    icon: 'ti-settings',
    children: [
      { id: 'tx-settings-c1', label: 'Account' },
      { id: 'tx-settings-c2', label: 'Security' },
      { id: 'tx-settings-c3', label: 'Billing' },
      { id: 'tx-settings-c4', label: 'Integrations' }
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
    var obj = { key: item.id, label: item.label || 'Section' };
    if (item.children && item.children.length > 0) {
      obj.children = item.children.map(function(c) {
        return { key: c.id, label: c.label };
      });
    }
    return obj;
  }));
}

/* Dual-level: each primary = section div, children rendered directly (no group header).
   data-has-children lets the page script hide the sidebar when there are no children. */
function buildDualLevelSections(tax) {
  if (!tax || tax.length === 0) return '';
  return tax.map(function(item, idx) {
    var isFirst = idx === 0;
    var kids = item.children || [];
    var hasChildren = kids.length > 0;
    var children = kids.map(function(child, ci) {
      return '<fresh-nav-item' + (isFirst && ci === 0 ? ' active' : '') + '>' +
             _txEsc(child.label || '') + '</fresh-nav-item>';
    }).join('');
    return '<div class="section-nav' + (isFirst ? ' active' : '') + '"' +
           ' id="snav-' + _txEsc(item.id) + '"' +
           ' data-has-children="' + (hasChildren ? '1' : '0') + '">' +
           children + '</div>';
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
