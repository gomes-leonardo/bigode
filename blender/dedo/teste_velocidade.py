"""Mede o tempo de render EEVEE de um quadro vertical 1080x1920 com pele (subsurface), metaballs e profundidade de campo."""
import math, os, sys, time
import bpy
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
s = bpy.context.scene
s.render.engine = "BLENDER_EEVEE"
s.render.resolution_x, s.render.resolution_y = 1080, 1920
s.render.fps = 30
s.eevee.taa_render_samples = int(sys.argv[-1]) if sys.argv[-1].isdigit() else 16
s.view_settings.view_transform = "AgX"
s.render.image_settings.file_format = "PNG"

# mundo escuro
w = bpy.data.worlds.new("mundo"); s.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.02, 0.02, 0.03, 1)

# pele
pele = bpy.data.materials.new("pele"); pele.use_nodes = True
b = pele.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0.80, 0.52, 0.40, 1)
b.inputs["Roughness"].default_value = 0.45
b.inputs["Subsurface Weight"].default_value = 0.3
b.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.2)
b.inputs["Subsurface Scale"].default_value = 0.05

# dedo em metaballs: três falanges e a mão
mb = bpy.data.metaballs.new("mao"); mb.resolution = 0.04; mb.render_resolution = 0.02; mb.threshold = 0.6
ob = bpy.data.objects.new("mao", mb); s.collection.objects.link(ob); mb.materials.append(pele)
def capsula(p, comp, raio, ang):
    e = mb.elements.new(); e.type = "CAPSULE"; e.co = p; e.radius = raio; e.size_x = comp / 2
    e.rotation = (math.cos(ang / 2), 0, math.sin(ang / 2) * 0, math.sin(ang / 2))
    return e
x = -1.2
for comp, raio in ((1.0, 0.36), (0.7, 0.33), (0.55, 0.3)):
    capsula((x + comp / 2, 0, 0), comp, raio, 0); x += comp + 0.05
e = mb.elements.new(); e.type = "ELLIPSOID"; e.co = (-2.3, 0, -0.1); e.radius = 1.0; e.size_x, e.size_y, e.size_z = 1.2, 1.4, 0.45

# luzes
for loc, en, cor in (((2, -3, 3), 600, (1, 0.95, 0.9)), ((-3, 2, 2), 400, (0.6, 0.8, 1.0))):
    ld = bpy.data.lights.new("l", "AREA"); ld.energy = en; ld.size = 2; ld.color = cor
    lo = bpy.data.objects.new("l", ld); s.collection.objects.link(lo); lo.location = loc
    lo.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()

cd = bpy.data.cameras.new("cam"); cd.lens = 50; cd.dof.use_dof = True; cd.dof.aperture_fstop = 2.0; cd.dof.focus_distance = 5
cam = bpy.data.objects.new("cam", cd); s.collection.objects.link(cam); cam.location = (0.3, -5, 0.8)
cam.rotation_euler = (Vector((-0.3, 0, 0)) - cam.location).to_track_quat("-Z", "Y").to_euler(); s.camera = cam

saida = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "out", "dedo", "teste_velocidade.png")
os.makedirs(os.path.dirname(saida), exist_ok=True)
for i in range(2):
    t0 = time.time(); s.frame_set(1 + i); s.render.filepath = saida
    bpy.ops.render.render(write_still=True)
    print(f"QUADRO {i}: {time.time() - t0:.1f} s")
