"""Fase 1 do rig: salva as partes da Gotinha e gera assets/rig/gotinha/parts.json + imagem de debug.

Partes de baixo (antebraço, canela) ficam com o círculo da articulação inteiro; lascas soltas
são descartadas (fica só o maior pedaço + o círculo). Pivôs:
- pelos círculos desenhados (Hough) onde existem: cotovelo, joelho, encaixes do tronco, ombro do braço direito;
- senão, o centro da extremidade de cima da peça (ombro do braço esquerdo, topo das coxas, base da cabeça).
`repouso` = ângulo (graus, 0 = apontando para baixo, positivo = sentido horário na tela) do vetor
pivô -> âncora do filho no desenho original. O Puppet gira cada parte por (rot - repouso),
então rot 0 = membro pendurado reto para baixo.
Uso: .venv/bin/python scripts/rig_salvar.py
"""
import json
import math
import os
import shutil

import cv2
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

OUT = "exportacao/rig"
DST = "assets/rig/gotinha"
PAD = 6
rgba = np.asarray(Image.open(f"{OUT}/_sem_verde.png"))
rot = np.load(f"{OUT}/_rotulos.npy")
pecas = {p["id"]: p for p in json.load(open(f"{OUT}/pecas.json"))}
cortes = {int(k): v for k, v in json.load(open(f"{OUT}/cortes.json")).items()}


def hough(cx, cy, rmin, rmax, janela=60):
    x0, y0 = int(cx - janela), int(cy - janela)
    crop = np.ascontiguousarray(rgba[y0:y0 + 2 * janela, x0:x0 + 2 * janela, :3])
    cinza = cv2.medianBlur(cv2.cvtColor(crop, cv2.COLOR_RGB2GRAY), 3)
    cs = cv2.HoughCircles(cinza, cv2.HOUGH_GRADIENT, dp=1, minDist=8, param1=80, param2=14, minRadius=rmin, maxRadius=rmax)
    if cs is None:
        return (float(cx), float(cy)), False
    c = min(cs[0], key=lambda c: (c[0] + x0 - cx) ** 2 + (c[1] + y0 - cy) ** 2)
    return (float(c[0] + x0), float(c[1] + y0)), True


def extremidade(mask, direcao, fatia=14):
    """Centro da ponta da peça na direção dada (ex.: (0,-1) = topo): média dos pixels da faixa extrema."""
    ys, xs = np.nonzero(mask)
    proj = xs * direcao[0] + ys * direcao[1]
    sel = proj >= proj.max() - fatia
    return (float(xs[sel].mean()), float(ys[sel].mean()))


def maior_mais(mascara, extra=None):
    rot2, n = ndimage.label(mascara)
    if n == 0:
        return mascara
    tam = ndimage.sum(mascara, rot2, range(1, n + 1))
    m = rot2 == (int(np.argmax(tam)) + 1)
    return m | extra if extra is not None else m


def salvar(nome, mask, pontos):
    """Recorta a máscara (com PAD), salva o PNG e converte os pontos da folha para px da peça."""
    ys, xs = np.nonzero(mask)
    x0, y0, x1, y1 = xs.min() - PAD, ys.min() - PAD, xs.max() + PAD + 1, ys.max() + PAD + 1
    img = rgba[y0:y1, x0:x1].copy()
    img[~mask[y0:y1, x0:x1]] = 0
    Image.fromarray(img, "RGBA").save(f"{DST}/{nome}.png")
    loc = {k: [round(v[0] - x0, 1), round(v[1] - y0, 1)] for k, v in pontos.items() if v is not None}
    return {"arquivo": f"{nome}.png", "largura": int(x1 - x0), "altura": int(y1 - y0), **loc, "_origem_folha": [int(x0), int(y0)]}


def angulo(de, ate):
    """0 = para baixo, positivo = horário na tela (y para baixo)."""
    return round(math.degrees(math.atan2(-(ate[0] - de[0]), ate[1] - de[1])), 1)


os.makedirs(f"{DST}/extras", exist_ok=True)
yy, xx = np.mgrid[0:rgba.shape[0], 0:rgba.shape[1]]
partes = {}
achados = {}

# cabeça: pivô = centro da base (encaixe no tronco); "rosto" = onde ficam os arcos
m = rot == pecas[0]["rotulo"]
base = extremidade(m, (0, 1))
ys, xs = np.nonzero(m)
rosto = (float(xs.mean()) + 0.08 * (xs.max() - xs.min()), float(ys.min() + 0.58 * (ys.max() - ys.min())))
partes["head"] = salvar("head", m, {"pivo": base, "ancora": None, "rosto": rosto})
partes["head"]["repouso"] = 180.0  # a cabeça "aponta" para cima a partir do pescoço

