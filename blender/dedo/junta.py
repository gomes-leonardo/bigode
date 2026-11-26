"""A junta em corte (vista de dentro do dedo): dois ossos com o miolo esponjoso, cartilagem nas pontas, a cápsula
(membrana), o líquido sinovial dourado com gás dissolvido (bolinhas) e a cavidade (a bolha do estalo).

Estado animável (chamar Junta.estado(quadro, ...) para gravar keyframes):
  sep    afastamento do osso da direita (0 = encostado, 0,3 = puxado)
  bolha  tamanho da cavidade (0 a 1)
  gas    quanto do gás dissolvido aparece (0 a 1)
  brilho força do brilho do líquido
Coordenadas no plano XZ (a câmera olha de -Y); 1 unidade ~ 1 cm.
"""
import math
import random

import bpy
from mathutils import Vector

import lib3d as L

ESP = 0.6          # espessura das fatias
FRENTE = -ESP / 2  # y da face da frente dos ossos


def _espelha(pts):
    """completa um perfil desenhado só na metade de cima (z >= 0), descendo pelo outro lado"""
    return pts + [(x, -z) for (x, z) in reversed(pts) if abs(z) > 1e-6]


class Junta:
    def __init__(self, com_pele=True, com_tecido=True, raio_bolha=0.22, n_gas=90, semente=3):
        mat_osso = L.principled("osso", (0.84, 0.76, 0.6), rugosidade=0.45, sss=0.1, raio_sss=(1, 0.8, 0.6))
        mat_esp = L.osso_esponjoso()
        mat_cart = L.principled("cartilagem", (0.45, 0.7, 0.95), rugosidade=0.15, coat=1.0)
        mat_caps = L.principled("capsula", (0.62, 0.1, 0.16), rugosidade=0.28, coat=0.6)
        mat_liq = L.liquido()
        mat_bolha = L.bolha()
        mat_gas = L.emissivo("gas", (0.85, 0.95, 1.0), 2.5)  # opaco: as transparências custam caro no render
        self.mat_liq = mat_liq
        # --- osso da esquerda (falange proximal): cabeça redonda virada para a direita
        osso_e = _espelha([(-6.0, 0.48), (-2.4, 0.5), (-1.3, 0.62), (-0.62, 0.8), (-0.22, 0.6), (0.0, 0.0)])
        mio_e = _espelha([(-6.0, 0.36), (-2.4, 0.38), (-1.3, 0.48), (-0.66, 0.64), (-0.33, 0.46), (-0.15, 0.0)])
        cart_e = [(-0.62, 0.84), (-0.2, 0.66), (0.05, 0.0), (-0.2, -0.66), (-0.62, -0.84), (-0.64, -0.74), (-0.28, -0.56), (-0.07, 0.0), (-0.28, 0.56), (-0.64, 0.74)]
        self.esq = [
            L.perfil("osso_esq", osso_e, ESP, 0.03, mat_osso),
            L.perfil("miolo_esq", mio_e, ESP, 0.0, mat_esp, loc=(0, -0.036, 0)),
            L.perfil("cart_esq", cart_e, ESP + 0.02, 0.02, mat_cart, loc=(0, -0.03, 0)),
        ]
        # --- osso da direita (falange média): base em concha virada para a esquerda
        osso_d = _espelha([(6.0, 0.46), (2.4, 0.48), (1.3, 0.62), (0.7, 0.84), (0.36, 0.74), (0.46, 0.4), (0.53, 0.0)])
        mio_d = _espelha([(6.0, 0.34), (2.4, 0.36), (1.3, 0.48), (0.76, 0.66), (0.52, 0.56), (0.6, 0.3), (0.66, 0.0)])
        cart_d = [(0.33, 0.78), (0.43, 0.4), (0.49, 0.0), (0.43, -0.4), (0.33, -0.78), (0.45, -0.74), (0.55, -0.38), (0.61, 0.0), (0.55, 0.38), (0.45, 0.74)]
        self.dir_pai = L.ligar(bpy.data.objects.new("lado_direito", None))
        self.dir = [
            L.perfil("osso_dir", osso_d, ESP, 0.03, mat_osso),
            L.perfil("miolo_dir", mio_d, ESP, 0.0, mat_esp, loc=(0, -0.036, 0)),
            L.perfil("cart_dir", cart_d, ESP + 0.02, 0.02, mat_cart, loc=(0, -0.03, 0)),
        ]
        for ob in self.dir:
            ob.parent = self.dir_pai
        # --- líquido: atrás dos ossos (eles tapam o que não é o vão); estica com o afastamento
        liq = _espelha([(-0.9, 0.0), (-0.85, 0.72), (-0.4, 0.98), (0.25, 1.04), (0.9, 0.98), (1.35, 0.72), (1.4, 0.0)])
        liq = [p for p in liq]
        self.liq = L.perfil("liquido", liq, ESP * 0.7, 0.04, mat_liq, loc=(0, 0.1, 0))
        # --- cápsula (membrana) em cima e embaixo, ancorada no osso da esquerda; estica com o afastamento
        caps_cima = [(-1.5, 0.6), (-0.8, 0.98), (0.25, 1.12), (1.3, 0.98), (1.9, 0.56), (1.9, 0.44), (1.25, 0.86), (0.25, 0.99), (-0.75, 0.86), (-1.5, 0.48)]
        self.caps = []
        for nome, pts in (("caps_cima", caps_cima), ("caps_baixo", [(x, -z) for (x, z) in caps_cima])):
            ob = L.perfil(nome, pts, ESP + 0.08, 0.02, mat_caps, loc=(0, 0.02, 0))
            self.caps.append(ob)
        # --- tecido em volta e pele (o dedo cortado)
        if com_tecido:
            tec = L.principled("tecido", (0.2, 0.025, 0.035), rugosidade=0.55)
            L.perfil("tecido", [(-7, 1.32), (7, 1.32), (7, -1.32), (-7, -1.32)], 0.3, 0.0, tec, loc=(0, 0.55, 0), suave_cantos=False)
        if com_pele:
            pele = L.principled("pele_corte", (0.62, 0.36, 0.25), rugosidade=0.5)
            for sinal in (1, -1):
                pts = [(-7, 1.32), (-2, 1.34), (0.25, 1.46), (2.5, 1.34), (7, 1.32), (7, 1.62), (2.5, 1.66), (0.25, 1.8), (-2, 1.66), (-7, 1.62)]
                L.perfil(f"pele_{sinal}", [(x, z * sinal) for (x, z) in pts], ESP + 0.4, 0.04, pele, loc=(0, 0.1, 0))
        # --- gás dissolvido: bolinhas no vão, na profundidade da frente do líquido
        rnd = random.Random(semente)
        self.gas = []
        y_gas = 0.1 - ESP * 0.35 - 0.04 - 0.025  # logo na frente da face do líquido (que tem chanfro de 0,04)
        for i in range(n_gas):
            x = rnd.uniform(-0.25, 0.85)
            z = rnd.uniform(-0.95, 0.95)
            r = rnd.uniform(0.012, 0.028)
            ob = L.esfera(f"gas{i}", r, mat_gas, seg=12, aneis=6, loc=(x, y_gas, z))
            ob["base"] = (x, z)
            self.gas.append(ob)
        # --- a cavidade (bolha)
        self.raio_bolha = raio_bolha
        self.bolha = L.esfera("cavidade", raio_bolha, mat_bolha, loc=(0.27, y_gas + 0.02, 0.0))
        self.bolha.scale = (0.001, 0.001, 0.001)

    def estado(self, f, sep=None, bolha=None, gas=None, brilho=None, fluxo=None):
        if sep is not None:
            self.dir_pai.location.x = sep
            self.dir_pai.keyframe_insert("location", frame=f, index=0)
            k = (2.0 + sep * 1.2) / 2.0
            for ob in self.caps:
                ob.scale.x = k
                ob.location.x = -1.5 * (1 - k)  # mantém a ponta esquerda presa no osso da esquerda
                ob.keyframe_insert("scale", frame=f, index=0)
                ob.keyframe_insert("location", frame=f, index=0)
            self.liq.scale.x = 1 + sep / 1.6
            self.liq.keyframe_insert("scale", frame=f, index=0)
            self.bolha.location.x = 0.27 + sep / 2
            self.bolha.keyframe_insert("location", frame=f, index=0)
            for ob in self.gas:
                x, z = ob["base"]
                ob.location.x = x + sep * (x + 0.25) / 1.1
                ob.keyframe_insert("location", frame=f, index=0)
        if bolha is not None:
            s = max(0.001, bolha)
            self.bolha.scale = (s, s, s)
            self.bolha.keyframe_insert("scale", frame=f)
        if gas is not None:
            for ob in self.gas:
                x, z = ob["base"]
                # o gás perto do meio some primeiro (entra na bolha); o resto vai junto
                d = math.hypot(x - 0.27, z) / 1.0
                v = max(0.001, min(1.0, gas * 1.6 - d * 0.6 + 0.0)) if gas < 1 else 1.0
                ob.scale = (v, v, v)
                ob.keyframe_insert("scale", frame=f)
        if brilho is not None:
            b = self.mat_liq.node_tree.nodes["Principled BSDF"]
            fx = [n for n in self.mat_liq.node_tree.nodes if n.type == "MAP_RANGE"][0]
            fx.inputs["To Max"].default_value = brilho * 1.6
            fx.inputs["To Min"].default_value = brilho * 0.3
            fx.inputs["To Max"].keyframe_insert("default_value", frame=f)
            fx.inputs["To Min"].keyframe_insert("default_value", frame=f)
        if fluxo is not None:
            n = self.mat_liq.node_tree.nodes["fluxo"]
            n.inputs["W"].default_value = fluxo
            n.inputs["W"].keyframe_insert("default_value", frame=f)


def luzes_junta():
    L.area("chave", (-2.5, -4.0, 4.5), (0.2, 0, 0), 380, 3.0, (1.0, 0.92, 0.82))
    for luz in (L.area("contra", (3.0, 2.0, 3.0), (0.2, 0, 0), 700, 3.0, (1.0, 0.35, 0.3)),
                L.area("baixo", (1.0, -3.5, -3.5), (0.2, 0, 0), 120, 4.0, (0.45, 0.65, 1.0)),
                L.ponto("brilho_vao", (0.27, -0.7, 0.0), 10.0, (1.0, 0.75, 0.35), 0.3)):
        luz.data.use_shadow = False  # só a luz principal faz sombra (as outras pesam muito no render)
