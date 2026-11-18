"""Câmera 3D com profundidade de campo sempre ligada (foco num objeto)."""
import bpy


def criar(loc=(0, -4.5, 1.4), alvo=(0, 0, 1.3), lente=50, fstop=1.8, foco=None):
    from mathutils import Vector
    cd = bpy.data.cameras.new("camera")
    cd.lens = lente
    cd.dof.use_dof = True
    cd.dof.aperture_fstop = fstop
    cam = bpy.data.objects.new("camera", cd)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = loc
    cam.rotation_euler = (Vector(alvo) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    if foco is not None:
        cd.dof.focus_object = foco
    bpy.context.scene.camera = cam
    return cam
