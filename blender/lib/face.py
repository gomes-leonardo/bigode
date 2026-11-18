"""Rosto: dois arcos de luz menta (curvas com bevel e emissão), filhos de um empty na frente da cabeça.

Presets de emoção = shape keys da curva; set_mood() insere keyframes com ease in/out e transição
mínima de 8 quadros (troca seca faz o rosto piscar). `none` = opacidade 0 (de costas, figurantes).
"""
import bpy

from .materials import emissao

# Pontos (x, z) do arco esquerdo, no espaço do empty do rosto: ponta externa, meio, ponta interna.
# O direito é o espelho. Neutral: quase reto, leve inclinação para fora (com uma curvinha, como na folha).
PRESETS = {
    "neutral": [(-0.17, -0.012), (-0.10, 0.018), (-0.03, 0.006)],
    "curious": [(-0.17, -0.012), (-0.10, 0.030), (-0.03, 0.036)],  # ponta interna sobe ~8°
    "worried": [(-0.17, -0.020), (-0.10, -0.010), (-0.03, 0.030)],  # internas sobem, curvatura invertida
    "calm": [(-0.15, -0.035), (-0.10, -0.012), (-0.05, -0.030)],  # mais baixo e mais curto
}
MIN_TRANSICAO = 8


def _curva(nome, pontos, pai, espelho):
    cd = bpy.data.curves.new(nome, "CURVE")
    cd.dimensions = "3D"
    cd.bevel_depth = 0.013
    cd.bevel_resolution = 4
    cd.use_fill_caps = True
    sp = cd.splines.new("BEZIER")
    sp.bezier_points.add(len(pontos) - 1)
    for bp, (x, z) in zip(sp.bezier_points, pontos):
        bp.co = (x * espelho, 0, z)
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    ob = bpy.data.objects.new(nome, cd)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = pai
    return ob


def criar_arcos(nome, cabeca, k=1.0):
    rosto = bpy.data.objects.new(f"{nome}_rosto", None)
    bpy.context.scene.collection.objects.link(rosto)
    rosto.parent = cabeca  # acompanha a rotação da cabeça
    rosto.location = (0, -0.47 * k, 0.03 * k)  # na frente da cabeça, altura das sobrancelhas
    rosto.scale = (k * 1.25,) * 3
    mat = emissao(f"{nome}_arcos", "menta", forca=1.15)  # forte demais estoura o menta para ciano claro
    arcos = []
    for lado, esp in (("esq", 1), ("dir", -1)):
        ob = _curva(f"{nome}_arco_{lado}", PRESETS["neutral"], rosto, esp)
        ob.data.materials.append(mat)
        ob.shape_key_add(name="Basis")
        for mood, pts in PRESETS.items():
            sk = ob.shape_key_add(name=mood)
            for i, (x, z) in enumerate(pts):
                sk.data[i].co = (x * esp, 0, z)
            sk.value = 0.0
        arcos.append(ob)
    return arcos
