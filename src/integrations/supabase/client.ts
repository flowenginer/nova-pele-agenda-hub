// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://flvkbiwftlonwlzextmx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsdmtiaXdmdGxvbndsemV4dG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDMyNzQsImV4cCI6MjA2NDgxOTI3NH0.owDvN4PQX9MAX2OHlbBgupsF7W5Whom7v4qDqDwzFj4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});