import { useCallback, useEffect, useRef } from "react";

import { OwnedTimers } from "./ownedTimers";

/** Owns cancellable timeouts for one mounted lifecycle. */
export function useOwnedTimeout() {
  const timers = useRef<OwnedTimers | undefined>(undefined);
  timers.current ??= new OwnedTimers();

  const cancelAll = useCallback(() => {
    timers.current?.cancelAll();
  }, []);

  const schedule = useCallback((callback: () => void, delayMs: number) => {
    return timers.current?.schedule(callback, delayMs);
  }, []);

  const watchdog = useCallback((callback: () => void, deadlineMs: number) => {
    return timers.current?.watchdog(callback, deadlineMs);
  }, []);

  useEffect(() => cancelAll, [cancelAll]);

  return { schedule, watchdog, cancelAll } as const;
}
