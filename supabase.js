// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://ylsodxvamvpauwlwizkf.supabase.co/'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsc29keHZhbXZwYXV3bHdpemtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NDY1MDYsImV4cCI6MjA2NzQyMjUwNn0.4k0PjrPMugDCOS_Y5SuCpm6u-ycSXmO75xqxdHCtW4c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)