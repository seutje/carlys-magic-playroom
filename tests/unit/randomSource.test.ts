import { createRandomSource } from "../../src/engine/random/randomSource";

describe("createRandomSource", () => {
  it("repeats output for the same seed and varies different seeds", () => {
    const first = createRandomSource("carly");
    const second = createRandomSource("carly");
    const other = createRandomSource("train");
    const sequence = () => [first.next(), first.next(), first.next()];
    const expected = sequence();
    expect([second.next(), second.next(), second.next()]).toEqual(expected);
    expect([other.next(), other.next(), other.next()]).not.toEqual(expected);
  });

  it("supports inclusive integers, picks, and immutable shuffles", () => {
    const random = createRandomSource("helpers");
    const source = [1, 2, 3, 4] as const;
    expect(random.integer(2, 2)).toBe(2);
    expect(source).toContain(random.pick(source));
    expect(random.shuffle(source).sort()).toEqual([...source]);
    expect(source).toEqual([1, 2, 3, 4]);
  });

  it("rejects invalid seeds, ranges, and empty collections", () => {
    expect(() => createRandomSource(" ")).toThrow(/seed/);
    const random = createRandomSource("invalid-input");
    expect(() => random.integer(4, 3)).toThrow(RangeError);
    expect(() => random.integer(0.5, 2)).toThrow(RangeError);
    expect(() => random.pick([])).toThrow(RangeError);
  });
});
