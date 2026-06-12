// Drop as <script type="module" src="/js/paid-guard.js"></script> on every
// page that requires a completed purchase. Redirects to /dashboard.html
// if the user has no session or has not paid.
import { supabase } from '/js/supabase-client.js';

;(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { window.location.replace('/'); return; }
  const { data } = await supabase
    .from('profiles')
    .select('has_paid')
    .eq('id', session.user.id)
    .single();
  if (!data?.has_paid) window.location.replace('/dashboard.html');
})();
