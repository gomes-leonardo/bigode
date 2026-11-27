# Trilha de efeitos do Short "quase nenhum som que você ouve é real": todos os sons das provas, sintetizados aqui
# (nada gravado de terceiros) e já colocados no tempo da narração, com a narração "abaixando" os efeitos quando fala.
#
# O motor é montado do jeito que os jogos fazem: cinco "gravações" do motor parado em rotação fixa, tocadas mais
# rápido ou mais devagar e misturadas (crossfade) conforme o giro pedido pelo pedal. Além do áudio, o script grava
# as curvas que o vídeo desenha (giro, pedal, peso de cada camada, cabeça de leitura da gravação fixa, passos) e as
# formas de onda de verdade de cada som.
#
# uso: python scripts/sfx_som.py <narracao.wav> <falas.json> <falas_audio.json> <saida.wav> <ondas.json>
import json, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
FPS = 30
ENTRADA = 0.25  # a narração começa 0,25 s depois do início do vídeo
SAIDA = 1.3
narr_wav, falas_json, audio_json, saida, ondas_json = sys.argv[1:6]
textos = json.load(open(falas_json, encoding="utf-8"))
F = json.load(open(audio_json))
rng = np.random.default_rng(20261127)

# ---------- tempo (no relógio da narração, em segundos) ----------
def T(i, k=0.0): return F[i]["ini"] + (F[i]["fim"] - F[i]["ini"]) * k
def C(i): return (F[i]["fim"] + F[i + 1]["ini"]) / 2 if i + 1 < len(F) else F[-1]["fim"] + SAIDA
def fr(i, trecho):
    t = textos[i]["texto"]
    return t.index(trecho) / len(t)
FIM = F[-1]["fim"] + SAIDA
N = int((FIM + ENTRADA) * SR)
trilha = np.zeros(N)
def poe(x, t, ganho=1.0):
    """coloca o som x a partir do instante t (segundos da narração; a trilha começa ENTRADA antes, junto com o vídeo)"""
    i = int(round((t + ENTRADA) * SR))
    if i < 0: x, i = x[-i:], 0
    j = min(N, i + len(x))
    if j > i: trilha[i:j] += ganho * x[: j - i]

