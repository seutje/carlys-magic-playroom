import { useEffect, useState } from "react";

import { diagnostics } from "../engine/diagnostics/diagnostics";
import type { RoomId } from "../types/domain";
import { RoomErrorBoundary } from "./RoomErrorBoundary";
import { ROOM_LOADERS } from "./roomLoaders";
import type { RoomModule, RoomModuleLoader } from "./roomModule";

interface RoomHostProps {
  readonly roomId: RoomId;
  readonly onHome: () => void;
  readonly onReplayInstruction: () => void;
  readonly loader?: RoomModuleLoader;
}

type LoadState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly room: RoomModule }
  | { readonly kind: "error" };

export function RoomHost({
  roomId,
  onHome,
  onReplayInstruction,
  loader = ROOM_LOADERS[roomId],
}: RoomHostProps) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const retry = () => {
    setState({ kind: "loading" });
    setAttempt((value) => value + 1);
  };

  useEffect(() => {
    let active = true;
    void loader().then(
      (room) => {
        if (!active) return;
        if (room.id !== roomId) {
          diagnostics.record({ category: "activity", code: "room-id-mismatch" });
          setState({ kind: "error" });
          return;
        }
        setState({ kind: "ready", room });
      },
      () => {
        if (!active) return;
        diagnostics.record({ category: "asset", code: `room-load-failed:${roomId}` });
        setState({ kind: "error" });
      },
    );
    return () => {
      active = false;
    };
  }, [attempt, loader, roomId]);

  if (state.kind === "loading") {
    return (
      <section className="room-loading" role="status">
        <div aria-hidden="true">✦</div>
        <p>Gathering room magic…</p>
      </section>
    );
  }

  if (state.kind === "error") {
    return (
      <section className="room-recovery" role="alert">
        <div aria-hidden="true">✨</div>
        <h1>This room is still waking up.</h1>
        <p>Let&apos;s give it another gentle try.</p>
        <div className="recovery-actions">
          <button type="button" onClick={retry}>
            Try again
          </button>
          <button type="button" onClick={onHome}>
            Go home
          </button>
        </div>
      </section>
    );
  }

  const RoomComponent = state.room.Component;
  return (
    <RoomErrorBoundary key={`${roomId}:${attempt}`} onHome={onHome} onRetry={retry}>
      <RoomComponent onReplayInstruction={onReplayInstruction} />
    </RoomErrorBoundary>
  );
}
