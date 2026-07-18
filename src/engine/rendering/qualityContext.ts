import { createContext, useContext } from "react";

import { QUALITY_PROFILES, type QualityProfile } from "./quality";

export const QualityContext = createContext<QualityProfile>(QUALITY_PROFILES.medium);

export function useQuality(): QualityProfile {
  return useContext(QualityContext);
}
