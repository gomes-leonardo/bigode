"""Luz: só a de contorno (area light menta atrás e acima do personagem).

Com os materiais toon por emissão, a luz não "ilumina" de forma realista: ela só decide
onde aparece o segundo tom (a borda menta que separa a silhueta do fundo).
"""
import math

import bpy

from .paleta import PALETA, linear


def luz_de_contorno(alvo=(0, 0, 0), distancia=4.0, altura=3.0, lado=-1.6, potencia=900, tamanho=1.2):
    dados = bpy.data.lights.new("contorno", type="AREA")
    dados.energy = potencia
    dados.size = tamanho
    dados.color = linear(PALETA["menta"])[:3]
    luz = bpy.data.objects.new("contorno", dados)
    bpy.context.scene.collection.objects.link(luz)
    # atrás (+Y, longe da câmera), acima (+Z) e à esquerda (−X), como a borda da folha de referência
    luz.location = (alvo[0] + lado, alvo[1] + distancia, alvo[2] + altura)
    direcao = [alvo[i] - luz.location[i] for i in range(3)]
    luz.rotation_euler = _olhar_para(direcao)
    return luz


def _olhar_para(direcao):
    from mathutils import Vector
    return Vector(direcao).to_track_quat("-Z", "Y").to_euler()
