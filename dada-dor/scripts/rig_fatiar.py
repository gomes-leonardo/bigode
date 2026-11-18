"""Fase 1 do rig: tira o verde chroma da folha de partes e detecta cada peça (componente conexo).

Uso: .venv/bin/python scripts/rig_fatiar.py analisar
Gera exportacao/rig/00_pecas.png (peças numeradas) e exportacao/rig/pecas.json (bbox de cada uma).
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

FOLHA = "assets/rig/gotinha-partes.png"
OUT = "exportacao/rig"
VERDE = np.array([0, 255, 0], dtype=np.float32)


def sem_verde():
    """Chroma key: 'verdice' = quanto o G passa de R e B. Alfa suave numa faixa de 1 px e despill."""
    rgb = np.asarray(Image.open(FOLHA).convert("RGB")).astype(np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    verdice = g - np.maximum(r, b)
    fundo = verdice > 90                                   # verde chapado
    alfa = np.clip((90 - verdice) / 60, 0, 1)             # transição
    alfa[fundo] = 0
    # a borda suave fica restrita a 1 px em volta do fundo
    borda = ndimage.binary_dilation(fundo, iterations=1) & ~fundo
    alfa = np.where(borda, alfa, np.where(fundo, 0, 1.0))
    # despill: tira o verde que vazou na borda (G não passa do maior entre R e B)
    g2 = np.where(borda, np.minimum(g, np.maximum(r, b)), g)
    rgba = np.dstack([r, g2, b, alfa * 255]).astype(np.uint8)
    return rgba


def componentes(rgba, area_min=400):
    rot, n = ndimage.label(rgba[..., 3] > 128)
    pecas = []
    for k, sl in enumerate(ndimage.find_objects(rot), 1):
        area = int((rot[sl] == k).sum())
        if area >= area_min:
            pecas.append({"rotulo": k, "x": sl[1].start, "y": sl[0].start, "w": sl[1].stop - sl[1].start, "h": sl[0].stop - sl[0].start, "area": area})
    # ordem de leitura: fileira (y) e depois x
    pecas.sort(key=lambda p: (p["y"] > 380, p["x"]))
    for i, p in enumerate(pecas):
        p["id"] = i
    return rot, pecas


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    rgba = sem_verde()
    rot, pecas = componentes(rgba)
    np.save(os.path.join(OUT, "_rotulos.npy"), rot)
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, "_sem_verde.png"))
    json.dump(pecas, open(os.path.join(OUT, "pecas.json"), "w"), indent=1)
    base = Image.new("RGBA", (rgba.shape[1], rgba.shape[0]), (40, 34, 70, 255))
    base.alpha_composite(Image.fromarray(rgba, "RGBA"))
    d = ImageDraw.Draw(base)
    fonte = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    for p in pecas:
        d.rectangle([p["x"], p["y"], p["x"] + p["w"], p["y"] + p["h"]], outline=(63, 224, 176, 255), width=2)
        d.text((p["x"] + 4, p["y"] - 32), str(p["id"]), fill=(255, 201, 74, 255), font=fonte)
    base.convert("RGB").save(os.path.join(OUT, "00_pecas.png"))
    for p in pecas:
        print(p)
