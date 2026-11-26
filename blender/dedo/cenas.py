"""Cenários do Shorts: as duas mãos (o puxão), o raio-x, a garrafa, o relógio, a cozinha, a mesa do médico e as duas
mãos na mesa. Cada função monta a cena e devolve os objetos que os planos animam."""
import math
import random

import bpy
from mathutils import Vector

import lib3d as L

# poses (flexão base, meio, ponta)
DEDOS_FECHADOS = {"medio": (62, 92, 40), "anelar": (66, 94, 40), "minimo": (70, 94, 40)}
PUNHO = {"indicador": (75, 95, 45), "medio": (80, 95, 45), "anelar": (85, 95, 45), "minimo": (85, 95, 45)}
RELAXADA = {"indicador": (6, 10, 6), "medio": (10, 16, 8), "anelar": (12, 18, 9), "minimo": (14, 20, 10)}


def materiais_mao():
    return L.pele(), L.principled("unha", (0.85, 0.6, 0.52), rugosidade=0.22, coat=0.7, sss=0.2)


def estudio(alvo=(0.6, -0.25, 0.0), forca=1.0):
    L.fundo_gradiente((0.015, 0.02, 0.035), (0.07, 0.09, 0.14), dist=10, tam=40)
    L.area("chave", (alvo[0] + 0.8, alvo[1] - 2.0, alvo[2] + 3.0), alvo, 260 * forca, 2.5, (1, 0.94, 0.86))
    L.area("contra", (alvo[0] - 1.6, alvo[1] + 2.6, alvo[2] + 1.6), alvo, 320 * forca, 2.0, (0.5, 0.72, 1.0))
    L.area("preench", (alvo[0] + 2.4, alvo[1] - 1.6, alvo[2] - 0.3), alvo, 70 * forca, 3.0, (1, 0.9, 0.85))


# ------------------------------------------------------------------ as duas mãos: A (direita) puxa o indicador de B (esquerda)
class Puxao:
    def __init__(self):
        pele, unha = materiais_mao()
        self.B = L.Mao("maoB", pele, lado=-1, mat_unha=unha)
        self.A = L.Mao("maoA", pele, lado=1, mat_unha=unha)
        self.A.pose(PUNHO, polegar=((-10, 40), 25, 15))
        self.A.raiz.rotation_euler = (0, 0, math.radians(-90))
        laco = [p for d in ("medio", "anelar") for p in self.A.juntas[d]]
        c = sum(laco, Vector()) / len(laco)
        self.furo = self.A.raiz.rotation_euler.to_matrix() @ c
        self.posiciona(0.0)

    def posiciona(self, puxa, f=None):
        """puxa (0 a ~0,05): o indicador de B sai da palma e o punho de A vai junto"""
        self.B.pose({"indicador": (0, 4, 3), **DEDOS_FECHADOS}, polegar=((-5, 30), 20, 10), puxa=puxa)
        pts = self.B.juntas["indicador"]
        alvo = pts[0] + (pts[1] - pts[0]) * 0.62
        self.A.raiz.location = alvo - self.furo
        if f is not None:
            self.B.chave_pose(f)
            self.A.raiz.keyframe_insert("location", frame=f)

    @property
    def junta(self):
        """a junta da base do indicador de B (onde estala), no mundo"""
        bx, by = L.DEDOS["indicador"]["base"]
        return Vector((bx, -by, 0.0))


