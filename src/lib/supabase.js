import { createClient } from '@supabase/supabase-js';

// These come from your .env file.
// Never hardcode these values here — always use environment variables.
const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY;

// One shared client instance used across the whole app.
// Think of this like the "connection" to your database.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
