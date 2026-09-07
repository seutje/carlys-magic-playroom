import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

import {
  createCritterModelInstance,
  CRITTER_BODY_MATERIAL,
  CRITTER_LEG_MATERIAL,
  CRITTER_MODEL_IDS,
  CRITTER_MODEL_PATHS,
  disposeCritterModelInstance,
  getCritterLegPositionY,
  getCritterMouthFallbackRotation,
  loadCritterModels,
  type CritterModelLoader,
} from "../../src/rooms/critter/critter.model";

describe("critter component models", () => {
  it("keeps fallback mouths front-facing with the smile opening upward", () => {
    expect(getCritterMouthFallbackRotation("mouth-smile")).toEqual([0, 0, Math.PI]);
    expect(getCritterMouthFallbackRotation("mouth-o")).toEqual([0, 0, 0]);
  });

  it("aligns every valid leg source to the selected body's attachment plane", () => {
    const expectedConnectionY = { round: -0.98, tall: -1.14 } as const;
    const modelAttachmentY = {
      "legs-bouncy": 0.125,
      "legs-stompy": 0.14,
      "legs-tall": 0.14,
    } as const;
    const validCombinations = [
      ["round", "legs-bouncy"],
      ["round", "legs-stompy"],
      ["tall", "legs-bouncy"],
      ["tall", "legs-tall"],
    ] as const;

    validCombinations.forEach(([bodyId, legId]) => {
      expect(getCritterLegPositionY(bodyId, legId, "model") + modelAttachmentY[legId]).toBeCloseTo(
        expectedConnectionY[bodyId],
      );
      expect(getCritterLegPositionY(bodyId, legId, "fallback")).toBeCloseTo(
        expectedConnectionY[bodyId],
      );
    });
  });

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

  it("tints leg shafts with the critter color while preserving leg accents", () => {
    const source = new Group();
    const geometry = new BoxGeometry();
    const shaftMaterial = new MeshStandardMaterial({ color: "#59496b" });
    shaftMaterial.name = CRITTER_LEG_MATERIAL;
    const accentMaterial = new MeshStandardMaterial({ color: "#ee82a2" });
    accentMaterial.name = "CMP_Critter_Pink";
    source.add(new Mesh(geometry, shaftMaterial), new Mesh(geometry, accentMaterial));

    const instance = createCritterModelInstance(source, "#66bd9a");
    const shaft = instance.children[0];
    const accent = instance.children[1];
    expect(shaft).toBeInstanceOf(Mesh);
    expect(accent).toBeInstanceOf(Mesh);
    if (
      !(shaft instanceof Mesh) ||
      !(shaft.material instanceof MeshStandardMaterial) ||
      !(accent instanceof Mesh) ||
      !(accent.material instanceof MeshStandardMaterial)
    ) {
      return;
    }
    expect(shaft.material.color.getHexString()).toBe("66bd9a");
    expect(accent.material.color.getHexString()).toBe("ee82a2");
    expect(shaftMaterial.color.getHexString()).toBe("59496b");

    disposeCritterModelInstance(instance);
    shaftMaterial.dispose();
    accentMaterial.dispose();
    geometry.dispose();
  });
});
