import { type ReactNode, useMemo } from "react";

import { resolveQuality } from "./quality";
import { QualityContext } from "./qualityContext";

export function QualityProvider({ children }: { readonly children: ReactNode }) {
  const profile = useMemo(() => {
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return resolveQuality(window.location.search, {
      ...(deviceMemory === undefined ? {} : { deviceMemory }),
      hardwareConcurrency: navigator.hardwareConcurrency,
      devicePixelRatio: window.devicePixelRatio,
      viewportWidth: window.innerWidth,
    });
  }, []);
  return <QualityContext.Provider value={profile}>{children}</QualityContext.Provider>;
}
