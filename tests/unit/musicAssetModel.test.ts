import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

import {
  createMusicModelInstance,
  disposeMusicModelInstance,
  loadMusicModels,
  MUSIC_MODEL_PATHS,
  type MusicModelLoader,
} from "../../src/rooms/music/music.model";
import { INSTRUMENTS } from "../../src/rooms/music/music.types";

describe("music instrument models", () => {
  it("loads every instrument from a base-path-aware public asset URL", async () => {
    const loadAsync = vi.fn().mockImplementation(() => Promise.resolve({ scene: new Group() }));
    const result = await loadMusicModels({ loadAsync });

    expect(result.failedIds).toEqual([]);
    expect(Object.keys(result.models)).toHaveLength(INSTRUMENTS.length);
    INSTRUMENTS.forEach((id) => {
      expect(loadAsync).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}${MUSIC_MODEL_PATHS[id]}`);
    });
  });

  it("isolates a missing instrument while retaining the rest of the stage", async () => {
    const loader: MusicModelLoader = {
      loadAsync: vi
        .fn()
        .mockImplementation((url: string) =>
          url.endsWith("bell.glb")
            ? Promise.reject(new Error("missing model"))
            : Promise.resolve({ scene: new Group() }),
        ),
    };

    const result = await loadMusicModels(loader);
    expect(result.failedIds).toEqual(["bell"]);
    expect(result.models.bell).toBeUndefined();
    expect(result.models.drum).toBeInstanceOf(Group);
    expect(result.models.xylophone).toBeInstanceOf(Group);
  });

  it("creates an instance with owned materials and shared geometry", () => {
    const source = new Group();
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial({ color: "#ffffff" });
    source.add(new Mesh(geometry, material));

    const instance = createMusicModelInstance(source);
    const mesh = instance.children[0];
    expect(mesh).toBeInstanceOf(Mesh);
    if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshStandardMaterial)) return;
    expect(mesh.geometry).toBe(geometry);
    expect(mesh.material).not.toBe(material);

    disposeMusicModelInstance(instance);
    material.dispose();
    geometry.dispose();
  });
});
