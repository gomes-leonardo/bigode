# Trilha do Short "todo mundo pulando ao mesmo tempo": um fundo baixo de espaço que começa e termina igual (loop); o
# ronco de terremoto com o rabisco do sismógrafo, o "whoosh" da Terra saindo da órbita e a fita parando no "Mas não"
# (com o rebobinar de volta); os "plins" da gente chegando; o "whoomp" do pulo e o baque da volta; o "clunc" da
# balança; os zooms até o átomo; o acorde do "certo"; o grave do "depois"; o burburinho da multidão com buzinas; e a
# calma da órbita. Tudo sintetizado, sem música.
#
# uso: python scripts/sfx_pulo.py <narracao.wav> <falas.json> <falas_audio.json> <saida.wav> <dados.json>
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
rr = np.random.default_rng(11)
def poe(trilha, x, t, ganho=1.0):
    i = int(round((t + ENTRADA) * SR))
    if i < 0: x, i = x[-i:], 0
    j = min(N, i + len(x))
    if j > i: trilha[i:j] += ganho * x[: j - i]
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, btype="low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, btype="high", fs=SR, output="sos"), x)
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
def fundo(dur):
    """o fundo de espaço: dois graves baixinhos e um brilho que respira; periódico em 10 s para o loop casar"""
    t = tt(dur)
    x = np.sin(2 * np.pi * 55 * t) + 0.7 * np.sin(2 * np.pi * 82.5 * t + 1.0) + 0.35 * np.sin(2 * np.pi * 110.2 * t)
    x *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.1 * t)
    x += 0.12 * np.sin(2 * np.pi * 880 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.2 * t))
    return x
def fundo_escuro(dur):
    t = tt(dur)
    return np.sin(2 * np.pi * 49 * t) + 0.8 * np.sin(2 * np.pi * 58.3 * t) + 0.4 * np.sin(2 * np.pi * 73.4 * t + 0.5)
def ronco(dur):
    """terremoto: ruído grave com tremor de 7 a 9 Hz, crescendo"""
    t = tt(dur)
    x = lp(rr.standard_normal(len(t)), 110, 4) * 3 + 0.5 * np.sin(2 * np.pi * 38 * t)
    x *= 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * (7 + 2 * t / dur) * t))
    return norm(x) * np.clip(t / (0.6 * dur), 0.25, 1)
def rabisco(dur):
    """a agulha do sismógrafo raspando o papel, mais forte quando ela corre"""
    t = tt(dur)
    vel = np.abs(np.sin(2 * np.pi * 5.3 * t) + 0.6 * np.sin(2 * np.pi * 9.1 * t + 1)) * np.clip(t / (0.7 * dur), 0.2, 1)
    return norm(bp(rr.standard_normal(len(t)), 2500, 6000) * vel)
def whoosh(dur, f0=300, f1=2400, sobe=True):
    t = tt(dur); n = len(t)
    x = rr.standard_normal(n)
    # varredura de passa-banda em blocos curtos
    y = np.zeros(n); blocos = 24
    for b in range(blocos):
        a, c = b * n // blocos, (b + 1) * n // blocos
        k = (b + 0.5) / blocos
        fc = f0 * (f1 / f0) ** (k if sobe else 1 - k)
        y[a:c] = bp(x[a:c], fc * 0.7, min(fc * 1.4, 20000))
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return norm(y * env)
def para_fita(x, dur):
    """a fita parando: a reprodução desacelera até zero em `dur` segundos"""
    n = int(dur * SR)
    taxa = np.linspace(1, 0, n) ** 1.5
    pos = np.cumsum(taxa)
    return np.interp(pos, np.arange(len(x)), x) * np.linspace(1, 0.3, n)
def tique(f0=2200, dur=0.06):
    t = tt(dur)
    return norm(fade(np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.012) + 0.4 * bp(rr.standard_normal(len(t)), 2000, 7000) * np.exp(-t / 0.004), 0.0005, 0.01))
def erro():
    x = np.concatenate([seno(330, 0.09), np.zeros(int(0.03 * SR)), seno(247, 0.14)])
    return norm(fade(np.tanh(3 * x), 0.003, 0.03))
def plim(f0):
    t = tt(0.22)
    return norm(fade(np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.05) + 0.3 * np.sin(2 * np.pi * 2 * f0 * t) * np.exp(-t / 0.03), 0.002, 0.03))
def whoomp():
    """o pulo de oito bilhões: um grave curto e o ar subindo"""
    t = tt(0.45)
    grave = np.sin(2 * np.pi * (70 - 40 * t / 0.45) * t) * np.exp(-t / 0.12)
    return norm(norm(grave) + 0.6 * fade(whoosh(0.45, 250, 1800), 0.01, 0.05))
