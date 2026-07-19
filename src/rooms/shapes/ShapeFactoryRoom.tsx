import { useEffect, useReducer, useRef, useState } from "react";

import { audioService } from "../../engine/audio/audioService";
import { isInsideTarget, PointerDragTracker } from "../../engine/input/pointerDrag";
import { useOwnedTimeout } from "../../engine/timing/useOwnedTimeout";
import { useSettings } from "../../ui/settings/settingsContext";
import { useReducedMotion } from "../../ui/useReducedMotion";
import type { RoomComponentProps } from "../roomModule";
import { ShapeAudioController } from "./shapes.audio";
import { generateShapeFactory, matchesRule } from "./shapes.generator";
import { activeStep, createShapeFactoryState, reduceShapeFactory } from "./shapes.machine";
import {
  defaultShapeProgress,
  loadShapeProgress,
  recordShapeCompletion,
} from "./shapes.persistence";
import type { ShapeFactoryStep, ShapeItem, ShapeRule } from "./shapes.types";
import { ShapeFactoryScene } from "./ShapeFactoryScene";

const INITIAL_FACTORY = generateShapeFactory("factory-welcome");

export function ShapeFactoryRoom({ replayRequest, session }: RoomComponentProps) {
  const [round, setRound] = useState(0);
  const [state, dispatch] = useReducer(
    reduceShapeFactory,
    INITIAL_FACTORY,
    createShapeFactoryState,
  );
  const [progress, setProgress] = useState(defaultShapeProgress);
  const [shapeAudio] = useState(
    () =>
      new ShapeAudioController(
        () => audioService.getSettings(),
        () => audioService.resume(),
      ),
  );
  const reducedMotion = useReducedMotion();
  const { settings } = useSettings();
  const lastReplay = useRef(replayRequest);
  const savedCompletion = useRef<string | undefined>(undefined);
  const { schedule, watchdog, cancelAll } = useOwnedTimeout();
  const step = activeStep(state);
  const puzzle = step.puzzle;
  const visibleItems =
    state.hintLevel >= 2
      ? puzzle.items.filter((item) => matchesRule(item, puzzle.target))
      : puzzle.items;

  useEffect(() => {
    let active = true;
    void loadShapeProgress().then((loaded) => {
      if (active) setProgress(loaded);
    });
    return () => {
      active = false;
      shapeAudio.stop();
    };
  }, [shapeAudio]);

  useEffect(() => {
    cancelAll();
    if (state.phase === "intro") {
      schedule(() => dispatch({ type: "INTRO_FINISHED" }), reducedMotion ? 50 : 600);
    } else if (state.feedback === "returning") {
      schedule(() => dispatch({ type: "RETURN_FINISHED" }), reducedMotion ? 50 : 350);
    } else if (state.phase === "waiting" || state.phase === "hint") {
      schedule(() => dispatch({ type: "HINT_TIMEOUT" }), settings.hintDelayMs);
    } else if (state.phase === "processing") {
      watchdog(() => dispatch({ type: "PROCESSING_FINISHED" }), reducedMotion ? 150 : 1_100);
    } else if (state.phase === "output") {
      watchdog(() => dispatch({ type: "OUTPUT_FINISHED" }), reducedMotion ? 100 : 700);
    } else if (state.phase === "celebrating") {
      schedule(() => dispatch({ type: "CELEBRATION_FINISHED" }), reducedMotion ? 200 : 1_100);
    }
    return cancelAll;
  }, [
    cancelAll,
    reducedMotion,
    schedule,
    settings.hintDelayMs,
    state.feedback,
    state.hintLevel,
    state.phase,
    watchdog,
  ]);

  useEffect(() => {
    if (state.phase === "waiting") shapeAudio.instruct(puzzle.target, true);
    if (state.phase === "celebrating") shapeAudio.celebrate();
  }, [puzzle.target, shapeAudio, state.phase]);

  useEffect(() => {
    if (replayRequest === lastReplay.current) return;
    lastReplay.current = replayRequest;
    shapeAudio.instruct(puzzle.target, true);
  }, [puzzle.target, replayRequest, shapeAudio]);

  useEffect(() => {
    if (state.phase !== "complete") return;
    const completionId = `${session.id}:round:${round}`;
    if (savedCompletion.current === completionId) return;
    savedCompletion.current = completionId;
    void recordShapeCompletion(state.definition, state.mismatchCount, completionId).then(
      setProgress,
    );
  }, [round, session.id, state.definition, state.mismatchCount, state.phase]);

  const locked = !["waiting", "hint"].includes(state.phase);
  return (
    <section className="shape-factory-room" aria-labelledby="shape-factory-title">
      <h1 id="shape-factory-title" className="sr-only">
        Magic Shape Factory
      </h1>
      <ShapeFactoryScene state={state} reducedMotion={reducedMotion} />
      <div className="shape-factory-guide" aria-live="polite">
        <span aria-hidden="true">◇</span>
        <div>
          <p className="eyebrow">Magic Shape Factory</p>
          <strong>{instructionText(puzzle.target, state.phase)}</strong>
          <p>{feedbackText(state.feedback, state.hintLevel)}</p>
        </div>
      </div>
      <div className="shape-machine-slots" aria-label="Four shape openings">
        {state.definition.steps.map((candidate, index) => (
          <MachineSlot
            key={candidate.id}
            step={candidate}
            active={index === state.stepIndex && state.phase !== "complete"}
            complete={index < state.stepIndex || state.phase === "complete"}
            hintLevel={index === state.stepIndex ? state.hintLevel : 0}
          />
        ))}
      </div>
      <div
        className={`shape-tray ${state.conveyorPaused ? "paused" : "moving"}`}
        aria-label="Shape tray"
      >
        {visibleItems.map((item) => (
          <ShapeButton
            key={item.id}
            item={item}
            disabled={locked}
            hinted={state.hintLevel >= 1 && matchesRule(item, puzzle.target)}
            onDragStart={() => dispatch({ type: "DRAG_STARTED" })}
            onDrop={(inside) =>
              dispatch({ type: "ITEM_DROPPED", itemId: item.id, insideOpening: inside })
            }
            onCancel={() => dispatch({ type: "DRAG_CANCELED" })}
          />
        ))}
      </div>
      <p className="shape-progress">
        Step {state.stepIndex + 1} of {state.definition.steps.length} · Factories finished:{" "}
        {progress.completedActivities}
      </p>
      {state.phase === "celebrating" ? (
        <div className="shape-celebration" role="status">
          ★ Shape made! ★
        </div>
      ) : null}
      {state.phase === "complete" ? (
        <button
          className="shape-next"
          type="button"
          onClick={() => {
            const nextRound = round + 1;
            setRound(nextRound);
            savedCompletion.current = undefined;
            dispatch({
              type: "RESET",
              definition: generateShapeFactory(`factory-round-${nextRound}`),
            });
          }}
        >
          Make another
        </button>
      ) : null}
    </section>
  );
}

