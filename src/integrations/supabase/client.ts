// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ybiswdwululmlgocshgj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaXN3ZHd1bHVsbWxnb2NzaGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNDcwNjksImV4cCI6MjA1ODgyMzA2OX0.rF3W4mBYEAnjOM5fySNgfdzqMcim4vGm9vS5Rsf-Z6o";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);