/// <reference types="node" />
import { readFileSync } from "node:fs";

import { GARDEN_MODEL_IDS, GARDEN_MODEL_PATHS } from "../../src/rooms/garden/garden.model";

interface ExportDocument {
  asset: { version: string };
  accessors: { count: number; min?: number[]; max?: number[] }[];
  buffers: { uri?: string }[];
  meshes: { primitives: { indices: number; attributes: { POSITION: number }; mode?: number }[] }[];
  images?: unknown[];
}

describe("bundled higher-detail garden exports", () => {
  it.each(GARDEN_MODEL_IDS)("keeps %s detailed, self-contained, and bounded", (id) => {
    const bytes = readFileSync(`public/${GARDEN_MODEL_PATHS[id]}`);
    expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
    expect(bytes.readUInt32LE(4)).toBe(2);
    expect(bytes.readUInt32LE(8)).toBe(bytes.length);
    expect(bytes.readUInt32LE(16)).toBe(0x4e4f534a);
    // This fixture type describes Blender's checked-in glTF output, not user input.
    const document = JSON.parse(
      bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString("utf8"),
    ) as ExportDocument;
    expect(document.asset.version).toBe("2.0");
    expect(document.buffers.every((buffer) => buffer.uri === undefined)).toBe(true);
    expect(document.images ?? []).toEqual([]);
    const primitives = document.meshes.flatMap((mesh) => mesh.primitives);
    expect(primitives.length).toBeLessThanOrEqual(8);
    let triangles = 0;
    primitives.forEach((primitive) => {
      expect(primitive.mode ?? 4).toBe(4);
      triangles += (document.accessors[primitive.indices]?.count ?? 0) / 3;
      const positions = document.accessors[primitive.attributes.POSITION];
      expect(positions?.count).toBeGreaterThan(0);
      expect(positions?.min?.every(Number.isFinite)).toBe(true);
      expect(positions?.max?.every(Number.isFinite)).toBe(true);
    });
    expect(triangles).toBeGreaterThanOrEqual(5_000);
    expect(triangles).toBeLessThanOrEqual(25_000);
    expect(bytes.length).toBeLessThan(600_000);
  });
});
