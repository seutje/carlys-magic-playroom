import { useEffect, useRef } from "react";

import { useOwnedTimeout } from "../../engine/timing/useOwnedTimeout";

export function ParentGate({
  onUnlock,
  onCancel,
}: {
  readonly onUnlock: () => void;
  readonly onCancel: () => void;
}) {
  const { schedule, cancelAll } = useOwnedTimeout();
  const holdButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    holdButton.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [onCancel]);

  const begin = () => {
    cancelAll();
    schedule(onUnlock, 1_800);
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="parent-gate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="parent-gate-title"
      >
        <h2 id="parent-gate-title">Grown-up area</h2>
        <p>This is only an accidental-tap check, not a security lock.</p>
        <p>Press and hold the button until the ring fills.</p>
        <button
          type="button"
          ref={holdButton}
          className="parent-hold-button"
          onPointerDown={begin}
          onPointerUp={cancelAll}
          onPointerCancel={cancelAll}
          onPointerLeave={cancelAll}
          onKeyDown={(event) => {
            if (!event.repeat && (event.key === "Enter" || event.key === " ")) begin();
          }}
          onKeyUp={(event) => {
            if (event.key === "Enter" || event.key === " ") cancelAll();
          }}
        >
          Hold for grown-up controls
        </button>
        <button type="button" onClick={onCancel}>
          Back to play
        </button>
      </section>
    </div>
  );
}
