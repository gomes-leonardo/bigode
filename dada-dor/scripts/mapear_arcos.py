"""Rode depois de remover_fundo.py (ele edita os PNGs de limpo/).

Acha os dois arcos menta pintados no rosto de cada pose e grava src/cena01/arcos-poses.json.

Arco = componente menta pequeno (exclui a luz de contorno, que é longa, e o quadro da bicicleta)
dentro da caixa da cabeça. Também mede a cor da cabeça ao redor dos arcos.
"""
import json
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

CAIXAS = {  # caixa aproximada da cabeça (x0, y0, x1, y1) em px da imagem original 1376x768
    "dada-bike": (640, 90, 870, 340),
    "dada-queda": (310, 70, 560, 320),
    "dada-sentada": (510, 60, 820, 430),
}
saida = {}
for pose, (x0, y0, x1, y1) in CAIXAS.items():
    im = np.asarray(Image.open(f"assets/personagens/limpo/{pose}.png").convert("RGBA")).astype(int)
    r, g, b, a = (im[..., i] for i in range(4))
    menta = (g > 150) & (r < 160) & (g - r > 60) & (a > 200)
    caixa = np.zeros_like(menta)
    caixa[y0:y1, x0:x1] = True
    rot, n = ndimage.label(menta & caixa)
    arcos = []
    for k, sl in enumerate(ndimage.find_objects(rot), 1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        area = int((rot[sl] == k).sum())
        if 20 <= w <= 110 and 10 <= h <= 70 and area >= 80:
            arcos.append({"x": (sl[1].start + sl[1].stop) / 2, "y": (sl[0].start + sl[0].stop) / 2, "w": w, "h": h, "rotulo": k})
    arcos.sort(key=lambda c: c["x"])
    if len(arcos) != 2:
        sys.exit(f"{pose}: achei {len(arcos)} arcos, esperava 2: {arcos}")
    cx = (arcos[0]["x"] + arcos[1]["x"]) / 2
    cy = (arcos[0]["y"] + arcos[1]["y"]) / 2
    dx, dy = arcos[1]["x"] - arcos[0]["x"], arcos[1]["y"] - arcos[0]["y"]
    # cor da cabeça: mediana dos pixels escuros perto dos arcos
    yy, xx = int(cy), int(cx)
    viz = im[yy - 60:yy + 60, xx - 90:xx + 90]
    escuros = viz[(viz[..., 3] > 250) & (viz[..., :3].sum(axis=2) < 200)][:, :3]
    cor = "#%02X%02X%02X" % tuple(int(v) for v in np.median(escuros, axis=0))
    saida[pose] = {
        "centro": [round(cx, 1), round(cy, 1)],
        "distancia": round(float(np.hypot(dx, dy)), 1),
        "angulo": round(float(np.degrees(np.arctan2(dy, dx))), 1),
        "largura_arco": max(c["w"] for c in arcos),
        "altura_arco": max(c["h"] for c in arcos),
        "cor_cabeca": cor,
        "arcos": arcos,
    }
    print(pose, saida[pose]["centro"], "dist", saida[pose]["distancia"], "ang", saida[pose]["angulo"], "arco", saida[pose]["largura_arco"], "x", saida[pose]["altura_arco"], "cabeça", cor)
    # o brilho dos arcos pintados que vaza para fora da cabeça (pixels semitransparentes perto dos arcos)
    # some do PNG limpo; o que está dentro da cabeça fica coberto pela elipse na composição
    zona = ndimage.binary_dilation(np.isin(rot, [c["rotulo"] for c in arcos]), iterations=14)  # só os 2 arcos, não a luz de contorno
    vazado = zona & (a < 250)
    # pixels esverdeados do arco pintado que restam dentro da silhueta (arco encostado na borda da cabeça)
    cabeca_rgb = [int(cor[i:i + 2], 16) for i in (1, 3, 5)]
    tingido = zona & (a >= 250) & (g - r > 25)
    if vazado.any() or tingido.any():
        im2 = im.copy()
        im2[vazado, 3] = 0
        im2[tingido, :3] = cabeca_rgb
        Image.fromarray(im2.astype(np.uint8), "RGBA").save(f"assets/personagens/limpo/{pose}.png")
        print(f"  {pose}: {int(vazado.sum())} px de brilho fora da cabeça removidos, {int(tingido.sum())} px repintados")
import os
os.makedirs("src/cena01", exist_ok=True)
json.dump(saida, open("src/cena01/arcos-poses.json", "w"), indent=1)
