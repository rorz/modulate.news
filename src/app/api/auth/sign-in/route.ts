import { NextResponse } from "next/server";
import { z } from "zod";

import { hasSupabaseBrowserConfig } from "@/lib/env";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase";

const signInRequest = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export async function POST(request: Request) {
  const parsed = signInRequest.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and a password with at least 6 characters." },
      { status: 400 },
    );
  }

  if (!hasSupabaseBrowserConfig()) {
    return NextResponse.json({
      error: "Supabase auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    }, { status: 503 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable." }, { status: 500 });
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (!signInError && signInData.user) {
    return authResponse(signInData.user, parsed.data.email, "signed-in");
  }

  if (isUnconfirmedEmailError(signInError?.message)) {
    const confirmed = await confirmExistingUser(parsed.data.email);

    if (!confirmed.ok) {
      return confirmed.response;
    }

    return signInAfterConfirmation(supabase, parsed.data.email, parsed.data.password);
  }

  if (!isMissingAccountError(signInError?.message)) {
    return NextResponse.json(
      { error: "That email exists, but the password did not match." },
      { status: 400 },
    );
  }

  const adminCreate = await createConfirmedUser(parsed.data.email, parsed.data.password);

  if (adminCreate.ok) {
    return signInAfterConfirmation(supabase, parsed.data.email, parsed.data.password);
  }

  if (!adminCreate.canFallbackToClientSignUp) {
    return adminCreate.response;
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  if (!signUpData.session || !signUpData.user) {
    return NextResponse.json(
      {
        error:
          "Account created, but email confirmation is enabled and SUPABASE_SERVICE_ROLE_KEY is not configured.",
      },
      { status: 409 },
    );
  }

  return authResponse(signUpData.user, parsed.data.email, "signed-up");
}

async function createConfirmedUser(email: string, password: string) {
  const admin = getSupabaseAdminClient();

  if (!admin) {
    return { canFallbackToClientSignUp: true as const, ok: false as const };
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
  });

  if (!error) {
    return { ok: true as const };
  }

  if (isAlreadyRegisteredError(error.message)) {
    const confirmed = await confirmExistingUser(email);
    return confirmed.ok
      ? { ok: true as const }
      : { canFallbackToClientSignUp: false as const, ok: false as const, response: confirmed.response };
  }

  return {
    canFallbackToClientSignUp: false as const,
    ok: false as const,
    response: NextResponse.json({ error: error.message }, { status: 400 }),
  };
}

function isMissingAccountError(message?: string) {
  const normalized = message?.toLowerCase() ?? "";
  return (
    normalized.includes("invalid login credentials") ||
    normalized.includes("user not found") ||
    normalized.includes("user_not_found")
  );
}

function isUnconfirmedEmailError(message?: string) {
  const normalized = message?.toLowerCase() ?? "";
  return normalized.includes("email not confirmed") || normalized.includes("not confirmed");
}

function isAlreadyRegisteredError(message?: string) {
  const normalized = message?.toLowerCase() ?? "";
  return normalized.includes("already") || normalized.includes("registered");
}

async function confirmExistingUser(email: string) {
  const admin = getSupabaseAdminClient();

  if (!admin) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            "Email confirmation is enabled and SUPABASE_SERVICE_ROLE_KEY is not configured.",
        },
        { status: 409 },
      ),
    };
  }

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });

    if (error) {
      return {
        ok: false as const,
        response: NextResponse.json({ error: error.message }, { status: 400 }),
      };
    }

    const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      const { error: confirmError } = await admin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

      if (confirmError) {
        return {
          ok: false as const,
          response: NextResponse.json({ error: confirmError.message }, { status: 400 }),
        };
      }

      return { ok: true as const };
    }

    if (data.users.length < 100) {
      break;
    }
  }

  return {
    ok: false as const,
    response: NextResponse.json({ error: "Unable to find unconfirmed user." }, { status: 404 }),
  };
}

async function signInAfterConfirmation(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
  email: string,
  password: string,
) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to sign in after confirmation." },
      { status: 400 },
    );
  }

  return authResponse(data.user, email, "signed-in");
}

function authResponse(
  user: {
    email?: string;
    user_metadata?: {
      username?: unknown;
    };
  },
  fallbackEmail: string,
  mode: "signed-in" | "signed-up",
) {
  return NextResponse.json({
    email: user.email ?? fallbackEmail,
    mode,
    username: typeof user.user_metadata?.username === "string" ? user.user_metadata.username : "",
  });
}
