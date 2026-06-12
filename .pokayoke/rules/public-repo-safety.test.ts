import { describe, expect, test } from "bun:test";

import { publicRepoSafety } from "./public-repo-safety.rule";

function createContext({
  files = [],
  textByFile = {},
}: {
  files?: string[];
  textByFile?: Record<string, string>;
}) {
  return {
    files: async () => files,
    fix: false,
    glob: async () => files.filter((file) => file === ".env" || file.startsWith(".env.")),
    options: undefined,
    packageJson: async () => ({}),
    parseTypescript: async () => {
      throw new Error("parseTypescript is not used by this rule.");
    },
    readFile: async (file: string) => textByFile[file] ?? "",
    report: () => {},
    root: "/tmp/modulate-test",
    workspaces: async () => [],
  };
}

describe("repo/public-repo-safety", () => {
  test("allows the committed env example", async () => {
    const result = await publicRepoSafety.run(
      createContext({
        files: [".env.example"],
        textByFile: { ".env.example": ["ELEVENLABS_API_KEY", ""].join("=") },
      }),
    );

    expect(result.findings).toHaveLength(0);
  });

  test("reports local env files and concrete secret-looking values", async () => {
    const result = await publicRepoSafety.run(
      createContext({
        files: [".env.local", "README.md"],
        textByFile: {
          ".env.local": ["ELEVENLABS_API_KEY", "real-value"].join("="),
          "README.md": ["SUPABASE_SERVICE_ROLE_KEY", "real-value"].join("="),
        },
      }),
    );

    expect(result.findings).toHaveLength(3);
  });
});
