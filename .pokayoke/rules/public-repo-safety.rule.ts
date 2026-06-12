import { spawnSync } from "node:child_process";

import type { Rule } from "pokayoke";

const allowedEnvFiles = new Set([".env.example"]);
const secretPattern =
  /(ELEVENLABS_API_KEY|SUPABASE_SERVICE_ROLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY)[^\S\r\n]*=[^\S\r\n]*(?=\S)(?!<|your-|change-me|example)/i;

export const publicRepoSafety: Rule = {
  meta: {
    id: "repo/public-repo-safety",
    docs: "Keep the repository safe to publish by allowing only placeholder environment files and blocking obvious secret literals.",
    kind: "project",
  },
  async run(context) {
    const findings = [];
    const envFiles = await context.glob([".env", ".env.*"]);

    for (const file of envFiles) {
      if (!allowedEnvFiles.has(file) && !isGitIgnored(context.root, file)) {
        findings.push({
          ruleId: "repo/public-repo-safety",
          severity: "error" as const,
          message: "Do not commit local environment files.",
          file,
          advice: "Keep secrets in your shell, Supabase, or Vercel env vars. Commit .env.example only.",
        });
      }
    }

    for (const file of await context.files()) {
      const text = await context.readFile(file);

      if (secretPattern.test(text)) {
        findings.push({
          ruleId: "repo/public-repo-safety",
          severity: "error" as const,
          message: "Potential committed provider secret.",
          file,
          advice: "Replace the value with an empty placeholder and rotate the exposed secret.",
        });
      }
    }

    return { findings };
  },
};

function isGitIgnored(root: string, file: string) {
  const result = spawnSync("git", ["check-ignore", "-q", file], {
    cwd: root,
    stdio: "ignore",
  });

  return result.status === 0;
}
