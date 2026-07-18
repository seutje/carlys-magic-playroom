import { useEffect, useReducer, useRef, useState } from "react";

import { audioService } from "../../engine/audio/audioService";
import { useOwnedTimeout } from "../../engine/timing/useOwnedTimeout";
import { useReducedMotion } from "../../ui/useReducedMotion";
import type { RoomComponentProps } from "../roomModule";
import { CritterAudioController } from "./critter.audio";
import {
  CRITTER_BODIES,
  CRITTER_COLORS,
  CRITTER_PARTS,
  CRITTER_PATTERNS,
  CRITTER_REACTIONS,
} from "./critter.content";
import { initialCritterState, reduceCritterAssembly } from "./critter.machine";
import { loadSavedCreatures, saveCreature } from "./critter.persistence";
import type { CritterAssemblyState, CritterPartDefinition, SavedCreature } from "./critter.types";
import { CritterScene } from "./CritterScene";

const SOCKET_INSTRUCTION = {
  eyes: "Choose some eyes!",
  mouth: "Choose a happy mouth!",
  legs: "Choose some legs!",
} as const;

export function CritterRoom({ replayRequest, session }: RoomComponentProps) {
  const [state, dispatch] = useReducer(reduceCritterAssembly, initialCritterState);
  const [savedCount, setSavedCount] = useState(0);
  const [round, setRound] = useState(0);
  const [critterAudio] = useState(
    () =>
      new CritterAudioController(
        () => audioService.getSettings(),
        () => audioService.resume(),
      ),
  );
  const lastReplay = useRef(replayRequest);
  const savedCompletion = useRef<string | undefined>(undefined);
  const reactionLocked = useRef(false);
  const reducedMotion = useReducedMotion();
  const { schedule, watchdog, cancelAll } = useOwnedTimeout();

  useEffect(() => {
    let active = true;
    void loadSavedCreatures().then((creatures) => {
      if (active) setSavedCount(creatures.length);
    });
    return () => {
      active = false;
      critterAudio.stop();
    };
  }, [critterAudio]);

  useEffect(() => {
    cancelAll();
    if (state.phase === "intro") {
      schedule(() => dispatch({ type: "INTRO_FINISHED" }), reducedMotion ? 50 : 600);
    } else if (state.phase === "waiting") {
      schedule(() => dispatch({ type: "HINT_TIMEOUT" }), 5_000);
    } else if (state.phase === "celebrating") {
      watchdog(() => dispatch({ type: "CELEBRATION_FINISHED" }), reducedMotion ? 250 : 1_500);
    }
    return cancelAll;
  }, [
    cancelAll,
    reducedMotion,
    schedule,
    state.activeSocket,
    state.hintLevel,
    state.phase,
    watchdog,
  ]);

  useEffect(() => {
    if (state.phase === "waiting") critterAudio.instruct(state.activeSocket, true);
    if (state.phase === "celebrating") critterAudio.ready();
  }, [critterAudio, state.activeSocket, state.phase]);

  useEffect(() => {
    if (replayRequest === lastReplay.current) return;
    lastReplay.current = replayRequest;
    critterAudio.instruct(state.activeSocket, true);
  }, [critterAudio, replayRequest, state.activeSocket]);

  useEffect(() => {
    if (state.phase !== "complete") return;
    const completionId = `${session.id}:round:${round}`;
    if (savedCompletion.current === completionId) return;
    savedCompletion.current = completionId;
    const creature = toSavedCreature(state, completionId);
    void saveCreature(creature).then((creatures) => setSavedCount(creatures.length));
  }, [round, session.id, state]);

  const visibleParts = CRITTER_PARTS.filter(
    (part) =>
      part.compatibleBodies.includes(state.bodyId) &&
      (part.socketId === state.activeSocket || Boolean(state.parts[part.socketId])),
  );

  const react = (reaction: (typeof CRITTER_REACTIONS)[number]) => {
    if (reactionLocked.current) return;
    reactionLocked.current = true;
    dispatch({ type: "REACT", reaction });
    schedule(
      () => {
        reactionLocked.current = false;
        dispatch({ type: "REACTION_FINISHED" });
      },
      reducedMotion ? 350 : 900,
    );
  };

  return (
    <section className="critter-room" aria-labelledby="critter-title">
      <h1 id="critter-title" className="sr-only">
        Build-a-Critter Lab
      </h1>
      <CritterScene creature={state} reducedMotion={reducedMotion} />
      <div className="critter-guide" aria-live="polite">
        <span aria-hidden="true">*</span>
        <div>
          <p className="eyebrow">Build-a-Critter Lab</p>
          <strong>
            {state.phase === "complete"
              ? "Your critter is ready!"
              : SOCKET_INSTRUCTION[state.activeSocket]}
          </strong>
          <p>{feedbackText(state.feedback)}</p>
        </div>
      </div>
      <div className="critter-customize" aria-label="Critter style">
        <OptionGroup label="Body">
          {CRITTER_BODIES.map((body) => (
            <OptionButton
              key={body.id}
              selected={state.bodyId === body.id}
              label={`${body.id} body`}
              onClick={() => dispatch({ type: "SELECT_BODY", bodyId: body.id })}
            />
          ))}
        </OptionGroup>
        <OptionGroup label="Color">
          {CRITTER_COLORS.map((color) => (
            <OptionButton
              key={color}
              selected={state.color === color}
              label={color}
              onClick={() => dispatch({ type: "SELECT_COLOR", color })}
            />
          ))}
        </OptionGroup>
        <OptionGroup label="Pattern">
          {CRITTER_PATTERNS.map((pattern) => (
            <OptionButton
              key={pattern}
              selected={state.pattern === pattern}
              label={pattern}
              onClick={() => dispatch({ type: "SELECT_PATTERN", pattern })}
            />
          ))}
        </OptionGroup>
      </div>
      <div className="critter-sockets" aria-label="Attachment steps">
        {(["eyes", "mouth", "legs"] as const).map((socket) => (
          <span
            key={socket}
            className={
              state.parts[socket] ? "attached" : state.activeSocket === socket ? "active" : ""
            }
          >
            {state.parts[socket] ? "✓" : "○"} {socket}
          </span>
        ))}
      </div>
      {state.phase !== "complete" ? (
        <div
          className={`critter-part-tray ${state.hintLevel > 0 ? "hinted" : ""} ${state.hintLevel === 2 ? "strong-hint" : ""}`}
          aria-label={`${state.activeSocket} parts`}
        >
          {visibleParts.map((part) => (
            <PartButton
              key={part.id}
              part={part}
              selected={state.parts[part.socketId] === part.id}
              disabled={state.phase !== "waiting"}
              onClick={() => dispatch({ type: "SELECT_PART", partId: part.id })}
            />
          ))}
        </div>
      ) : (
        <div className="critter-reactions" aria-label="Critter reactions">
          {CRITTER_REACTIONS.map((reaction) => (
            <button key={reaction} type="button" onClick={() => react(reaction)}>
              {reaction}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              savedCompletion.current = undefined;
              setRound((value) => value + 1);
              dispatch({ type: "RESET" });
            }}
          >
            Build another
          </button>
        </div>
      )}
      {state.phase === "celebrating" ? (
        <div className="critter-celebration" role="status">
          <span aria-hidden="true">✦ ★ ✦</span>
          <strong>Your critter is ready!</strong>
        </div>
      ) : null}
      <p className="critter-saved" aria-label={`${savedCount} saved critters`}>
        Saved critters: {savedCount}
      </p>
    </section>
  );
}

function OptionGroup({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div role="group" aria-label={label}>
      {children}
    </div>
  );
}

function OptionButton({
  selected,
  label,
  onClick,
}: {
  readonly selected: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick}>
      {label}
    </button>
  );
}

function PartButton({
  part,
  selected,
  disabled,
  onClick,
}: {
  readonly part: CritterPartDefinition;
  readonly selected: boolean;
  readonly disabled: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`Choose ${part.id}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span aria-hidden="true">{part.symbol}</span>
      <small>{part.socketId}</small>
    </button>
  );
}

function feedbackText(feedback: (typeof initialCritterState)["feedback"]): string {
  if (feedback === "attached") return "Pop! It snapped right into place.";
  if (feedback === "replaced") return "A new part popped into place.";
  if (feedback === "incompatible") return "That part can rest in its own tray.";
  if (feedback === "celebrating") return "What a wonderful critter!";
  return "Tap any big part. It will snap on for you.";
}

function toSavedCreature(state: CritterAssemblyState, id: string): SavedCreature {
  return {
    schemaVersion: 1,
    id,
    bodyId: state.bodyId,
    color: state.color,
    pattern: state.pattern,
    parts: state.parts as SavedCreature["parts"],
    reaction: "wave",
    savedAt: Date.now(),
  };
}
