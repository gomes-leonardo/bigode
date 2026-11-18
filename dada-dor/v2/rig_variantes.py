"""Gera o elenco a partir do rig da Gotinha: recolore o macacão coral de cada parte (mantém o sombreado,
a cabeça índigo, as luvas, as botas e as faixas menta). Saída: assets/rig/<variante>/*.png + parts.json.
Uso: .venv/bin/python v2/rig_variantes.py
"""
import colorsys
import json
import os
import shutil

import numpy as np
from PIL import Image

BASE = "assets/rig/gotinha"
VARIANTES = {
    "lucia": "#FFC94A",      # Dona Lúcia, vestido amarelo
    "zefa": "#E9D7BC",       # Vó Zefa (o avental rosa é desenhado por cima)
    "tiao": "#3FAF63",       # Tião, camisa verde (as listras são desenhadas por cima)
    "caco": "#7A5BD6",       # Caco, moletom roxo
    "helena": "#F1EEF7",     # Dra. Helena, jaleco branco
    "mae_tiao": "#4FB3BF",   # mãe do Tião
    "vizinho": "#8C90B8",
    "turma1": "#5B8DEF",
    "turma2": "#E59A3C",
    "turma3": "#B07CF0",
    "turma4": "#E86A92",
}


def hex_rgb(h):
    return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))


def recolorir(arr, alvo):
    rgb = arr[..., :3].astype(np.float32) / 255
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    # coral: vermelho dominante, verde no meio, azul baixo, saturado (não pega menta, índigo nem contorno escuro)
    coral = (r >= g) & (g >= b * 0.9) & (r - b > 0.25) & (sat > 0.35) & (mx > 0.3) & (arr[..., 3] > 0)
    th, ts, tv = colorsys.rgb_to_hsv(*hex_rgb(alvo))
    v_ref = 1.0  # coral base #FF6B5E tem V = 1
    out = arr.copy().astype(np.float32)
    vs = mx[coral] / v_ref
    novo = np.array([colorsys.hsv_to_rgb(th, ts, min(1.0, tv * v)) for v in vs]) if vs.size else np.zeros((0, 3))
    out[coral, :3] = novo * 255
    return out.astype(np.uint8), int(coral.sum())


for nome, cor in VARIANTES.items():
    dst = f"assets/rig/{nome}"
    os.makedirs(dst, exist_ok=True)
    total = 0
    for f in os.listdir(BASE):
        if f.endswith(".png"):
            arr = np.asarray(Image.open(f"{BASE}/{f}").convert("RGBA"))
            novo, n = recolorir(arr, cor)
            total += n
            Image.fromarray(novo, "RGBA").save(f"{dst}/{f}")
    shutil.copy(f"{BASE}/parts.json", f"{dst}/parts.json")
    print(f"{nome:9s} {cor}  {total} px recoloridos")
