import { createContext, useContext } from "react";

import { defaultSaveData, type PersistedSettings } from "../../persistence/saveData";

export interface SettingsContextValue {
  readonly settings: PersistedSettings;
  readonly update: (patch: Partial<PersistedSettings>) => Promise<void>;
  readonly reset: () => Promise<void>;
}

const fallback: SettingsContextValue = {
  settings: defaultSaveData.settings,
  update: () => Promise.resolve(),
  reset: () => Promise.resolve(),
};

export const SettingsContext = createContext<SettingsContextValue>(fallback);

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
