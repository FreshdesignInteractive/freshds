// Drop this as <script type="module" src="/js/auth-guard.js"></script>
// in the <head> of every protected product page.
// Redirects to / if the user has no active Supabase session.
import { supabase } from '/js/supabase-client.js'

;(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.replace('/')
  }
})()
