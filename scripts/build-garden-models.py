"""Run in Blender via MCP, or blender --background --python this_file.py.

Creates an isolated authoring scene without modifying existing user objects.
Set CMP_GARDEN_OUTPUT before execution to override the export directory.
Front is -Y in Blender; glTF export converts Z-up to the app's Y-up.
Geometry is joined by material to bound draw calls, without decimation.
"""

import bpy
import math
import os
import tempfile

OUTPUT = globals().get("CMP_GARDEN_OUTPUT", os.path.join(tempfile.gettempdir(), "cmp-garden-hd"))
os.makedirs(OUTPUT, exist_ok=True)
scene = bpy.data.scenes.new("CMP Garden Higher Detail")
bpy.context.window.scene = scene
materials = {}
for key, color in {
    "green": (0.12, 0.42, 0.16, 1),
    "leaf": (0.32, 0.67, 0.19, 1),
    "vein": (0.55, 0.79, 0.28, 1),
    "pink": (0.95, 0.23, 0.43, 1),
    "blush": (1, 0.43, 0.51, 1),
    "yellow": (1, 0.66, 0.055, 1),
    "dark": (0.055, 0.035, 0.065, 1),
    "white": (0.96, 0.98, 1, 1),
    "blue": (0.55, 0.84, 0.94, 1),
    "seed": (0.53, 0.27, 0.105, 1),
    "seam": (0.77, 0.49, 0.23, 1),
}.items():
    material = bpy.data.materials.new("CMP_HD_" + key)
    material.use_nodes = True
    shader = next(n for n in material.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Roughness"].default_value = 0.6
    material.diffuse_color = color
    materials[key] = material


def finish(obj, name, material, root):
    obj.name = name
    obj.parent = root
    obj.data.materials.append(materials[material])
    if obj.type == "MESH":
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    return obj


def ellipsoid(name, center, scale, material, root, detail=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=detail, ring_count=detail // 2, location=center)
    obj = bpy.context.object
    obj.scale = scale
    return finish(obj, name, material, root)


def tube(name, points, radius, material, root):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 12
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    curve.use_fill_caps = True
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, position in zip(spline.bezier_points, points):
        point.co = position
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve)
    scene.collection.objects.link(obj)
    return finish(obj, name, material, root)


def face(root, z, front, spacing=0.13, size=1):
    for sign in (-1, 1):
        x = sign * spacing
        ellipsoid("Eye", (x, front, z + 0.06 * size), (0.047 * size, 0.038 * size, 0.075 * size), "dark", root, 20)
        ellipsoid("Eye glint", (x - 0.012 * size, front - 0.035 * size, z + 0.087 * size), (0.014 * size,) * 3, "white", root, 16)
        ellipsoid("Cheek", (sign * spacing * 1.65, front + 0.015 * size, z - 0.055 * size), (0.075 * size, 0.024 * size, 0.038 * size), "blush", root, 20)
    tube("Smile", [(-0.085 * size, front - 0.004, z - 0.045 * size), (0, front - 0.018, z - 0.095 * size), (0.085 * size, front - 0.004, z - 0.045 * size)], 0.016 * size, "dark", root)


def leaf(root, sign, height, length=0.65):
    # A tapered, curved blade with real thickness and a raised midrib.
    vertices, faces = [], []
    rings, sides = 16, 12
    for i in range(rings + 1):
        t = i / rings
        width = max(0.004, math.sin(math.pi * t) ** 0.85 * length * 0.28)
        for j in range(sides):
            a = j * math.tau / sides
            vertices.append((sign * (0.06 + length * t), math.cos(a) * width, height + length * (0.45 * t + 0.22 * math.sin(math.pi * t)) + math.sin(a) * width * 0.22))
    for i in range(rings):
        for j in range(sides):
            a = i * sides + j
            b = i * sides + (j + 1) % sides
            faces.append((a, b, b + sides, a + sides))
    faces.extend([tuple(reversed(range(sides))), tuple(rings * sides + j for j in range(sides))])
    mesh = bpy.data.meshes.new("Curved leaf")
    mesh.from_pydata(vertices, [], faces)
    obj = bpy.data.objects.new("Leaf blade", mesh)
    scene.collection.objects.link(obj)
    finish(obj, obj.name, "leaf", root)
    tube("Leaf midrib", [(sign * (0.06 + length * t), -0.014, height + length * (0.45 * t + 0.22 * math.sin(math.pi * t)) + 0.025) for t in (0, 0.25, 0.5, 0.75, 1)], 0.012, "vein", root)


roots = {}
for index, key in enumerate(("seed", "sprout", "bud", "flower", "sun", "cloud", "bee")):
    root = bpy.data.objects.new("CMP_HD_Garden_" + key.title(), None)
    scene.collection.objects.link(root)
    roots[key] = root
    if key == "seed":
        body = ellipsoid("Seed shell", (0, 0, 0.3), (0.36, 0.28, 0.32), "seed", root, 40)
        tube("Shell seam", [(0, 0.01, 0.61), (-0.07, -0.2, 0.52), (-0.12, -0.275, 0.3), (-0.07, -0.2, 0.08)], 0.018, "seam", root)
        ellipsoid("Seed tip", (0.02, 0, 0.6), (0.1, 0.1, 0.15), "seam", root)
        face(root, 0.31, -0.275, 0.11, 0.8)
    elif key in ("sprout", "bud", "flower"):
        top = {"sprout": 0.9, "bud": 1.65, "flower": 2.3}[key]
        tube("Curved stem", [(0, 0, 0), (0.04, 0.02, top * 0.35), (-0.035, 0, top * 0.7), (0, 0, top)], 0.085 if key == "flower" else 0.065, "green", root)
        leaf(root, -1, top * 0.32)
        leaf(root, 1, top * 0.52)
        if key == "sprout":
            ellipsoid("Sprout head", (0, 0, top), (0.29, 0.22, 0.24), "leaf", root, 40)
            face(root, top, -0.219, 0.105, 0.8)
        elif key == "bud":
            ellipsoid("Bud", (0, 0, top + 0.1), (0.34, 0.28, 0.43), "pink", root, 40)
            for sign in (-1, 1):
                sepal = ellipsoid("Sepal", (sign * 0.18, 0.01, top - 0.18), (0.15, 0.18, 0.3), "leaf", root)
                sepal.rotation_euler[1] = sign * 0.45
            face(root, top + 0.12, -0.275, 0.12, 0.9)
        else:
            for n in range(8):
                angle = n * math.tau / 8
                petal = ellipsoid("Rounded petal", (0.57 * math.sin(angle), 0.025, top + 0.57 * math.cos(angle)), (0.28, 0.16, 0.48), "pink" if n % 2 else "blush", root)
                petal.rotation_euler[1] = angle
            ellipsoid("Flower center", (0, -0.16, top), (0.37, 0.24, 0.37), "yellow", root, 40)
            face(root, top, -0.396, 0.13, 1)
    elif key == "sun":
        for n in range(12):
            angle = n * math.tau / 12
            ray = ellipsoid("Sun ray", (1.04 * math.sin(angle), 0.045, 1.04 * math.cos(angle)), (0.12, 0.12, 0.3), "yellow", root, 24)
            ray.rotation_euler[1] = angle
        ellipsoid("Sun face", (0, 0, 0), (0.78, 0.31, 0.78), "yellow", root, 48)
        face(root, 0, -0.31, 0.23, 1.65)
    elif key == "cloud":
        for x, z, sx, sz in ((0, -0.12, 1.07, 0.43), (-0.64, 0.05, 0.52, 0.47), (0, 0.3, 0.62, 0.66), (0.62, 0.12, 0.55, 0.48)):
            ellipsoid("Cloud puff", (x, 0, z), (sx, 0.4, sz), "white", root, 40)
        face(root, -0.08, -0.405, 0.21, 1.4)
    else:
        for sign in (-1, 1):
            wing = ellipsoid("Wing", (sign * 0.53, 0.15, 0.2), (0.38, 0.11, 0.65), "blue", root, 40)
            wing.rotation_euler[1] = sign * 0.48
            tube("Wing vein", [(sign * 0.23, 0.025, -0.1), (sign * 0.55, 0.025, 0.28), (sign * 0.75, 0.025, 0.61)], 0.017, "white", root)
        ellipsoid("Bee body", (0, 0, -0.08), (0.46, 0.35, 0.65), "yellow", root, 48)
        for z in (-0.12, -0.39):
            # Raised bands follow the body's ellipsoidal cross-section.
            r = math.sqrt(1 - ((z + 0.08) / 0.65) ** 2)
            tube("Body stripe", [(0.465 * r * math.sin(a), -0.355 * r * math.cos(a), z) for a in [i * math.tau / 16 for i in range(17)]], 0.045, "dark", root)
        ellipsoid("Bee head", (0, -0.035, 0.56), (0.46, 0.36, 0.42), "yellow", root, 48)
        face(root, 0.57, -0.393, 0.16, 1.05)
        for sign in (-1, 1):
            tube("Antenna", [(sign * 0.21, 0, 0.87), (sign * 0.29, 0, 1.1), (sign * 0.4, -0.01, 1.18)], 0.025, "dark", root)
            ellipsoid("Antenna tip", (sign * 0.4, -0.01, 1.18), (0.065,) * 3, "dark", root, 20)

# Convert curves and merge each material family into one mesh per character.
stats = {}
for key, root in roots.items():
    groups = {}
    for obj in list(root.children):
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        if obj.type == "CURVE":
            bpy.ops.object.convert(target="MESH")
            obj = bpy.context.object
        groups.setdefault(obj.data.materials[0].name, []).append(obj)
    for material, objects in groups.items():
        bpy.ops.object.select_all(action="DESELECT")
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = objects[0]
        if len(objects) > 1:
            bpy.ops.object.join()
        objects[0].name = root.name + "_" + material
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for obj in root.children:
        obj.select_set(True)
    path = os.path.join(OUTPUT, key + ".glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True, export_yup=True, export_cameras=False, export_lights=False)
    triangles = 0
    for obj in root.children:
        obj.data.calc_loop_triangles()
        triangles += len(obj.data.loop_triangles)
    stats[key] = {"bytes": os.path.getsize(path), "triangles": triangles, "batches": len(root.children)}
    # Display only; export roots remain at the origin in their individual GLBs.
    root.location.x = list(roots).index(key) * 3.4

print({"output": OUTPUT, "models": stats})
