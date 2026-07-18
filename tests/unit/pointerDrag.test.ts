import {
  isInsideTarget,
  PointerDragTracker,
  snapSmoothing,
} from "../../src/engine/input/pointerDrag";
import { pointerPath } from "../../src/testing/helpers";

describe("shared pointer drag", () => {
  it("applies a movement threshold, pointer ownership, and cancellation recovery", () => {
    const drag = new PointerDragTracker(6);
    drag.begin(1, { x: 10, y: 10 });
    expect(drag.move(2, { x: 100, y: 100 })).toBe(false);
    expect(drag.move(1, { x: 13, y: 13 })).toBe(false);
    expect(drag.move(1, { x: 17, y: 10 })).toBe(true);
    expect(drag.finish(1)).toBe(true);
    drag.begin(3, { x: 0, y: 0 });
    drag.cancel();
    expect(drag.owns(3)).toBe(false);
  });

  it("supports forgiving targets and deterministic snap interpolation", () => {
    const bounds = { left: 10, right: 20, top: 10, bottom: 20 };
    expect(isInsideTarget({ x: 6, y: 15 }, bounds, 5)).toBe(true);
    expect(isInsideTarget({ x: 4, y: 15 }, bounds, 5)).toBe(false);
    expect(snapSmoothing(0, 12)).toBe(0);
    expect(snapSmoothing(1 / 60, 12)).toBeCloseTo(0.1813, 3);
    expect(() => snapSmoothing(-1, 1)).toThrow(/non-negative/);
    expect(pointerPath({ x: 0, y: 0 }, { x: 10, y: 20 }, 2)).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 10 },
      { x: 10, y: 20 },
    ]);
  });
});
