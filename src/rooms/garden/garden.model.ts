import { BufferGeometry, type Group, Material, type Object3D, Texture } from "three";

import { assetUrl } from "../../engine/assets/assetUrl";
import type { GrowthStage } from "./garden.types";

export type GardenModelId = GrowthStage | "sun" | "cloud" | "bee";

export const GARDEN_MODEL_IDS = ["seed", "sprout", "bud", "flower", "sun", "cloud", "bee"] as const;

export const GARDEN_MODEL_PATHS: Readonly<Record<GardenModelId, string>> = {
  seed: "models/garden/seed.glb",
  sprout: "models/garden/sprout.glb",
  bud: "models/garden/bud.glb",
  flower: "models/garden/flower.glb",
  sun: "models/garden/sun.glb",
  cloud: "models/garden/cloud.glb",
  bee: "models/garden/bee.glb",
};

export type GardenModelSources = Partial<Readonly<Record<GardenModelId, Group>>>;

export interface GardenModelLoader {
  loadAsync(url: string): Promise<{ readonly scene: Group }>;
}

export interface GardenModelLoadResult {
  readonly models: GardenModelSources;
  readonly failedIds: readonly GardenModelId[];
}

/** Loads each garden character independently so a missing stage has a local fallback. */
export async function loadGardenModels(loader?: GardenModelLoader): Promise<GardenModelLoadResult> {
  const activeLoader =
    loader ?? new (await import("three/addons/loaders/GLTFLoader.js")).GLTFLoader();
  const outcomes = await Promise.all(
    GARDEN_MODEL_IDS.map(async (id) => {
      try {
        const { scene } = await activeLoader.loadAsync(assetUrl(GARDEN_MODEL_PATHS[id]));
        return { id, scene } as const;
      } catch {
        return { id } as const;
      }
    }),
  );
  const models: Partial<Record<GardenModelId, Group>> = {};
  const failedIds: GardenModelId[] = [];
  outcomes.forEach((outcome) => {
    if ("scene" in outcome) models[outcome.id] = outcome.scene;
    else failedIds.push(outcome.id);
  });
  return { models, failedIds };
}

/** Shares immutable source geometry while owning the visible instance's materials. */
export function createGardenModelInstance(source: Group): Group {
  const instance = source.clone(true);
  instance.traverse((object) => {
    if (!("material" in object) || !isMaterialValue(object.material)) return;
    object.material = Array.isArray(object.material)
      ? object.material.map((material) => material.clone())
      : object.material.clone();
  });
  return instance;
}

export function disposeGardenModelInstance(root: Object3D): void {
  root.traverse((object) => {
    if (!("material" in object) || !isMaterialValue(object.material)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
}

export function disposeGardenModelSources(sources: GardenModelSources): void {
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

function isMaterialValue(value: unknown): value is Material | Material[] {
  return (
    value instanceof Material ||
    (Array.isArray(value) && value.every((item) => item instanceof Material))
  );
}
