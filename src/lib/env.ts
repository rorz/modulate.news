import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);
const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const envSchema = z.object({
  AI_GATEWAY_API_KEY: optionalString,
  BLOB_READ_WRITE_TOKEN: optionalString,
  ELEVENLABS_API_KEY: optionalString,
  ELEVENLABS_HOST_A_VOICE_ID: optionalString,
  ELEVENLABS_HOST_B_VOICE_ID: optionalString,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalString,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  OPENAI_API_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
});

export const env = envSchema.parse(process.env);

export function getSupabaseBrowserKey() {
  return env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
}

export function hasSupabaseBrowserConfig() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && getSupabaseBrowserKey());
}

export function hasElevenLabsConfig() {
  return Boolean(env.ELEVENLABS_API_KEY);
}

export function hasBlobConfig() {
  return Boolean(env.BLOB_READ_WRITE_TOKEN);
}
