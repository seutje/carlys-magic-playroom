import { useCallback, useEffect, useState } from "react";

export type StartupStatus = "loading" | "ready" | "error";
export type StartupLoader = () => Promise<void>;

const defaultLoader: StartupLoader = () => Promise.resolve();

export function useStartupResources(loader: StartupLoader = defaultLoader) {
  const [status, setStatus] = useState<StartupStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    void loader().then(
      () => {
        if (active) setStatus("ready");
      },
      () => {
        if (active) setStatus("error");
      },
    );
    return () => {
      active = false;
    };
  }, [attempt, loader]);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }, []);

  return { status, retry } as const;
}
