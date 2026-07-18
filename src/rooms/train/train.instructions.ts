import { renderInstruction } from "../../engine/instructions/instruction";
import type { TrainInstruction } from "./train.types";

export const TRAIN_INSTRUCTION_TEMPLATES = {
  "train.instruction.load": "Put {count} {color} {category} in the train.",
} as const;

const COUNT_WORD = { 1: "one", 2: "two", 3: "three" } as const;

export function renderTrainInstruction(instruction: TrainInstruction): string {
  return renderInstruction(instruction, TRAIN_INSTRUCTION_TEMPLATES, (key, value) => {
    if (key === "count" && typeof value === "number") return COUNT_WORD[value as 1 | 2 | 3];
    if (key === "category") {
      return `${String(value)}${instruction.parameters.count === 1 ? "" : "s"}`;
    }
    return String(value);
  });
}
