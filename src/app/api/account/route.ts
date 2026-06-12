import { NextResponse } from "next/server";
import { z } from "zod";

import { isValidUsername, normalizeUsername } from "@/lib/public-ids";
import { getSupabaseServerClient } from "@/lib/supabase";

const accountRequest = z.object({
  username: z.string().min(1).max(80),
});

export async function GET() {
  const user = await getSignedInUser();

  if (!user.ok) {
    return user.response;
  }

  const { supabase, email, userId } = user;
  const { data: authData } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", userId)
    .maybeSingle();

  return NextResponse.json({
    email,
    username:
      typeof data?.username === "string"
        ? data.username
        : typeof authData.user?.user_metadata.username === "string"
          ? authData.user.user_metadata.username
          : "",
  });
}

export async function POST(request: Request) {
  const parsed = accountRequest.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a valid username." }, { status: 400 });
  }

  const username = normalizeUsername(parsed.data.username);

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Use 3-30 lowercase letters, numbers, or hyphens." },
      { status: 400 },
    );
  }

  const user = await getSignedInUser();

  if (!user.ok) {
    return user.response;
  }

  const { error } = await user.supabase
    .from("profiles")
    .upsert({ user_id: user.userId, username }, { onConflict: "user_id" });

  if (error) {
    if (!isMissingTableError(error)) {
      const message = error.code === "23505" ? "That username is already taken." : error.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const { error: metadataError } = await user.supabase.auth.updateUser({ data: { username } });

  if (metadataError) {
    return NextResponse.json({ error: metadataError.message }, { status: 400 });
  }

  return NextResponse.json({ email: user.email, username });
}

async function getSignedInUser() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }),
    };
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Sign in first." }, { status: 401 }),
    };
  }

  return {
    ok: true as const,
    email: data.user.email ?? "",
    supabase,
    userId: data.user.id,
  };
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    message.includes("could not find the table") ||
    message.includes("does not exist")
  );
}