# ---------- filtros ----------
def bp(x, lo, hi, o=4): return signal.sosfilt(signal.butter(o, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, f, o=4): return signal.sosfilt(signal.butter(o, f, btype="low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, btype="high", fs=SR, output="sos"), x)
def norm(x, pico=1.0): return x * (pico / (np.abs(x).max() + 1e-12))
def fade(x, a=0.005, b=0.02):
    x = x.copy(); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)

# ---------- o motor ----------
RPMS = [1000, 2200, 3600, 5000, 6500]
def camada(rpm, dur=2.4, semente=0):
    """uma 'gravação' do motor parado numa rotação fixa (4 cilindros, 4 tempos: 2 explosões por volta)"""
    r = np.random.default_rng(semente)
    n = int(dur * SR)
    f0 = rpm / 60 * 2
    x = np.zeros(n + SR)
    cil = 1 + 0.2 * r.standard_normal(4)
    t, k = 0.0, 0
    while t < dur:
        i = int(t * SR)
        L = max(32, int(SR * min(0.01, 0.9 / f0)))
        env = np.exp(-np.arange(L) / (SR * 0.0022))
        x[i:i + L] += cil[k % 4] * (1 + 0.1 * r.standard_normal()) * env * (1 + 0.35 * r.standard_normal(L))
        t += (1 / f0) * (1 + 0.005 * r.standard_normal())
        k += 1
    x = x[:n]
    y = 1.0 * bp(x, 40, 280) + 0.5 * bp(x, 280, 900) + 0.1 * bp(x, 900, 2500)
    y += bp(r.standard_normal(n), 1500, 4000) * 0.006 * (rpm / 6500) * (np.abs(y).max())
    y = lp(y, 2800)
    # vira um laço sem emenda: o fim se mistura com o começo
    m = int(0.25 * SR)
    laco = y[: n - m].copy()
    laco[:m] = laco[:m] * np.linspace(0, 1, m) + y[n - m:] * np.linspace(1, 0, m)
    return norm(laco)
CAMADAS = [camada(r, semente=i + 1) for i, r in enumerate(RPMS)]

def toca(laco, taxa):
    fase = np.cumsum(taxa) % len(laco)
    i0 = np.floor(fase).astype(int); f = fase - i0
    return laco[i0] * (1 - f) + laco[(i0 + 1) % len(laco)] * f

def pesos_de(rpm):
    """peso de cada camada para um giro (crossfade de potência constante entre as duas vizinhas, em escala log)"""
    L = np.log(RPMS); lr = np.clip(np.log(np.maximum(rpm, 1)), L[0], L[-1])
    j = np.clip(np.searchsorted(L, lr) - 1, 0, len(L) - 2)
    p = (lr - L[j]) / (L[j + 1] - L[j])
    w = np.zeros((len(RPMS), len(rpm)))
    idx = np.arange(len(rpm))
    w[j, idx] = np.cos(p * np.pi / 2)
    w[j + 1, idx] = np.sin(p * np.pi / 2)
    return w

def motor(rpm, acel):
    """o som montado ao vivo: cada camada tocada na velocidade rpm/rpm_da_camada, misturadas pelos pesos"""
    w = pesos_de(rpm)
    y = np.zeros(len(rpm))
    for i, laco in enumerate(CAMADAS):
        if w[i].max() < 1e-4: continue
        y += w[i] * toca(laco, rpm / RPMS[i])
    y = y * (0.45 + 0.55 * (rpm - 900) / 5600) * (0.8 + 0.35 * acel)
    y += hp(y, 700) * 0.25 * acel  # com o pé no fundo o som fica mais "aberto"
    return lp(y, 3800)

def simula(eventos, t0, t1, rpm0=900):
    """giro do motor respondendo ao pedal: eventos = [(t, pedal 0..1)]; devolve giro e pedal por amostra"""
    passo = 1 / 1000
    tt = np.arange(t0, t1, passo)
    u = np.zeros(len(tt))
    for te, ue in sorted(eventos): u[tt >= te] = ue
    u = np.convolve(u, np.ones(40) / 40, mode="same")  # o pé não é instantâneo
    r, rpm = rpm0, np.empty(len(tt))
    for k in range(len(tt)):
        alvo = 900 + u[k] * 5800
        tau = 0.42 if alvo > r else 0.75
        r += (alvo - r) * passo / tau
        r = min(r, 6600)
        rpm[k] = r * (1 + 0.004 * np.sin(2 * np.pi * 7 * tt[k]))
    ts = np.arange(int((t1 - t0) * SR)) / SR
    return np.interp(ts, tt - t0, rpm), np.interp(ts, tt - t0, u)

# curvas por quadro do vídeo (quadro f = (t + ENTRADA) * FPS)
NQ = int(round((FIM + ENTRADA) * FPS))
curva_rpm = np.zeros(NQ); curva_acel = np.zeros(NQ); curva_pesos = np.zeros((len(RPMS), NQ)); curva_fixa = -np.ones(NQ)
def grava_curva(t0, rpm, acel):
    q = np.arange(NQ); t = q / FPS - ENTRADA
    dentro = (t >= t0) & (t < t0 + len(rpm) / SR)
    k = ((t[dentro] - t0) * SR).astype(int)
    curva_rpm[dentro] = rpm[k]; curva_acel[dentro] = acel[k]
    curva_pesos[:, dentro] = pesos_de(rpm[k])

def bloco_motor(t0, t1, eventos, ganho, rpm0=900, fade_fim=0.25):
    rpm, acel = simula(eventos, t0, t1, rpm0)
    x = motor(rpm, acel)
    x = fade(x, 0.08, fade_fim)
    poe(norm(x), t0, ganho)
    grava_curva(t0, rpm, acel)
    return rpm

# a gravação fixa: um carro acelerando e soltando, com começo e fim
rpm_fixa, acel_fixa = simula([(0.12, 1), (1.25, 0)], 0, 2.4)
FIXA = norm(fade(motor(rpm_fixa, acel_fixa), 0.03, 0.3))

# ---------- passos ----------
def passo(tipo, r):
    n = int(0.45 * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    baque = np.sin(2 * np.pi * (85 + 20 * r.random()) * tt) * np.exp(-tt / 0.02)
    if tipo == "rua":
        x += 0.5 * baque
        cl = bp(r.standard_normal(n), 1800, 7000) * np.exp(-tt / 0.004)
        x += 0.9 * cl
        k = int(0.075 * SR); x[k:] += 0.4 * cl[: n - k]
    elif tipo in ("areia", "pedra"):
        dur, ngr, L = (0.2, 160, 0.0012) if tipo == "areia" else (0.24, 55, 0.004)
        for tg in r.gamma(2.0, dur / 5, ngr):
            i = int(tg * SR); m = int(L * SR)
            if i + m < n: x[i:i + m] += r.uniform(0.15, 1.0) * np.exp(-tg / dur * 1.6) * r.standard_normal(m) * np.exp(-np.arange(m) / (m / 3))
        x = bp(x, 2500, 10000) if tipo == "areia" else bp(x, 900, 6500)
        x = norm(x) + 0.35 * baque
    elif tipo == "madeira":
        for f, d, a in [(165, 0.09, 1.0), (390, 0.06, 0.7), (720, 0.04, 0.5), (1180, 0.025, 0.35), (2100, 0.012, 0.2)]:
            for k0, ak in [(0, 1.0), (int(0.06 * SR), 0.45)]:
                x[k0:] += ak * a * np.sin(2 * np.pi * f * (1 + 0.02 * r.standard_normal()) * tt[: n - k0] + r.uniform(0, 6.3)) * np.exp(-tt[: n - k0] / d)
        x += 0.5 * bp(r.standard_normal(n), 2000, 8000) * np.exp(-tt / 0.003)
    return norm(fade(x, 0.0005, 0.05))

# ---------- osso (legume torcido), chuva (grão em superfície fina), fogo (plástico amassado) ----------
def osso(r):
    n = int(0.9 * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    t_estalo = 0.32
    for tg in np.sort(r.uniform(0.0, t_estalo, 9)):  # as fibras cedendo antes
        i = int(tg * SR); m = int(0.003 * SR)
        x[i:i + m] += 0.18 * r.standard_normal(m) * np.exp(-np.arange(m) / (m / 4))
    i = int(t_estalo * SR); m = int(0.012 * SR)
    x[i:i + m] += 1.0 * r.standard_normal(m) * np.exp(-np.arange(m) / (m / 5))
    corpo = lp(r.standard_normal(int(0.06 * SR)), 700) * np.exp(-np.arange(int(0.06 * SR)) / (0.012 * SR))
    x[i:i + len(corpo)] += 0.9 * norm(corpo)
    for tg in t_estalo + np.sort(r.exponential(0.06, 14)):
        j = int(tg * SR); m = int(r.uniform(0.0015, 0.005) * SR)
        if j + m < n: x[j:j + m] += r.uniform(0.15, 0.7) * np.exp(-(tg - t_estalo) / 0.12) * r.standard_normal(m) * np.exp(-np.arange(m) / (m / 4))
    return norm(fade(bp(x, 300, 9000), 0.001, 0.1))

def chuva(r, dur=2.6):
    n = int(dur * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    taxa = np.interp(tt, [0, 0.6, dur], [60, 380, 420])
    t = 0.0
    while t < dur - 0.02:
        t += r.exponential(1 / np.interp(t, tt, taxa))
        i = int(t * SR); m = int(0.012 * SR)
        if i + m >= n: break
        f = r.uniform(2200, 5600); d = r.uniform(0.002, 0.006)
        x[i:i + m] += r.lognormal(-1.2, 0.6) * np.sin(2 * np.pi * f * np.arange(m) / SR) * np.exp(-np.arange(m) / (d * SR))
    x += 0.04 * bp(r.standard_normal(n), 1500, 8000) * np.interp(tt, [0, 0.6, dur], [0.2, 1, 1])
    return norm(fade(x, 0.05, 0.4))

def fogo(r, dur=2.6):
    n = int(dur * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    t = 0.0
    while t < dur - 0.1:
        t += r.exponential(1 / 9)
        for tc in t + np.sort(r.uniform(0, 0.07, r.integers(5, 22))):
            i = int(tc * SR); m = int(r.uniform(0.0008, 0.003) * SR)
            if i + m < n: x[i:i + m] += r.uniform(0.1, 1.0) * r.standard_normal(m) * np.exp(-np.arange(m) / (m / 3))
    x = bp(x, 900, 11000)
    farfalha = bp(r.standard_normal(n), 2500, 9000) * lp(np.abs(r.standard_normal(n)), 6) * 0.25
    ronco = lp(np.cumsum(r.standard_normal(n)), 180); ronco = norm(ronco - lp(ronco, 20)) * 0.12
    return norm(fade(norm(x) + farfalha + ronco, 0.08, 0.4))

# ---------- projetor, televisão e o feixe ----------
def projetor(r, dur=3.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = 92 * (1 + 0.006 * np.sin(2 * np.pi * 0.25 * tt))
    fase = 2 * np.pi * np.cumsum(f) / SR
    x = sum((1 / k ** 1.1) * np.sin(k * fase + r.uniform(0, 6.3)) for k in range(1, 13))
    x += 0.06 * bp(r.standard_normal(n), 600, 1500) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 24 * tt)))
    return norm(fade(x, 0.2, 0.2))

def televisao(r, dur=3.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    fase = 2 * np.pi * 60 * tt
    x = sum(((1.0 if k % 2 else 0.5) / k ** 0.8) * np.sin(k * fase + r.uniform(0, 6.3)) for k in range(1, 61))
    x = bp(x, 110, 5000)
    for tc in r.uniform(0, dur, 30):
        i = int(tc * SR); m = int(0.002 * SR)
        if i + m < n: x[i:i + m] += 0.6 * r.standard_normal(m)
    return norm(fade(x, 0.05, 0.2))

PROJ = projetor(np.random.default_rng(7), 6.0)
TV = televisao(np.random.default_rng(8), 6.0)
def feixe(dur, liga=False, balanca_em=None):
    n = int(dur * SR); tt = np.arange(n) / SR
    taxa = np.ones(n); amp = 1 + 0.08 * np.sin(2 * np.pi * 0.8 * tt)
    if liga:
        k = np.clip(tt / 0.28, 0, 1)
        taxa *= 0.55 + 0.45 * k; amp *= np.clip(tt / 0.2, 0, 1)
    if balanca_em is not None:
        b = np.exp(-((tt - balanca_em) / 0.18) ** 2)
        taxa *= 1 + 0.09 * np.gradient(b) * SR * 0.05; amp *= 1 + 0.8 * b
    y = 0.5 * toca(PROJ, taxa) + 0.5 * toca(TV, taxa * 1.004)
    y = y * amp
    if liga:  # o "estalo" de acender
        m = int(0.05 * SR); y[:m] += 0.8 * bp(np.random.default_rng(9).standard_normal(m), 1500, 9000) * np.exp(-np.arange(m) / (m / 4))
    return norm(fade(y, 0.002, 0.3))

def erro():
    tt = np.arange(int(0.34 * SR)) / SR
    x = np.sign(np.sin(2 * np.pi * np.where(tt < 0.15, 220, 165) * tt)) * (tt % 0.17 < 0.14)
    return norm(fade(lp(x, 2500), 0.003, 0.03))

# ================= a trilha, plano a plano =================
G = {"motor": 0.9, "fixa": 0.85, "camada": 0.55, "passo": 0.75, "osso": 1.0, "chuva": 0.55, "fogo": 0.6, "feixe": 0.7, "proj": 0.65, "tv": 0.55, "erro": 0.45}
r = np.random.default_rng(3)

# 1-2: o painel, o giro subindo (abre o vídeo acelerando)
bloco_motor(-ENTRADA, C(1) + 0.15, [(0.0, 1), (1.05, 0), (T(1, 0.0) - 0.1, 0.85), (C(1) - 0.35, 0)], G["motor"], fade_fim=0.2)
# 3: a gravação fixa toca inteira; 4: de novo, com a cabeça de leitura de "começa" a "termina"
for t0 in [C(1) + 0.25, T(3, fr(3, "começa")) - 0.05]:
    poe(FIXA, t0, G["fixa"])
    q = np.arange(NQ); t = q / FPS - ENTRADA
    dentro = (t >= t0) & (t < t0 + len(FIXA) / SR)
    curva_fixa[dentro] = (t[dentro] - t0) / (len(FIXA) / SR)
# 5-6: o pé decide: pisa, solta, pisa de novo (o som segue o pedal)
eventos = [(T(4, fr(4, "aceleração")), 1), (T(4, fr(4, "você")), 0),
           (T(5, fr(5, "pisa")), 1), (T(5, fr(5, "solta")), 0), (T(5, fr(5, "pisa de novo")), 1), (F[5]["fim"] + 0.2, 0)]
bloco_motor(C(3), C(5) + 0.1, eventos, G["motor"], fade_fim=0.15)
# 7: a gravação fixa tentando seguir o pé: recomeça a cada pisada e é cortada a cada soltada
pisadas = [(T(6, 0.02), T(6, 0.27)), (T(6, 0.36), T(6, 0.55)), (T(6, 0.66), F[6]["fim"] + 0.25)]
for a, b in pisadas:
    poe(fade(FIXA[: int((b - a) * SR)], 0.002, 0.008), a, G["fixa"])
    q = np.arange(NQ); t = q / FPS - ENTRADA
    dentro = (t >= a) & (t < b)
    curva_fixa[dentro] = (t[dentro] - a) / (len(FIXA) / SR)
rpm7, acel7 = simula([(a, 1) for a, _ in pisadas] + [(b, 0) for _, b in pisadas], C(5), C(6))
grava_curva(C(5), rpm7, acel7)
# 8: o X
poe(erro(), T(7, 0.05), G["erro"])
# 9: o motor no estúdio, em marcha lenta
poe(fade(toca(CAMADAS[0], np.ones(int((C(8) - C(7)) * SR))), 0.3, 0.3), C(7), G["camada"] * 0.6)
# 10: cada faixa de rotação aparece com o seu som
INICIO_FAIXAS = [T(9, 0.08 + 0.17 * i) for i in range(5)]
for i, t0 in enumerate(INICIO_FAIXAS):
    poe(fade(CAMADAS[i][: int(0.5 * SR)], 0.02, 0.12), t0, G["camada"])
# 12-13: o jogo monta o som ao vivo: o giro sobe e desce e as camadas se misturam
eventos = [(C(10) + 0.05, 1), (T(11, fr(11, "conforme")), 0), (T(11, fr(11, "sobe")), 1), (T(11, fr(11, "desce")), 0)]
bloco_motor(C(10), C(11) + 0.2, eventos, G["motor"], fade_fim=0.2)
# 14: no "pisou", uma acelerada
bloco_motor(T(13, fr(13, "pisou")) - 0.1, C(13), [(T(13, fr(13, "pisou")) - 0.05, 1), (T(13, fr(13, "pisou")) + 0.35, 0)], G["motor"] * 0.8)
# 16-18: os passos (o mesmo som atravessa o corte: era do estúdio o tempo todo)
PASSOS = []
t, k = C(14) + 0.12, 0
fim_passos = T(16, fr(16, "de pedra")) - 0.1
while t < fim_passos:
    poe(passo("pedra", r), t, G["passo"]); PASSOS.append({"t": t, "tipo": "pedra", "pe": k % 2}); t += 0.52; k += 1
# 19: as três caixas, no mesmo ritmo
seq = [("pedra", T(16, fr(16, "de pedra"))), ("pedra", T(16, fr(16, "de pedra")) + 0.42), ("madeira", T(16, fr(16, "de madeira"))),
       ("madeira", T(16, fr(16, "de madeira")) + 0.42)]
t = T(16, fr(16, "no mesmo ritmo"))
for tipo in ["areia", "pedra", "madeira", "areia", "pedra", "madeira"]:
    if t > C(16) - 0.05: break
    seq.append((tipo, t)); t += 0.36
for k, (tipo, t) in enumerate(seq):
    poe(passo(tipo, r), t, G["passo"]); PASSOS.append({"t": t, "tipo": tipo, "pe": k % 2})
# 20: osso = legume torcido (estala na pausa)
OSSO = osso(np.random.default_rng(11)); T_OSSO = F[17]["fim"] + 0.1 - 0.32
poe(OSSO, T_OSSO, G["osso"])
# 21: chuva = grão em superfície fina
T_CHUVA = T(18, fr(18, "grão")) - 0.1; poe(chuva(np.random.default_rng(12), C(18) + 0.25 - T_CHUVA), T_CHUVA, G["chuva"])
# 22-23: fogo = plástico amassado
T_FOGO = T(19, fr(19, "plástico")) - 0.1; poe(fogo(np.random.default_rng(13), C(19) + 0.1 - T_FOGO), T_FOGO, G["fogo"])
# 24: tela preta, silêncio
# 25: o feixe acende
T_FEIXE = C(20) + 0.1; poe(feixe(C(21) - T_FEIXE + 0.2, liga=True), T_FEIXE, G["feixe"])
# 26: o projetor; 27: a televisão (o microfone chegando perto: o chiado cresce)
T_TV = T(22, fr(22, "e o chiado"))
poe(fade(PROJ[: int((T_TV + 0.3 - C(21)) * SR)], 0.15, 0.3), C(21), G["proj"])
tv = TV[: int((C(22) + 0.1 - T_TV) * SR)].copy(); tv *= np.linspace(0.25, 1, len(tv)) ** 1.5
poe(fade(tv, 0.1, 0.15), T_TV, G["tv"])
# 28: as duas juntas: o som que o mundo reconhece (com uma balançada no fim)
T_SOMA = C(22) + 0.05; poe(feixe(C(23) - T_SOMA, balanca_em=F[23]["fim"] + 0.25 - T_SOMA), T_SOMA, G["feixe"] * 1.1)
# 29: de volta ao painel, marcha lenta baixinha
rpm29, acel29 = simula([], C(23), FIM - 0.6)
poe(fade(norm(motor(rpm29, acel29)), 0.4, 0.8), C(23), G["motor"] * 0.35)
grava_curva(C(23), rpm29, acel29)

# ---------- a narração abaixa os efeitos enquanto fala ----------
sr_n, nar = wavfile.read(narr_wav)
nar = nar.astype(np.float64) / 32768 if nar.dtype == np.int16 else nar.astype(np.float64)
if nar.ndim > 1: nar = nar.mean(1)
if sr_n != SR: nar = signal.resample_poly(nar, SR, sr_n)
env = np.zeros(N); a0 = int(ENTRADA * SR); m = min(N - a0, len(nar)); env[a0:a0 + m] = np.abs(nar[:m])
janela = int(0.03 * SR)
env = np.convolve(env, np.ones(janela) / janela, mode="same")
fala = (env > 0.02).astype(float)
# segura 150 ms depois da fala e solta devagar
k = int(0.15 * SR); fala = np.convolve(fala, np.ones(k), mode="full")[:N] > 0
ganho = np.where(fala, 0.3, 1.0)
ganho = np.convolve(ganho, np.ones(int(0.06 * SR)) / int(0.06 * SR), mode="same")
mix = trilha * ganho
# nível: o efeito na pausa fica um pouco abaixo da voz
voz_db = rms_db(nar[np.abs(nar) > 0.02]) if (np.abs(nar) > 0.02).any() else -20.0
pausa = ~fala & (np.abs(mix) > 1e-4)
alvo = voz_db - 4
mix *= 10 ** ((alvo - rms_db(mix[pausa])) / 20)
mix = np.clip(mix, -0.97, 0.97)
wavfile.write(saida, SR, (mix * 32767).astype(np.int16))

# ---------- dados para o vídeo ----------
PPS = 100
def picos(x):
    h = SR // PPS; k = len(x) // h
    return [round(float(v), 3) for v in np.abs(x[: k * h]).reshape(k, h).max(1)]
fq = lambda t: int(round((t + ENTRADA) * FPS))
dados = {
    "pps": PPS, "fps": FPS,
    "efeitos": picos(norm(trilha)),  # a trilha (sem abaixar), no relógio do vídeo (começa no quadro 0)
    "fixa": picos(FIXA), "camadas": [picos(c[: int(0.6 * SR)]) for c in CAMADAS],
    "projetor": picos(PROJ[: SR * 2]), "tv": picos(TV[: SR * 2]), "feixe": picos(feixe(2.0)),
    "osso": picos(OSSO), "rpms": RPMS,
    "rpm": [round(float(v)) for v in curva_rpm], "acel": [round(float(v), 3) for v in curva_acel],
    "pesos": [[round(float(v), 3) for v in w] for w in curva_pesos], "cabeca": [round(float(v), 4) for v in curva_fixa],
    "passos": [{"q": fq(p["t"]), "tipo": p["tipo"], "pe": p["pe"]} for p in PASSOS],
    "faixas": [fq(t) for t in INICIO_FAIXAS],
    "eventos": {"osso": fq(T_OSSO + 0.32), "chuva": fq(T_CHUVA), "fogo": fq(T_FOGO), "feixe": fq(T_FEIXE), "tv": fq(T_TV), "soma": fq(T_SOMA),
                "pisadas": [[fq(a), fq(b)] for a, b in pisadas], "erro": fq(T(7, 0.05))},
}
json.dump(dados, open(ondas_json, "w"), separators=(",", ":"))
print(f"trilha de efeitos: {len(mix) / SR:.1f} s · {len(PASSOS)} passos · nível na pausa {rms_db(mix[pausa]):.1f} dB (voz {voz_db:.1f} dB)")