# ------------------------------------------------------------------ raio-x
def ossos_mao(nome, mao, mat):
    """esqueleto da mão em metaballs (falanges com cabeças nas juntas e os metacarpos), seguindo as juntas da mão"""
    mb = bpy.data.metaballs.new(nome)
    mb.resolution = 0.02
    mb.render_resolution = 0.013
    mb.threshold = L.LIMIAR
    ob = L.ligar(bpy.data.objects.new(nome, mb), mao.raiz)
    mb.materials.append(mat)

    def cap(a, b, rho, rig=6.0):
        e = mb.elements.new()
        e.type = "CAPSULE"
        e.stiffness = rig
        a, b = Vector(a), Vector(b)
        e.co = (a + b) / 2
        e.radius = L.r_mb(rho, rig)
        e.size_x = max(0.001, (b - a).length / 2 - rho * 0.4)
        e.rotation = L._quat_dir(b - a)

    def bola(p, rho, rig=6.0):
        e = mb.elements.new()
        e.type = "BALL"
        e.stiffness = rig
        e.co = p
        e.radius = L.r_mb(rho, rig)

    Ls = mao.lado
    for dedo, pts in mao.juntas.items():
        if dedo == "polegar":
            continue
        wx, wy = L.PUNHO[dedo]
        base = Vector((L.DEDOS[dedo]["base"][0] - 0.03, L.DEDOS[dedo]["base"][1] * Ls, 0.0))
        cap((wx, wy * Ls, 0.0), base, 0.033)
        bola(base, 0.05)
        for i in range(3):
            a = pts[i] + (pts[i + 1] - pts[i]) * 0.12
            b = pts[i + 1] - (pts[i + 1] - pts[i]) * 0.12
            cap(a, b, (0.03, 0.027, 0.024)[i])
            bola(a, (0.042, 0.036, 0.032)[i])
            bola(b, (0.04, 0.034, 0.028)[i])
    pts = mao.juntas["polegar"]
    for i in range(3):
        a = pts[i] + (pts[i + 1] - pts[i]) * 0.1
        b = pts[i + 1] - (pts[i + 1] - pts[i]) * 0.1
        cap(a, b, 0.034)
        bola(a, 0.045)
        bola(b, 0.042)
    # ossos do punho (carpo): bolinhas
    rnd = random.Random(2)
    for i in range(8):
        bola((-0.5 + rnd.uniform(-0.06, 0.06), (i - 3.5) * 0.06 * Ls, rnd.uniform(-0.02, 0.02)), 0.045, 3.0)
    return ob


def raiox(mao, cor=(0.35, 0.75, 1.0)):
    """troca a pele da mão pela casca de raio-x e põe o esqueleto dentro"""
    casca = L.raio_x("raio_x_pele", cor, forca=2.2, centro=0.04)
    mao.mb.materials[0] = casca
    for u in mao.unhas.values():
        u.hide_render = True
    osso = L.emissivo("osso_rx", (0.85, 0.95, 1.0), 2.6)
    return ossos_mao(mao.nome + "_osso", mao, osso)


# ------------------------------------------------------------------ garrafa
PERFIL_GARRAFA = [(0.001, 0.0), (0.26, 0.01), (0.35, 0.06), (0.38, 0.16), (0.38, 1.05), (0.37, 1.22), (0.32, 1.45), (0.22, 1.66),
                  (0.15, 1.8), (0.13, 1.9), (0.155, 1.92), (0.155, 1.94), (0.13, 1.95), (0.13, 2.08)]


class Garrafa:
    def __init__(self, cor_liquido=(0.75, 0.32, 0.05), nivel=1.5, n_bolhas=140, semente=5):
        plast = L.principled("plastico", (0.85, 0.95, 0.9), rugosidade=0.05, alpha=0.18, coat=1.0, especular=0.8)
        liq = L.principled("refri", cor_liquido, rugosidade=0.05, alpha=0.82, emissao=cor_liquido, forca=0.15, coat=0.5)
        rotulo = L.principled("rotulo", (0.85, 0.12, 0.1), rugosidade=0.4)
        faixa = L.principled("faixa", (0.95, 0.95, 0.95), rugosidade=0.4)
        tampa_m = L.principled("tampa", (0.1, 0.35, 0.85), rugosidade=0.35)
        bolha_m = L.bolha("bolha_refri")
        self.corpo = L.revolucao("garrafa", PERFIL_GARRAFA, plast)
        interno = [(max(0.001, r - 0.02), z) for (r, z) in PERFIL_GARRAFA if z <= nivel] + [(0.001, nivel)]
        dentro = [(r, z) for (r, z) in interno]
        # líquido: mesmo perfil por dentro, até o nível
        pts = [(0.001, 0.02)] + [(r * 0.94, max(0.02, z)) for (r, z) in PERFIL_GARRAFA if 0.02 < z <= nivel]
        r_nivel = pts[-1][0]
        pts += [(r_nivel, nivel), (0.001, nivel)]
        self.liquido = L.revolucao("liquido_refri", pts, liq)
        L.revolucao("rotulo", [(0.385, 0.55), (0.385, 0.98)], rotulo)
        L.revolucao("faixa", [(0.387, 0.72), (0.387, 0.8)], faixa)
        # tampa com ranhuras
        self.tampa = L.ligar(bpy.data.objects.new("tampa_raiz", None))
        self.tampa.location = (0, 0, 1.97)
        t = L.cilindro("tampa", 0.16, 0.2, tampa_m, loc=(0, 0, 0.1))
        t.parent = self.tampa
        for i in range(36):
            a = 2 * math.pi * i / 36
            r = L.caixa(f"ranhura{i}", (0.012, 0.012, 0.085), tampa_m, loc=(0.162 * math.cos(a), 0.162 * math.sin(a), 0.1))
            r.rotation_euler = (0, 0, a)
            r.parent = self.tampa
        # bolhas: grudadas na parede (fechada) e as que sobem (depois de abrir)
        rnd = random.Random(semente)
        self.bolhas = []
        for i in range(n_bolhas):
            z0 = rnd.uniform(0.1, nivel - 0.15)
            ang = rnd.uniform(0, 2 * math.pi)
            raio_z = [r for (r, z) in PERFIL_GARRAFA if z >= z0][0] * 0.9
            rr = rnd.uniform(0.25, 0.95) * raio_z
            b = L.esfera(f"b{i}", rnd.uniform(0.008, 0.02), bolha_m, seg=10, aneis=6, loc=(rr * math.cos(ang), rr * math.sin(ang), z0))
            b["z0"], b["vel"], b["nivel"] = z0, rnd.uniform(0.6, 1.4), nivel
            self.bolhas.append(b)

    def anima_bolhas(self, f0, f1, inicio, velocidade=0.04):
        """a partir do quadro `inicio`, as bolhas sobem até a superfície (keyframes a cada 2 quadros)"""
        for b in self.bolhas:
            for f in range(f0, f1 + 1, 2):
                t = max(0, f - inicio)
                z = b["z0"] + t * velocidade * b["vel"]
                ciclo = b["nivel"] - 0.05 - 0.1
                if z > b["nivel"] - 0.05:
                    z = 0.1 + ((z - 0.1) % ciclo)
                b.location.z = z
                b.keyframe_insert("location", frame=f, index=2)


