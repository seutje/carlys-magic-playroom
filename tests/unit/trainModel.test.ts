import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

import {
  CARGO_CAR_MODEL_PATH,
  createDuckModelInstance,
  disposeDuckModelInstance,
  DUCK_FEATHER_MATERIAL,
  DUCK_MODEL_PATH,
  loadCargoCarModel,
  loadDuckModel,
  loadTrainModel,
  TRAIN_MODEL_PATH,
  type TrainModelLoader,
} from "../../src/rooms/train/train.model";

describe("train model", () => {
  it("loads the locomotive from a base-path-aware public asset URL", async () => {
    const scene = new Group();
    const loadAsync = vi.fn().mockResolvedValue({ scene });
    const loader: TrainModelLoader = {
      loadAsync,
    };

    await expect(loadTrainModel(loader)).resolves.toBe(scene);
    expect(loadAsync).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}${TRAIN_MODEL_PATH}`);
  });

  it("lets the scene recover when model loading fails", async () => {
    const loader: TrainModelLoader = {
      loadAsync: vi.fn().mockRejectedValue(new Error("missing model")),
    };

    await expect(loadTrainModel(loader)).rejects.toThrow("missing model");
  });

  it("loads the cargo car from its base-path-aware public asset URL", async () => {
    const scene = new Group();
    const loadAsync = vi.fn().mockResolvedValue({ scene });

    await expect(loadCargoCarModel({ loadAsync })).resolves.toBe(scene);
    expect(loadAsync).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}${CARGO_CAR_MODEL_PATH}`);
  });

  it("loads the duck from its base-path-aware public asset URL", async () => {
    const scene = new Group();
    const loadAsync = vi.fn().mockResolvedValue({ scene });

    await expect(loadDuckModel({ loadAsync })).resolves.toBe(scene);
    expect(loadAsync).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}${DUCK_MODEL_PATH}`);
  });

  it("creates independently tinted duck instances without mutating the source material", () => {
    const source = new Group();
    const sourceGeometry = new BoxGeometry();
    const sourceMaterial = new MeshStandardMaterial({ color: "#ffffff" });
    sourceMaterial.name = DUCK_FEATHER_MATERIAL;
    source.add(new Mesh(sourceGeometry, sourceMaterial));

    const instance = createDuckModelInstance(source, "#4f8fdf");
    const instanceMesh = instance.children[0];
    expect(instanceMesh).toBeInstanceOf(Mesh);
    if (!(instanceMesh instanceof Mesh)) return;
    expect(instanceMesh.material).toBeInstanceOf(MeshStandardMaterial);
    if (!(instanceMesh.material instanceof MeshStandardMaterial)) return;
    expect(instanceMesh.material.color.getHexString()).toBe("4f8fdf");
    expect(sourceMaterial.color.getHexString()).toBe("ffffff");

    disposeDuckModelInstance(instance);
    sourceMaterial.dispose();
    sourceGeometry.dispose();
  });
});
