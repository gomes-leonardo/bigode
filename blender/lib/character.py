"""Dadá e variantes com primitivas (sem modelagem manual, sem armature).

Cabeça: UV sphere deformada em gota invertida (estreita em cima, larga embaixo), nunca esfera perfeita.
Membros: cápsulas penduradas em empties pai/filho (a rotação do empty articula o membro).
"""
import math

import bmesh
import bpy

from . import face
from .materials import emissao, toon

# altura (m), cor do macacão, arcos
VARIANTES = {
    "dada": {"escala": 1.0, "roupa": "coral", "arcos": True},
    "dada_adulta": {"escala": 1.25, "roupa": "coral", "arcos": True},
    "mae": {"escala": 1.3, "roupa": "amarelo", "arcos": True},
    "medica": {"escala": 1.25, "roupa": "branco", "arcos": True},
    "figurante": {"escala": 1.15, "roupa": "indigo", "arcos": False},
    "bebe": {"escala": 0.6, "roupa": "coral", "arcos": True},
}


def _ligar(obj, pai=None):
    bpy.context.scene.collection.objects.link(obj)
    if pai is not None:
        obj.parent = pai
    return obj


def malha_gota(nome, largura=0.52, altura=0.62, segmentos=64, aneis=40):
    """UV sphere deformada: t=0 na base, t=1 no topo; a largura cai com t^1.7 (ponta arredondada em cima)."""
    me = bpy.data.meshes.new(nome)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segmentos, v_segments=aneis, radius=1.0)
    for v in bm.verts:
        t = (v.co.z + 1) / 2
        fator = 1.0 - 0.66 * t ** 1.7
        v.co.x *= largura * fator
        v.co.y *= largura * fator
        v.co.z *= altura * (0.88 if v.co.z < 0 else 1.0)  # base um pouco achatada
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return me


def malha_capsula(nome, raio, comprimento, segmentos=32, aneis=16):
    """Cápsula com o topo em z=0 e o corpo descendo (pivô no topo, para articular pelo empty)."""
    me = bpy.data.meshes.new(nome)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segmentos, v_segments=aneis, radius=raio)
    for v in bm.verts:
        v.co.z += -raio if v.co.z >= 0 else -(comprimento - raio)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return me


def _objeto(nome, malha, material, pai=None, loc=(0, 0, 0), escala=(1, 1, 1)):
    ob = bpy.data.objects.new(nome, malha)
    ob.data.materials.append(material)
    ob.location, ob.scale = loc, escala
    return _ligar(ob, pai)


def _empty(nome, pai, loc):
    e = bpy.data.objects.new(nome, None)
    e.empty_display_size = 0.05
    e.location = loc
    return _ligar(e, pai)


def build_character(variant="dada", nome=None, loc=(0, 0, 0)):
    cfg = VARIANTES[variant]
    nome = nome or variant
    roupa = toon(f"{nome}_roupa", cfg["roupa"])
    pele = toon(f"{nome}_indigo", "indigo")  # cabeça, mãos e botas: índigo escuro, nunca preto
    listra = emissao(f"{nome}_listra", "menta", forca=1.6)

    raiz = _empty(nome, None, loc)  # move o personagem inteiro
    raiz.scale = (cfg["escala"],) * 3
    bebe = variant == "bebe"

    # proporções da folha: cabeça grande, corpo pequeno (bebê: cabeça ainda maior)
    corpo = _empty(f"{nome}_corpo", raiz, (0, 0, 0.98))
    _objeto(f"{nome}_tronco", malha_capsula("tronco", 0.27, 0.62), roupa, corpo, (0, 0, 0.30), (1.0, 0.82, 1.0))
    _objeto(f"{nome}_listra", malha_capsula("listra", 0.028, 0.34), listra, corpo, (-0.258, -0.04, 0.2))  # rente à lateral do tronco, sem passar da curva de baixo

    def membro(lado, tipo, z, x):
        junta = _empty(f"{nome}_{tipo}_{lado}", corpo, (x, 0, z))
        comp, raio = (0.42, 0.11) if tipo == "perna" else (0.40, 0.085)
        _objeto(f"{nome}_{tipo}_{lado}_seg", malha_capsula(tipo, raio, comp), roupa, junta)
        ponta = _empty(f"{nome}_{tipo}_{lado}_ponta", junta, (0, 0, -comp + raio * 0.6))
        if tipo == "perna":
            _objeto(f"{nome}_bota_{lado}", bpy.data.meshes.get("bota") or _esfera("bota", 0.13), pele, ponta, (0, -0.05, -0.02), (1.0, 1.4, 0.62))
        else:
            _objeto(f"{nome}_mao_{lado}", bpy.data.meshes.get("mao") or _esfera("mao", 0.11), pele, ponta, (0, 0, -0.03), (1.0, 0.75, 1.05))
        return junta

    sign = {"esq": -1, "dir": 1}
    for lado, s in sign.items():
        membro(lado, "perna", -0.28, s * 0.12)
        b = membro(lado, "braco", 0.2, s * 0.31)
        b.rotation_euler = (0, -s * math.radians(24), 0)  # braços abertos para fora do tronco

    # cabeça sem pescoço: encaixa direto no tronco
    cab = _empty(f"{nome}_cabeca", corpo, (0, 0, 0.62 if not bebe else 0.75))
    k = 1.0 if not bebe else 1.45
    _objeto(f"{nome}_cabeca_malha", malha_gota("cabeca"), pele, cab, (0, 0, 0.0), (k, k, k))
    if cfg["arcos"]:
        face.criar_arcos(nome, cab, k)
    return raiz


def _esfera(nome, raio):
    me = bpy.data.meshes.new(nome)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=12, radius=raio)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    return me
