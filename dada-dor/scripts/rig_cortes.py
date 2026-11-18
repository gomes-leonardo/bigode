"""Fase 1 do rig: acha o círculo da articulação (cotovelo/joelho) nas peças dobradas e propõe o corte.

O corte passa pelo centro do círculo, na direção da bissetriz do ângulo da articulação.
A parte de baixo (antebraço/canela) fica com o círculo inteiro: ao girar, ele cobre a junta (sem fresta).
Uso: .venv/bin/python scripts/rig_cortes.py  -> exportacao/rig/01_cortes.png + exportacao/rig/cortes.json
"""
import json

import cv2
import numpy as np
from PIL import Image, ImageDraw

OUT = "exportacao/rig"
rgba = np.asarray(Image.open(f"{OUT}/_sem_verde.png"))
rot = np.load(f"{OUT}/_rotulos.npy")
pecas = {p["id"]: p for p in json.load(open(f"{OUT}/pecas.json"))}

# peça -> (nome, ponta de cima ~, articulação ~, ponta de baixo ~)  em px da folha (estimativa visual,
# a articulação é refinada pelo círculo desenhado via Hough)
DOBRADAS = {
    5: ("arm_R", (189, 452), (200, 548), (308, 592)),
    3: ("arm_L", (896, 152), (911, 247), (1022, 290)),
    7: ("leg_R", (655, 462), (732, 524), (740, 640)),
    9: ("leg_L", (1110, 462), (1187, 524), (1195, 640)),
}


def circulo(cx, cy, rmin, rmax):
    """Refina o centro do círculo desenhado (contorno escuro) perto de (cx, cy)."""
    x0, y0 = int(cx - 70), int(cy - 70)
    crop = rgba[y0:y0 + 140, x0:x0 + 140]
    cinza = cv2.cvtColor(np.ascontiguousarray(crop[..., :3]), cv2.COLOR_RGB2GRAY)
    cinza = cv2.medianBlur(cinza, 3)
    cs = cv2.HoughCircles(cinza, cv2.HOUGH_GRADIENT, dp=1, minDist=8, param1=80, param2=14, minRadius=rmin, maxRadius=rmax)
    if cs is None:
        return (cx, cy, (rmin + rmax) / 2), False
    cs = sorted(cs[0], key=lambda c: (c[0] + x0 - cx) ** 2 + (c[1] + y0 - cy) ** 2)
    c = cs[0]
    return (float(c[0] + x0), float(c[1] + y0), float(c[2])), True


cortes = {}
painel = []
for pid, (nome, topo, junta, ponta) in DOBRADAS.items():
    perna = nome.startswith("leg")
    (cx, cy, r), achou = circulo(*junta, *(18, 30) if perna else (13, 24))
    u = np.array(topo, float) - (cx, cy)
    l = np.array(ponta, float) - (cx, cy)
    u /= np.linalg.norm(u)
    l /= np.linalg.norm(l)
    bis = u + l
    bis /= np.linalg.norm(bis)                   # aponta para "dentro" do ângulo
    linha = np.array([-bis[1], bis[0]])          # o corte é perpendicular à bissetriz... não:
    linha = bis                                   # o corte segue a bissetriz (separa os dois segmentos)
    n_corte = np.array([-linha[1], linha[0]])    # normal da linha de corte
    if np.dot(n_corte, u) < 0:
        n_corte = -n_corte                       # normal aponta para o segmento de cima
    cortes[pid] = {"nome": nome, "centro": [round(cx, 1), round(cy, 1)], "raio": round(r, 1), "hough": achou,
                   "normal": [round(float(n_corte[0]), 4), round(float(n_corte[1]), 4)], "topo": topo, "ponta": ponta}

    # prévia: peça com a linha de corte (amarelo) e o círculo (menta), e as duas metades separadas
    p = pecas[pid]
    pad = 30
    x0, y0, x1, y1 = p["x"] - pad, p["y"] - pad, p["x"] + p["w"] + pad, p["y"] + p["h"] + pad
    m = rot[y0:y1, x0:x1] == p["rotulo"]
    peca = rgba[y0:y1, x0:x1].copy()
    peca[~m] = 0
    yy, xx = np.mgrid[y0:y1, x0:x1]
    lado = (xx - cx) * n_corte[0] + (yy - cy) * n_corte[1]
    no_circulo = (xx - cx) ** 2 + (yy - cy) ** 2 <= (r + 2) ** 2
    cima = peca.copy(); cima[(lado < 0) | no_circulo] = 0         # parte de cima: sem o círculo
    baixo = peca.copy(); baixo[(lado >= 0) & ~no_circulo] = 0      # parte de baixo: com o círculo inteiro
    fundo = (40, 34, 70, 255)
    def tela(arr, linha_corte=False):
        im = Image.new("RGBA", (arr.shape[1], arr.shape[0]), fundo)
        im.alpha_composite(Image.fromarray(arr, "RGBA"))
        d = ImageDraw.Draw(im)
        if linha_corte:
            a = np.array([cx - x0, cy - y0]); t = linha * 120
            d.line([tuple(a - t), tuple(a + t)], fill=(255, 201, 74, 255), width=3)
            d.ellipse([cx - x0 - r, cy - y0 - r, cx - x0 + r, cy - y0 + r], outline=(63, 224, 176, 255), width=3)
            d.ellipse([cx - x0 - 4, cy - y0 - 4, cx - x0 + 4, cy - y0 + 4], fill=(63, 224, 176, 255))
        return im.resize((im.width * 2, im.height * 2), Image.NEAREST)
    linha_img = [tela(peca, True), tela(cima), tela(baixo)]
    w = sum(i.width for i in linha_img) + 40
    h = max(i.height for i in linha_img)
    faixa = Image.new("RGBA", (w, h + 40), (25, 20, 45, 255))
    x = 0
    for i in linha_img:
        faixa.paste(i, (x, 40)); x += i.width + 20
    ImageDraw.Draw(faixa).text((10, 8), f"peca {pid} -> {nome}: corte | parte de cima | parte de baixo (com o circulo inteiro)   hough={'ok' if achou else 'estimado'} r={r:.0f}", fill=(255, 255, 255, 255))
    painel.append(faixa)
W = max(f.width for f in painel); H = sum(f.height for f in painel) + 10 * len(painel)
folha = Image.new("RGB", (W, H), (25, 20, 45))
y = 0
for f in painel:
    folha.paste(f.convert("RGB"), (0, y)); y += f.height + 10
folha.save(f"{OUT}/01_cortes.png")
json.dump(cortes, open(f"{OUT}/cortes.json", "w"), indent=1)
for k, c in cortes.items():
    print(k, c["nome"], "centro", c["centro"], "r", c["raio"], "hough", c["hough"])
