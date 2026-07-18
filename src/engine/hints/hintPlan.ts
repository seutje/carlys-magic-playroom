export interface HintStep<Level extends number = number> {
  readonly level: Level;
  readonly delayMs: number;
  readonly repeatInstruction: boolean;
  readonly simplifyChoices: boolean;
  readonly motion: "none" | "pulse" | "wiggle";
  readonly reducedMotion: "none" | "outline";
}

export interface HintPlan<Level extends number = number> {
  readonly steps: readonly HintStep<Level>[];
}

export function validateHintPlan(plan: HintPlan): boolean {
  return (
    plan.steps.length > 0 &&
    plan.steps.every(
      (step, index) =>
        step.level === index + 1 && Number.isFinite(step.delayMs) && step.delayMs >= 0,
    )
  );
}

export function nextHintStep<Level extends number>(
  plan: HintPlan<Level>,
  currentLevel: number,
): HintStep<Level> {
  if (!validateHintPlan(plan)) throw new Error("Hint plans must have ordered positive levels");
  const index = Math.min(currentLevel, plan.steps.length - 1);
  const step = plan.steps[index];
  if (!step) throw new Error("Hint plan has no steps");
  return step;
}

export function hintDelay(plan: HintPlan, currentLevel: number): number {
  return nextHintStep(plan, currentLevel).delayMs;
}
