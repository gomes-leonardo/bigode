"""Peças 3D do Shorts "por que seu dedo estala" (Blender 5.2, EEVEE): cena vertical, materiais (pele, unha, raio-x,
osso, cartilagem, membrana, líquido sinovial, bolha, garrafa), mão em metaballs com pose por articulação, perfis
extrudados (a junta em corte), sólidos de revolução (garrafa), câmera com profundidade de campo e luzes de estúdio.

Unidades: 1 = 10 cm na mão (a palma tem ~1 de comprimento); na junta em corte, 1 = ~1 cm (é um close de dentro).
"""
import math
import os

import bmesh
import bpy
from mathutils import Euler, Matrix, Quaternion, Vector

FPS = 24
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ------------------------------------------------------------------ cena
def cena_nova(fundo=(0.015, 0.017, 0.025), amostras=6, pct=100, fps=FPS):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "BLENDER_EEVEE"
    s.render.resolution_x, s.render.resolution_y = 1080, 1920
    s.render.resolution_percentage = pct
    s.render.fps = fps
    s.eevee.taa_render_samples = amostras
    s.view_settings.view_transform = "AgX"
    s.view_settings.look = "AgX - Medium High Contrast"
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGB"
    w = bpy.data.worlds.new("mundo")
    s.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (*fundo, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    return s


def ligar(ob, pai=None):
    bpy.context.scene.collection.objects.link(ob)
    if pai is not None:
        ob.parent = pai
    return ob


def chave(alvo, prop, quadro, valor, indice=-1):
    """keyframe com interpolação suave (bezier, padrão do Blender)"""
    setattr(alvo, prop, valor) if indice < 0 else getattr(alvo, prop).__setitem__(indice, valor)
    alvo.keyframe_insert(prop, frame=quadro, index=indice)


def suave(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------ materiais
def _mat(nome):
    m = bpy.data.materials.get(nome)
    if m:
        return m, False
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    return m, True


def principled(nome, cor, rugosidade=0.5, sss=0.0, raio_sss=(1, 0.4, 0.25), escala_sss=0.05, especular=0.5, emissao=None, forca=0.0, alpha=1.0, coat=0.0):
    m, novo = _mat(nome)
    if not novo:
        return m
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*cor, 1)
    b.inputs["Roughness"].default_value = rugosidade
    b.inputs["Subsurface Weight"].default_value = sss
    b.inputs["Subsurface Radius"].default_value = raio_sss
    b.inputs["Subsurface Scale"].default_value = escala_sss
    b.inputs["Specular IOR Level"].default_value = especular
    b.inputs["Coat Weight"].default_value = coat
    if emissao:
        b.inputs["Emission Color"].default_value = (*emissao, 1)
        b.inputs["Emission Strength"].default_value = forca
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
        m.surface_render_method = "BLENDED"
    return m


def pele(nome="pele", cor=(0.62, 0.36, 0.25)):
    """pele com subsuperfície e poros finos (relevo de ruído)"""
    m, novo = _mat(nome)
    if not novo:
        return m
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*cor, 1)
    b.inputs["Roughness"].default_value = 0.48
    b.inputs["Subsurface Weight"].default_value = 0.35
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.18)
    b.inputs["Subsurface Scale"].default_value = 0.04
    b.inputs["Specular IOR Level"].default_value = 0.45
    b.inputs["Sheen Weight"].default_value = 0.15
    ruido = nt.nodes.new("ShaderNodeTexNoise")
    ruido.inputs["Scale"].default_value = 180.0
    ruido.inputs["Detail"].default_value = 6.0
    relevo = nt.nodes.new("ShaderNodeBump")
    relevo.inputs["Strength"].default_value = 0.08
    relevo.inputs["Distance"].default_value = 0.002
    nt.links.new(ruido.outputs["Fac"], relevo.inputs["Height"])
    nt.links.new(relevo.outputs["Normal"], b.inputs["Normal"])
    # variação leve de cor (manchas suaves)
    manchas = nt.nodes.new("ShaderNodeTexNoise")
    manchas.inputs["Scale"].default_value = 6.0
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs["Factor"].default_value = 0.12
    mix.inputs["A"].default_value = (*cor, 1)
    mix.inputs["B"].default_value = (cor[0] * 1.08, cor[1] * 0.82, cor[2] * 0.8, 1)
    nt.links.new(manchas.outputs["Fac"], mix.inputs["Factor"])
    nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
    return m


