import {
  BufferGeometry,
  type Group,
  Material,
  MeshStandardMaterial,
  type Object3D,
  Texture,
} from "three";

import { assetUrl } from "../../engine/assets/assetUrl";
import type { CritterBodyDefinition, CritterPartDefinition } from "./critter.types";

export type CritterModelId = `body-${CritterBodyDefinition["id"]}` | CritterPartDefinition["id"];

export const CRITTER_BODY_MATERIAL = "CMP_Critter_Body";
export const CRITTER_LEG_MATERIAL = "CMP_Critter_Dark";

const CRITTER_COLORABLE_MATERIALS: ReadonlySet<string> = new Set([
  CRITTER_BODY_MATERIAL,
  CRITTER_LEG_MATERIAL,
]);

export const CRITTER_MODEL_PATHS: Readonly<Record<CritterModelId, string>> = {
  "body-round": "models/critter/body-round.glb",
  "body-tall": "models/critter/body-tall.glb",
  "eyes-round": "models/critter/eyes-round.glb",
  "eyes-star": "models/critter/eyes-star.glb",
  "mouth-smile": "models/critter/mouth-smile.glb",
  "mouth-o": "models/critter/mouth-o.glb",
  "legs-bouncy": "models/critter/legs-bouncy.glb",
  "legs-stompy": "models/critter/legs-stompy.glb",
  "legs-tall": "models/critter/legs-tall.glb",
};

export const CRITTER_MODEL_IDS = Object.keys(CRITTER_MODEL_PATHS) as CritterModelId[];

export type CritterLegId = Extract<CritterPartDefinition["id"], `legs-${string}`>;
export type CritterMouthId = Extract<CritterPartDefinition["id"], `mouth-${string}`>;
export type CritterComponentSource = "model" | "fallback";

const BODY_LEG_SOCKET_Y: Readonly<Record<CritterBodyDefinition["id"], number>> = {
  round: -1.06,
  tall: -1.22,
};

const LEG_MODEL_ATTACHMENT_Y: Readonly<Record<CritterLegId, number>> = {
  "legs-bouncy": 0.125,
  "legs-stompy": 0.14,
  "legs-tall": 0.14,
};

const LEG_CONNECTION_OVERLAP = 0.08;

export type CritterModelSources = Partial<Readonly<Record<CritterModelId, Group>>>;

export interface CritterModelLoader {
  loadAsync(url: string): Promise<{ readonly scene: Group }>;
}

export interface CritterModelLoadResult {
  readonly models: CritterModelSources;
  readonly failedIds: readonly CritterModelId[];
}

/**
 * Places a leg component's top attachment plane just inside the selected body's lower surface.
 * Fallback legs are authored with their attachment plane at local y=0; bundled GLBs retain their
 * exported origins, so their measured top anchors are removed here instead of mutating the assets.
 */
export function getCritterLegPositionY(
  bodyId: CritterBodyDefinition["id"],
  legId: CritterLegId,
  source: CritterComponentSource,
): number {
  const attachmentY = source === "model" ? LEG_MODEL_ATTACHMENT_Y[legId] : 0;
  return BODY_LEG_SOCKET_Y[bodyId] + LEG_CONNECTION_OVERLAP - attachmentY;
}

/** Keeps fallback torus mouths front-facing and turns the half arc into an upward smile. */
export function getCritterMouthFallbackRotation(
  mouthId: CritterMouthId,
): [x: number, y: number, z: number] {
  return [0, 0, mouthId === "mouth-smile" ? Math.PI : 0];
}

/** Loads component files independently so one missing choice does not hide the others. */
export async function loadCritterModels(
  loader?: CritterModelLoader,
): Promise<CritterModelLoadResult> {
  const activeLoader =
    loader ?? new (await import("three/addons/loaders/GLTFLoader.js")).GLTFLoader();
  const outcomes = await Promise.all(
    CRITTER_MODEL_IDS.map(async (id) => {
      try {
        const { scene } = await activeLoader.loadAsync(assetUrl(CRITTER_MODEL_PATHS[id]));
        return { id, scene } as const;
      } catch {
        return { id } as const;
      }
    }),
  );
  const models: Partial<Record<CritterModelId, Group>> = {};
  const failedIds: CritterModelId[] = [];
  outcomes.forEach((outcome) => {
    if ("scene" in outcome) models[outcome.id] = outcome.scene;
    else failedIds.push(outcome.id);
  });
  return { models, failedIds };
}

/** Clones materials per visible component while retaining the source GLB's immutable geometry. */
export function createCritterModelInstance(source: Group, critterColor?: string): Group {
  const instance = source.clone(true);
  instance.traverse((object) => {
    if (!("material" in object) || !isMaterialValue(object.material)) return;
    object.material = Array.isArray(object.material)
      ? object.material.map((material) => cloneMaterial(material, critterColor))
      : cloneMaterial(object.material, critterColor);
  });
  return instance;
}

export function disposeCritterModelInstance(root: Object3D): void {
  root.traverse((object) => {
    if (!("material" in object) || !isMaterialValue(object.material)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
}

export function disposeCritterModelSources(sources: CritterModelSources): void {
  Object.values(sources).forEach((source) => {
    source?.traverse((object) => {
      Object.values(object).forEach((value) => {
        if (
          value instanceof BufferGeometry ||
          value instanceof Material ||
          value instanceof Texture
        ) {
          value.dispose();
        }
      });
    });
  });
}

function cloneMaterial(material: Material, critterColor?: string): Material {
  const clone = material.clone();
  if (
    critterColor !== undefined &&
    CRITTER_COLORABLE_MATERIALS.has(clone.name) &&
    clone instanceof MeshStandardMaterial
  ) {
    clone.color.set(critterColor);
  }
  return clone;
}

function isMaterialValue(value: unknown): value is Material | Material[] {
  return (
    value instanceof Material ||
    (Array.isArray(value) && value.every((item) => item instanceof Material))
  );
}