def baque(dur=0.6, f0=55):
    t = tt(dur)
    corpo = np.sin(2 * np.pi * (f0 + 30 * np.exp(-t / 0.03)) * t) * np.exp(-t / 0.15)
    poeira = lp(rr.standard_normal(len(t)), 1800) * np.exp(-t / 0.25) * 0.5
    return norm(fade(corpo + poeira, 0.001, 0.08))
def clunc():
    t = tt(0.5)
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in [(220, 1, 0.12), (517, 0.6, 0.07), (893, 0.4, 0.05), (1340, 0.25, 0.03)])
    return norm(fade(x + 0.8 * np.sin(2 * np.pi * 48 * t) * np.exp(-t / 0.1), 0.001, 0.05))
def ping():
    t = tt(1.2)
    return norm(fade(np.sin(2 * np.pi * 2350 * t) * np.exp(-t / 0.35) + 0.3 * np.sin(2 * np.pi * 3525 * t) * np.exp(-t / 0.2), 0.002, 0.1))
def acorde_certo():
    a = plim(659.3); b = plim(880)
    return norm(np.concatenate([a[: int(0.09 * SR)], b]))
def grave_depois():
    t = tt(1.8)
    x = np.sin(2 * np.pi * (52 - 8 * t / 1.8) * t) * np.exp(-t / 0.7) + 0.3 * lp(rr.standard_normal(len(t)), 400) * np.exp(-t / 0.4)
    return norm(fade(x, 0.005, 0.3))
