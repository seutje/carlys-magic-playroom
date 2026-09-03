import type { ShapeFactoryState } from "./shapes.types";

export interface FactoryGearSpec {
  readonly id: "drive" | "idler" | "output";
  readonly teeth: number;
  readonly position: readonly [number, number, number];
  readonly color: string;
}

export const GEAR_MODULE = 0.062;

/**
 * A three-gear external train. Adjacent pitch circles are tangent, so the rendered teeth
 * turn in opposite directions at tooth-count-derived speeds instead of merely spinning.
 */
export const FACTORY_GEARS: readonly FactoryGearSpec[] = [
  { id: "drive", teeth: 14, position: [-1.45, -0.18, 1.34], color: "#f4a340" },
  { id: "idler", teeth: 22, position: [-0.334, -0.18, 1.35], color: "#62c6bd" },
  { id: "output", teeth: 16, position: [0.499, 0.653, 1.36], color: "#f2768b" },
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
