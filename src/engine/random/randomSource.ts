export interface RandomSource {
  next(): number;
  integer(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

/** Stable 32-bit seeded generator. Its output is part of reproducible activity fixtures. */
export function createRandomSource(seed: string): RandomSource {
  if (!seed.trim()) throw new Error("A non-empty seed is required");
  let state = hashSeed(seed);

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };

  return {
    next,
    integer(min, max) {
      if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) {
        throw new RangeError("Random integer bounds must be safe integers with min <= max");
      }
      return Math.floor(next() * (max - min + 1)) + min;
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new RangeError("Cannot pick from an empty collection");
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error("Random selection escaped collection bounds");
      return item;
    },
    shuffle<T>(items: readonly T[]): T[] {
      const result = [...items];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(next() * (index + 1));
        const current = result[index];
        const swap = result[swapIndex];
        if (current === undefined || swap === undefined) continue;
        result[index] = swap;
        result[swapIndex] = current;
      }
      return result;
    },
  };
}

function hashSeed(seed: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}
