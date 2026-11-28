# Trilha do Short "baratas extintas": um fundo de mato (vento nas folhas e passarinhos sintetizados) que começa e termina
# igual, para o loop, e deixa a primeira frase limpa; os "puf" das espécies sumindo; o
# mastigar de folha, madeira e bicho morto; o "plop" do cocô e o brilho do nitrogênio descendo para a raiz; um "pop"
# para cada bicho que come barata; o zumbido da vespa, que cai e some; os "blups" do que fica faltando; e os "pops" das
# milhares de espécies voltando. Tudo sintetizado, sem música.
#
# uso: python scripts/sfx_baratas.py <narracao.wav> <falas.json> <falas_audio.json> <saida.wav> <dados.json>
import json, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR, FPS = 48000, 30
ENTRADA, SAIDA = 0.25, 1.3
narr_wav, falas_json, audio_json, saida, dados_json = sys.argv[1:6]
textos = json.load(open(falas_json, encoding="utf-8"))
F = json.load(open(audio_json))
def T(i, k=0.0): return F[i]["ini"] + (F[i]["fim"] - F[i]["ini"]) * k
def C(i): return (F[i]["fim"] + F[i + 1]["ini"]) / 2 if i + 1 < len(F) else F[-1]["fim"] + SAIDA
def P(i, trecho):
    t = textos[i]["texto"]
    return T(i, t.index(trecho) / len(t))
FIM = F[-1]["fim"] + SAIDA
N = int(round((FIM + ENTRADA) * SR))
amb, dest = np.zeros(N), np.zeros(N)
rr = np.random.default_rng(23)
def poe(trilha, x, t, ganho=1.0):
    i = int(round((t + ENTRADA) * SR))
    if i < 0: x, i = x[-i:], 0
    j = min(N, i + len(x))
    if j > i: trilha[i:j] += ganho * x[: j - i]
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, btype="low", fs=SR, output="sos"), x)
def norm(x, pico=1.0): return x * (pico / (np.abs(x).max() + 1e-12))
def fade(x, a=0.005, b=0.02):
    x = x.copy(); na, nb = int(a * SR), int(b * SR)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
def tt(dur): return np.arange(int(dur * SR)) / SR
def seno(f, dur, fase=0.0):
    t = tt(dur)
    return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, t.shape)) / SR + fase)

# ---------- os sons ----------
def mato(dur):
    """vento nas folhas (ruído filtrado que respira); os passarinhos esparsos entram à parte; estacionário (loop)"""
    t = tt(dur); n = len(t)
    vento = bp(rr.standard_normal(n), 250, 2200) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t) * np.sin(2 * np.pi * 0.07 * t + 1))
    return norm(vento) * 0.8
def piu(f0):
    t = tt(0.12)
    f = f0 * (1 + 0.35 * np.sin(np.pi * t / 0.12))
    return norm(fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.12), 0.003, 0.02))
def patinhas(dur, dens=60):
    """tlec-tlec: cliques secos e rápidos de patinha"""
    n = int(dur * SR); x = np.zeros(n)
    for _ in range(int(dur * dens)):
        i = rr.integers(0, n - 400)
        x[i:i + 300] += bp(rr.standard_normal(300), 3000, 9000) * np.exp(-np.arange(300) / 40) * rr.uniform(0.4, 1)
    return norm(x * np.clip(np.sin(np.pi * np.arange(n) / n) * 2, 0, 1))
def puf(f0):
    t = tt(0.16)
    return norm(fade(np.sin(2 * np.pi * f0 * (1 - 0.4 * t / 0.16) * t) * np.exp(-t / 0.04) + 0.5 * lp(rr.standard_normal(len(t)), 3000) * np.exp(-t / 0.03), 0.002, 0.03))
def ding(f0=1568):
    t = tt(0.7)
    return norm(fade(np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.18) + 0.35 * np.sin(2 * np.pi * 2 * f0 * t) * np.exp(-t / 0.1), 0.002, 0.08))
def whoosh(dur, f0=300, f1=2400):
    t = tt(dur); n = len(t); x = rr.standard_normal(n); y = np.zeros(n); blocos = 24
    for b in range(blocos):
        a, c = b * n // blocos, (b + 1) * n // blocos
        fc = f0 * (f1 / f0) ** ((b + 0.5) / blocos)
        y[a:c] = bp(x[a:c], fc * 0.7, min(fc * 1.4, 20000))
    return norm(y * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5)
def mastiga(dur=0.5, brilho=4000):
    n = int(dur * SR); x = np.zeros(n)
    for k in range(int(dur * 14)):
        i = int(k * SR / 14 + rr.uniform(0, 0.02) * SR)
        m = min(n - i, int(0.04 * SR))
        if m > 0: x[i:i + m] += bp(rr.standard_normal(m), 800, brilho) * np.exp(-np.arange(m) / (0.008 * SR))
    return norm(x)
