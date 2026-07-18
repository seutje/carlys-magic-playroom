import { BufferGeometry, type Group, Material, type Object3D, Texture } from "three";

import { assetUrl } from "../../engine/assets/assetUrl";
import { INSTRUMENTS, type InstrumentId } from "./music.types";

export const MUSIC_MODEL_PATHS: Readonly<Record<InstrumentId, string>> = {
  drum: "models/music/drum.glb",
  bell: "models/music/bell.glb",
  xylophone: "models/music/xylophone.glb",
};

export type MusicModelSources = Partial<Readonly<Record<InstrumentId, Group>>>;

export interface MusicModelLoader {
  loadAsync(url: string): Promise<{ readonly scene: Group }>;
}

export interface MusicModelLoadResult {
  readonly models: MusicModelSources;
  readonly failedIds: readonly InstrumentId[];
}

/** Loads instruments independently so one missing model does not hide the rest of the stage. */
export async function loadMusicModels(loader?: MusicModelLoader): Promise<MusicModelLoadResult> {
  const activeLoader =
    loader ?? new (await import("three/addons/loaders/GLTFLoader.js")).GLTFLoader();
  const outcomes = await Promise.all(
    INSTRUMENTS.map(async (id) => {
      try {
        const { scene } = await activeLoader.loadAsync(assetUrl(MUSIC_MODEL_PATHS[id]));
        return { id, scene } as const;
      } catch {
        return { id } as const;
      }
    }),
  );
  const models: Partial<Record<InstrumentId, Group>> = {};
  const failedIds: InstrumentId[] = [];
  outcomes.forEach((outcome) => {
    if ("scene" in outcome) models[outcome.id] = outcome.scene;
    else failedIds.push(outcome.id);
  });
  return { models, failedIds };
}

/** Shares immutable geometry while owning visible-instance materials. */
export function createMusicModelInstance(source: Group): Group {
  const instance = source.clone(true);
  instance.traverse((object) => {
    if (!("material" in object) || !isMaterialValue(object.material)) return;
    object.material = Array.isArray(object.material)
      ? object.material.map((material) => material.clone())
      : object.material.clone();
  });
  return instance;
}

export function disposeMusicModelInstance(root: Object3D): void {
  root.traverse((object) => {
    if (!("material" in object) || !isMaterialValue(object.material)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
}

export function disposeMusicModelSources(sources: MusicModelSources): void {
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
