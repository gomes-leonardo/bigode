"""Monta a Gotinha em pose neutra a partir de parts.json (mesmas regras do Puppet) e marca os pivôs.

Convenção de pose (igual ao Puppet): rot em graus, positivo = "para frente" (ela olha para a direita).
Membros pendurados: rot 0 = reto para baixo. Filho herda a rotação do pai.
Uso: .venv/bin/python scripts/rig_debug.py -> exportacao/rig/02_montagem.png
"""
import json
import math

import numpy as np
from PIL import Image, ImageDraw

P = json.load(open("assets/rig/gotinha/parts.json"))["partes"]
DIR = "assets/rig/gotinha"
W, H = 900, 900
ORDEM = ["leg_upper_L", "leg_lower_L", "arm_upper_L", "arm_lower_L", "torso", "leg_upper_R", "leg_lower_R", "head", "arm_upper_R", "arm_lower_R"]
POSE = {"torso": {"x": 450, "y": 420, "rot": 0}, "head": 0, "arm_upper_R": 6, "arm_lower_R": 10, "arm_upper_L": -6, "arm_lower_L": 10,
        "leg_upper_R": 4, "leg_lower_R": 0, "leg_upper_L": -4, "leg_lower_L": 0}


def rot_local(nome, r):
    """Rotação de tela (graus, horário +) da parte em relação ao pai, como no Puppet."""
    p = P[nome]
    if nome == "torso":
        return r
    if nome == "head":
        return r  # cabeça: positivo inclina o topo para frente (horário)
    pai = p["pai"][0]
    rep_pai = P[pai].get("repouso", 0) if pai != "torso" else 0
    return -r - p["repouso"] + rep_pai


def mat(tx, ty, graus):
    a = math.radians(graus)
    return np.array([[math.cos(a), -math.sin(a), tx], [math.sin(a), math.cos(a), ty], [0, 0, 1]])


mundo = {}
def transforma(nome):
    if nome in mundo:
        return mundo[nome]
    p = P[nome]
    px, py = p["pivo"]
    r = POSE[nome]["rot"] if nome == "torso" else POSE[nome]
    if nome == "torso":
        M = mat(POSE["torso"]["x"], POSE["torso"]["y"], rot_local(nome, r)) @ mat(-px, -py, 0)
    else:
        pai, chave = p["pai"]
        ax, ay = P[pai][chave]
        Mp = transforma(pai)
        # a parte gira em torno do próprio pivô, e o pivô é levado até a âncora do pai
        M = Mp @ mat(ax, ay, 0) @ mat(0, 0, rot_local(nome, r)) @ mat(-px, -py, 0)
    mundo[nome] = M
    return M


tela = Image.new("RGBA", (W, H), (36, 28, 70, 255))
pivos = []
for nome in ORDEM:
    M = transforma(nome)
    img = Image.open(f"{DIR}/{P[nome]['arquivo']}")
    inv = np.linalg.inv(M)
    camada = img.transform((W, H), Image.AFFINE, data=tuple(inv[:2].ravel()), resample=Image.BICUBIC)
    tela.alpha_composite(camada)
    pivos.append((nome, M @ np.array([*P[nome]["pivo"], 1])))
d = ImageDraw.Draw(tela)
for nome, (x, y, _) in pivos:
    d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=(63, 224, 176, 255), outline=(10, 10, 20, 255), width=2)
    d.text((x + 10, y - 6), nome, fill=(63, 224, 176, 255))
# âncora dos arcos no rosto
Mh = transforma("head")
rx, ry, _ = Mh @ np.array([*P["head"]["rosto"], 1])
d.ellipse([rx - 5, ry - 5, rx + 5, ry + 5], outline=(255, 201, 74, 255), width=2)
d.text((rx + 8, ry - 6), "rosto (arcos)", fill=(255, 201, 74, 255))
tela.convert("RGB").save("exportacao/rig/02_montagem.png")
print("ok")
