const PLANK_LEFT_TOY_CENTER = -4.5;
const PLANK_RIGHT_TOY_CENTER = 0.9;

/** Distributes the currently available toys across the full usable width of the plank. */
export function trainPlankToyX(index: number, toyCount: number): number {
  if (!Number.isSafeInteger(toyCount) || toyCount < 1) {
    throw new Error("Train plank layout needs at least one toy");
  }
  if (!Number.isSafeInteger(index) || index < 0 || index >= toyCount) {
    throw new Error("Train plank toy index is outside the available toy range");
  }

  if (toyCount === 1) return (PLANK_LEFT_TOY_CENTER + PLANK_RIGHT_TOY_CENTER) / 2;

  const progress = index / (toyCount - 1);
  return PLANK_LEFT_TOY_CENTER + (PLANK_RIGHT_TOY_CENTER - PLANK_LEFT_TOY_CENTER) * progress;
}