# tronco: encaixes desenhados (ombro e quadril da frente, à esquerda) e saliências de trás (à direita)
m = rot == pecas[1]["rotulo"]
ombro_f, a1 = hough(490, 167, 16, 30)
quadril_f, a2 = hough(506, 327, 22, 40)
achados.update({"torso.ombro_frente": a1, "torso.quadril_frente": a2})
ombro_t = (ombro_f[0] + 92, ombro_f[1] - 6)    # lado de trás: saliência à direita do tronco
quadril_t = (quadril_f[0] + 82, quadril_f[1] + 4)
pescoco = extremidade(m, (0, -1))
pescoco = (pescoco[0], pescoco[1] + 10)
ys, xs = np.nonzero(m)
centro = (float(xs.mean()), float(ys.mean()))
partes["torso"] = salvar("torso", m, {"pivo": centro, "pescoco": pescoco, "ombro_R": ombro_f, "ombro_L": ombro_t, "quadril_R": quadril_f, "quadril_L": quadril_t})

# membros cortados na articulação
for pid, nome_sup, nome_inf in ((5, "arm_upper_R", "arm_lower_R"), (3, "arm_upper_L", "arm_lower_L"), (7, "leg_upper_R", "leg_lower_R"), (9, "leg_upper_L", "leg_lower_L")):
    c = cortes[pid]
    m = rot == pecas[pid]["rotulo"]
    cx, cy = c["centro"]
    r = c["raio"]
    n = np.array(c["normal"])
    lado = (xx - cx) * n[0] + (yy - cy) * n[1]
    disco = ((xx - cx) ** 2 + (yy - cy) ** 2 <= (r + 2) ** 2) & m
    sup = maior_mais(m & (lado >= 0) & ~disco)
    inf = maior_mais(m & (lado < 0) & ~disco, extra=disco)  # sem lascas soltas + o círculo inteiro
    # pivô da parte de cima: círculo do ombro se houver (braço direito), senão a ponta de cima
    if nome_sup == "arm_upper_R":
        topo, achou = hough(*c["topo"], 14, 26)
        achados[nome_sup] = achou
    else:
        topo = extremidade(sup, -np.array([n[0], n[1]]) * -1 if False else (lambda v: v / np.linalg.norm(v))(np.array(c["topo"], float) - (cx, cy)))
    ponta = extremidade(inf, (lambda v: v / np.linalg.norm(v))(np.array(c["ponta"], float) - (cx, cy)))
    partes[nome_sup] = salvar(nome_sup, sup, {"pivo": topo, "ancora": (cx, cy)})
    partes[nome_sup]["repouso"] = angulo(topo, (cx, cy))
    partes[nome_inf] = salvar(nome_inf, inf, {"pivo": (cx, cy), "ancora": ponta})
    partes[nome_inf]["repouso"] = angulo((cx, cy), ponta)

for pid, nome in ((2, "braco_reto"), (4, "braco_dobrado_sem_mao"), (6, "perna_bumerangue_1"), (8, "perna_bumerangue_2")):
    m = rot == pecas[pid]["rotulo"]
    ys, xs = np.nonzero(m)
    img = rgba[ys.min() - PAD:ys.max() + PAD + 1, xs.min() - PAD:xs.max() + PAD + 1].copy()
    img[~m[ys.min() - PAD:ys.max() + PAD + 1, xs.min() - PAD:xs.max() + PAD + 1]] = 0
    Image.fromarray(img, "RGBA").save(f"{DST}/extras/{nome}.png")

hierarquia = {"torso": None, "head": ["torso", "pescoco"], "arm_upper_R": ["torso", "ombro_R"], "arm_upper_L": ["torso", "ombro_L"],
              "leg_upper_R": ["torso", "quadril_R"], "leg_upper_L": ["torso", "quadril_L"], "arm_lower_R": ["arm_upper_R", "ancora"],
              "arm_lower_L": ["arm_upper_L", "ancora"], "leg_lower_R": ["leg_upper_R", "ancora"], "leg_lower_L": ["leg_upper_L", "ancora"]}
for k, v in hierarquia.items():
    partes[k]["pai"] = v
json.dump({"pecas_do_desenho": "assets/rig/gotinha-partes.png", "partes": partes}, open(f"{DST}/parts.json", "w"), indent=1)
print("círculos detectados:", achados)
for k, p in partes.items():
    print(f'{k:12s} {p["largura"]:3d}x{p["altura"]:3d} pivo {p["pivo"]} repouso {p.get("repouso", "-")}')
