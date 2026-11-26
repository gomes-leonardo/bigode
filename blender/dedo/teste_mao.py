"""quadro de teste da mão (calibrar metaballs, pele e luz)"""
import math, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import lib3d as L

nome = sys.argv[-1] if len(sys.argv) > 1 and not sys.argv[-1].endswith(".py") else "teste_mao"
s = L.cena_nova(fundo=(0.02, 0.025, 0.035), amostras=6, pct=40)
pele = L.pele()
unha = L.principled("unha", (0.85, 0.6, 0.52), rugosidade=0.22, coat=0.7, sss=0.2)
m = L.Mao("maoB", pele, lado=-1, mat_unha=unha)
m.pose({"indicador": (4, 8, 5), "medio": (14, 24, 12), "anelar": (18, 30, 14), "minimo": (22, 34, 16)})
L.fundo_gradiente((0.02, 0.03, 0.05), (0.08, 0.1, 0.16), dist=12)
L.area("chave", (1.2, -2.0, 3.0), (0.2, 0, 0), 260, 2.5, (1, 0.95, 0.88))
L.area("contra", (-1.0, 2.5, 1.6), (0.2, 0, 0), 300, 2.0, (0.55, 0.75, 1.0))
L.area("preench", (2.5, -1.5, -0.2), (0.2, 0, 0), 70, 3.0, (1, 0.9, 0.85))
vistas = {"teste_mao": ((0.2, -2.6, 2.2), (0.15, 0.0, 0.0), 50), "teste_mao_lado": ((1.8, -1.4, 0.5), (0.5, 0.0, 0.0), 50)}
for n, (loc, alvo, lente) in vistas.items():
    for ob in [o for o in bpy.data.objects if o.name.startswith("cam") or o.name.startswith("mira")]:
        bpy.data.objects.remove(ob)
    L.camera(loc, alvo, lente=lente, fstop=5.6)
    t0 = time.time()
    L.quadro(os.path.join(L.RAIZ, "out", "dedo", n + ".png"), 1)
    print(f"TEMPO {n} {time.time()-t0:.1f}s")
