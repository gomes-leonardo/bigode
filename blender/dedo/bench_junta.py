"""mede o tempo de um quadro da junta (720x1280) com e sem as transparências"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import plano as P
import lib3d as L

P.N = 85
P.p03()
s = bpy.context.scene
s.render.resolution_x, s.render.resolution_y = 720, 1280
s.eevee.taa_render_samples = 5
out = os.path.join(L.RAIZ, "out", "dedo", "bench")
os.makedirs(out, exist_ok=True)

def mede(nome):
    s.frame_set(20)
    s.render.filepath = os.path.join(out, nome + ".png")
    t = time.time(); bpy.ops.render.render(write_still=True); print(f"BENCH {nome}: {time.time() - t:.1f} s", flush=True)

mede("a_atual")
# gás opaco (emissivo) e líquido opaco
gas = L.emissivo("gas_opaco", (0.85, 0.95, 1.0), 2.5)
for ob in bpy.data.objects:
    if ob.name.startswith("gas"):
        ob.data.materials[0] = gas
liq = bpy.data.materials["sinovial"]
liq.node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = 1.0
liq.surface_render_method = "DITHERED"
mede("b_opacos")
s.eevee.taa_render_samples = 4
mede("c_4amostras")
for nome in ("contra", "baixo", "brilho_vao"):
    bpy.data.objects[nome].data.use_shadow = False
mede("d_sem_sombra_extra")
# pele das bordas do corte sem subsuperfície
pc = bpy.data.materials.get("pele_corte")
if pc:
    pc.node_tree.nodes["Principled BSDF"].inputs["Subsurface Weight"].default_value = 0.0
cart = bpy.data.materials.get("cartilagem")
if cart:
    cart.node_tree.nodes["Principled BSDF"].inputs["Subsurface Weight"].default_value = 0.0
mede("e_sem_sss")
for at, v in (("use_raytracing", False), ("shadow_step_count", 2), ("shadow_ray_count", 1)):
    if hasattr(s.eevee, at):
        setattr(s.eevee, at, v)
mede("f_eevee_leve")
s.render.resolution_x, s.render.resolution_y = 630, 1120
mede("g_630x1120")
