"""Build the Reeng ring in Blender from photo reference.

Run:  Blender -b -P 3d/build_ring.py
Units: 1 Blender unit = 1 cm. Assumed size US 9 (inner Ø 18.9 mm), 8 mm wide, 2.4 mm thick.

Outputs (next to this script):
  reeng_ring.blend      source scene
  reeng_ring.glb        web model (Draco compressed)
  reeng_ring_raw.glb    uncompressed, for debugging
Objects (named for the web code): Shell, Liner, Antenna, SecureChip
"""
import math
import os

import bmesh
import bpy

OUT = os.path.dirname(os.path.abspath(__file__))

# --- dimensions (cm) -------------------------------------------------------
RI = 0.945            # inner radius
HW = 0.40             # half width
LINER_T = 0.05        # liner thickness
LINER_HW = 0.37       # liner half width (narrower -> visible step at the edges)
SHELL_IN = RI + LINER_T
SHELL_SIDE = RI + 0.13
DOME = 0.11           # outer dome height -> total thickness 0.24
SEGMENTS = 256


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system = "METRIC"


def material(name, color, rough, metal=0.0, coat=0.0, coat_rough=0.03):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1.0)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = coat_rough
    return m


def revolve(name, profile, mat):
    """Spin a closed (r, z) profile around Z into a mesh object."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0.0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[(i + 1) % len(verts)])) for i in range(len(verts))]
    bmesh.ops.spin(
        bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1),
        angle=math.tau, steps=SEGMENTS, use_merge=True,
    )
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    me.materials.append(mat)
    smooth(ob)
    return ob


def smooth(ob, angle=40):
    for poly in ob.data.polygons:
        poly.use_smooth = True
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
    ob.select_set(False)


def shell_profile():
    pts = []
    # domed outer face: superellipse from bottom edge to top edge
    n = 48
    for i in range(n + 1):
        t = -1 + 2 * i / n
        k = (1 - abs(t) ** 2.4) ** (1 / 2.4)
        pts.append((SHELL_SIDE + DOME * k, t * HW))
    # top side face with a small fillet into the inner lip
    pts += [(SHELL_SIDE - 0.02, HW), (SHELL_IN + 0.012, HW), (SHELL_IN, HW - 0.012)]
    # inner face (sits on the liner)
    pts += [(SHELL_IN, -HW + 0.012), (SHELL_IN + 0.012, -HW), (SHELL_SIDE - 0.02, -HW)]
    return pts


def liner_profile():
    c = 0.01
    r0, r1 = RI, SHELL_IN + 0.004  # tiny overlap into the shell, no gap
    return [
        (r0 + c, -LINER_HW), (r1, -LINER_HW), (r1, LINER_HW), (r0 + c, LINER_HW),
        (r0, LINER_HW - c), (r0, -LINER_HW + c),
    ]


def engraving(liner, mat):
    """Deboss 'reeng' into the inside of the liner, readable from the ring's centre."""
    bpy.ops.object.text_add()
    txt = bpy.context.object
    txt.data.body = "reeng"
    txt.data.size = 0.30
    txt.data.extrude = 0.015
    txt.data.align_x = "CENTER"
    txt.data.align_y = "CENTER"
    bpy.ops.object.convert(target="MESH")
    me = txt.data
    for v in me.vertices:
        x, h, d = v.co.x, v.co.y, v.co.z + 0.01  # d: radial depth, + = into the liner
        th = x / RI
        r = RI + d
        # inside surface at -Y; text runs toward -X so it reads correctly from the centre
        v.co = (-r * math.sin(th), -r * math.cos(th), h)
    # the wrap above is a mirroring transform, so the cutter comes out inside-out
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    # cut faces take the cutter's material so the lettering reads against the satin liner
    me.materials.append(mat)
    liner.data.materials.append(mat)
    mod = liner.modifiers.new("Engrave", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.solver = "EXACT"
    mod.material_mode = "TRANSFER"
    mod.object = txt
    bpy.context.view_layer.objects.active = liner
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(txt)
    # the cut leaves long n-gons; triangulate and re-split normals so letter walls stay crisp
    bm = bmesh.new()
    bm.from_mesh(liner.data)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    bm.to_mesh(liner.data)
    bm.free()
    smooth(liner, 30)


def internals(copper, chip_mat):
    # NFC antenna coil sits inside the shell; revealed by the exploded view on the web
    ant = revolve("Antenna", [(1.01, -0.26), (1.035, -0.26), (1.035, 0.26), (1.01, 0.26)], copper)
    bpy.ops.mesh.primitive_cube_add(size=1)
    chip = bpy.context.object
    chip.name = "SecureChip"
    chip.dimensions = (0.34, 0.035, 0.30)
    chip.location = (0, 1.05, 0)
    bpy.ops.object.transform_apply(scale=True)
    bev = chip.modifiers.new("Bevel", "BEVEL")
    bev.width, bev.segments = 0.008, 2
    bpy.ops.object.modifier_apply(modifier=bev.name)
    chip.data.materials.append(chip_mat)
    return ant, chip


def studio(target_objs):
    scn = bpy.context.scene
    scn.render.engine = "CYCLES"
    scn.cycles.samples = 96
    scn.cycles.device = "GPU"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    try:
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
    except Exception:
        scn.cycles.device = "CPU"
    scn.render.resolution_x, scn.render.resolution_y = 1600, 1000
    # transparent PNGs so renders drop onto any section background
    scn.render.film_transparent = True
    scn.render.image_settings.color_mode = "RGBA"
    scn.view_settings.view_transform = "AgX"
    scn.view_settings.look = "AgX - Punchy"
    # dark world so black ceramic stays black; shape comes from the softboxes
    world = bpy.data.worlds.new("Studio")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.02, 0.025, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    scn.world = world

    def area(name, loc, size, energy, color=(1, 1, 1)):
        bpy.ops.object.light_add(type="AREA", location=loc)
        l = bpy.context.object
        l.name = name
        l.data.size = size
        l.data.energy = energy
        l.data.color = color
        l.constraints.new("TRACK_TO").target = target_objs
        return l

    area("Key", (4, -4, 5), 4, 900)
    area("Rim", (-5, 3, 2), 2, 500, (0.59, 0.19, 0.96))   # brand purple #9730F6 rim
    area("Strip", (-1, -6, 0.6), 7, 500)                   # long highlight on the dome
    area("Top", (0, 0, 7), 5, 300)

    bpy.ops.object.camera_add()
    cam = bpy.context.object
    cam.data.lens = 85
    scn.camera = cam
    cam.constraints.new("TRACK_TO").target = target_objs
    return cam


def aim(cam, point):
    """Point the camera's track constraint at an arbitrary spot."""
    tgt = bpy.data.objects.get("CamTarget") or bpy.data.objects.new("CamTarget", None)
    if tgt.name not in bpy.context.collection.objects:
        bpy.context.collection.objects.link(tgt)
    tgt.location = point
    cam.constraints[0].target = tgt


def main():
    reset()
    ceramic = material("BlackCeramic", (0.008, 0.008, 0.01), 0.12, coat=1.0)
    liner_mat = material("LinerSatin", (0.03, 0.03, 0.035), 0.45)
    copper = material("Copper", (0.95, 0.55, 0.35), 0.3, metal=1.0)
    chip_mat = material("Chip", (0.02, 0.02, 0.025), 0.35, metal=0.6)
    engrave_mat = material("Engraving", (0.55, 0.55, 0.58), 0.35, metal=1.0)

    shell = revolve("Shell", shell_profile(), ceramic)
    liner = revolve("Liner", liner_profile(), liner_mat)
    engraving(liner, engrave_mat)
    internals(copper, chip_mat)

    root = bpy.data.objects.new("ReengRing", None)
    bpy.context.collection.objects.link(root)
    for name in ("Shell", "Liner", "Antenna", "SecureChip"):
        bpy.data.objects[name].parent = root

    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "reeng_ring.blend"))

    # glTF: +Y up on export; ring axis is Blender Z -> three.js Y
    for draco, fname in ((True, "reeng_ring.glb"), (False, "reeng_ring_raw.glb")):
        bpy.ops.object.select_all(action="DESELECT")
        root.select_set(True)
        for c in root.children:
            c.select_set(True)
        bpy.ops.export_scene.gltf(
            filepath=os.path.join(OUT, fname), export_format="GLB", use_selection=True,
            export_apply=True, export_draco_mesh_compression_enable=draco,
            export_draco_mesh_compression_level=7,
        )

    # preview renders
    cam = studio(root)
    # name: (camera location, look-at point)
    shots = {
        "preview_hero": ((6.5, -6.5, 3.2), (0, 0, 0)),
        "preview_side": ((9.0, 0.0, 0.8), (0, 0, 0)),
        "preview_inside": ((0.0, 2.2, 3.4), (0, -0.95, 0)),  # down into the ring at the engraving
    }
    for name, (loc, look) in shots.items():
        cam.location = loc
        aim(cam, look)
        bpy.context.scene.render.filepath = os.path.join(OUT, "previews", name + ".png")
        bpy.ops.render.render(write_still=True)


main()
