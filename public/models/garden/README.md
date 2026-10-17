# Garden models

Rebuilt in Blender 5.2 through the Blender MCP connection on 2026-10-17.
These are original procedural meshes; no external assets, textures, or services
are required at runtime. Regenerate using `scripts/build-garden-models.py` in
Blender. Set the Python global `CMP_GARDEN_OUTPUT` to the desired export folder
before executing the script; by default it uses a temporary folder. Copy the
seven resulting GLBs here after visual review.

The script creates a separate scene and leaves existing scenes intact. Each
export has its root at the origin, faces Blender -Y, and converts Z-up to glTF
Y-up. Plant roots rest on the soil; helpers and bee use centered origins.
The display lineup positions are applied only after each individual export.

| Model  | Previous triangles | Triangles | Material batches |   Bytes |
| ------ | -----------------: | --------: | ---------------: | ------: |
| seed   |                232 |     5,600 |                5 | 147,016 |
| sprout |                280 |     7,400 |                6 | 189,716 |
| bud    |                260 |     9,320 |                7 | 238,076 |
| flower |                260 |    15,080 |                8 | 377,852 |
| sun    |                232 |    10,928 |                4 | 281,956 |
| cloud  |                312 |     8,464 |                3 | 212,840 |
| bee    |              1,672 |    20,256 |                5 | 498,728 |

Garden total: 1,946,184 bytes. All project GLBs: 3,804,792 bytes against
the maintainer-authorized 8,000,000-byte budget (previously 4,000,000).
Curved stems, tapered leaves with midribs, rounded petals, eye highlights,
and bee wing veins use geometry. Joining by material bounds draw calls;
no subdivision modifiers or decimation are needed at runtime.

Asset URLs, interaction colliders, DOM controls, reduced-motion behavior,
primitive fallbacks, and geometry/material ownership remain in the existing
garden rendering adapter. Exports are independently loaded and cached offline.
`gardenModelExports.test.ts` checks self-contained files, finite geometry
bounds, triangle ranges, material batches, and per-model size.
