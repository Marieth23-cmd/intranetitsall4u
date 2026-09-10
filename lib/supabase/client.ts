import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKEY= process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () =>
    createBrowserClient(
        supabaseUrl!,
        supabaseKEY!

    )