import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const supabase = createClient(
  'https://fvfveljfslfxcxrepfid.supabase.co',
  'sb_publishable_Cyts4seRFYkwB7LR_mBzKw_glcS8BTe'
)

export const BETA_SEAT_LIMIT = 100
