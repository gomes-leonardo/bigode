"""quadros de teste da junta em corte: inteira, ossos afastados com a bolha, close no vão"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import lib3d as L
from junta import Junta, luzes_junta

s = L.cena_nova(fundo=(0.03, 0.01, 0.012), amostras=6, pct=40)
J = Junta()
luzes_junta()
L.fundo_gradiente((0.05, 0.005, 0.01), (0.12, 0.02, 0.03), dist=8, tam=40)
cam, mira = L.camera((0.9, -5.2, 0.9), (0.25, 0, 0), lente=50, fstop=4.0)
J.estado(1, sep=0.0, bolha=0.0, gas=1.0, brilho=0.6, fluxo=0.0)
J.estado(2, sep=0.32, bolha=1.0, gas=0.0, brilho=1.0, fluxo=0.5)
J.estado(3, sep=0.32, bolha=1.0, gas=0.0, brilho=1.0, fluxo=0.5)
out = os.path.join(L.RAIZ, "out", "dedo")
L.quadro(os.path.join(out, "junta_1.png"), 1)
L.quadro(os.path.join(out, "junta_2.png"), 2)
cam.location = (0.6, -3.2, 0.5); cam.data.lens = 60
L.quadro(os.path.join(out, "junta_3.png"), 3)
