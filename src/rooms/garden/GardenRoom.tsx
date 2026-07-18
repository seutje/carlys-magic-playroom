import { useEffect, useReducer, useRef, useState } from "react";

import { audioService } from "../../engine/audio/audioService";
import { useOwnedTimeout } from "../../engine/timing/useOwnedTimeout";
import { useReducedMotion } from "../../ui/useReducedMotion";
import type { RoomComponentProps } from "../roomModule";
import { GardenAudioController } from "./garden.audio";
import { generateGardenActivity } from "./garden.generator";
import { createGardenState, reduceGarden } from "./garden.machine";
import {
  defaultGardenProgress,
  loadGardenProgress,
  recordGardenCompletion,
} from "./garden.persistence";
import { GardenScene } from "./GardenScene";
import type { GardenAction } from "./garden.types";

export function GardenRoom({ replayRequest, session }: RoomComponentProps) {
  const [round, setRound] = useState(0);
  const [state, dispatch] = useReducer(
    reduceGarden,
    generateGardenActivity("garden-round-0", 1),
    createGardenState,
  );
  const [progress, setProgress] = useState(defaultGardenProgress);
  const [gardenAudio] = useState(
    () =>
      new GardenAudioController(
        () => audioService.getSettings(),
        () => audioService.resume(),
      ),
  );
  const lastReplay = useRef(replayRequest);
  const savedCompletion = useRef<string | undefined>(undefined);
  const reducedMotion = useReducedMotion();
  const { schedule, watchdog, cancelAll } = useOwnedTimeout();
  const expectedAction =
    state.definition.task[state.actionIndex] ?? state.definition.task[0] ?? "water";

  useEffect(() => {
    let active = true;
    void loadGardenProgress().then((loaded) => {
      if (active) setProgress(loaded);
    });
    return () => {
      active = false;
      gardenAudio.stop();
    };
  }, [gardenAudio]);

  useEffect(() => {
    cancelAll();
    if (state.phase === "intro") {
      schedule(() => dispatch({ type: "INTRO_FINISHED" }), reducedMotion ? 50 : 600);
    } else if (state.phase === "waiting") {
      schedule(() => dispatch({ type: "HINT_TIMEOUT" }), 5_000);
    } else if (state.phase === "evaluating") {
      schedule(() => dispatch({ type: "EFFECT_FINISHED" }), reducedMotion ? 100 : 550);
    } else if (state.phase === "celebrating") {
      watchdog(() => dispatch({ type: "CELEBRATION_FINISHED" }), reducedMotion ? 250 : 1_200);
    }
    return cancelAll;
  }, [
    cancelAll,
    reducedMotion,
    schedule,
    state.actionIndex,
    state.hintLevel,
    state.phase,
    watchdog,
  ]);

  useEffect(() => {
    if (state.phase === "waiting") gardenAudio.instruct(expectedAction, true);
    if (state.phase === "celebrating") gardenAudio.celebrate();
  }, [expectedAction, gardenAudio, state.phase]);

  useEffect(() => {
    if (replayRequest === lastReplay.current) return;
    lastReplay.current = replayRequest;
    gardenAudio.instruct(expectedAction, true);
  }, [expectedAction, gardenAudio, replayRequest]);

  useEffect(() => {
    if (state.phase !== "complete") return;
    const completionId = `${session.id}:round:${round}`;
    if (savedCompletion.current === completionId) return;
    savedCompletion.current = completionId;
    void recordGardenCompletion(state.definition, state.mismatchCount, completionId).then(
      setProgress,
    );
  }, [round, session.id, state.definition, state.mismatchCount, state.phase]);

  const act = (action: GardenAction) => dispatch({ type: "ACT", action });
  const interactionLocked = state.phase !== "waiting";

  return (
    <section className="garden-room" aria-labelledby="garden-title">
      <h1 id="garden-title" className="sr-only">
        Little Garden
      </h1>
      <GardenScene state={state} reducedEffects={reducedMotion} />
      <div className="garden-guide" aria-live="polite">
        <span aria-hidden="true">*</span>
        <div>
          <p className="eyebrow">Little Garden</p>
          <strong>{instructionText(expectedAction, state.phase)}</strong>
          <p>{feedbackText(state.feedback)}</p>
        </div>
      </div>
      <div className={`garden-controls hint-${state.hintLevel}`} aria-label="Garden helpers">
        <button
          type="button"
          disabled={interactionLocked || (state.hintLevel === 2 && expectedAction !== "water")}
          onClick={() => act("water")}
          aria-label="Tap rain cloud"
        >
          <span aria-hidden="true">☁</span>
          Rain
        </button>
        <button
          type="button"
          disabled={interactionLocked || (state.hintLevel === 2 && expectedAction !== "sun")}
          onClick={() => act("sun")}
          aria-label="Tap warm sun"
        >
          <span aria-hidden="true">☀</span>
          Sun
        </button>
      </div>
      <div className="garden-levels" aria-label="Garden progress">
        <span>Water {state.water}/3</span>
        <span>Light {state.light}/3</span>
        <span>Growth {state.growth}/3</span>
      </div>
      <button
        className="garden-pause"
        type="button"
        disabled={state.phase !== "waiting" && state.phase !== "paused"}
        onClick={() => dispatch({ type: state.phase === "paused" ? "RESUME" : "PAUSE" })}
        aria-label={state.phase === "paused" ? "Resume garden" : "Pause garden"}
      >
        {state.phase === "paused" ? "▶" : "Ⅱ"}
      </button>
      {state.phase === "paused" ? (
        <div className="garden-paused" role="status">
          The garden is resting.
        </div>
      ) : null}
      {state.phase === "celebrating" ? (
        <div className="garden-celebration" role="status">
          <span aria-hidden="true">✿</span>
          The garden grew!
        </div>
      ) : null}
      {state.phase === "complete" ? (
        <button
          className="garden-next"
          type="button"
          onClick={() => {
            const nextRound = round + 1;
            setRound(nextRound);
            savedCompletion.current = undefined;
            dispatch({
              type: "RESET",
              definition: generateGardenActivity(
                `garden-round-${nextRound}`,
                nextRound === 1 ? 2 : 1,
              ),
            });
          }}
        >
          {round === 0 ? "Try two steps" : "Grow another"}
        </button>
      ) : null}
      <p className="garden-saved">Garden games: {progress.completedActivities}</p>
    </section>
  );
}

function instructionText(action: GardenAction, phase: string): string {
  if (phase === "complete" || phase === "celebrating") return "Look what grew!";
  return action === "water" ? "Tap the rain cloud." : "Tap the warm sun.";
}

function feedbackText(feedback: "ready" | "growing" | "extra" | "complete"): string {
  if (feedback === "growing") return "Wiggle, stretch, grow!";
  if (feedback === "extra") return "The plant liked that too. Let's try the other helper!";
  if (feedback === "complete") return "The garden is waving hello!";
  return "Every helper makes the garden happy.";
}
