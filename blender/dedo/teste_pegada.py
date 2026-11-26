"""duas mãos: a esquerda (B) com o indicador sendo puxado pelo punho da direita (A)"""
import math, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
import lib3d as L

s = L.cena_nova(fundo=(0.02, 0.025, 0.035), amostras=6, pct=40)
pele = L.pele()
unha = L.principled("unha", (0.85, 0.6, 0.52), rugosidade=0.22, coat=0.7, sss=0.2)
B = L.Mao("maoB", pele, lado=-1, mat_unha=unha)
B.pose({"indicador": (0, 4, 3), "medio": (62, 92, 40), "anelar": (66, 94, 40), "minimo": (70, 94, 40)}, polegar=((-5, 30), 20, 10))
A = L.Mao("maoA", pele, lado=1, mat_unha=unha)
A.pose({"indicador": (75, 95, 45), "medio": (80, 95, 45), "anelar": (85, 95, 45), "minimo": (85, 95, 45)}, polegar=((-10, 40), 25, 15))
A.raiz.rotation_euler = (0, 0, math.radians(-90))
import math as _m
pts = B.juntas["indicador"]
alvo = pts[0] + (pts[1] - pts[0]) * 0.62  # meio da falange proximal do indicador de B
# centro do furo do punho: média do laço base -> meio -> ponta dos dedos médio e anelar (no espaço local de A)
laco = [p for d in ("medio", "anelar") for p in A.juntas[d]]
c = sum(laco, Vector()) / len(laco)
c = Vector((c.x, c.y, c.z))
rot = A.raiz.rotation_euler.to_matrix()
A.raiz.location = alvo - rot @ c
print("FURO LOCAL", c)
print("ALVO", alvo, "RAIZ A", A.raiz.location)
L.fundo_gradiente((0.02, 0.03, 0.05), (0.08, 0.1, 0.16), dist=12)
L.area("chave", (1.2, -2.0, 3.0), (0.6, 0, 0), 260, 2.5, (1, 0.95, 0.88))
L.area("contra", (-1.0, 2.5, 1.6), (0.6, 0, 0), 300, 2.0, (0.55, 0.75, 1.0))
L.area("preench", (2.5, -1.5, -0.2), (0.6, 0, 0), 70, 3.0, (1, 0.9, 0.85))
for n, (loc, al, lente) in {"pegada_a": ((0.5, -2.4, 1.2), (0.7, -0.25, 0.0), 50), "pegada_b": ((0.25, -1.25, 0.35), (0.55, -0.27, 0.0), 60)}.items():
    for ob in [o for o in bpy.data.objects if o.name.startswith(("cam", "mira"))]:
        bpy.data.objects.remove(ob)
    L.camera(loc, al, lente=lente, fstop=5.6)
    L.quadro(os.path.join(L.RAIZ, "out", "dedo", n + ".png"), 1)
