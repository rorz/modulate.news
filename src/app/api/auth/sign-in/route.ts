import { NextResponse } from "next/server";
import { z } from "zod";

import { hasSupabaseBrowserConfig } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase";

const signInRequest = z.object({
  email: z.string().email(),
  username: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/),
});

export async function POST(request: Request) {
  const parsed = signInRequest.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  if (!hasSupabaseBrowserConfig()) {
    return NextResponse.json({
      mode: "mock",
      message: "Supabase is not configured yet. Add env vars to send real magic links.",
    });
  }

  const supabase = await getSupabaseServerClient();
  const origin = new URL(request.url).origin;

  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable." }, { status: 500 });
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    mode: "supabase",
    message: "Magic link sent.",
  });
}
