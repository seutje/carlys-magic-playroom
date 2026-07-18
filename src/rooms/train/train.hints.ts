import type { HintPlan } from "../../engine/hints/hintPlan";

export const TRAIN_HINT_PLAN = {
  steps: [
    {
      level: 1,
      delayMs: 5_000,
      repeatInstruction: true,
      simplifyChoices: false,
      motion: "pulse",
      reducedMotion: "outline",
    },
    {
      level: 2,
      delayMs: 5_000,
      repeatInstruction: false,
      simplifyChoices: false,
      motion: "wiggle",
      reducedMotion: "outline",
    },
    {
      level: 3,
      delayMs: 5_000,
      repeatInstruction: false,
      simplifyChoices: true,
      motion: "none",
      reducedMotion: "outline",
    },
  ],
} as const satisfies HintPlan<1 | 2 | 3>;
