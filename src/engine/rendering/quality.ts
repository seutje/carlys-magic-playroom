export type QualityLevel = "low" | "medium" | "high";

export interface QualityProfile {
  readonly level: QualityLevel;
  readonly dpr: number | [number, number];
  readonly shadows: boolean;
  readonly antialias: boolean;
  readonly particleCount: number;
  readonly decorativeObjects: boolean;
  readonly decorativeMotion: boolean;
}

export interface QualitySignals {
  readonly deviceMemory?: number;
  readonly hardwareConcurrency?: number;
  readonly devicePixelRatio: number;
  readonly viewportWidth: number;
}

export const QUALITY_PROFILES: Record<QualityLevel, QualityProfile> = {
  low: {
    level: "low",
    dpr: 1,
    shadows: false,
    antialias: false,
    particleCount: 1,
    decorativeObjects: false,
    decorativeMotion: false,
  },
  medium: {
    level: "medium",
    dpr: [1, 1.25],
    shadows: false,
    antialias: true,
    particleCount: 2,
    decorativeObjects: true,
    decorativeMotion: true,
  },
  high: {
    level: "high",
    dpr: [1, 1.5],
    shadows: true,
    antialias: true,
    particleCount: 5,
    decorativeObjects: true,
    decorativeMotion: true,
  },
};

export function chooseQuality(signals: QualitySignals): QualityLevel {
  if (
    (signals.deviceMemory !== undefined && signals.deviceMemory <= 4) ||
    (signals.hardwareConcurrency !== undefined && signals.hardwareConcurrency <= 4)
  ) {
    return "low";
  }
  if (
    (signals.deviceMemory === undefined || signals.deviceMemory >= 8) &&
    (signals.hardwareConcurrency === undefined || signals.hardwareConcurrency >= 8) &&
    signals.devicePixelRatio <= 2 &&
    signals.viewportWidth >= 1000
  ) {
    return "high";
  }
  return "medium";
}

export function resolveQuality(search: string, signals: QualitySignals): QualityProfile {
  const parameters = new URLSearchParams(search);
  const requested = parameters.has("diagnostics") ? parameters.get("quality") : null;
  const level =
    requested === "low" || requested === "medium" || requested === "high"
      ? requested
      : chooseQuality(signals);
  return QUALITY_PROFILES[level];
}
