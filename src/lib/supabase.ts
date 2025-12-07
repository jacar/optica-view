import { createClient } from '@supabase/supabase-js';

// Fallback credentials provided by user to ensure connection works even if env vars fail to inject
const FALLBACK_URL = 'https://wnzarmvlonhrphfgzwbr.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduemFybXZsb25ocnBoZmd6d2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3Mjc3NjgsImV4cCI6MjA2NzMwMzc2OH0.hSlGe9IaywDTbaOU3LQhx5yytnsfOPCAFPmPVMwDbBQ';

// Safely retrieve environment variables or use fallback
const getSupabaseUrl = () => {
    try {
        // @ts-ignore
        return (import.meta as any).env?.VITE_SUPABASE_URL || FALLBACK_URL;
    } catch {
        return FALLBACK_URL;
    }
};

const getSupabaseKey = () => {
    try {
        // @ts-ignore
        return (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;
    } catch {
        return FALLBACK_KEY;
    }
};

export const supabase = createClient(getSupabaseUrl(), getSupabaseKey());