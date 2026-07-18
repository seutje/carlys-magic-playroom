import { Group } from "three";

import {
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
});
