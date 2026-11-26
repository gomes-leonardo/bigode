"""uma cena do puxão, vários ângulos de câmera candidatos (um quadro cada, 40%)"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import lib3d as L
import cenas as C
from mathutils import Vector

L.cena_nova(fundo=(0.02, 0.025, 0.035), amostras=4, pct=40)
P = C.Puxao()
P.posiciona(0.02, 1)
C.estudio(alvo=(0.6, -0.27, 0.0))
j = P.junta
cands = {
    "p01": ((0.5, -2.4, 1.2), (0.7, -0.25, 0.0), 50),
    "p07": ((-1.2, -1.9, 1.1), (0.6, -0.27, 0.0), 50),
    "p16": ((0.6, -1.5, 2.2), (0.65, -0.27, 0.0), 50),
    "p17": ((1.7, -2.0, 0.9), (0.65, -0.27, 0.0), 55),
}
out = os.path.join(L.RAIZ, "out", "dedo", "cams2")
os.makedirs(out, exist_ok=True)
cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=60, fstop=3.2)
for n, (loc, alvo, lente) in cands.items():
    cam.location = loc
    mira.location = alvo
    cam.data.lens = lente
    L.quadro(os.path.join(out, n + ".png"), 1)
    print("ok", n)
