import { lazy, Suspense, useCallback, useEffect, useReducer, useRef, useState } from "react";

import { audioService, type AudioAvailability } from "../engine/audio/audioService";
import { BuildDiagnostics } from "../engine/diagnostics/BuildDiagnostics";
import { useOwnedTimeout } from "../engine/timing/useOwnedTimeout";
import { PortalControls } from "../playroom/PortalControls";
import { RoomHost } from "../rooms/RoomHost";
import { initialAppView, reduceNavigation } from "../state/navigation";
import type { RoomId } from "../types/domain";
import { GlobalControls } from "../ui/controls/GlobalControls";
import { ParentArea } from "../ui/settings/ParentArea";
import { ParentGate } from "../ui/settings/ParentGate";
import { SettingsProvider } from "../ui/settings/SettingsProvider";
import { useSettings } from "../ui/settings/settingsContext";
import { useReducedMotion } from "../ui/useReducedMotion";
import { StartupScreen } from "./StartupScreen";
import { useStartupResources } from "./useStartupResources";

const ROOM_CATEGORY = {
  train: "counting",
  critter: "creativity",
  garden: "nature",
  shapes: "shapes",
  music: "music",
} as const;

const PlayroomScene = lazy(() =>
  import("../playroom/PlayroomScene").then(({ PlayroomScene: Component }) => ({
    default: Component,
  })),
);

export function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

function AppContent() {
  const [view, dispatch] = useReducer(reduceNavigation, initialAppView);
  const [audioAvailability, setAudioAvailability] = useState<AudioAvailability>("idle");
  const [parentView, setParentView] = useState<"closed" | "gate" | "area">("closed");
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const [replayCount, setReplayCount] = useState(0);
  const startup = useStartupResources();
  const reducedMotion = useReducedMotion();
  const { settings } = useSettings();
  const availableRooms = settings.enabledRooms.filter((roomId) =>
    settings.enabledLearningCategories.includes(ROOM_CATEGORY[roomId]),
  );
  const { schedule, cancelAll } = useOwnedTimeout();
  const closeParent = useCallback(() => {
    setParentView("closed");
    settingsButton.current?.focus();
  }, []);

  useEffect(() => {
    audioService.setMuted(settings.muted);
    audioService.setMasterVolume(settings.masterVolume);
    audioService.setChannelVolumes(settings.musicVolume, settings.speechVolume);
  }, [settings.masterVolume, settings.musicVolume, settings.muted, settings.speechVolume]);

  useEffect(() => {
    if (view.kind !== "transitioning") return;
    const roomId = view.roomId;
    schedule(() => dispatch({ type: "TRANSITION_FINISHED", roomId }), reducedMotion ? 80 : 650);
    return cancelAll;
  }, [cancelAll, reducedMotion, schedule, view]);

  const startPlay = useCallback(() => {
    void audioService.initialize().then(setAudioAvailability);
    dispatch({ type: "PLAY" });
  }, []);

  const selectRoom = useCallback(
    (roomId: RoomId) => {
      if (availableRooms.includes(roomId)) dispatch({ type: "SELECT_ROOM", roomId });
    },
    [availableRooms],
  );

  const goHome = useCallback(() => {
    dispatch({ type: "HOME" });
  }, []);

  const replayInstruction = useCallback(() => {
    setReplayCount((count) => count + 1);
    void audioService.resume().then(setAudioAvailability);
  }, []);

  if (view.kind === "startup") {
    return (
      <>
        <StartupScreen
          status={startup.status}
          audioAvailability={audioAvailability}
          onPlay={startPlay}
          onRetry={() => startup.retry()}
        />
        <BuildDiagnostics />
      </>
    );
  }

  const inPlayroom = view.kind === "playroom" || view.kind === "transitioning";
  const transitioningRoom = view.kind === "transitioning" ? view.roomId : undefined;

  return (
    <main
      className={`game-shell ${settings.highContrast ? "high-contrast" : ""} ${settings.reducedEffects ? "reduced-effects" : ""}`}
    >
      {inPlayroom ? (
        <>
          <Suspense
            fallback={
              <div className="scene-loading" role="status">
                Painting the playroom…
              </div>
            }
          >
            <PlayroomScene
              transitioningTo={transitioningRoom}
              reducedMotion={reducedMotion}
              enabledRooms={availableRooms}
              interactionLocked={view.kind === "transitioning"}
              onSelectRoom={selectRoom}
            />
          </Suspense>
          <header className="playroom-heading">
            <p className="eyebrow">Carly&apos;s Magic Playroom</p>
            <h1>Where shall we play?</h1>
          </header>
          <PortalControls
            disabled={view.kind === "transitioning"}
            enabledRooms={availableRooms}
            onSelectRoom={selectRoom}
          />
        </>
      ) : null}
      {view.kind === "room" ? (
        <RoomHost roomId={view.roomId} onHome={goHome} replayRequest={replayCount} />
      ) : null}
      {view.kind === "transitioning" ? (
        <div className={`transition-cover ${reducedMotion ? "reduced" : ""}`} role="status">
          <span aria-hidden="true">✦</span>
          <span className="sr-only">Opening the room</span>
        </div>
      ) : null}
      <GlobalControls
        homeDisabled={view.kind === "playroom"}
        onHome={goHome}
        onReplay={replayInstruction}
        onSettings={() => setParentView(parentUnlocked ? "area" : "gate")}
        settingsButtonRef={settingsButton}
      />
      <p className="sr-only" aria-live="polite">
        {replayCount > 0 ? "Instruction replayed" : ""}
      </p>
      {parentView === "gate" ? (
        <ParentGate
          onUnlock={() => {
            setParentUnlocked(true);
            setParentView("area");
          }}
          onCancel={closeParent}
        />
      ) : null}
      {parentView === "area" ? <ParentArea onClose={closeParent} /> : null}
      <BuildDiagnostics />
    </main>
  );
}
