/** Resolves an app-owned asset beneath Vite's configured deployment base. */
export function assetUrl(relativePath: string): string {
  const normalized = relativePath.replace(/^\.\//, "");

  if (!normalized || normalized.startsWith("/") || normalized.includes("..")) {
    throw new Error("Asset paths must be non-empty, relative, and remain inside the app");
  }

  return `${import.meta.env.BASE_URL}${normalized}`;
}
