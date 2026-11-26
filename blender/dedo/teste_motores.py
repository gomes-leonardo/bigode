"""Compara motores e resoluções no mesmo quadro de teste (o dedo do teste_velocidade)."""
import os, sys, time
import bpy
sys.argv = sys.argv[:1] + ["16"]
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "teste_velocidade.py")).read().split("saida = ")[0])
s = bpy.context.scene
base = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "out", "dedo")
def mede(nome, motor, pct, amostras):
    s.render.engine = motor
    s.render.resolution_percentage = pct
    if motor == "BLENDER_EEVEE":
        s.eevee.taa_render_samples = amostras
    elif motor == "CYCLES":
        s.cycles.samples = amostras; s.cycles.use_denoising = True; s.cycles.device = "CPU"
        s.cycles.max_bounces = 4; s.cycles.use_adaptive_sampling = False
    s.render.filepath = os.path.join(base, f"motor_{nome}.png")
    bpy.ops.render.render(write_still=True)  # aquece
    t0 = time.time(); bpy.ops.render.render(write_still=True)
    print(f"MOTOR {nome}: {time.time() - t0:.1f} s")
mede("eevee_67_s8", "BLENDER_EEVEE", 67, 8)
mede("eevee_100_s4", "BLENDER_EEVEE", 100, 4)
mede("cycles_67_s8", "CYCLES", 67, 8)
mede("workbench_100", "BLENDER_WORKBENCH", 100, 1)