function MachineSlot({
  step,
  active,
  complete,
  hintLevel,
}: {
  readonly step: ShapeFactoryStep;
  readonly active: boolean;
  readonly complete: boolean;
  readonly hintLevel: 0 | 1 | 2;
}) {
  return (
    <div
      className={`shape-opening slot-${step.slot} ${active ? `active hint-${hintLevel}` : ""} ${complete ? "complete" : ""}`}
      data-testid={active ? "shape-opening" : undefined}
      role="img"
      aria-label={`${active ? "Active" : complete ? "Filled" : "Upcoming"} ${step.slot.replace("-", " ")} opening for a ${step.puzzle.target.color} ${step.puzzle.target.kind}`}
    >
      <ShapeGlyph rule={step.puzzle.target} />
    </div>
  );
}

function ShapeButton({
  item,
  disabled,
  hinted,
  onDragStart,
  onDrop,
  onCancel,
}: {
  readonly item: ShapeItem;
  readonly disabled: boolean;
  readonly hinted: boolean;
  readonly onDragStart: () => void;
  readonly onDrop: (inside: boolean) => void;
  readonly onCancel: () => void;
}) {
  const drag = useRef(new PointerDragTracker());
  const start = useRef({ x: 0, y: 0 });
  const dragged = useRef(false);
  const finish = (event: React.PointerEvent<HTMLButtonElement>, canceled = false) => {
    if (!drag.current.owns(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const moved = drag.current.finish(event.pointerId);
    event.currentTarget.style.transform = "";
    if (canceled) onCancel();
    else if (moved) {
      const bounds = document
        .querySelector<HTMLElement>("[data-testid='shape-opening']")
        ?.getBoundingClientRect();
      onDrop(Boolean(bounds && isInsideTarget({ x: event.clientX, y: event.clientY }, bounds, 24)));
    }
    queueMicrotask(() => {
      dragged.current = false;
    });
  };
  return (
    <button
      type="button"
      className={hinted ? "hinted" : ""}
      disabled={disabled}
      aria-label={`${item.size} ${item.color} ${item.kind}`}
      onClick={() => {
        if (!dragged.current) onDrop(true);
      }}
      onPointerDown={(event) => {
        drag.current.begin(event.pointerId, { x: event.clientX, y: event.clientY });
        start.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
        onDragStart();
      }}
      onPointerMove={(event) => {
        if (!drag.current.owns(event.pointerId)) return;
        if (!drag.current.move(event.pointerId, { x: event.clientX, y: event.clientY })) return;
        dragged.current = true;
        event.currentTarget.style.transform = `translate(${event.clientX - start.current.x}px, ${event.clientY - start.current.y}px) scale(1.12)`;
      }}
      onPointerUp={(event) => finish(event)}
      onPointerCancel={(event) => finish(event, true)}
    >
      <ShapeGlyph rule={item} />
    </button>
  );
}

function ShapeGlyph({ rule }: { readonly rule: ShapeRule }) {
  return (
    <span
      aria-hidden="true"
      className={`shape-glyph ${rule.kind} ${rule.size}`}
      style={{ "--shape-color": rule.color } as React.CSSProperties}
    />
  );
}

function instructionText(target: ShapeRule, phase: string): string {
  if (["processing", "output"].includes(phase)) return "Whirr, sparkle, make!";
  if (["celebrating", "complete"].includes(phase)) return "The machine made your shape!";
  return `Put the ${target.size} ${target.color} ${target.kind} in the machine.`;
}

function feedbackText(feedback: string, hintLevel: number): string {
  if (feedback === "returning") return "That shape can roll back. Try the glowing one!";
  if (feedback === "recovered") return "The machine is ready again.";
  if (hintLevel >= 2) return "Only the matching shape is left.";
  if (hintLevel === 1) return "The matching shape is glowing.";
  return "Drag or tap a shape.";
}
