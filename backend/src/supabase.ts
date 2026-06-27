import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
    if (!config.supabaseUrl || !config.supabaseKey) {
        return null;
    }

    if (!supabaseInstance) {
        supabaseInstance = createClient(config.supabaseUrl, config.supabaseKey);
    }

    return supabaseInstance;
}