def plop(f0=420):
    t = tt(0.18)
    return norm(fade(np.sin(2 * np.pi * (f0 + 500 * np.exp(-t / 0.02)) * t) * np.exp(-t / 0.05), 0.001, 0.03))
def brilho(dur):
    """arpejo agudo e macio subindo (o nitrogênio entrando na raiz e subindo na planta)"""
    x = np.zeros(int(dur * SR))
    notas = [1047, 1319, 1568, 2093, 2637]
    for k, f0 in enumerate(notas):
        y = ding(f0) * 0.6
        i = int(k * dur / len(notas) * SR)
        m = min(len(x) - i, len(y))
        x[i:i + m] += y[:m]
    return norm(x)
def pop(f0):
    t = tt(0.12)
    return norm(fade(np.sin(2 * np.pi * f0 * (1 + 1.5 * np.exp(-t / 0.01)) * t) * np.exp(-t / 0.035), 0.001, 0.02))
def zumbido(dur, f0=210, cai=False):
    t = tt(dur)
    f = f0 * (1 + 0.04 * np.sin(2 * np.pi * 9 * t)) * (np.linspace(1, 0.55, len(t)) if cai else 1)
    fase = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(k * fase) / k for k in range(1, 9))
    return norm(lp(x, 2500) * (np.linspace(1, 0, len(t)) ** 1.5 if cai else 1))
def guincho():
    t = tt(0.14)
    return norm(fade(np.sin(2 * np.pi * (2600 + 900 * np.sin(np.pi * t / 0.14)) * t), 0.004, 0.03))
def clique_lingua():
    t = tt(0.05)
    return norm(fade(bp(rr.standard_normal(len(t)), 1200, 5000) * np.exp(-t / 0.006), 0.0005, 0.01))
def erro():
    x = np.concatenate([seno(330, 0.09), np.zeros(int(0.03 * SR)), seno(247, 0.14)])
    return norm(fade(np.tanh(3 * x), 0.003, 0.03))
def blup():
    t = tt(0.35)
    return norm(fade(np.sin(2 * np.pi * (520 - 320 * t / 0.35) * t) * np.exp(-t / 0.15), 0.002, 0.05))

# ---------- a trilha ----------
fundo = mato(FIM + ENTRADA)
# passarinhos esparsos, nos mesmos lugares relativos ao começo e ao fim (o loop não tropeça)
for tb in np.arange(1.3, FIM - 1.0, 2.9):
    if rr.random() < 0.75: poe(amb, piu(rr.uniform(2700, 3600)), tb + rr.uniform(-0.3, 0.3), 0.12)