def raio_x(nome="raio_x_pele", cor=(0.35, 0.75, 1.0), forca=2.5, centro=0.03):
    """casca de raio-x: brilha na borda (de lado para a câmera), quase transparente no meio"""
    m, novo = _mat(nome)
    if not novo:
        return m
    nt = m.node_tree
    nt.nodes.clear()
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    rampa = nt.nodes.new("ShaderNodeMapRange")
    rampa.inputs["From Min"].default_value = 0.0
    rampa.inputs["From Max"].default_value = 1.0
    rampa.inputs["To Min"].default_value = centro
    rampa.inputs["To Max"].default_value = 1.0
    emi = nt.nodes.new("ShaderNodeEmission")
    emi.inputs["Color"].default_value = (*cor, 1)
    emi.inputs["Strength"].default_value = forca
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(lw.outputs["Facing"], rampa.inputs["Value"])
    nt.links.new(rampa.outputs["Result"], mix.inputs["Fac"])
    nt.links.new(tr.outputs["BSDF"], mix.inputs[1])
    nt.links.new(emi.outputs["Emission"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    m.surface_render_method = "BLENDED"
    return m


def emissivo(nome, cor, forca=1.0):
    m, novo = _mat(nome)
    if not novo:
        return m
    nt = m.node_tree
    nt.nodes.clear()
    emi = nt.nodes.new("ShaderNodeEmission")
    emi.inputs["Color"].default_value = (*cor, 1)
    emi.inputs["Strength"].default_value = forca
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(emi.outputs["Emission"], out.inputs["Surface"])
    return m


def osso_esponjoso(nome="osso_esponjoso"):
    """miolo do osso cortado: bege com poros (voronoi)"""
    m, novo = _mat(nome)
    if not novo:
        return m
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.8
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 26.0
    vor.inputs["Randomness"].default_value = 0.9
    rampa = nt.nodes.new("ShaderNodeValToRGB")
    e = rampa.color_ramp.elements
    e[0].position, e[0].color = 0.18, (0.36, 0.14, 0.07, 1)   # poro (perto do centro da célula)
    e[1].position, e[1].color = 0.42, (0.9, 0.8, 0.58, 1)     # trabécula (osso)
    nt.links.new(vor.outputs["Distance"], rampa.inputs["Fac"])
    nt.links.new(rampa.outputs["Color"], b.inputs["Base Color"])
    relevo = nt.nodes.new("ShaderNodeBump")
    relevo.inputs["Strength"].default_value = 0.5
    nt.links.new(vor.outputs["Distance"], relevo.inputs["Height"])
    nt.links.new(relevo.outputs["Normal"], b.inputs["Normal"])
    return m


def liquido(nome="sinovial", cor=(1.0, 0.62, 0.12), forca=1.0, alpha=0.88):
    """líquido sinovial: dourado translúcido, brilho que corre (ruído 4D animado pelo W)"""
    m, novo = _mat(nome)
    if not novo:
        return m
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*cor, 1)
    b.inputs["Roughness"].default_value = 0.08
    b.inputs["Coat Weight"].default_value = 1.0
    b.inputs["Alpha"].default_value = alpha
    b.inputs["Emission Color"].default_value = (*cor, 1)
    ruido = nt.nodes.new("ShaderNodeTexNoise")
    ruido.noise_dimensions = "4D"
    ruido.inputs["Scale"].default_value = 2.5
    ruido.inputs["Detail"].default_value = 3.0
    faixa = nt.nodes.new("ShaderNodeMapRange")
    faixa.inputs["From Min"].default_value = 0.35
    faixa.inputs["From Max"].default_value = 0.75
    faixa.inputs["To Min"].default_value = forca * 0.3
    faixa.inputs["To Max"].default_value = forca * 1.6
    nt.links.new(ruido.outputs["Fac"], faixa.inputs["Value"])
    nt.links.new(faixa.outputs["Result"], b.inputs["Emission Strength"])
    ruido.name = "fluxo"
    m.surface_render_method = "BLENDED"
    return m


def bolha(nome="bolha"):
    """bolha de gás: transparente no meio, borda clara e reflexo (fresnel)"""
    m, novo = _mat(nome)
    if not novo:
        return m
    nt = m.node_tree
    nt.nodes.clear()
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.25
    gl = nt.nodes.new("ShaderNodeBsdfGlossy")
    gl.inputs["Roughness"].default_value = 0.02
    emi = nt.nodes.new("ShaderNodeEmission")
    emi.inputs["Color"].default_value = (0.85, 0.95, 1.0, 1)
    emi.inputs["Strength"].default_value = 2.2
    add = nt.nodes.new("ShaderNodeAddShader")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(gl.outputs["BSDF"], add.inputs[0])
    nt.links.new(emi.outputs["Emission"], add.inputs[1])
    nt.links.new(lw.outputs["Facing"], mix.inputs["Fac"])
    nt.links.new(tr.outputs["BSDF"], mix.inputs[1])
    nt.links.new(add.outputs["Shader"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    m.surface_render_method = "BLENDED"
    return m


# ------------------------------------------------------------------ geometria
def esfera(nome, raio, mat=None, seg=48, aneis=24, loc=(0, 0, 0)):
    me = bpy.data.meshes.new(nome)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=aneis, radius=raio)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(nome, me)
    if mat:
        me.materials.append(mat)
    ob.location = loc
    return ligar(ob)


def caixa(nome, tam, mat=None, loc=(0, 0, 0), chanfro=0.0):
    me = bpy.data.meshes.new(nome)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= tam[0]
        v.co.y *= tam[1]
        v.co.z *= tam[2]
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(nome, me)
    if mat:
        me.materials.append(mat)
    ob.location = loc
    ligar(ob)
    if chanfro > 0:
        mod = ob.modifiers.new("chanfro", "BEVEL")
        mod.width = chanfro
        mod.segments = 4
    return ob


def cilindro(nome, raio, altura, mat=None, loc=(0, 0, 0), seg=64):
    me = bpy.data.meshes.new(nome)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=raio, radius2=raio, depth=altura)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = abs(p.normal.z) < 0.5
    ob = bpy.data.objects.new(nome, me)
    if mat:
        me.materials.append(mat)
    ob.location = loc
    return ligar(ob)


def perfil(nome, pontos, espessura=0.3, chanfro=0.03, mat=None, loc=(0, 0, 0), fechado=True, suave_cantos=True):
    """forma 2D (lista de pontos no plano XZ, a câmera olha de -Y) extrudada em Y: a "fatia" de um corte"""
    cu = bpy.data.curves.new(nome, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = espessura / 2
    cu.bevel_depth = chanfro
    cu.bevel_resolution = 3
    cu.resolution_u = 24
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pontos) - 1)
    for bp, (x, z) in zip(sp.bezier_points, pontos):
        bp.co = (x, z, 0)
        bp.handle_left_type = bp.handle_right_type = "AUTO" if suave_cantos else "VECTOR"
    sp.use_cyclic_u = fechado
    ob = bpy.data.objects.new(nome, cu)
    ob.rotation_euler = (math.radians(90), 0, 0)  # plano XY da curva -> plano XZ do mundo
    ob.location = loc
    if mat:
        cu.materials.append(mat)
    return ligar(ob)


