"""Render the ring for the Open Graph share image (public/og.png is built from it).

Run:  /Applications/Blender.app/Contents/MacOS/Blender -b 3d/reeng_ring.blend -P 3d/render_og.py
Out:  3d/previews/og_ring.png, transparent, in the hero's 3/4 pose: standing, tipped back so
      the hole shows, turned a little (as RingRig's HERO_ROT does on the site).
"""
import math
import os

import bpy

OUT = os.path.dirname(os.path.abspath(__file__))
SIZE = 1400

scn = bpy.context.scene
root = bpy.data.objects["ReengRing"]
# the site's hero pose: axis tipped toward the camera, then rolled a touch
root.rotation_euler = (1.15, 0.0, 0.0)
root.rotation_euler.rotate_axis("Y", 0.35)

scn.render.engine = "CYCLES"
scn.cycles.samples = 128
scn.cycles.device = "GPU"
try:
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
except Exception:
    scn.cycles.device = "CPU"
scn.render.resolution_x = scn.render.resolution_y = SIZE
scn.render.film_transparent = True
scn.render.image_settings.color_mode = "RGBA"
scn.view_settings.view_transform = "AgX"
scn.view_settings.look = "AgX - Punchy"

# dark world so the black ceramic stays black; the shape comes from big soft boxes
world = bpy.data.worlds.new("OGStudio")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.02, 0.025, 1)
scn.world = world

target = bpy.data.objects.new("OGTarget", None)
scn.collection.objects.link(target)


def area(name, loc, size, energy, color=(1, 1, 1)):
    bpy.ops.object.light_add(type="AREA", location=loc)
    light = bpy.context.object
    light.name = name
    light.data.size = size
    light.data.energy = energy
    light.data.color = color
    light.constraints.new("TRACK_TO").target = target
    return light


area("Key", (3, -5, 5), 5, 1100)
area("Fill", (-5, -4, 1), 4, 500)
area("Rim", (-4, 4, 3), 2.5, 700, (0.59, 0.19, 0.96))  # brand violet #9730F6
area("Kicker", (5, 3, -1), 2, 350, (0.59, 0.19, 0.96))
area("Top", (0, 0, 7), 6, 350)

bpy.ops.object.camera_add(location=(0, -9.5, 0.6))
cam = bpy.context.object
cam.data.lens = 85
cam.constraints.new("TRACK_TO").target = target
scn.camera = cam

scn.render.filepath = os.path.join(OUT, "previews", "og_ring.png")
bpy.ops.render.render(write_still=True)
print("rendered", scn.render.filepath, math.degrees(1.15))
