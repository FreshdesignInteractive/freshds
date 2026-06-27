import { supabase } from '/js/supabase-client.js';

// Returns the current session access token, or null if not signed in.
window.__getAuthToken = async function() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch (_) {
    return null;
  }
};

// Debounced save to any column in the profiles table.
// Usage: window.__saveToCloud('theme_config', dataObject)
const _timers = {};
window.__saveToCloud = function(column, data) {
  clearTimeout(_timers[column]);
  _timers[column] = setTimeout(async function() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;
      const { error } = await supabase
        .from('profiles')
        .update({ [column]: data })
        .eq('id', user.id);
      if (error) console.error('[cloud-sync] save failed:', column, error.message, error);
    } catch(e) {
      console.error('[cloud-sync] save error:', column, e);
    }
  }, 800);
};

// Theme load: only runs on pages that have the theme engine (freshds-site.js sets window.ds).
// Fetches theme_config from Supabase and syncs to localStorage; reloads once if different.
if (typeof window.ds !== 'undefined') {
  (async function() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) return;
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('theme_config')
        .eq('id', user.id)
        .single();
      if (error) { console.error('[cloud-sync] theme load failed:', error.message, error); return; }
      if (!profile?.theme_config) return;
      const cloud = JSON.stringify(profile.theme_config);
      const local = localStorage.getItem('freshds-theme');
      if (local !== cloud) {
        localStorage.setItem('freshds-theme', cloud);
        location.reload();
      }
    } catch(e) {
      console.error('[cloud-sync] theme load error:', e);
    }
  })();
}