def revolucao(nome, perfil_rz, mat=None, loc=(0, 0, 0), seg=64):
    """sólido de revolução em torno de Z a partir de pares (raio, z)"""
    me = bpy.data.meshes.new(nome)
    bm = bmesh.new()
    aneis = []
    for r, z in perfil_rz:
        anel = [bm.verts.new((r * math.cos(2 * math.pi * i / seg), r * math.sin(2 * math.pi * i / seg), z)) for i in range(seg)]
        aneis.append(anel)
    for a, b in zip(aneis, aneis[1:]):
        for i in range(seg):
            bm.faces.new((a[i], a[(i + 1) % seg], b[(i + 1) % seg], b[i]))
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(nome, me)
    if mat:
        me.materials.append(mat)
    ob.location = loc
    return ligar(ob)


# ------------------------------------------------------------------ mão (metaballs)
# campo de cada elemento: f = rigidez * (1 - d²/r²)³; com limiar 0,6 a superfície fica em d = r * sqrt(1 - (0,6/rigidez)^(1/3))
LIMIAR = 0.6


def r_mb(rho, rigidez):
    """raio do metaball para a superfície ficar a `rho` do eixo"""
    return rho / math.sqrt(1 - (LIMIAR / rigidez) ** (1 / 3))


# dedos: articulação da base (x, y), comprimentos das falanges (proximal, média, distal), raio visível; unidades de 10 cm
DEDOS = {
    "indicador": dict(base=(0.48, 0.27), comp=(0.42, 0.25, 0.21), raio=0.083, abertura=5),
    "medio": dict(base=(0.52, 0.09), comp=(0.47, 0.29, 0.22), raio=0.086, abertura=1),
    "anelar": dict(base=(0.49, -0.09), comp=(0.44, 0.27, 0.21), raio=0.08, abertura=-4),
    "minimo": dict(base=(0.42, -0.25), comp=(0.34, 0.21, 0.19), raio=0.069, abertura=-10),
}
PUNHO = {"indicador": (-0.42, 0.17), "medio": (-0.43, 0.06), "anelar": (-0.42, -0.05), "minimo": (-0.40, -0.15)}


