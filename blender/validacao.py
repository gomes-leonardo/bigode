"""Passo 1 do brief: frame de validação (e um 2º frame com a Dadá inteira).

Uso: .venv/bin/python validacao.py [cabeca|dada|ambos]
Saída: out/validacao/*.png (RGBA) + *_preview.png (composto sobre o fundo da paleta, só para avaliar).
"""
import math
import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import camera, character, face, lighting, render  # noqa: E402
from lib.materials import emissao, toon  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, "out", "validacao")


def limpar():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def cenario_em_profundidade():
    """Fundo, meio e frente em Y realmente distintos: o desfoque e o paralaxe vêm daí."""
    fundo = toon("cenario_fundo", "fundo2", contorno="fundo2")
    for i, (x, y, z, sx, sz) in enumerate([(-4.2, 9, 1.4, 1.3, 2.6), (-1.2, 11, 2.0, 1.6, 3.4), (2.4, 10, 1.6, 1.4, 2.8), (5.6, 12, 2.2, 1.8, 3.6)]):
        ob = bpy.data.objects.new(f"bloco{i}", character.malha_capsula("bloco", 1.0, 3.0))
        ob.data.materials.append(fundo)
        ob.location, ob.scale = (x, y, z + 2.6), (sx, 0.6, sz / 3)
        bpy.context.scene.collection.objects.link(ob)
    luzes = emissao("bokeh_menta", "menta", forca=3.0)
    for i, (x, y, z) in enumerate([(-2.8, 7.5, 2.8), (3.6, 8.5, 3.4), (1.4, 9.5, 0.9), (-5.0, 9.0, 0.6)]):
        ob = bpy.data.objects.new(f"luz{i}", character._esfera("luzinha", 0.12))
        ob.data.materials.append(luzes)
        ob.location = (x, y, z)
        bpy.context.scene.collection.objects.link(ob)
    frente = emissao("frente_coral", "coral", forca=1.2)
    ob = bpy.data.objects.new("frente", character._esfera("frente", 0.16))
    ob.data.materials.append(frente)
    ob.location = (-0.75, -3.3, 1.2)  # bem perto da câmera: desfoca na frente
    bpy.context.scene.collection.objects.link(ob)


def frame_cabeca():
    limpar()
    render.configurar(os.path.join(SAIDA, "01_cabeca.png"))
    cab = bpy.data.objects.new("cabeca", None)
    bpy.context.scene.collection.objects.link(cab)
    cab.location = (0, 0, 1.6)
    ob = bpy.data.objects.new("cabeca_malha", character.malha_gota("cabeca"))
    ob.data.materials.append(toon("indigo", "indigo"))
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = cab
    face.criar_arcos("dada", cab)
    cab.rotation_euler = (0, 0, math.radians(-14))  # leve 3/4: mostra que é volume, não disco
    lighting.luz_de_contorno(alvo=(0, 0, 1.6), distancia=2.6, altura=2.0, lado=-1.9, potencia=1400, tamanho=2.0)
    cenario_em_profundidade()
    camera.criar(loc=(0.45, -4.6, 1.72), alvo=(0, 0, 1.6), lente=60, fstop=1.6, foco=ob)
    render.render_quadro(os.path.join(SAIDA, "01_cabeca.png"))


def frame_dada():
    limpar()
    render.configurar(os.path.join(SAIDA, "02_dada.png"))
    d = character.build_character("dada")
    d.rotation_euler = (0, 0, math.radians(-16))
    lighting.luz_de_contorno(alvo=(0, 0, 1.2), distancia=2.6, altura=2.6, lado=-1.9, potencia=1800, tamanho=2.2)
    cenario_em_profundidade()
    foco = bpy.data.objects["dada_cabeca_malha"]
    camera.criar(loc=(0.5, -6.2, 1.3), alvo=(0, 0, 1.05), lente=50, fstop=1.8, foco=foco)
    render.render_quadro(os.path.join(SAIDA, "02_dada.png"))


def preview(nome):
    """Composição só para avaliar o PNG transparente: gradiente #1A1333 -> #241A4A por trás."""
    from PIL import Image
    png = Image.open(os.path.join(SAIDA, f"{nome}.png")).convert("RGBA")
    w, h = png.size
    grad = Image.new("RGBA", (w, h))
    for yy in range(h):
        t = yy / (h - 1)
        c = tuple(int(a + (b - a) * t) for a, b in zip((0x1A, 0x13, 0x33), (0x24, 0x1A, 0x4A)))
        grad.paste(c + (255,), (0, yy, w, yy + 1))
    Image.alpha_composite(grad, png).convert("RGB").save(os.path.join(SAIDA, f"{nome}_preview.png"))


if __name__ == "__main__":
    os.makedirs(SAIDA, exist_ok=True)
    qual = sys.argv[1] if len(sys.argv) > 1 else "ambos"
    if qual in ("cabeca", "ambos"):
        frame_cabeca()
        preview("01_cabeca")
    if qual in ("dada", "ambos"):
        frame_dada()
        preview("02_dada")