def burburinho(dur):
    """multidão: várias "vozes" de ruído filtrado com sílabas aleatórias"""
    t = tt(dur); n = len(t); x = np.zeros(n)
    for v in range(14):
        fc = rr.uniform(350, 1600)
        base = bp(rr.standard_normal(n), fc * 0.8, fc * 1.25)
        silabas = np.convolve((rr.random(n // 480 + 1) < 0.45).astype(float).repeat(480)[:n], np.ones(2400) / 2400, mode="same")
        x += base * silabas
    return norm(lp(x, 2500))
def buzina(f0):
    t = tt(0.32)
    x = np.sign(np.sin(2 * np.pi * f0 * t)) + np.sign(np.sin(2 * np.pi * f0 * 1.26 * t))
    return norm(fade(lp(x, 1800), 0.01, 0.06))

# ---------- a trilha ----------
poe(amb, fade(fundo(FIM + ENTRADA), 0.02, 0.02), -ENTRADA, 0.55)
# 1: a turma se agacha no "pulasse"
T_AGACHA = P(0, "pulasse")
# 2-3: terremoto e a Terra saindo do lugar; a fita para logo depois de "lugar"; 4: no "Mas não" ela rebobina e a
# Terra volta para a órbita
T_TREMOR, T_PARA = C(0), F[2]["fim"] + 0.05
r = ronco(T_PARA - T_TREMOR + 0.4)
r_para = int((T_PARA - T_TREMOR) * SR)
r = np.concatenate([fade(r[:r_para], 0.4, 0.001), para_fita(r[r_para:], 0.3)])
poe(amb, r, T_TREMOR, 1.6)
poe(dest, fade(rabisco(C(1) - T_TREMOR), 0.2, 0.15), T_TREMOR, 0.25)
T_FOGE = T(2, 0.2)
w = whoosh(T_PARA - T_FOGE + 0.4, 200, 1600)
w_para = int((T_PARA - T_FOGE) * SR)
poe(dest, np.concatenate([w[:w_para], para_fita(w[w_para:], 0.3)]), T_FOGE, 0.5)
T_VOLTA = P(3, "não")
poe(dest, whoosh(0.35, 2200, 400)[::-1], T_VOLTA - 0.35, 0.35)
T_X = T_VOLTA + 0.02
poe(dest, erro(), T_X, 0.35)
# 5: a gente chegando de todo canto num lugar só (plins cada vez mais juntos)
J0, J1 = C(3) + 0.1, P(4, "e pulassem") - 0.15
PLINS, t = [], J0
while t < J1:
    PLINS.append(t); poe(dest, plim(rr.uniform(700, 1500)), t, 0.07 + 0.06 * (t - J0) / (J1 - J0))
    t += max(0.035, 0.22 * (1 - (t - J0) / (J1 - J0)) ** 1.5)
# 6: o pulo; o medidor nem mexe
T_PULO1 = P(4, "pulassem") + 0.03
poe(dest, whoomp(), T_PULO1, 0.9)
T_MEDIDOR = P(4, "quase")
poe(dest, tique(3000, 0.04), T_MEDIDOR, 0.3)
# 7: a balança
T_BALANCA = C(4) + 0.45
poe(dest, clunc(), T_BALANCA, 0.7)
# 8: os zooms até o átomo
T_ATOMO = P(6, "átomo") - 0.1
T_ZOOM = [C(5) + 0.6 + i * (T_ATOMO - C(5) - 0.6) / 3 for i in range(3)]  # o chão fica 0,6 s na tela antes do primeiro zoom
for i, z in enumerate(T_ZOOM): poe(dest, whoosh(0.4, 400 + 300 * i, 2600 + 800 * i), z - 0.12, 0.3)
poe(dest, ping(), T_ATOMO, 0.4)
# 9: todo mundo cai de volta
T_POUSO1 = P(7, "caísse")
poe(dest, baque(), T_POUSO1, 1.0)
T_NADA = P(7, "nada")
# 11: o pulo não é o problema (certo)
T_CHECK = T(8, 0.2)
poe(dest, acorde_certo(), T_CHECK, 0.45)
# 12: o depois
T_DEPOIS = P(9, "depois") - 0.05
poe(dest, grave_depois(), T_DEPOIS, 0.9)
poe(amb, fade(fundo_escuro(C(10) + 0.6 - T_DEPOIS), 0.4, 0.8), T_DEPOIS, 0.5)
# 13-14: a multidão, sem comida, sem água; buzinas tentando voltar pra casa
B0 = C(9) - 0.2
poe(amb, fade(burburinho(C(10) + 0.6 - B0), 0.8, 0.7), B0, 0.9)
X2 = [P(10, "comida"), P(10, "água")]
for t in X2: poe(dest, erro(), t, 0.35)
T_CASA = P(10, "tentando")
BUZ = [T_CASA + 0.15, T_CASA + 0.55, T_CASA + 0.8, T_CASA + 1.2]
for i, t in enumerate(BUZ): poe(dest, buzina([330, 294, 370, 262][i]), t, 0.18)
# 16: o pulo de novo, e a volta; depois, só o fundo (igual ao começo)
T_PULO2 = P(12, "pulando")
poe(dest, whoomp(), T_PULO2, 0.8)
T_POUSO2 = P(12, "quase")
poe(dest, baque(0.5, 60), T_POUSO2, 0.8)

# ---------- a narração abaixa o fundo enquanto fala; os destaques ficam por cima ----------
sr_n, nar = wavfile.read(narr_wav)
nar = nar.astype(np.float64) / 32768 if nar.dtype == np.int16 else nar.astype(np.float64)
if nar.ndim > 1: nar = nar.mean(1)
if sr_n != SR: nar = signal.resample_poly(nar, SR, sr_n)
env = np.zeros(N); a0 = int(ENTRADA * SR); m = min(N - a0, len(nar)); env[a0:a0 + m] = np.abs(nar[:m])
env = np.convolve(env, np.ones(int(0.03 * SR)) / int(0.03 * SR), mode="same")
fala = np.convolve((env > 0.02).astype(float), np.ones(int(0.15 * SR)), mode="full")[:N] > 0
ganho = np.convolve(np.where(fala, 0.5, 1.0), np.ones(int(0.06 * SR)) / int(0.06 * SR), mode="same")
voz_db = rms_db(nar[np.abs(nar) > 0.02])
base = fundo(FIM + ENTRADA) * 0.55  # o fundo sozinho, para medir o nível nas pausas
pausa = ~fala
amb_m = amb * ganho
amb_m *= 10 ** ((voz_db - 17 - rms_db(base[pausa])) / 20)
dest_m = dest * 10 ** ((voz_db - 5 - rms_db(dest[np.abs(dest) > 1e-3])) / 20)
mix = np.clip(amb_m + dest_m, -0.97, 0.97)
wavfile.write(saida, SR, (mix * 32767).astype(np.int16))
fq = lambda t: int(round((t + ENTRADA) * FPS))
json.dump({"agacha": fq(T_AGACHA), "tremor": fq(T_TREMOR), "foge": fq(T_FOGE), "para": fq(T_PARA), "volta": fq(T_VOLTA), "x": fq(T_X),
           "junta": [fq(J0), fq(J1)], "pulo1": fq(T_PULO1), "medidor": fq(T_MEDIDOR), "balanca": fq(T_BALANCA), "zoom": [fq(t) for t in T_ZOOM],
           "atomo": fq(T_ATOMO), "pouso1": fq(T_POUSO1), "nada": fq(T_NADA), "check": fq(T_CHECK), "depois": fq(T_DEPOIS), "x2": [fq(t) for t in X2],
           "casa": fq(T_CASA), "pulo2": fq(T_PULO2), "pouso2": fq(T_POUSO2)}, open(dados_json, "w"))
print(f"trilha: {N / SR:.1f} s · voz {voz_db:.1f} dB · {len(PLINS)} plins · começo {rms_db(mix[:int(0.5 * SR)]):.1f} dB · fim {rms_db(mix[-int(0.5 * SR):]):.1f} dB")
