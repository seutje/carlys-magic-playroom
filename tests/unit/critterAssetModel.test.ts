import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

import {
  createCritterModelInstance,
  CRITTER_BODY_MATERIAL,
  CRITTER_MODEL_IDS,
  CRITTER_MODEL_PATHS,
  disposeCritterModelInstance,
  loadCritterModels,
  type CritterModelLoader,
} from "../../src/rooms/critter/critter.model";

describe("critter component models", () => {
  it("loads every component from a base-path-aware public asset URL", async () => {
    const loadAsync = vi.fn().mockImplementation(() => Promise.resolve({ scene: new Group() }));
    const result = await loadCritterModels({ loadAsync });

    expect(result.failedIds).toEqual([]);
    expect(Object.keys(result.models)).toHaveLength(CRITTER_MODEL_IDS.length);
    CRITTER_MODEL_IDS.forEach((id) => {
      expect(loadAsync).toHaveBeenCalledWith(
        `${import.meta.env.BASE_URL}${CRITTER_MODEL_PATHS[id]}`,
      );
    });
  });

  it("isolates a missing component so the remaining choices still load", async () => {
    const loader: CritterModelLoader = {
      loadAsync: vi
        .fn()
        .mockImplementation((url: string) =>
          url.endsWith("mouth-o.glb")
            ? Promise.reject(new Error("missing model"))
            : Promise.resolve({ scene: new Group() }),
        ),
    };

    const result = await loadCritterModels(loader);
    expect(result.failedIds).toEqual(["mouth-o"]);
    expect(result.models["mouth-o"]).toBeUndefined();
    expect(result.models["eyes-star"]).toBeInstanceOf(Group);
  });

  it("tints body material instances without mutating their source", () => {
    const source = new Group();
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial({ color: "#ffffff" });
    material.name = CRITTER_BODY_MATERIAL;
    source.add(new Mesh(geometry, material));

    const instance = createCritterModelInstance(source, "#9b7fd1");
    const mesh = instance.children[0];
    expect(mesh).toBeInstanceOf(Mesh);
    if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshStandardMaterial)) return;
    expect(mesh.material.color.getHexString()).toBe("9b7fd1");
    expect(material.color.getHexString()).toBe("ffffff");

    disposeCritterModelInstance(instance);
    material.dispose();
    geometry.dispose();
  });
});
