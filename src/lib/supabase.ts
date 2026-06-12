import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env, hasSupabaseBrowserConfig } from "@/lib/env";

type SupabaseServerClient = ReturnType<typeof createServerClient>;

export async function getSupabaseServerClient(): Promise<SupabaseServerClient | null> {
  if (!hasSupabaseBrowserConfig()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