def luzes_garrafa():
    L.fundo_gradiente((0.02, 0.03, 0.06), (0.06, 0.12, 0.2), dist=8, tam=30)
    L.area("chave", (-1.5, -2.5, 2.5), (0, 0, 1.2), 300, 2.0, (1, 0.95, 0.9))
    L.area("contra1", (1.6, 1.6, 1.8), (0, 0, 1.2), 450, 1.0, (0.6, 0.85, 1.0))
    L.area("contra2", (-1.6, 1.6, 1.0), (0, 0, 1.0), 300, 1.0, (1.0, 0.7, 0.4))


# ------------------------------------------------------------------ relógio
class Relogio:
    def __init__(self):
        aro = L.principled("aro", (0.08, 0.08, 0.09), rugosidade=0.25, coat=0.8)
        face = L.principled("mostrador", (0.95, 0.94, 0.9), rugosidade=0.5)
        preto = L.principled("ponteiro", (0.04, 0.04, 0.045), rugosidade=0.4)
        verm = L.principled("segundos", (0.85, 0.1, 0.08), rugosidade=0.4)
        raiz = L.ligar(bpy.data.objects.new("relogio", None))
        raiz.rotation_euler = (math.radians(90), 0, 0)  # o mostrador olha para -Y (a câmera)
        self.raiz = raiz
        for nome, r, h, m, z in (("aro", 1.12, 0.16, aro, 0.0), ("face", 1.0, 0.17, face, 0.004)):
            ob = L.cilindro(nome, r, h, m, loc=(0, 0, z))
            ob.parent = raiz
        for i in range(60):
            a = 2 * math.pi * i / 60
            grande = i % 5 == 0
            ob = L.caixa(f"tique{i}", (0.022 if grande else 0.008, 0.11 if grande else 0.05, 0.01), preto,
                         loc=(0.86 * math.sin(a), 0.86 * math.cos(a), 0.09))
            ob.rotation_euler = (0, 0, -a)
            ob.parent = raiz
        for n in (12, 3, 6, 9):
            cu = bpy.data.curves.new(f"n{n}", "FONT")
            cu.body = str(n)
            cu.size = 0.22
            cu.align_x, cu.align_y = "CENTER", "CENTER"
            cu.extrude = 0.005
            ob = L.ligar(bpy.data.objects.new(f"n{n}", cu), raiz)
            a = 2 * math.pi * n / 12
            ob.location = (0.66 * math.sin(a), 0.66 * math.cos(a), 0.09)
            cu.materials.append(preto)
        self.ponteiros = {}
        for nome, comp, larg, m, z in (("hora", 0.5, 0.05, preto, 0.1), ("minuto", 0.78, 0.035, preto, 0.11), ("segundo", 0.85, 0.012, verm, 0.12)):
            piv = L.ligar(bpy.data.objects.new(f"piv_{nome}", None), raiz)
            piv.location = (0, 0, z)
            ob = L.caixa(f"pont_{nome}", (larg, comp, 0.012), m, loc=(0, comp / 2 - 0.08, 0))
            ob.parent = piv
            self.ponteiros[nome] = piv
        L.cilindro("centro", 0.05, 0.03, verm, loc=(0, 0, 0.13)).parent = raiz


