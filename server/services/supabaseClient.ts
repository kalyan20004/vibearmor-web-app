import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Missing credentials in .env! Database features will fail.');
}

export const supabase = createClient(
  supabaseUrl || 'https://mock.supabase.co', 
  supabaseKey || 'mock-key'
);
