// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://ylsodxvamvpauwlwizkf.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_j3FUOBH0BUpg3WIsGaZpnw_t_9o-pQF'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)