# ------------------------------------------------------------------ cozinha (fundo desfocado) e a mão do dedo em riste
def cozinha():
    parede = L.principled("parede", (0.85, 0.78, 0.62), rugosidade=0.8)
    armario = L.principled("armario", (0.35, 0.55, 0.5), rugosidade=0.5)
    bancada = L.principled("bancada", (0.25, 0.22, 0.2), rugosidade=0.3)
    azulejo = L.principled("azulejo", (0.92, 0.92, 0.88), rugosidade=0.25)
    L.caixa("parede", (8, 0.1, 6), parede, loc=(0, 4.0, 0))
    for i in range(4):
        L.caixa(f"armario_alto{i}", (0.95, 0.5, 0.9), armario, loc=(-2.4 + i * 1.05, 3.6, 1.6), chanfro=0.03)
        L.caixa(f"armario_baixo{i}", (0.95, 0.6, 1.0), armario, loc=(-2.4 + i * 1.05, 3.5, -1.6), chanfro=0.03)
    L.caixa("bancada", (4.6, 0.7, 0.08), bancada, loc=(-0.8, 3.4, -1.05))
    for i in range(10):
        for j in range(3):
            L.caixa(f"az{i}_{j}", (0.38, 0.02, 0.28), azulejo, loc=(-2.8 + i * 0.42, 3.92, -0.7 + j * 0.32))
    janela = L.emissivo("janela", (1.0, 0.95, 0.85), 4.0)
    L.caixa("janela", (1.4, 0.05, 1.2), janela, loc=(2.6, 3.9, 0.6))
    L.area("sol", (2.6, 2.0, 1.4), (0, 0, 0), 600, 2.0, (1, 0.92, 0.8))
    L.area("chave", (-1.5, -2.5, 2.0), (0, 0, 0.3), 220, 2.5, (1, 0.95, 0.9))
    L.area("contra", (1.5, 1.5, 1.5), (0, 0, 0.3), 200, 1.5, (1.0, 0.85, 0.7))


def mao_dedo_em_riste(pele, unha):
    m = L.Mao("maoD", pele, lado=1, mat_unha=unha)
    m.pose({"indicador": (0, 2, 2), "medio": (85, 95, 50), "anelar": (88, 95, 50), "minimo": (90, 95, 50)}, polegar=((-5, 45), 35, 20))
    # dedos para cima (+Z), palma virada para a câmera (-Y)
    m.raiz.rotation_euler = (math.radians(90), math.radians(-90), 0)
    return m


