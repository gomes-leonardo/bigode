"""Os 26 planos do Shorts "por que seu dedo estala" (Blender, 24 fps, 1080x1920).

uso: blender-python dedo/plano.py <numero> <quadros> <pasta> [teste|final] [amostras]
  teste: 3 quadros (começo, meio, fim) em 40% da resolução, para conferir
  final: todos os quadros em 100%, PNG numerado (q0001.png ...) na pasta
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import lib3d as L  # noqa: E402
import cenas as C  # noqa: E402
from junta import Junta, luzes_junta  # noqa: E402

N = 72  # quadros do plano (o main troca)
EXTRA = {}  # momentos sincronizados com a voz (render.json): bolha_u, solta_u


def mov_cam(cam, mira, a, b, f0=1, f1=None, lente=None):
    """câmera de a=(loc, alvo) para b=(loc, alvo) entre f0 e f1 (suave)"""
    f1 = f1 or N
    for f, (loc, alvo) in ((f0, a), (f1, b)):
        cam.location = loc
        cam.keyframe_insert("location", frame=f)
        mira.location = alvo
        mira.keyframe_insert("location", frame=f)
    if lente:
        for f, l in ((f0, lente[0]), (f1, lente[1])):
            cam.data.lens = l
            cam.data.keyframe_insert("lens", frame=f)


def q(u):
    """quadro a partir da fração do plano"""
    return 1 + round(u * (N - 1))


def cena_junta(**kw):
    L.cena_nova(fundo=(0.03, 0.01, 0.012))
    J = Junta(**kw)
    luzes_junta()
    L.fundo_gradiente((0.05, 0.005, 0.01), (0.12, 0.02, 0.03), dist=8, tam=40)
    return J


def cena_puxao():
    L.cena_nova(fundo=(0.02, 0.025, 0.035))
    P = C.Puxao()
    C.estudio(alvo=(0.6, -0.27, 0.0))
    return P


def anima_puxao(P, ini, fim, de=0.0, ate=0.045, tranco=False):
    passos = 8
    for i in range(passos + 1):
        u = i / passos
        k = L.suave(u) if not tranco else (u ** 3)
        f = round(ini + (fim - ini) * u)
        P.posiciona(de + (ate - de) * k, f)


# ------------------------------------------------------------------ 1. close na mão, o dedo sendo puxado (congela antes do som)
def p01():
    P = cena_puxao()
    anima_puxao(P, 1, q(0.85), 0.0, 0.035)
    P.posiciona(0.035, N)
    j = P.junta
    cam, mira = L.camera((0.0, 0, 0), (0, 0, 0), lente=70, fstop=3.2)
    mov_cam(cam, mira, ((0.5, -2.4, 1.2), (0.7, -0.25, 0.0)), ((0.55, -2.1, 1.05), (0.7, -0.25, 0.0)))


# ------------------------------------------------------------------ 2. a mesma mão em raio-x: os ossos da junta aparecem
def p02():
    L.cena_nova(fundo=(0.005, 0.01, 0.02))
    P = C.Puxao()
    P.posiciona(0.0, 1)
    C.raiox(P.B, (0.3, 0.7, 1.0))
    for ob in [P.A.ob] + list(P.A.unhas.values()):
        ob.hide_render = True
    bpy.data.materials["raio_x_pele"].node_tree.nodes["Emission"].inputs["Strength"].default_value = 1.3
    L.fundo_gradiente((0.0, 0.004, 0.012), (0.01, 0.03, 0.06), dist=10, tam=40)
    j = P.junta
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=50, fstop=5.6)
    mov_cam(cam, mira, ((j.x + 0.1, j.y - 0.9, 2.2), (j.x + 0.1, j.y, 0)), ((j.x + 0.1, j.y - 0.6, 1.5), (j.x + 0.05, j.y, 0)))


# ------------------------------------------------------------------ 3. corte da junta: o líquido brilha
def p03():
    J = cena_junta()
    J.estado(1, sep=0.0, bolha=0.0, gas=1.0, brilho=0.5, fluxo=0.0)
    J.estado(q(0.5), brilho=1.2, fluxo=0.4)
    J.estado(N, brilho=0.8, fluxo=0.8)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=45, fstop=5.6)
    mov_cam(cam, mira, ((1.4, -6.5, 1.4), (0.25, 0, 0)), ((0.9, -5.0, 0.8), (0.25, 0, 0)))


# ------------------------------------------------------------------ 4. macro do líquido escorrendo entre as cartilagens
def p04():
    J = cena_junta(com_pele=False)
    J.estado(1, sep=0.0, bolha=0.0, gas=1.0, brilho=1.0, fluxo=0.0)
    J.estado(N, fluxo=1.6)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=60, fstop=2.8)
    mov_cam(cam, mira, ((-0.3, -2.4, 1.0), (0.22, 0, 0.45)), ((0.7, -2.2, -0.2), (0.25, 0, -0.1)))


# ------------------------------------------------------------------ 5. zoom no líquido até ver as bolinhas de gás
def p05():
    J = cena_junta(com_pele=False)
    J.estado(1, sep=0.0, bolha=0.0, gas=1.0, brilho=0.9, fluxo=0.0)
    J.estado(N, fluxo=0.6)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=50, fstop=2.8)
    mov_cam(cam, mira, ((0.4, -3.6, 0.3), (0.25, 0, 0.0)), ((0.3, -1.05, 0.15), (0.28, 0, 0.12)), lente=(50, 70))


# ------------------------------------------------------------------ 6. garrafa de refrigerante fechada, macro
def p06():
    L.cena_nova(fundo=(0.01, 0.015, 0.03))
    G = C.Garrafa()
    C.luzes_garrafa()
    G.anima_bolhas(1, N, 10_000)  # fechada: as bolhas ficam paradas na parede
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=85, fstop=2.8)
    mov_cam(cam, mira, ((-0.9, -2.2, 1.4), (0, 0, 1.15)), ((-0.4, -2.0, 1.2), (0, 0, 1.0)))


# ------------------------------------------------------------------ 7. volta para a mão: começa a puxar
def p07():
    P = cena_puxao()
    P.posiciona(0.0, 1)
    anima_puxao(P, q(0.25), N, 0.0, 0.03)
    j = P.junta
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=60, fstop=3.2)
    mov_cam(cam, mira, ((-1.2, -1.9, 1.1), (0.6, -0.27, 0.0)), ((-1.0, -1.7, 1.0), (0.6, -0.27, 0.0)))


# ------------------------------------------------------------------ 8. os ossos se afastando, em câmera lenta
def p08():
    J = cena_junta()
    J.estado(1, sep=0.0, bolha=0.0, gas=1.0, brilho=0.9, fluxo=0.0)
    J.estado(N, sep=0.32, fluxo=0.5)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=50, fstop=4.0)
    mov_cam(cam, mira, ((0.7, -4.6, 0.7), (0.3, 0, 0)), ((0.6, -4.2, 0.6), (0.4, 0, 0)))


# ------------------------------------------------------------------ 9. a pressão despenca (o manômetro entra por cima, na montagem)
def p09():
    J = cena_junta()
    J.estado(1, sep=0.32, bolha=0.0, gas=1.0, brilho=0.9, fluxo=0.5)
    J.estado(N, brilho=0.45, fluxo=0.9)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=50, fstop=4.0)
    mov_cam(cam, mira, ((-0.2, -4.4, 0.4), (0.4, 0, 0)), ((0.1, -3.6, 0.3), (0.42, 0, 0)))


# ------------------------------------------------------------------ 10. a tampa da garrafa gira e solta
def p10():
    L.cena_nova(fundo=(0.01, 0.015, 0.03))
    G = C.Garrafa()
    C.luzes_garrafa()
    solta = q(EXTRA.get("solta_u", 0.7))
    for f, giro, sobe in ((1, 0, 0), (solta, -540, 0.02), (N, -620, 0.12)):
        G.tampa.rotation_euler.z = math.radians(giro)
        G.tampa.location.z = 1.97 + sobe
        G.tampa.keyframe_insert("rotation_euler", frame=f, index=2)
        G.tampa.keyframe_insert("location", frame=f, index=2)
    G.anima_bolhas(1, N, solta, 0.05)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=85, fstop=2.8)
    mov_cam(cam, mira, ((0.6, -1.6, 2.4), (0, 0, 1.95)), ((0.5, -1.4, 2.3), (0, 0, 1.98)))


# ------------------------------------------------------------------ 11. macro: o gás saindo da solução
def p11():
    L.cena_nova(fundo=(0.01, 0.015, 0.03))
    G = C.Garrafa(n_bolhas=260)
    C.luzes_garrafa()
    G.tampa.hide_render = True
    for ob in G.tampa.children:
        ob.hide_render = True
    G.anima_bolhas(1, N, 1, 0.06)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=90, fstop=2.2)
    mov_cam(cam, mira, ((0.25, -1.3, 1.15), (0, 0, 1.2)), ((0.2, -1.15, 1.3), (0, 0, 1.3)))


# ------------------------------------------------------------------ 12. a cavidade se abre no meio da junta (o plano principal)
def p12():
    J = cena_junta()
    fb = q(EXTRA.get("bolha_u", 0.32))
    J.estado(1, sep=0.32, bolha=0.0, gas=1.0, brilho=0.5, fluxo=0.0)
    J.estado(fb - 1, bolha=0.0, gas=1.0, brilho=0.5)
    J.estado(fb + 2, bolha=1.15, gas=0.4, brilho=1.8)
    J.estado(fb + 5, bolha=0.96, gas=0.0, brilho=1.2)
    J.estado(fb + 9, bolha=1.0, brilho=1.0)
    J.estado(N, fluxo=0.6)
    luz = bpy.data.objects["brilho_vao"].data
    for f, e in ((fb - 1, 10), (fb + 2, 400), (fb + 10, 30), (N, 20)):
        luz.energy = e
        luz.keyframe_insert("energy", frame=f)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=55, fstop=3.2)
    mov_cam(cam, mira, ((0.5, -3.4, 0.4), (0.43, 0, 0)), ((0.45, -2.9, 0.3), (0.43, 0, 0)))
    # tranco da câmera no estalo
    for f, dx in ((fb, 0), (fb + 1, 0.05), (fb + 2, -0.04), (fb + 3, 0.025), (fb + 5, 0)):
        mira.location.x = 0.43 + dx
        mira.keyframe_insert("location", frame=f, index=0)


# ------------------------------------------------------------------ 13. congela na bolha formada (legenda grande na montagem)
def p13():
    J = cena_junta(com_pele=False)
    J.estado(1, sep=0.32, bolha=1.0, gas=0.0, brilho=1.0, fluxo=0.6)
    J.estado(N, fluxo=0.75)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=70, fstop=2.8)
    mov_cam(cam, mira, ((0.43, -2.4, 0.15), (0.43, 0, 0.0)), ((0.43, -2.15, 0.12), (0.43, 0, 0.0)))


# ------------------------------------------------------------------ 14. os três falsos culpados (rótulos riscados na montagem)
def p14():
    J = cena_junta()
    J.estado(1, sep=0.32, bolha=1.0, gas=0.0, brilho=1.0, fluxo=0.6)
    J.estado(N, fluxo=0.9)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=40, fstop=5.6)
    mov_cam(cam, mira, ((0.2, -7.2, 0.6), (0.35, 0, 0)), ((0.3, -6.8, 0.5), (0.35, 0, 0)))


# ------------------------------------------------------------------ 15. de volta à bolha, girando devagar
def p15():
    J = cena_junta(com_pele=False)
    J.estado(1, sep=0.32, bolha=1.0, gas=0.0, brilho=1.0, fluxo=0.9)
    J.estado(N, fluxo=1.3)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=60, fstop=2.8)
    c = Vector((0.43, 0, 0))
    passos = 6
    for i in range(passos + 1):
        u = i / passos
        a = math.radians(-28 + 56 * u)
        f = round(1 + (N - 1) * u)
        cam.location = c + Vector((2.4 * math.sin(a), -2.4 * math.cos(a), 0.35 - 0.25 * u))
        cam.keyframe_insert("location", frame=f)
    mira.location = c


# ------------------------------------------------------------------ 16 e 17. tenta estalar de novo: nada
def p16():
    P = cena_puxao()
    P.posiciona(0.0, 1)
    anima_puxao(P, q(0.15), q(0.6), 0.0, 0.012)
    anima_puxao(P, q(0.6), N, 0.012, 0.004)
    j = P.junta
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=55, fstop=4.0)
    mov_cam(cam, mira, ((0.6, -1.5, 2.2), (0.65, -0.27, 0.0)), ((0.6, -1.35, 2.0), (0.65, -0.27, 0.0)))


def p17():
    P = cena_puxao()
    P.posiciona(0.0, 1)
    anima_puxao(P, q(0.1), q(0.35), 0.0, 0.016, tranco=True)
    anima_puxao(P, q(0.35), q(0.55), 0.016, 0.003)
    anima_puxao(P, q(0.6), q(0.8), 0.003, 0.016, tranco=True)
    anima_puxao(P, q(0.8), N, 0.016, 0.004)
    j = P.junta
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=85, fstop=2.8)
    mov_cam(cam, mira, ((1.7, -2.0, 0.9), (0.65, -0.27, 0.0)), ((1.5, -1.8, 0.85), (0.65, -0.27, 0.0)))


# ------------------------------------------------------------------ 18. relógio marcando vinte minutos, acelerado
def p18():
    L.cena_nova(fundo=(0.02, 0.02, 0.03))
    R = C.Relogio()
    L.fundo_gradiente((0.03, 0.03, 0.05), (0.1, 0.1, 0.14), dist=5, tam=20)
    L.area("chave", (-1.5, -3.0, 2.5), (0, 0, 0), 500, 3.0, (1, 0.95, 0.9))
    L.area("contra", (2.0, 1.0, 2.0), (0, 0, 0), 300, 2.0, (0.6, 0.8, 1.0))
    for nome, giro in (("minuto", -120), ("hora", -10), ("segundo", -360 * 20)):
        p = R.ponteiros[nome]
        for f, k in ((1, 0.0), (N, 1.0)):
            p.rotation_euler.z = math.radians(giro * k)
            p.keyframe_insert("rotation_euler", frame=f, index=2)
        for fc in (p.animation_data.action.fcurves if p.animation_data and p.animation_data.action and hasattr(p.animation_data.action, "fcurves") else []):
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=50, fstop=4.0)
    mov_cam(cam, mira, ((0.3, -4.4, 0.2), (0, 0, 0)), ((0.15, -3.7, 0.1), (0, 0, 0)))


# ------------------------------------------------------------------ 19. o gás se dissolvendo de volta (time-lapse)
def p19():
    J = cena_junta()
    J.estado(1, sep=0.32, bolha=1.0, gas=0.0, brilho=1.0, fluxo=0.0)
    J.estado(N, sep=0.0, bolha=0.0, gas=1.0, brilho=0.7, fluxo=2.5)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=55, fstop=3.2)
    mov_cam(cam, mira, ((0.5, -3.6, 0.5), (0.4, 0, 0)), ((0.45, -3.3, 0.4), (0.3, 0, 0)))


# ------------------------------------------------------------------ 20. a junta recarregando (a barra entra na montagem)
def p20():
    J = cena_junta()
    J.estado(1, sep=0.0, bolha=0.0, gas=0.4, brilho=0.3, fluxo=0.0)
    J.estado(N, gas=1.0, brilho=1.4, fluxo=1.0)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=45, fstop=5.6)
    mov_cam(cam, mira, ((-0.6, -5.4, 1.0), (0.25, 0, 0)), ((-0.3, -5.0, 0.8), (0.25, 0, 0)))


# ------------------------------------------------------------------ 21. cozinha: alguém falando e apontando o dedo
def p21():
    L.cena_nova(fundo=(0.3, 0.28, 0.25))
    C.cozinha()
    pele, unha = C.materiais_mao()
    M = C.mao_dedo_em_riste(pele, unha)
    base = M.raiz.rotation_euler.copy()
    for i in range(9):
        f = round(1 + (N - 1) * i / 8)
        M.raiz.rotation_euler = (base.x, base.y, base.z + math.radians(14 * (1 if i % 2 else -1) if 0 < i < 8 else 0))
        M.raiz.keyframe_insert("rotation_euler", frame=f)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=55, fstop=2.0)
    mov_cam(cam, mira, ((0.15, -2.6, 0.65), (0.0, 0, 0.55)), ((0.1, -2.3, 0.6), (0.0, 0, 0.55)))


# ------------------------------------------------------------------ 22. o médico, de costas, numa escrivaninha antiga
def p22():
    L.cena_nova(fundo=(0.01, 0.012, 0.02))
    C.mesa_medico()
    L.area("costas", (0.6, -3.2, 1.6), (0, -0.25, 0.4), 180, 3.0, (0.85, 0.9, 1.0))
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=40, fstop=4.0)
    mov_cam(cam, mira, ((0.25, -2.6, 0.9), (0, 0.2, 0.45)), ((0.2, -2.1, 0.85), (0, 0.2, 0.45)))
    for f, z in ((1, 0.0), (q(0.5), math.radians(4)), (N, 0.0)):
        cab = bpy.data.objects["cabeca"]
        cab.rotation_euler.y = z
        cab.keyframe_insert("rotation_euler", frame=f, index=1)


# ------------------------------------------------------------------ 23 e 24. as duas mãos: a esquerda estala, a direita parada
def cena_duas(raio_x=False):
    L.cena_nova(fundo=(0.01, 0.012, 0.02))
    D = C.DuasMaos(raio_x=raio_x)
    if raio_x:
        L.fundo_gradiente((0.0, 0.004, 0.012), (0.01, 0.03, 0.06), dist=10, tam=40)
    else:
        L.fundo_gradiente((0.02, 0.025, 0.04), (0.06, 0.07, 0.1), dist=10, tam=40)
    return D


def p23():
    D = cena_duas()
    C.estudio(alvo=(0.2, 0, 0))
    for i, k in enumerate((0, 0, 1, 1, 0, 0, 1, 1, 0)):
        D.estala(round(1 + (N - 1) * i / 8), k)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=35, fstop=5.6)
    mov_cam(cam, mira, ((0.5, -0.35, 3.7), (0.5, 0, 0)), ((0.5, -0.3, 3.45), (0.5, 0, 0)))


def p24():
    D = cena_duas()
    L.fundo_gradiente((0.02, 0.025, 0.04), (0.06, 0.07, 0.1), dist=10, tam=40)
    sol = L.area("sol", (0, 0, 3), (0.5, 0, 0), 400, 2.0, (1, 0.95, 0.85))
    L.area("ceu", (0.5, 0, 4), (0.5, 0, 0), 60, 6.0, (0.6, 0.7, 1.0))
    for i in range(13):
        f = round(1 + (N - 1) * i / 12)
        a = math.radians(-70 + 140 * (i % 3) / 2)
        sol.location = (0.5 + 2.5 * math.sin(a), -1.0, 2.5 * math.cos(a) + 0.5)
        sol.keyframe_insert("location", frame=f)
        sol.data.energy = 150 if i % 3 == 0 else 450
        sol.data.keyframe_insert("energy", frame=f)
        D.estala(f, 1 if i % 2 else 0)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=35, fstop=5.6)
    mov_cam(cam, mira, ((0.5, -0.3, 3.45), (0.5, 0, 0)), ((0.5, -0.3, 3.45), (0.5, 0, 0)))


# ------------------------------------------------------------------ 25. as duas mãos em raio-x, idênticas
def p25():
    cena_duas(raio_x=True)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=35, fstop=8.0)
    mov_cam(cam, mira, ((0.5, -0.35, 3.7), (0.5, 0, 0)), ((0.5, -0.3, 3.3), (0.5, 0, 0)))


# ------------------------------------------------------------------ 26. volta ao close do primeiro plano (pergunta final; fecha o loop)
def p26():
    P = cena_puxao()
    anima_puxao(P, 1, q(0.85), 0.0, 0.035)
    P.posiciona(0.035, N)
    j = P.junta
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=70, fstop=2.8)
    # termina no mesmo enquadramento em que o plano 1 começa: o vídeo dá a volta sem emenda
    mov_cam(cam, mira, ((0.55, -2.1, 1.05), (0.7, -0.25, 0.0)), ((0.5, -2.4, 1.2), (0.7, -0.25, 0.0)))


# ------------------------------------------------------------------ 27. as cartilagens deslizando (um osso não raspa no outro)
def p27():
    J = cena_junta(com_pele=False)
    J.estado(1, sep=0.0, bolha=0.0, gas=1.0, brilho=1.0, fluxo=0.0)
    J.estado(N, fluxo=1.0)
    lado = J.dir_pai
    for f, ang in ((1, 0.0), (q(0.5), 7.0), (N, 0.0)):
        lado.rotation_euler.y = math.radians(ang)  # o osso da direita gira um pouco em volta da cabeça do outro
        lado.keyframe_insert("rotation_euler", frame=f, index=1)
    cam, mira = L.camera((0, 0, 0), (0, 0, 0), lente=70, fstop=2.8)
    mov_cam(cam, mira, ((0.0, -2.3, 0.75), (0.22, 0, 0.55)), ((0.15, -2.2, 0.6), (0.24, 0, 0.45)))


PLANOS = {i: globals()[f"p{i:02d}"] for i in range(1, 28)}


def main():
    global N
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    numero, N, pasta = int(args[0]), int(args[1]), args[2]
    modo = args[3] if len(args) > 3 else "teste"
    amostras = int(args[4]) if len(args) > 4 else 6
    for a in args[5:]:
        k, v = a.split("=")
        EXTRA[k] = float(v)
    PLANOS[numero]()
    s = bpy.context.scene
    s.eevee.taa_render_samples = amostras
    os.makedirs(pasta, exist_ok=True)
    if modo == "teste":
        s.render.resolution_percentage = 40
        for u in (0.0, 0.5, 1.0):
            L.quadro(os.path.join(pasta, f"p{numero:02d}_{round(u * 100):03d}.png"), q(u))
    else:
        s.render.resolution_x, s.render.resolution_y = 720, 1280  # ampliado para 1080x1920 na montagem
        s.render.resolution_percentage = 100
        L.render(pasta, 1, N, "q")


if __name__ == "__main__":
    main()
