import { useEffect, useReducer, useRef, useState } from "react";

import { audioService } from "../../engine/audio/audioService";
import { useOwnedTimeout } from "../../engine/timing/useOwnedTimeout";
import { useSettings } from "../../ui/settings/settingsContext";
import { useReducedEffects, useReducedMotion } from "../../ui/useReducedMotion";
import type { RoomComponentProps } from "../roomModule";
import { MusicAudioController } from "./music.audio";
import { generateMusicRound } from "./music.generator";
import { createMusicState, reduceMusic } from "./music.machine";
import {
  defaultMusicProgress,
  loadMusicProgress,
  recordMusicCompletion,
} from "./music.persistence";
import type { MusicChoice } from "./music.types";
import { MusicScene } from "./MusicScene";

const INITIAL_ROUND = generateMusicRound("music-welcome", 1);

export function MusicRoom({ replayRequest, session }: RoomComponentProps) {
  const [round, setRound] = useState(0);
  const [state, dispatch] = useReducer(reduceMusic, INITIAL_ROUND, createMusicState);
  const [progress, setProgress] = useState(defaultMusicProgress);
  const [musicAudio] = useState(
    () =>
      new MusicAudioController(
        () => audioService.getSettings(),
        () => audioService.resume(),
      ),
  );
  const reducedMotion = useReducedMotion();
  const reducedEffects = useReducedEffects();
  const { settings } = useSettings();
  const lastReplay = useRef(replayRequest);
  const savedCompletion = useRef<string | undefined>(undefined);
  const { schedule, cancelAll } = useOwnedTimeout();
  const target =
    state.definition.choices.find((choice) => choice.id === state.definition.targetChoiceId) ??
    state.definition.choices[0];
  const choices =
    state.hintLevel >= 2
      ? state.definition.choices.filter((choice) => choice.id === state.definition.targetChoiceId)
      : state.definition.choices;

  useEffect(() => {
    let active = true;
    void loadMusicProgress().then((loaded) => {
      if (active) setProgress(loaded);
    });
    return () => {
      active = false;
      musicAudio.stop();
    };
  }, [musicAudio]);

  useEffect(() => {
    cancelAll();
    if (state.phase === "intro")
      schedule(() => dispatch({ type: "INTRO_FINISHED" }), reducedMotion ? 50 : 500);
    else if (state.phase === "waiting" || state.phase === "hint")
      schedule(() => dispatch({ type: "HINT_TIMEOUT" }), settings.hintDelayMs);
    else if (state.phase === "evaluating")
      schedule(() => dispatch({ type: "EVALUATION_FINISHED" }), reducedMotion ? 220 : 500);
    else if (state.phase === "celebrating")
      schedule(() => dispatch({ type: "CELEBRATION_FINISHED" }), reducedMotion ? 250 : 1_200);
    return cancelAll;
  }, [cancelAll, reducedMotion, schedule, settings.hintDelayMs, state.hintLevel, state.phase]);

  useEffect(() => {
    if ((state.phase === "waiting" || state.phase === "hint") && target) {
      musicAudio.playTarget(target.soundId);
      dispatch({ type: "TARGET_PLAYED" });
    }
  }, [musicAudio, state.phase, target]);

  useEffect(() => {
    if (replayRequest === lastReplay.current || !target) return;
    lastReplay.current = replayRequest;
    musicAudio.playTarget(target.soundId);
    dispatch({ type: "TARGET_PLAYED" });
  }, [musicAudio, replayRequest, target]);

  useEffect(() => {
    if (state.phase !== "complete") return;
    const id = `${session.id}:round:${round}`;
    if (savedCompletion.current === id) return;
    savedCompletion.current = id;
    void recordMusicCompletion(state.definition.concept, state.mismatchCount, id).then(setProgress);
  }, [round, session.id, state.definition.concept, state.mismatchCount, state.phase]);

  if (!target) return <p className="webgl-fallback">The instruments are taking a tiny rest.</p>;
  const choose = (choice: MusicChoice) => {
    if (musicAudio.playSelection(choice.soundId)) dispatch({ type: "SELECT", choiceId: choice.id });
  };

  return (
    <section className="music-room" aria-labelledby="music-title">
      <h1 id="music-title" className="sr-only">
        Musical Corner
      </h1>
      <MusicScene state={state} reducedEffects={reducedEffects} />
      <div className="music-guide" aria-live="polite">
        <span aria-hidden="true">♫</span>
        <div>
          <p className="eyebrow">Musical Corner</p>
          <strong>Listen, then tap the matching picture.</strong>
          <p>{feedback(state.feedback, state.hintLevel)}</p>
        </div>
      </div>
      <button
        className={`music-target pulse-${state.pulse % 2}`}
        type="button"
        onClick={() => {
          musicAudio.playTarget(target.soundId);
          dispatch({ type: "TARGET_PLAYED" });
        }}
        aria-label="Play target sound again"
      >
        <span className={`music-icon ${target.visualPattern}`} aria-hidden="true">
          {instrumentSymbol(target)}
        </span>
        <span>Hear it again</span>
      </button>
      <div className="music-choices" aria-label="Musical choices">
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={state.phase !== "waiting" && state.phase !== "hint"}
            data-target={choice.id === target.id ? "true" : "false"}
            onClick={() => choose(choice)}
            aria-label={choiceLabel(choice)}
          >
            <span className={`music-icon ${choice.visualPattern}`} aria-hidden="true">
              {instrumentSymbol(choice)}
            </span>
            <span>{choiceLabel(choice)}</span>
          </button>
        ))}
      </div>
      <p className="music-progress">Songs matched: {progress.completedRounds}</p>
      {state.phase === "celebrating" ? (
        <div className="music-celebration" role="status">
          ♪ You found it! ♪
        </div>
      ) : null}
      {state.phase === "complete" ? (
        <button
          className="music-next"
          type="button"
          onClick={() => {
            const next = round + 1;
            setRound(next);
            savedCompletion.current = undefined;
            dispatch({
              type: "RESET",
              definition: generateMusicRound(`music-round-${next}`, ((next % 3) + 1) as 1 | 2 | 3),
            });
          }}
        >
          Try another sound
        </button>
      ) : null}
    </section>
  );
}

function instrumentSymbol(choice: MusicChoice): string {
  return choice.instrument === "drum" ? "●" : choice.instrument === "bell" ? "♢" : "▥";
}
function choiceLabel(choice: MusicChoice): string {
  return choice.variant === "normal" ? choice.instrument : `${choice.variant} ${choice.instrument}`;
}
function feedback(value: MusicStateFeedback, hint: number): string {
  if (hint >= 2) return "Here is the matching picture.";
  if (hint === 1) return "Watch the target picture bounce.";
  if (value === "playful") return "That instrument is playing too. Listen once more!";
  if (value === "correct") return "The stage lights are dancing!";
  return "Every sound has a matching picture.";
}
type MusicStateFeedback = "ready" | "playful" | "correct" | "recovered";
