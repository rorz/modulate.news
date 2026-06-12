import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { env, getSupabaseBrowserKey, hasSupabaseBrowserConfig } from "@/lib/env";

type SupabaseServerClient = ReturnType<typeof createServerClient>;
type SupabaseAdminClient = ReturnType<typeof createClient>;

export async function getSupabaseServerClient(): Promise<SupabaseServerClient | null> {
  if (!hasSupabaseBrowserConfig()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL!, getSupabaseBrowserKey()!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. Route Handlers and Actions can.
        }
      },
    },
  });
}

export function getSupabaseAdminClient(): SupabaseAdminClient | null {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
