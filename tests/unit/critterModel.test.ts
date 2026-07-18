import { CRITTER_BODIES, CRITTER_PARTS } from "../../src/rooms/critter/critter.content";
import {
  initialCritterState,
  reduceCritterAssembly,
} from "../../src/rooms/critter/critter.machine";
import { CRITTER_SOCKET_IDS } from "../../src/rooms/critter/critter.types";
import {
  migrateSavedCreature,
  validateSavedCreature,
} from "../../src/rooms/critter/critter.validation";

describe("critter model and assembly", () => {
  it("defines exhaustive sockets and rejects incompatible replacements safely", () => {
    expect(CRITTER_BODIES.every((body) => body.sockets.join() === CRITTER_SOCKET_IDS.join())).toBe(
      true,
    );
    let state = reduceCritterAssembly(initialCritterState, { type: "INTRO_FINISHED" });
    state = reduceCritterAssembly(state, { type: "SELECT_BODY", bodyId: "tall" });
    state = reduceCritterAssembly(state, { type: "SELECT_PART", partId: "legs-stompy" });
    expect(state.feedback).toBe("incompatible");
    expect(state.parts).toEqual({});
  });

  it("assembles every allowed part and replaces without precision or invalid state", () => {
    for (const body of CRITTER_BODIES) {
      let state = reduceCritterAssembly(initialCritterState, { type: "INTRO_FINISHED" });
      state = reduceCritterAssembly(state, { type: "SELECT_BODY", bodyId: body.id });
      for (const socketId of CRITTER_SOCKET_IDS) {
        const part = CRITTER_PARTS.find(
          (candidate) =>
            candidate.socketId === socketId && candidate.compatibleBodies.includes(body.id),
        );
        expect(part).toBeDefined();
        if (part) state = reduceCritterAssembly(state, { type: "SELECT_PART", partId: part.id });
      }
      expect(state.phase).toBe("celebrating");
      expect(Object.keys(state.parts).sort()).toEqual([...CRITTER_SOCKET_IDS].sort());
    }
    for (const part of CRITTER_PARTS) {
      for (const bodyId of part.compatibleBodies) {
        let state = reduceCritterAssembly(initialCritterState, { type: "INTRO_FINISHED" });
        state = reduceCritterAssembly(state, { type: "SELECT_BODY", bodyId });
        state = reduceCritterAssembly(state, { type: "SELECT_PART", partId: part.id });
        expect(state.parts[part.socketId]).toBe(part.id);
      }
    }
  });

  it("validates JSON and migrates a compatible legacy creature", () => {
    const legacy = migrateSavedCreature({
      schemaVersion: 0,
      id: "old",
      body: "round",
      color: "mint",
      eyes: "eyes-star",
      mouth: "mouth-smile",
      legs: "legs-bouncy",
    });
    expect(legacy).toBeDefined();
    expect(validateSavedCreature(JSON.parse(JSON.stringify(legacy)))).toBe(true);
    expect(validateSavedCreature({ ...legacy, parts: { ...legacy?.parts, eyes: "mouth-o" } })).toBe(
      false,
    );
  });

  it("locks assembly during celebration and bounds hint escalation", () => {
    let state = reduceCritterAssembly(initialCritterState, { type: "INTRO_FINISHED" });
    for (const partId of ["eyes-round", "mouth-smile", "legs-bouncy"] as const) {
      state = reduceCritterAssembly(state, { type: "SELECT_PART", partId });
    }
    expect(state.phase).toBe("celebrating");
    expect(reduceCritterAssembly(state, { type: "SELECT_BODY", bodyId: "tall" })).toBe(state);

    state = reduceCritterAssembly(initialCritterState, { type: "INTRO_FINISHED" });
    state = reduceCritterAssembly(state, { type: "HINT_TIMEOUT" });
    state = reduceCritterAssembly(state, { type: "HINT_TIMEOUT" });
    state = reduceCritterAssembly(state, { type: "HINT_TIMEOUT" });
    expect(state.hintLevel).toBe(2);
  });
});
