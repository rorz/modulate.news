import { z } from "zod";

const envSchema = z.object({
  ELEVENLABS_API_KEY: z.string().min(1).optional(),
  ELEVENLABS_HOST_A_VOICE_ID: z.string().min(1).optional(),
  ELEVENLABS_HOST_B_VOICE_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);

export function hasSupabaseBrowserConfig() {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasElevenLabsConfig() {
  return Boolean(env.ELEVENLABS_API_KEY);
}