def _quat_dir(d):
    """quatérnio que leva o eixo X local para a direção d (as cápsulas do metaball ficam ao longo de X)"""
    return Vector((1, 0, 0)).rotation_difference(Vector(d).normalized())


def cadeia(origem, direcao_base, flexoes, comps, eixo_flexao):
    """articulações de um dedo: começa em origem, cada falange gira `flexao` graus em torno de eixo_flexao"""
    pts = [Vector(origem)]
    d = Vector(direcao_base).normalized()
    eixo = Vector(eixo_flexao).normalized()
    for ang, c in zip(flexoes, comps):
        d = Quaternion(eixo, math.radians(ang)) @ d
        pts.append(pts[-1] + d * c)
    return pts


class Mao:
    """mão direita com a palma para baixo (dorso em +Z), dedos para +X, polegar do lado +Y; lado=-1 espelha (esquerda).
    pose: dedo -> (flexão da base, do meio, da ponta) em graus (positivo fecha). puxa: afasta o `dedo_puxado` da palma
    ao longo dele (a junta da base abre). O objeto raiz (self.raiz) posiciona e gira a mão inteira."""

    def __init__(self, nome, mat_pele, lado=1, mat_unha=None, resolucao=0.01, antebraco=True):
        self.nome, self.lado, self.antebraco = nome, lado, antebraco
        self.mb = bpy.data.metaballs.new(nome)
        self.mb.resolution = resolucao * 2.5
        self.mb.render_resolution = resolucao
        self.mb.threshold = LIMIAR
        self.raiz = ligar(bpy.data.objects.new(nome + "_raiz", None))
        self.ob = ligar(bpy.data.objects.new(nome, self.mb), self.raiz)
        self.mb.materials.append(mat_pele)
        self.elementos = {}
        self.unhas = {}
        self.mat_unha = mat_unha
        self.juntas = {}

    def _el(self, chave_, tipo, rigidez):
        e = self.elementos.get(chave_)
        if e is None:
            e = self.mb.elements.new()
            e.type = tipo
            e.stiffness = rigidez
            self.elementos[chave_] = e
        return e

    def _cap(self, chave_, a, b, rho, rigidez=6.0):
        e = self._el(chave_, "CAPSULE", rigidez)
        a, b = Vector(a), Vector(b)
        e.co = (a + b) / 2
        e.radius = r_mb(rho, rigidez)
        e.size_x = max(0.001, (b - a).length / 2)
        e.rotation = _quat_dir(b - a)

    def _elip(self, chave_, p, rho, rigidez=2.0, rot=(0, 0, 0)):
        """elipsoide com semi-eixos visíveis rho=(rx, ry, rz)"""
        e = self._el(chave_, "ELLIPSOID", rigidez)
        m = max(rho)
        e.co = p
        e.radius = r_mb(m, rigidez)
        e.size_x, e.size_y, e.size_z = rho[0] / m, rho[1] / m, rho[2] / m
        e.rotation = Euler(rot).to_quaternion()

    def _bola(self, chave_, p, rho, rigidez=6.0):
        e = self._el(chave_, "BALL", rigidez)
        e.co = p
        e.radius = r_mb(rho, rigidez)

    def _unha(self, dedo, a, b, rho, cima):
        if self.mat_unha is None:
            return
        u = self.unhas.get(dedo)
        if u is None:
            u = esfera(f"{self.nome}_unha_{dedo}", 1.0, self.mat_unha, seg=32, aneis=16)
            u.parent = self.raiz
            self.unhas[dedo] = u
        a, b = Vector(a), Vector(b)
        d = (b - a).normalized()
        lado = d.cross(cima).normalized()
        cima = lado.cross(d).normalized()
        centro = a + (b - a) * 0.62 + cima * rho * 0.9
        m = Matrix((d, lado, cima)).transposed().to_4x4()
        u.matrix_parent_inverse = Matrix.Identity(4)
        u.matrix_basis = Matrix.Translation(centro) @ m @ Matrix.Diagonal((rho * 0.92, rho * 0.82, rho * 0.2, 1))

    def pose(self, flexoes=None, polegar=((10, 12), 10, 8), puxa=0.0, dedo_puxado="indicador"):
        flexoes = flexoes or {}
        L = self.lado
        cima = Vector((0, 0, 1))
        # palma: metacarpos que se fundem numa placa, punho, eminências do polegar e do mínimo
        for nome, (wx, wy) in PUNHO.items():
            bx, by = DEDOS[nome]["base"]
            self._cap(f"meta_{nome}", (wx, wy * L, 0.0), (bx - 0.02, by * L, 0.0), 0.088, 2.0)
        self._elip("punho", (-0.47, 0.0, -0.01), (0.12, 0.27, 0.11))
        self._elip("tenar", (-0.12, 0.29 * L, -0.04), (0.24, 0.12, 0.1), rot=(0, 0, 0.5 * L))
        self._elip("hipotenar", (-0.08, -0.26 * L, -0.03), (0.3, 0.08, 0.09))
        if self.antebraco:
            self._cap("antebraco", (-1.6, 0.0, -0.02), (-0.5, 0.0, -0.01), 0.21, 2.0)
        for nome, dd in DEDOS.items():
            bx, by = dd["base"]
            fl = flexoes.get(nome, (6, 10, 6))
            ang = math.radians(dd["abertura"])
            direcao = Vector((math.cos(ang), math.sin(ang) * L, 0))
            eixo = cima.cross(direcao)  # girar em torno deste eixo leva a ponta para baixo, para a palma (fecha)
            base = Vector((bx, by * L, 0.0))
            if nome == dedo_puxado and puxa:
                base = base + direcao * puxa
            pts = cadeia(base, direcao, fl, dd["comp"], eixo)
            rho = dd["raio"]
            self._bola(f"{nome}_no", Vector((bx, by * L, 0.02)), rho * 0.96, 3.0)  # nó do dedo (cabeça do metacarpo)
            for i in range(3):
                ri = rho * (1.0, 0.94, 0.88)[i]
                fim = pts[i + 1] - (pts[i + 1] - pts[i]).normalized() * (ri * 0.6 if i == 2 else 0)
                self._cap(f"{nome}_{i}", pts[i], fim, ri, 4.0)
            self.juntas[nome] = pts
            d = (pts[3] - pts[2]).normalized()
            cima_local = (Quaternion(eixo, math.radians(sum(fl))) @ cima)
            self._unha(nome, pts[2], pts[3], rho * 0.88, cima_local)
            if nome == dedo_puxado:
                self._cap(f"{nome}_ponte", Vector((bx, by * L, 0.0)), base + direcao * 0.001, rho * 0.97)
        # polegar: metacarpo inclinado para fora e para baixo, depois duas falanges
        a0 = Vector((-0.34, 0.16 * L, -0.05))
        abd, fl1 = polegar[0]
        d0 = Vector((math.cos(math.radians(38 + abd)), math.sin(math.radians(38 + abd)) * L, -0.25)).normalized()
        eixo_p = Vector((0, 0, 1)).cross(d0) * L
        pts = cadeia(a0, d0, (0, fl1, polegar[1], polegar[2])[:3], (0.36, 0.3, 0.25), eixo_p)
        for i, (rho, rig) in enumerate(((0.1, 2.0), (0.095, 4.0), (0.088, 4.0))):
            fim = pts[i + 1] - (pts[i + 1] - pts[i]).normalized() * (rho * 0.6 if i == 2 else 0)
            self._cap(f"polegar_{i}", pts[i], fim, rho, rig)
        self.juntas["polegar"] = pts
        self._unha("polegar", pts[2], pts[3], 0.08, Vector((-0.35 * L, 0.0, 1.0)) if L else cima)
        return self

    def chave_pose(self, quadro):
        """grava a pose atual dos elementos e das unhas como keyframes"""
        for e in self.mb.elements:
            for p in ("co", "radius", "size_x", "rotation"):
                e.keyframe_insert(p, frame=quadro)
        for u in self.unhas.values():
            u.keyframe_insert("location", frame=quadro)
            u.keyframe_insert("rotation_euler", frame=quadro)
            u.keyframe_insert("scale", frame=quadro)


