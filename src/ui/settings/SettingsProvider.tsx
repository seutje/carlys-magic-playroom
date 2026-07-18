import { useCallback, useEffect, useMemo, useState } from "react";

import {
  defaultSaveData,
  loadSaveData,
  updateSaveData,
  type PersistedSettings,
} from "../../persistence/saveData";
import { diagnostics } from "../../engine/diagnostics/diagnostics";
import { SettingsContext } from "./settingsContext";

export function SettingsProvider({ children }: { readonly children: React.ReactNode }) {
  const [settings, setSettings] = useState(defaultSaveData.settings);

  useEffect(() => {
    let active = true;
    void loadSaveData()
      .then((save) => {
        if (active) setSettings(save.settings);
      })
      .catch(() => diagnostics.record({ category: "persistence", code: "settings-load-failed" }));
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback(async (patch: Partial<PersistedSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
    try {
      const save = await updateSaveData((current) => ({
        ...current,
        settings: { ...current.settings, ...patch },
      }));
      setSettings(save.settings);
    } catch {
      diagnostics.record({ category: "persistence", code: "settings-save-failed" });
    }
  }, []);

  const reset = useCallback(async () => {
    setSettings(defaultSaveData.settings);
    try {
      const save = await updateSaveData((current) => ({
        ...current,
        settings: defaultSaveData.settings,
      }));
      setSettings(save.settings);
    } catch {
      diagnostics.record({ category: "persistence", code: "settings-reset-failed" });
    }
  }, []);

  const value = useMemo(() => ({ settings, update, reset }), [reset, settings, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
