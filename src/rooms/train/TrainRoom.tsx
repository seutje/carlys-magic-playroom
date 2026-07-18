import { useEffect, useReducer, useRef, useState } from "react";

import { useOwnedTimeout } from "../../engine/timing/useOwnedTimeout";
import { hintDelay, nextHintStep } from "../../engine/hints/hintPlan";
import { isInsideTarget, PointerDragTracker } from "../../engine/input/pointerDrag";
import { useReducedMotion } from "../../ui/useReducedMotion";
import type { RoomComponentProps } from "../roomModule";
import { audioService } from "../../engine/audio/audioService";
import { createBrowserTrainClipPlayer, TrainAudioController } from "./train.audio";
import { generateTrainActivity } from "./train.generator";
import { TRAIN_HINT_PLAN } from "./train.hints";
import { renderTrainInstruction } from "./train.instructions";
import { initialTrainState, reduceTrainActivity } from "./train.machine";
import { defaultTrainProgress, loadTrainProgress, recordTrainCompletion } from "./train.progress";
import { TrainScene } from "./TrainScene";
import type { TrainObjectDefinition } from "./train.types";
import { isMatchingObject } from "./train.validation";

const INITIAL_DEFINITION = generateTrainActivity({
  seed: "welcome-ducks",
  difficulty: 2,
  target: { category: "duck", color: "yellow", count: 2 },
});

