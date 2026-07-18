import { useEffect, useState } from "react";

import { useSettings } from "./settings/settingsContext";

const QUERY = "(prefers-reduced-motion: reduce)";

export function useReducedMotion(): boolean {
  const { settings } = useSettings();
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion || settings.reducedMotion;
}

export function useReducedEffects(): boolean {
  const { settings } = useSettings();
  return settings.reducedEffects || settings.reducedMotion;
}
