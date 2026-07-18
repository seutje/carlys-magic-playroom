import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function offlineAssetsPlugin(base: string, version: string): Plugin {
  return {
    name: "playroom-offline-assets",
    generateBundle(_: unknown, bundle: Record<string, unknown>) {
      const publicDirectory = resolve("public");
      const publicAssets = listFiles(publicDirectory)
        .map((path) => relative(publicDirectory, path).replaceAll("\\", "/"))
        .filter((path) =>
          /^(audio\/.*\.(?:mp3|ogg)|icons\/.*\.(?:png|svg)|models\/.*\.glb)$/.test(path),
        );
      const urls = ["index.html", "manifest.webmanifest", ...Object.keys(bundle), ...publicAssets]
        .filter((path, index, paths) => paths.indexOf(path) === index)
        .map((path) => `${base}${path}`);
      const manifest = {
        name: "Carly's Magic Playroom",
        short_name: "Magic Playroom",
        description: "A warm, forgiving educational toy for young children.",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#eadfff",
        theme_color: "#7252b8",
        icons: [192, 512].map((size) => ({
          src: `${base}icons/playroom-icon-${size}.png`,
          sizes: `${size}x${size}`,
          type: "image/png",
          purpose: "any maskable",
        })),
      };

      this.emitFile({
        type: "asset",
        fileName: "manifest.webmanifest",
        source: JSON.stringify(manifest, null, 2),
      });
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: serviceWorkerSource(base, version, urls),
      });
    },
  };
}

function serviceWorkerSource(base: string, version: string, urls: readonly string[]): string {
  return `const CACHE_NAME = ${JSON.stringify(`playroom-${version}`)};
const ROOT = ${JSON.stringify(base)};
const PRECACHE_URLS = ${JSON.stringify(urls)};

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(PRECACHE_URLS.map(async (url) => {
      const response = await fetch(new Request(url, { cache: "reload" }));
      if (response.ok) await cache.put(url, response);
    }));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("playroom-") && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(ROOT)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (request.mode === "navigate") {
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(ROOT + "index.html", response.clone());
        return response;
      } catch {
        return (await cache.match(ROOT + "index.html", { ignoreVary: true })) || Response.error();
      }
    }

    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return new Response("Asset unavailable offline", { status: 503, headers: { "Content-Type": "text/plain" } });
    }
  })());
});
`;
}

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

const base = normalizeBasePath(process.env.VITE_BASE_PATH);
const commit = readCommit();
const cacheVersion = commit === "development" ? `local-${Date.now().toString(36)}` : commit;

export default defineConfig({
  base,
  plugins: [react(), offlineAssetsPlugin(base, cacheVersion)],
  build: {
    manifest: true,
  },
  define: {
    __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version ?? "0.0.0"),
    __BUILD_COMMIT__: JSON.stringify(commit),
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
