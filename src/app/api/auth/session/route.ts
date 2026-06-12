import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ authenticated: false });
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ authenticated: false });
  }

  const email = data.user.email ?? "";
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const username =
    typeof profile?.username === "string"
      ? profile.username
      : typeof data.user.user_metadata.username === "string"
        ? data.user.user_metadata.username
        : "";

  return NextResponse.json({
    authenticated: true,
    email,
    username,
  });
}