poe(amb, fade(fundo, 0.03, 0.03), -ENTRADA, 0.5)
# 1: a primeira frase entra limpa (é o gancho); a vermelha pisca no "trinta" e a casinha pula no "perto da gente"
T_PULSO, T_CASA0 = P(0, "trinta"), P(0, "perto")
poe(dest, ding(1568), T_PULSO, 0.35)
poe(dest, pop(900), T_CASA0, 0.4)
# 2: as espécies sumindo; a câmera corre da casa para a floresta; um alerta lá longe
E0, E1 = P(1, "extintas") - 0.25, P(1, "o estrago") - 0.15
EXT = list(np.linspace(E0, E1, 36) + rr.uniform(-0.02, 0.02, 36))
for k, t in enumerate(EXT): poe(dest, puf(1300 - 18 * k), t, 0.16)
T_PAN = P(1, "o estrago") - 0.05
poe(dest, whoosh(0.7, 250, 1600), T_PAN, 0.4)
T_ALERTA = P(1, "longe")
poe(dest, ding(880), T_ALERTA, 0.4)
# 3: reciclando o que morreu
T_FOLHA, T_MADEIRA, T_BICHO = P(2, "folha"), P(2, "madeira"), P(2, "bicho")
poe(dest, mastiga(0.55, 5000), T_FOLHA, 0.4)
poe(dest, mastiga(0.55, 2500), T_MADEIRA, 0.45)
poe(dest, mastiga(0.6, 3500), T_BICHO, 0.4)
poe(dest, patinhas(C(2) - C(1), 18), C(1), 0.12)
# 4: cocô, nitrogênio descendo e a planta crescendo
T_COCO = [P(3, "cocô") - 0.05, P(3, "cocô") + 0.2]
for t in T_COCO: poe(dest, plop(), t, 0.45)
T_NITRO, T_PLANTA = P(3, "nitrogênio"), P(3, "plantas")
poe(dest, brilho(1.2), T_NITRO + 0.7, 0.15)  # depois da palavra "nitrogênio", baixinho
poe(dest, whoosh(0.9, 200, 900), T_PLANTA, 0.25)
# 5: quem come barata
T_BICHOS = [P(4, "pássaros"), P(4, "lagartos"), P(4, "roedores"), P(4, "vespas")]
for k, t in enumerate(T_BICHOS): poe(dest, pop(700 + 120 * k), t, 0.4)
poe(dest, piu(3200), T_BICHOS[0] + 0.12, 0.3)
poe(dest, clique_lingua(), T_BICHOS[1] + 0.12, 0.4)
poe(dest, guincho(), T_BICHOS[2] + 0.12, 0.25)
poe(dest, fade(zumbido(0.5), 0.05, 0.2), T_BICHOS[3] + 0.08, 0.12)
# 6: a vespa e a ooteca; 7: a vespa some
poe(dest, fade(zumbido(C(5) - C(4) + 0.05), 0.15, 0.08), C(4), 0.1)
T_OVO = P(5, "filhotes")
poe(dest, plop(900), T_OVO, 0.35)
T_SOME = P(6, "sumiriam")
poe(dest, zumbido(T_SOME - C(5) + 0.7, cai=True), C(5), 0.12)
poe(dest, erro(), T_SOME, 0.35)
# 8: menos comida, menos adubo
T_MENOS = [P(7, "menos"), P(8, "menos")]
for t in T_MENOS: poe(dest, blup(), t - 0.12, 0.3)
# 9: as umas trinta espécies de perto da gente somem
S0, S1 = P(9, "sumiriam"), C(9) - 0.15
SOME30 = list(np.linspace(S0, S1, 30))
for k, t in enumerate(SOME30): poe(dest, puf(1100 - 10 * k), t, 0.12)
# 10: as milhares voltando (pops subindo), e o gancho de volta na tela
V0, V1 = C(9) + 0.05, F[-1]["fim"] + 0.35
VOLTA = list(np.linspace(V0, V1, 44))
for k, t in enumerate(VOLTA): poe(dest, pop(600 + 22 * k), t, 0.1)
T_GANCHO = F[-1]["fim"] + 0.05

# ---------- a narração abaixa o fundo enquanto fala; os destaques ficam por cima ----------
sr_n, nar = wavfile.read(narr_wav)
nar = nar.astype(np.float64) / 32768 if nar.dtype == np.int16 else nar.astype(np.float64)
if nar.ndim > 1: nar = nar.mean(1)
if sr_n != SR: nar = signal.resample_poly(nar, SR, sr_n)
env = np.zeros(N); a0 = int(ENTRADA * SR); m = min(N - a0, len(nar)); env[a0:a0 + m] = np.abs(nar[:m])
env = np.convolve(env, np.ones(int(0.03 * SR)) / int(0.03 * SR), mode="same")
fala = np.convolve((env > 0.02).astype(float), np.ones(int(0.15 * SR)), mode="full")[:N] > 0
ganho = np.convolve(np.where(fala, 0.4, 1.0), np.ones(int(0.06 * SR)) / int(0.06 * SR), mode="same")
voz_db = rms_db(nar[np.abs(nar) > 0.02])
pausa = ~fala
amb_m = amb * ganho
amb_m *= 10 ** ((voz_db - 17 - rms_db(amb[pausa])) / 20)
dest_m = dest * 10 ** ((voz_db - 8 - rms_db(dest[np.abs(dest) > 1e-3])) / 20)
mix = np.clip(amb_m + dest_m, -0.97, 0.97)
wavfile.write(saida, SR, (mix * 32767).astype(np.int16))
fq = lambda t: int(round((t + ENTRADA) * FPS))
json.dump({"pulso": fq(T_PULSO), "casa0": fq(T_CASA0), "ext": [fq(EXT[0]), fq(EXT[-1])], "pan": fq(T_PAN), "alerta": fq(T_ALERTA),
           "folha": fq(T_FOLHA), "madeira": fq(T_MADEIRA), "bicho": fq(T_BICHO), "coco": [fq(t) for t in T_COCO], "nitro": fq(T_NITRO),
           "planta": fq(T_PLANTA), "bichos": [fq(t) for t in T_BICHOS], "ovo": fq(T_OVO), "some": fq(T_SOME), "menos": [fq(t) for t in T_MENOS],
           "some30": [fq(SOME30[0]), fq(SOME30[-1])], "volta": [fq(V0), fq(V1)], "gancho": fq(T_GANCHO)}, open(dados_json, "w"))
print(f"trilha: {N / SR:.1f} s · voz {voz_db:.1f} dB · começo {rms_db(mix[:int(0.5 * SR)]):.1f} dB · fim {rms_db(mix[-int(0.5 * SR):]):.1f} dB")
