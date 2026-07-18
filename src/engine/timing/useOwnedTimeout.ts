import { useCallback, useEffect, useRef } from "react";

/** Owns cancellable timeouts for one mounted lifecycle. */
export function useOwnedTimeout() {
  const timers = useRef(new Set<ReturnType<typeof window.setTimeout>>());

  const cancelAll = useCallback(() => {
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current.clear();
  }, []);

  const schedule = useCallback((callback: () => void, delayMs: number) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delayMs);
    timers.current.add(timer);
    return timer;
  }, []);

  useEffect(() => cancelAll, [cancelAll]);

  return { schedule, cancelAll } as const;
}
