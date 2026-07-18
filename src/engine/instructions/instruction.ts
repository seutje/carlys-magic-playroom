export type InstructionParameter = string | number;

export interface InstructionDefinition<
  Id extends string = string,
  TextKey extends string = string,
  AudioKey extends string = string,
  Parameters extends object = Readonly<Record<string, InstructionParameter>>,
> {
  readonly id: Id;
  readonly textKey: TextKey;
  readonly audioKey: AudioKey;
  readonly parameters: Parameters;
}

export type InstructionTemplates<TextKey extends string> = Readonly<Record<TextKey, string>>;

/** Renders localizable named parameters and leaves an obvious visual fallback for missing values. */
export function renderInstruction<TextKey extends string, Parameters extends object>(
  instruction: Pick<
    InstructionDefinition<string, TextKey, string, Parameters>,
    "textKey" | "parameters"
  >,
  templates: InstructionTemplates<TextKey>,
  transform: (key: string, value: InstructionParameter) => string = (_, value) => String(value),
): string {
  const parameters = instruction.parameters as Readonly<Record<string, unknown>>;
  return templates[instruction.textKey].replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = parameters[key];
    return typeof value === "string" || typeof value === "number" ? transform(key, value) : "…";
  });
}

export function isSerializableInstruction(value: unknown): value is InstructionDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.textKey !== "string" ||
    typeof candidate.audioKey !== "string" ||
    !candidate.parameters ||
    typeof candidate.parameters !== "object" ||
    Array.isArray(candidate.parameters)
  ) {
    return false;
  }
  return Object.values(candidate.parameters).every(
    (parameter) => typeof parameter === "string" || typeof parameter === "number",
  );
}

/** Missing audio is intentionally a no-op because the visual instruction remains authoritative. */
export async function replayInstruction(
  instruction: InstructionDefinition,
  playAudio?: (audioKey: string) => Promise<void>,
): Promise<void> {
  if (!playAudio) return;
  try {
    await playAudio(instruction.audioKey);
  } catch {
    // Visual instructions keep the activity usable when a clip cannot play.
  }
}
