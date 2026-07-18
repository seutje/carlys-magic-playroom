import type { Plane, Ray, Vector3 } from "three";

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface TargetBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

/** Pure pointer lifecycle shared by DOM and 3D adapters. */
export class PointerDragTracker {
  private pointerId: number | undefined;
  private startPoint: Point2D = { x: 0, y: 0 };
  private moved = false;

  public constructor(private readonly thresholdPx = 6) {}

  public begin(pointerId: number, point: Point2D): void {
    if (this.pointerId !== undefined) return;
    this.pointerId = pointerId;
    this.startPoint = point;
    this.moved = false;
  }

  public move(pointerId: number, point: Point2D): boolean {
    if (pointerId !== this.pointerId) return false;
    if (Math.hypot(point.x - this.startPoint.x, point.y - this.startPoint.y) >= this.thresholdPx) {
      this.moved = true;
    }
    return this.moved;
  }

  public finish(pointerId: number): boolean {
    if (pointerId !== this.pointerId) return false;
    const moved = this.moved;
    this.cancel();
    return moved;
  }

  public cancel(): void {
    this.pointerId = undefined;
    this.moved = false;
  }

  public owns(pointerId: number): boolean {
    return this.pointerId === pointerId;
  }
}

export function isInsideTarget(point: Point2D, bounds: TargetBounds, padding = 0): boolean {
  return (
    point.x >= bounds.left - padding &&
    point.x <= bounds.right + padding &&
    point.y >= bounds.top - padding &&
    point.y <= bounds.bottom + padding
  );
}

export function projectRayToPlane(ray: Ray, plane: Plane, target: Vector3): boolean {
  return ray.intersectPlane(plane, target) !== null;
}

export function snapSmoothing(deltaSeconds: number, speed: number): number {
  if (deltaSeconds < 0 || speed < 0) throw new Error("Snap timing must be non-negative");
  return 1 - Math.exp(-deltaSeconds * speed);
}
