import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;

export const getSupabaseClient = () => {
    if (supabaseClient) return supabaseClient;

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        );
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return supabaseClient;
};

export const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