export function TrainRoom({ replayRequest, session }: RoomComponentProps) {
  const [state, dispatch] = useReducer(reduceTrainActivity, {
    ...initialTrainState,
    phase: "intro",
    definition: INITIAL_DEFINITION,
  });
  const [manualFeedback, setManualFeedback] = useState("The conductor is waving hello!");
  const [progress, setProgress] = useState(defaultTrainProgress);
  const [round, setRound] = useState(0);
  const [trainAudio] = useState(
    () =>
      new TrainAudioController(
        createBrowserTrainClipPlayer(),
        () => audioService.getSettings(),
        () => audioService.resume(),
      ),
  );
  const lastReplayRequest = useRef(replayRequest);
  const lastSpokenObject = useRef<string | undefined>(undefined);
  const reducedMotion = useReducedMotion();
  const { schedule, cancelAll } = useOwnedTimeout();
  const definition = state.definition ?? INITIAL_DEFINITION;

  useEffect(() => () => trainAudio.stop(), [trainAudio]);

  useEffect(() => {
    trainAudio.beginRound(round);
  }, [round, trainAudio]);

  useEffect(() => {
    if (replayRequest === lastReplayRequest.current) return;
    lastReplayRequest.current = replayRequest;
    trainAudio.replayInstruction();
  }, [replayRequest, trainAudio]);

  useEffect(() => {
    const acceptedObject =
      state.lastDrop?.result === "accepted" ? state.lastDrop.objectId : undefined;
    if (!acceptedObject || acceptedObject === lastSpokenObject.current) return;
    lastSpokenObject.current = acceptedObject;
    trainAudio.speakCount(state.loadedObjectIds.length as 1 | 2 | 3);
  }, [state.lastDrop, state.loadedObjectIds.length, trainAudio]);

  useEffect(() => {
    if (
      state.phase === "hint" &&
      nextHintStep(TRAIN_HINT_PLAN, Math.max(0, state.hintLevel - 1)).repeatInstruction
    ) {
      trainAudio.repeatInstruction();
    }
    if (state.phase === "celebrating") trainAudio.celebrate();
  }, [state.hintLevel, state.phase, trainAudio]);

  useEffect(() => {
    let active = true;
    void loadTrainProgress().then((loadedProgress) => {
      if (active) setProgress(loadedProgress);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (state.phase !== "complete") return;
    let active = true;
    void recordTrainCompletion(
      definition,
      state.mismatchCount,
      `${session.id}:round:${round}`,
    ).then((savedProgress) => {
      if (active) setProgress(savedProgress);
    });
    return () => {
      active = false;
    };
  }, [definition, round, session.id, state.mismatchCount, state.phase]);

  useEffect(() => {
    cancelAll();
    switch (state.phase) {
      case "intro":
        schedule(() => dispatch({ type: "INTRO_FINISHED" }), reducedMotion ? 50 : 700);
        break;
      case "instruction":
        schedule(() => dispatch({ type: "INSTRUCTION_FINISHED" }), 500);
        break;
      case "evaluating":
        schedule(() => dispatch({ type: "EVALUATION_FINISHED" }), reducedMotion ? 80 : 420);
        break;
      case "waiting":
      case "hint":
        schedule(
          () => dispatch({ type: "HINT_TIMEOUT" }),
          hintDelay(TRAIN_HINT_PLAN, state.hintLevel),
        );
        break;
      case "celebrating":
        // This owned timeout is also the watchdog if a visual animation is interrupted.
        schedule(() => dispatch({ type: "CELEBRATION_FINISHED" }), reducedMotion ? 250 : 2_000);
        break;
      case "loading":
      case "complete":
      case "paused":
      case "exiting":
      case "error":
        break;
      default:
        assertNever(state.phase);
    }
    return cancelAll;
  }, [cancelAll, reducedMotion, replayRequest, schedule, state.hintLevel, state.phase]);

  const handleDrop = (objectId: string, insideTrain: boolean) => {
    if (!insideTrain) {
      setManualFeedback("Almost! Bring the toy close to the big blue train car.");
      return;
    }
    cancelAll();
    dispatch({ type: "OBJECT_DROPPED", objectId });
  };

  const interactionLocked = !["waiting", "hint"].includes(state.phase);
  const visibleObjects =
    state.hintLevel >= 3
      ? definition.objects.filter(
          (object) =>
            state.loadedObjectIds.includes(object.id) || isMatchingObject(definition, object),
        )
      : definition.objects;

  return (
    <section className="train-room" aria-labelledby="train-room-title">
      <h1 id="train-room-title" className="sr-only">
        Tiny Delivery Train
      </h1>
      <TrainScene
        definition={{ ...definition, objects: visibleObjects }}
        loadedObjectIds={state.loadedObjectIds}
        hintLevel={state.hintLevel}
        interactionLocked={interactionLocked}
        reducedMotion={reducedMotion}
        departing={state.phase === "celebrating" || state.phase === "complete"}
        onDrop={handleDrop}
      />
      <div className="train-instruction" aria-live="polite">
        <span aria-hidden="true" className="conductor-face">
          😊
        </span>
        <div>
          <p className="eyebrow">Tiny Delivery Train</p>
          <p className="instruction-copy">{renderTrainInstruction(definition.instruction)}</p>
          <p className="train-feedback">{feedbackText(state, manualFeedback)}</p>
        </div>
      </div>
      <div className="count-display" aria-label={`${state.loadedObjectIds.length} toys loaded`}>
        {Array.from({ length: definition.target.count }, (_, index) => (
          <span
            key={index}
            className={index < state.loadedObjectIds.length ? "filled" : ""}
            aria-hidden="true"
          >
            {index < state.loadedObjectIds.length ? "★" : "☆"}
          </span>
        ))}
      </div>
      <p
        className="train-progress"
        aria-label={`${progress.completedActivities} train trips completed`}
      >
        Trips: {progress.completedActivities}
      </p>
      <div className="train-dom-drop-zone" data-testid="train-drop-zone" aria-hidden="true" />
      <div className="train-toy-controls" aria-label="Toys to load">
        {visibleObjects
          .filter((object) => !state.loadedObjectIds.includes(object.id))
          .map((object) => (
            <ToyButton
              key={object.id}
              object={object}
              disabled={interactionLocked}
              highlighted={state.hintLevel >= 2 && isMatchingObject(definition, object)}
              onDrop={(insideTrain) => handleDrop(object.id, insideTrain)}
            />
          ))}
      </div>
      {state.phase === "celebrating" ? (
        <div className="train-celebration" role="status">
          <span aria-hidden="true">★ ✦ ★</span>
          <strong>All aboard!</strong>
        </div>
      ) : null}
      {state.phase === "complete" ? (
        <button
          className="train-play-again"
          type="button"
          onClick={() => {
            setManualFeedback("The conductor is ready again!");
            lastSpokenObject.current = undefined;
            setRound((value) => value + 1);
            dispatch({ type: "RESET" });
          }}
        >
          Play again
        </button>
      ) : null}
    </section>
  );
}

function ToyButton({
  object,
  disabled,
  highlighted,
  onDrop,
}: {
  readonly object: TrainObjectDefinition;
  readonly disabled: boolean;
  readonly highlighted: boolean;
  readonly onDrop: (insideTrain: boolean) => void;
}) {
  const drag = useRef(new PointerDragTracker());
  const start = useRef({ x: 0, y: 0 });
  const dragged = useRef(false);

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>, canceled = false) => {
    if (!drag.current.owns(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const moved = drag.current.finish(event.pointerId);
    event.currentTarget.style.transform = "";
    if (!canceled && moved) {
      const dropZone = document.querySelector<HTMLElement>("[data-testid='train-drop-zone']");
      const bounds = dropZone?.getBoundingClientRect();
      const inside = Boolean(
        bounds && isInsideTarget({ x: event.clientX, y: event.clientY }, bounds, 12),
      );
      onDrop(inside);
    }
    window.setTimeout(() => {
      dragged.current = false;
    }, 0);
  };

  return (
    <button
      type="button"
      className={highlighted ? "hinted" : ""}
      disabled={disabled}
      aria-label={`Load ${object.color} ${object.category}`}
      onClick={() => {
        if (!dragged.current) onDrop(true);
      }}
      onPointerDown={(event) => {
        drag.current.begin(event.pointerId, { x: event.clientX, y: event.clientY });
        start.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!drag.current.owns(event.pointerId)) return;
        const x = event.clientX - start.current.x;
        const y = event.clientY - start.current.y;
        if (!drag.current.move(event.pointerId, { x: event.clientX, y: event.clientY })) return;
        dragged.current = true;
        event.currentTarget.style.transform = `translate(${x}px, ${y}px) scale(1.08)`;
      }}
      onPointerUp={(event) => finishDrag(event)}
      onPointerCancel={(event) => finishDrag(event, true)}
    >
      <span aria-hidden="true">
        {object.category === "duck" ? "🦆" : object.category === "apple" ? "🍎" : "●"}
      </span>
      <span className="toy-color-name">{object.color}</span>
    </button>
  );
}

function feedbackText(state: ReturnType<typeof reduceTrainActivity>, fallback: string): string {
  const result = state.lastDrop?.result;
  if (result === "accepted") return `${state.loadedObjectIds.length}! The train smiles.`;
  if (result === "rejected") return "That toy can wiggle back. Let's find another one!";
  if (result === "duplicate") return "That toy is already cozy on the train.";
  if (state.hintLevel === 1) return "The big blue train car is glowing.";
  if (state.hintLevel === 2) return "Look for the wiggly matching toy.";
  if (state.hintLevel === 3) return "Here are the toys that can ride today.";
  return fallback;
}

function assertNever(value: never): never {
  throw new Error(`Unexpected train phase: ${String(value)}`);
}