# ------------------------------------------------------------------ luz e câmera
def area(nome, loc, alvo, energia, tam=2.0, cor=(1, 1, 1)):
    ld = bpy.data.lights.new(nome, "AREA")
    ld.energy = energia
    ld.size = tam
    ld.color = cor
    ob = ligar(bpy.data.objects.new(nome, ld))
    ob.location = loc
    ob.rotation_euler = (Vector(alvo) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return ob


def ponto(nome, loc, energia, cor=(1, 1, 1), raio=0.1):
    ld = bpy.data.lights.new(nome, "POINT")
    ld.energy = energia
    ld.color = cor
    ld.shadow_soft_size = raio
    ob = ligar(bpy.data.objects.new(nome, ld))
    ob.location = loc
    return ob


def camera(loc, alvo, lente=85, fstop=2.8, foco=None):
    cd = bpy.data.cameras.new("cam")
    cd.lens = lente
    cd.sensor_width = 36
    cd.dof.use_dof = fstop is not None
    if fstop:
        cd.dof.aperture_fstop = fstop
    ob = ligar(bpy.data.objects.new("cam", cd))
    ob.location = loc
    mira = ligar(bpy.data.objects.new("mira", None))
    mira.location = alvo
    tr = ob.constraints.new("TRACK_TO")
    tr.target = mira
    tr.track_axis = "TRACK_NEGATIVE_Z"
    tr.up_axis = "UP_Y"
    if foco is not None:
        cd.dof.focus_object = foco
    else:
        cd.dof.focus_object = mira
    bpy.context.scene.camera = ob
    return ob, mira


def fundo_gradiente(cor_a, cor_b, dist=30, tam=60, mat_nome="fundo"):
    """painel grande atrás da cena com degradê vertical (cor_a embaixo, cor_b em cima)"""
    m, novo = _mat(mat_nome)
    if novo:
        nt = m.node_tree
        nt.nodes.clear()
        tc = nt.nodes.new("ShaderNodeTexCoord")
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        rampa = nt.nodes.new("ShaderNodeValToRGB")
        rampa.color_ramp.elements[0].color = (*cor_a, 1)
        rampa.color_ramp.elements[1].color = (*cor_b, 1)
        emi = nt.nodes.new("ShaderNodeEmission")
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(tc.outputs["Generated"], sep.inputs[0])
        nt.links.new(sep.outputs["Z"], rampa.inputs["Fac"])
        nt.links.new(rampa.outputs["Color"], emi.inputs["Color"])
        nt.links.new(emi.outputs["Emission"], out.inputs["Surface"])
    me = bpy.data.meshes.new("fundo")
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=tam / 2)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("fundo", me)
    me.materials.append(m)
    ob.rotation_euler = (math.radians(90), 0, 0)
    ob.location = (0, dist, 0)
    return ligar(ob)


# ------------------------------------------------------------------ render
def render(saida_dir, ini, fim, prefixo="q"):
    s = bpy.context.scene
    s.frame_start, s.frame_end = ini, fim
    os.makedirs(saida_dir, exist_ok=True)
    s.render.filepath = os.path.join(saida_dir, prefixo)
    bpy.ops.render.render(animation=True)


def quadro(caminho, f):
    s = bpy.context.scene
    s.frame_set(f)
    s.render.filepath = caminho
    bpy.ops.render.render(write_still=True)
