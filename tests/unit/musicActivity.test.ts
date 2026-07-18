import { generateMusicRound, validateMusicRound } from "../../src/rooms/music/music.generator";
import { createMusicState, reduceMusic } from "../../src/rooms/music/music.machine";

describe("deterministic musical activity", () => {
  it("reproduces valid rounds with the target among distinct choices", () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let index = 0; index < 100; index += 1) {
        const round = generateMusicRound(`music-${difficulty}-${index}`, difficulty);
        expect(round).toEqual(generateMusicRound(`music-${difficulty}-${index}`, difficulty));
        expect(validateMusicRound(JSON.parse(JSON.stringify(round)))).toBe(true);
        expect(round.choices.some((choice) => choice.id === round.targetChoiceId)).toBe(true);
      }
    }
  });

  it("covers instrument, high-low, and loud-soft concepts", () => {
    expect(
      generateMusicRound("one", 1)
        .choices.map((choice) => choice.soundId)
        .sort(),
    ).toEqual(["bell-normal", "drum-normal", "xylophone-normal"]);
    expect(
      generateMusicRound("two", 2)
        .choices.map((choice) => choice.soundId)
        .sort(),
    ).toEqual(["bell-high", "bell-low"]);
    expect(
      generateMusicRound("three", 3)
        .choices.map((choice) => choice.soundId)
        .sort(),
    ).toEqual(["drum-loud", "drum-soft"]);
  });

  it("bounds rapid selections, replays after mismatch, simplifies, and completes once", () => {
    const round = generateMusicRound("flow", 1);
    const wrong = round.choices.find((choice) => choice.id !== round.targetChoiceId);
    expect(wrong).toBeDefined();
    if (!wrong) return;
    let state = reduceMusic(createMusicState(round), { type: "INTRO_FINISHED" });
    state = reduceMusic(state, { type: "TARGET_PLAYED" });
    state = reduceMusic(state, { type: "SELECT", choiceId: wrong.id });
    expect(reduceMusic(state, { type: "SELECT", choiceId: wrong.id })).toBe(state);
    state = reduceMusic(state, { type: "EVALUATION_FINISHED" });
    state = reduceMusic(state, { type: "SELECT", choiceId: wrong.id });
    state = reduceMusic(state, { type: "EVALUATION_FINISHED" });
    expect(state).toMatchObject({ phase: "hint", hintLevel: 2, mismatchCount: 2 });
    state = reduceMusic(state, { type: "SELECT", choiceId: round.targetChoiceId });
    state = reduceMusic(state, { type: "EVALUATION_FINISHED" });
    expect(state.phase).toBe("celebrating");
    const duplicate = reduceMusic(state, { type: "EVALUATION_FINISHED" });
    expect(duplicate).toBe(state);
    expect(reduceMusic(state, { type: "RECOVER" })).toMatchObject({ phase: "waiting" });
  });
});
