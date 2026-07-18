import { BufferGeometry, type Group, Material, type Object3D, Texture } from "three";

import { assetUrl } from "../../engine/assets/assetUrl";

export const TRAIN_MODEL_PATH = "models/train/locomotive.glb";

export interface TrainModelLoader {
  loadAsync(url: string): Promise<{ readonly scene: Group }>;
}

/** Loads a fresh, room-owned model instance so room cleanup can release its GPU resources. */
export async function loadTrainModel(loader?: TrainModelLoader): Promise<Group> {
  const activeLoader =
    loader ?? new (await import("three/addons/loaders/GLTFLoader.js")).GLTFLoader();
  const model = await activeLoader.loadAsync(assetUrl(TRAIN_MODEL_PATH));
  return model.scene;
}

/** GLTF scenes rendered through a primitive are caller-owned and need explicit disposal. */
export function disposeTrainModel(root: Object3D): void {
  root.traverse((object) => {
    if (!("geometry" in object) || !(object.geometry instanceof BufferGeometry)) return;
    if (!("material" in object) || !isMaterialValue(object.material)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(disposeMaterial);
  });
}

function isMaterialValue(value: unknown): value is Material | Material[] {
  return (
    value instanceof Material ||
    (Array.isArray(value) && value.every((item) => item instanceof Material))
  );
}

function disposeMaterial(material: Material): void {
  Object.values(material).forEach((value: unknown) => {
    if (value instanceof Texture) value.dispose();
  });
  material.dispose();
}
