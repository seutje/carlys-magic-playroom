import { execFileSync } from "node:child_process";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

function normalizeBasePath(value: string | undefined): string {
  if (!value || value === "/") return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

function readCommit(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 12);

  try {
    return execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "development";
  }
}

export default defineConfig({
  base: normalizeBasePath(process.env.VITE_BASE_PATH),
  plugins: [react()],
  define: {
    __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version ?? "0.0.0"),
    __BUILD_COMMIT__: JSON.stringify(readCommit()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/testing/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/**/*.d.ts"],
    },
  },
});
