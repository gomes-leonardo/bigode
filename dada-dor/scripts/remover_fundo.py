"""Remove o fundo sólido das poses (chroma pela cor dominante dos cantos) -> assets/personagens/limpo/*.png.

1. A cor de fundo é a mediana dos 4 cantos.
2. Fundo = região ligada às bordas com cor próxima da do fundo (flood fill), mais as áreas
   fechadas grandes com essa cor (dentro das rodas da bicicleta).
3. Borda suave: numa faixa de alguns px em volta, o alfa vem da distância de cor até o fundo e
   a cor é "des-misturada" do fundo (sem halo branco/roxo no contorno).
Uso: .venv/bin/python scripts/remover_fundo.py assets/personagens/dada-bike.png [...]
"""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

TOL_DURO = 38.0   # distância de cor abaixo da qual é fundo com certeza
TOL_SUAVE = 95.0  # acima disto é personagem com certeza
FAIXA = 3         # px de borda suave
MIN_AREA_FECHADA = 150  # px: área fechada com cor de fundo maior que isso também é fundo

for caminho in sys.argv[1:]:
    rgb = np.asarray(Image.open(caminho).convert("RGB")).astype(np.float32)
    h, w, _ = rgb.shape
    cantos = np.array([rgb[2, 2], rgb[2, w - 3], rgb[h - 3, 2], rgb[h - 3, w - 3]])
    fundo = np.median(cantos, axis=0)
    dist = np.linalg.norm(rgb - fundo, axis=2)
    perto = dist < TOL_DURO
    rotulos, _ = ndimage.label(perto)
    bordas = np.unique(np.concatenate([rotulos[0], rotulos[-1], rotulos[:, 0], rotulos[:, -1]]))
    # também as áreas fechadas com a cor do fundo (miolo das rodas, triângulos do quadro), se forem grandes
    tamanhos = ndimage.sum(perto, rotulos, index=np.arange(rotulos.max() + 1))
    grandes = np.nonzero(tamanhos >= MIN_AREA_FECHADA)[0]
    mascara_fundo = np.isin(rotulos, np.union1d(bordas[bordas > 0], grandes[grandes > 0]))
    alfa = np.where(mascara_fundo, 0.0, 1.0)
    # faixa de transição em volta do fundo: alfa proporcional à distância de cor
    faixa = ndimage.binary_dilation(mascara_fundo, iterations=FAIXA) & ~mascara_fundo
    alfa[faixa] = np.clip((dist[faixa] - TOL_DURO) / (TOL_SUAVE - TOL_DURO), 0, 1)
    # des-mistura: c = (c_obs - (1 - a) * fundo) / a
    a = alfa[..., None]
    cor = np.where(a > 0.01, (rgb - (1 - a) * fundo) / np.maximum(a, 0.01), 0)
    cor = np.clip(cor, 0, 255)
    rgba = np.dstack([cor, alfa * 255]).astype(np.uint8)
    dst = os.path.join(os.path.dirname(caminho), "limpo", os.path.basename(caminho))
    Image.fromarray(rgba, "RGBA").save(dst)
    ys, xs = np.nonzero(alfa > 0.5)
    print(f"{dst}: fundo {fundo.astype(int).tolist()}, personagem em x {xs.min()}-{xs.max()}, y {ys.min()}-{ys.max()}")