# ------------------------------------------------------------------ a mesa do médico, de costas
def mesa_medico():
    madeira = L.principled("madeira", (0.22, 0.11, 0.05), rugosidade=0.45, coat=0.4)
    jaleco = L.principled("jaleco", (0.88, 0.9, 0.92), rugosidade=0.7, sss=0.1)
    pele_ = L.pele("pele_med", (0.6, 0.38, 0.28))
    cabelo = L.principled("cabelo", (0.55, 0.55, 0.56), rugosidade=0.75)
    papel = L.principled("papel", (0.92, 0.9, 0.82), rugosidade=0.8)
    estante = L.principled("estante", (0.12, 0.07, 0.04), rugosidade=0.6)
    L.caixa("tampo", (2.6, 1.2, 0.08), madeira, loc=(0, 0.6, 0.0), chanfro=0.02)
    for x in (-1.2, 1.2):
        L.caixa(f"gaveteiro{x}", (0.5, 1.1, 1.2), madeira, loc=(x, 0.6, -0.64), chanfro=0.02)
    for i, (x, y, r) in enumerate(((-0.3, 0.55, 8), (0.1, 0.62, -5), (0.4, 0.5, 14))):
        p = L.caixa(f"papel{i}", (0.42, 0.56, 0.005), papel, loc=(x, y, 0.045))
        p.rotation_euler = (0, 0, math.radians(r))
    # abajur
    lata = L.principled("abajur", (0.12, 0.3, 0.18), rugosidade=0.3, coat=0.8)
    L.cilindro("abajur_base", 0.14, 0.03, lata, loc=(0.95, 0.8, 0.055))
    haste = L.cilindro("abajur_haste", 0.015, 0.6, lata, loc=(0.95, 0.8, 0.35))
    cupula = L.revolucao("cupula", [(0.05, 0.0), (0.12, -0.04), (0.26, -0.2)], lata, loc=(0.85, 0.75, 0.7))
    cupula.rotation_euler = (math.radians(15), math.radians(-20), 0)
    L.esfera("lampada", 0.05, L.emissivo("lampada", (1.0, 0.8, 0.5), 25.0), loc=(0.82, 0.72, 0.6))
    L.ponto("luz_abajur", (0.78, 0.7, 0.55), 120, (1.0, 0.72, 0.42), 0.15)
    # estante ao fundo
    for i in range(4):
        L.caixa(f"prateleira{i}", (3.2, 0.35, 0.04), estante, loc=(0, 2.6, -0.4 + i * 0.6))
        rnd = random.Random(i)
        x = -1.5
        while x < 1.5:
            w = rnd.uniform(0.05, 0.12)
            h = rnd.uniform(0.3, 0.5)
            cor = rnd.choice([(0.35, 0.08, 0.06), (0.1, 0.2, 0.35), (0.25, 0.3, 0.1), (0.4, 0.3, 0.15)])
            L.caixa(f"livro{i}_{x:.2f}", (w, 0.28, h), L.principled(f"livro{cor}", cor, rugosidade=0.6), loc=(x, 2.6, -0.4 + i * 0.6 + h / 2 + 0.02))
            x += w + 0.01
    # o médico, de costas: cadeira, jaleco, cabeça com cabelo grisalho
    L.caixa("encosto", (0.62, 0.08, 0.7), madeira, loc=(0, -0.55, -0.05), chanfro=0.03)
    corpo = L.esfera("tronco", 1.0, jaleco, loc=(0, -0.25, 0.05))
    corpo.scale = (0.33, 0.2, 0.42)
    for lado in (-1, 1):
        b = L.esfera(f"ombro{lado}", 1.0, jaleco, loc=(0.27 * lado, -0.22, 0.32))
        b.scale = (0.14, 0.14, 0.14)
        braco = L.esfera(f"braco{lado}", 1.0, jaleco, loc=(0.34 * lado, -0.05, 0.18))
        braco.scale = (0.09, 0.3, 0.09)
        braco.rotation_euler = (math.radians(-35), 0, math.radians(-12 * lado))
    L.esfera("pescoco", 0.07, pele_, loc=(0, -0.24, 0.5))
    cab = L.esfera("cabeca", 0.15, pele_, loc=(0, -0.22, 0.66))
    cab.scale = (1.0, 1.05, 1.15)
    cabelo_ob = L.esfera("cabelo", 0.158, cabelo, loc=(0, -0.24, 0.69))
    cabelo_ob.scale = (1.02, 1.0, 1.05)
    for lado in (-1, 1):
        o = L.esfera(f"orelha{lado}", 0.035, pele_, loc=(0.15 * lado, -0.2, 0.65))
        o.scale = (0.5, 1.0, 1.2)
    L.fundo_gradiente((0.02, 0.025, 0.04), (0.05, 0.06, 0.09), dist=4, tam=20)
    L.area("janela", (-2.5, 1.5, 1.5), (0, 0.5, 0.2), 120, 2.0, (0.45, 0.6, 1.0))


# ------------------------------------------------------------------ as duas mãos na mesa
class DuasMaos:
    def __init__(self, raio_x=False):
        pele, unha = materiais_mao()
        self.E = L.Mao("maoE", pele, lado=-1, mat_unha=unha, antebraco=True)
        self.D = L.Mao("maoD2", pele, lado=1, mat_unha=unha, antebraco=True)
        self.E.pose(RELAXADA)
        self.D.pose(RELAXADA)
        # uma em cima da outra na tela vertical (a esquerda em cima), dedos para a direita
        self.E.raiz.location = (0.35, 0.6, 0.0)
        self.D.raiz.location = (0.35, -0.6, 0.0)
        self.raio_x = raio_x
        if raio_x:
            raiox(self.E)
            raiox(self.D)
        else:
            mesa = L.principled("mesa", (0.32, 0.18, 0.09), rugosidade=0.45, coat=0.3)
            L.caixa("mesa", (6, 6, 0.1), mesa, loc=(0, 0, -0.17))

    def estala(self, f, k):
        """k de 0 (aberta) a 1 (punho fechado): a mão esquerda fecha e abre (o jeito de estalar todos)"""
        fl = {d: tuple(a + (b - a) * k for a, b in zip(RELAXADA[d], PUNHO[d])) for d in RELAXADA}
        self.E.pose(fl)
        self.E.chave_pose(f)
