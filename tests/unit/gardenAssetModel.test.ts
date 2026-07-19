import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

import {
  createGardenModelInstance,
  disposeGardenModelInstance,
  GARDEN_MODEL_IDS,
  GARDEN_MODEL_PATHS,
  loadGardenModels,
  type GardenModelLoader,
} from "../../src/rooms/garden/garden.model";

describe("garden character models", () => {
  it("loads every growth stage and helper from a base-path-aware URL", async () => {
    const loadAsync = vi.fn().mockImplementation(() => Promise.resolve({ scene: new Group() }));
    const result = await loadGardenModels({ loadAsync });

    expect(result.failedIds).toEqual([]);
    expect(Object.keys(result.models)).toHaveLength(GARDEN_MODEL_IDS.length);
    GARDEN_MODEL_IDS.forEach((id) => {
      expect(loadAsync).toHaveBeenCalledWith(
        `${import.meta.env.BASE_URL}${GARDEN_MODEL_PATHS[id]}`,
      );
    });
  });

  it("isolates a missing stage while retaining the other garden characters", async () => {
    const loader: GardenModelLoader = {
      loadAsync: vi
        .fn()
        .mockImplementation((url: string) =>
          url.endsWith("bud.glb")
            ? Promise.reject(new Error("missing model"))
            : Promise.resolve({ scene: new Group() }),
        ),
    };

    const result = await loadGardenModels(loader);
    expect(result.failedIds).toEqual(["bud"]);
    expect(result.models.bud).toBeUndefined();
    expect(result.models.seed).toBeInstanceOf(Group);
    expect(result.models.sun).toBeInstanceOf(Group);
    expect(result.models.cloud).toBeInstanceOf(Group);
  });

  it("creates an instance with owned materials and shared geometry", () => {
    const source = new Group();
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial({ color: "#ffffff" });
    source.add(new Mesh(geometry, material));

    const instance = createGardenModelInstance(source);
    const mesh = instance.children[0];
    expect(mesh).toBeInstanceOf(Mesh);
    if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshStandardMaterial)) return;
    expect(mesh.geometry).toBe(geometry);
    expect(mesh.material).not.toBe(material);

    disposeGardenModelInstance(instance);
    material.dispose();
    geometry.dispose();
  });
});
