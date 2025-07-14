// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://ylsodxvamvpauwlwizkf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsc29keHZhbXZwYXV3bHdpemtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ2MDUzNiwiZXhwIjoyMDY4MDM2NTM2fQ.YYeZyaM7D5G6PMMsUnqoKyVgXn9B-RWCgFq2F_HZghw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)