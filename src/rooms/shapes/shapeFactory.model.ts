import type { ShapeFactoryState } from "./shapes.types";

export type ShapeOutputPhase = "output" | "celebrating" | "complete";

export interface ShapeProductPresentation {
  readonly position: readonly [number, number, number];
  readonly rotation: readonly [number, number, number];
  readonly scale: number;
}

export const FACTORY_PHASE_DURATION_MS = {
  processing: { standard: 1_100, reduced: 150 },
  output: { standard: 900, reduced: 300 },
  celebrating: { standard: 2_200, reduced: 2_200 },
} as const;

export function factoryPhaseDuration(
  phase: keyof typeof FACTORY_PHASE_DURATION_MS,
  reducedMotion: boolean,
): number {
  const duration = FACTORY_PHASE_DURATION_MS[phase];
  return reducedMotion ? duration.reduced : duration.standard;
}

/**
 * Rendering-only pose for the made shape. State-owned watchdogs remain authoritative for phase
 * progression; elapsed time can only interpolate the visual reveal within the current phase.
 */
export function shapeProductPresentation(
  phase: ShapeOutputPhase,
  elapsedSeconds: number,
  size: "small" | "big",
  reducedMotion: boolean,
): ShapeProductPresentation {
  const restingScale = size === "big" ? 1.08 : 0.78;
  if (reducedMotion || phase !== "output") {
    return {
      position: [3.45, 0.15, 0.72],
      rotation: [0.08, -0.18, phase === "celebrating" && !reducedMotion ? -0.06 : 0],
      scale: restingScale,
    };
  }

  const durationSeconds = FACTORY_PHASE_DURATION_MS.output.standard / 1_000;
  const progress = Math.min(1, Math.max(0, elapsedSeconds / durationSeconds));
  const eased = 1 - (1 - progress) ** 3;
  return {
    position: [
      2.72 + (3.45 - 2.72) * eased,
      -1.27 + (0.15 + 1.27) * eased,
      0.42 + (0.72 - 0.42) * eased,
    ],
    rotation: [0.08, -0.18 + Math.PI * 2 * (1 - progress), -0.18 * (1 - eased)],
    scale: restingScale * (0.28 + 0.72 * eased),
  };
}

export interface FactoryGearSpec {
  readonly id: "drive" | "idler" | "output";
  readonly teeth: number;
  readonly position: readonly [number, number, number];
  readonly color: string;
}

export const GEAR_MODULE = 0.062;
export const GEAR_MESH_CLEARANCE = 0.055;

/**
 * A three-gear external train. Adjacent pitch circles have a small visual clearance suited to
 * the chunky toy teeth, while rotations still use tooth-count-derived ratios and phasing.
 */
export const FACTORY_GEARS: readonly FactoryGearSpec[] = [
  { id: "drive", teeth: 14, position: [-1.505, -0.18, 1.34], color: "#f4a340" },
  { id: "idler", teeth: 22, position: [-0.334, -0.18, 1.35], color: "#62c6bd" },
  { id: "output", teeth: 16, position: [0.538, 0.692, 1.36], color: "#f2768b" },
] as const;

export function gearPitchRadius(teeth: number): number {
  return (teeth * GEAR_MODULE) / 2;
}

export function gearOuterRadius(teeth: number): number {
  return gearPitchRadius(teeth) + GEAR_MODULE * 0.9;
}

/** Returns each gear's angle for a given drive-shaft angle. */
export function calculateGearAngles(
  driveAngle: number,
): Readonly<Record<FactoryGearSpec["id"], number>> {
  const drive = FACTORY_GEARS[0];
  const idler = FACTORY_GEARS[1];
  const output = FACTORY_GEARS[2];
  if (!drive || !idler || !output) throw new Error("The factory gear train is incomplete");
  const idlerAngle = drivenGearAngle(drive, idler, driveAngle);
  return {
    drive: driveAngle,
    idler: idlerAngle,
    output: drivenGearAngle(idler, output, idlerAngle),
  };
}

/**
 * Phases a driven external gear so a tooth on one wheel meets a gap on the next at their
 * line of centers. The negative ratio supplies the opposite direction and matching pitch speed.
 */
function drivenGearAngle(
  driver: FactoryGearSpec,
  driven: FactoryGearSpec,
  driverAngle: number,
): number {
  const lineAngle = Math.atan2(
    driven.position[1] - driver.position[1],
    driven.position[0] - driver.position[0],
  );
  return (
    -(driver.teeth / driven.teeth) * driverAngle +
    ((driver.teeth + driven.teeth) / driven.teeth) * lineAngle +
    Math.PI -
    Math.PI / driven.teeth
  );
}

/** Drive speed is state-derived so dragging stops the belt while processing powers the machine. */
export function factoryDriveSpeed(
  state: Pick<ShapeFactoryState, "phase" | "conveyorPaused">,
  reducedMotion: boolean,
): number {
  if (reducedMotion || state.phase === "paused" || state.phase === "complete") return 0;
  if (state.phase === "processing") return 2.8;
  if (state.phase === "output" || state.phase === "celebrating") return 1.4;
  return state.conveyorPaused ? 0 : 0.65;
}
