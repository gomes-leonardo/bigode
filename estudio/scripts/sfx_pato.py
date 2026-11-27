# Trilha do Short "o pato que dorme com metade do cérebro": ambiente de noite (grilos, água batendo no tronco, um pad
# grave), o "zzz" dos patos do meio, o mesmo "plim" toda vez que um olho abre, o galho e o "whoosh" do predador, o
# bipe estranho no quarto do hotel. Sem música. A narração abaixa o ambiente enquanto fala; os destaques (plim, bipe,
# galho) passam por cima sem abaixar. O fim volta ao ambiente do começo (o vídeo fecha em loop).
#
# uso: python scripts/sfx_pato.py <narracao.wav> <falas.json> <falas_audio.json> <saida.wav> <dados.json>
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
amb, dest = np.zeros(N), np.zeros(N)  # ambiente (abaixa com a voz) e destaques (não abaixam)
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
r = np.random.default_rng(1127)

def grilos(dur, f0=4600, gap=(0.55, 0.95), semente=5):
    rr = np.random.default_rng(semente); n = int(dur * SR); x = np.zeros(n); t = rr.uniform(0, 0.4)
    while t < dur - 0.2:
        for k in range(3):
            i = int((t + k * 0.034) * SR); m = int(0.02 * SR)
            if i + m < n: x[i:i + m] += np.sin(2 * np.pi * f0 * np.arange(m) / SR) * np.hanning(m)
        t += rr.uniform(*gap)
    return norm(x)
def agua(dur, semente=6):
    rr = np.random.default_rng(semente); n = int(dur * SR); tt = np.arange(n) / SR
    env = np.zeros(n); t = rr.uniform(0, 0.5)
    while t < dur:
        env += np.exp(-((tt - t) / 0.18) ** 2) * rr.uniform(0.5, 1.0); t += rr.uniform(1.1, 2.0)
    x = bp(rr.standard_normal(n), 180, 900) * (0.25 + env)
    return norm(x)
def pad(dur, notas, semente=0):
    rr = np.random.default_rng(semente); n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for f in notas:
        for d in (-0.15, 0.15):
            x += np.sin(2 * np.pi * f * (1 + d / 100) * t + rr.uniform(0, 6.3))
    return norm(lp(x * (1 + 0.12 * np.sin(2 * np.pi * 0.15 * t)), 450))
def ronco(dur, semente=7):
    rr = np.random.default_rng(semente); n = int(dur * SR); t = np.arange(n) / SR
    resp = np.maximum(0, np.sin(2 * np.pi * t / 2.3)) ** 2
    return norm(fade(bp(rr.standard_normal(n), 140, 650) * resp, 0.3, 0.3))
def plim():
    t = np.arange(int(0.8 * SR)) / SR
    f = 2093 * (1 + 0.03 * (1 - np.exp(-t / 0.02)))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.35 * np.sin(2 * np.pi * 2 * np.cumsum(f) / SR) + 0.15 * np.sin(2 * np.pi * 3.01 * np.cumsum(f) / SR)
    return norm(fade(x * np.exp(-t / 0.22), 0.002, 0.05))
def galho():
    rr = np.random.default_rng(8); n = int(0.35 * SR); x = np.zeros(n)
    m = int(0.01 * SR); x[:m] = rr.standard_normal(m) * np.exp(-np.arange(m) / (m / 5))
    for tg in np.sort(rr.exponential(0.04, 8)):
        i = int(tg * SR); k = int(0.003 * SR)
        if i + k < n: x[i:i + k] += rr.uniform(0.2, 0.6) * rr.standard_normal(k)
    return norm(fade(bp(x, 400, 7000), 0.001, 0.05))
def whoosh(dur=0.28):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.random.default_rng(9).standard_normal(n)
    y = np.zeros(n)
    for k, (lo, hi) in enumerate([(300, 900), (600, 1800), (1200, 3600), (2000, 6000)]):
        y += bp(x, lo, hi) * np.exp(-((t - dur * (0.3 + 0.12 * k)) / (dur * 0.25)) ** 2)
    return norm(fade(y, 0.01, 0.05))
def bipe_estranho():
    t = np.arange(int(0.55 * SR)) / SR
    f = 1350 + 90 * np.sin(2 * np.pi * 23 * t)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * ((t % 0.27) < 0.16)
    return norm(fade(lp(x, 5000), 0.003, 0.03))
def quarto(dur):
    rr = np.random.default_rng(10); n = int(dur * SR)
    return norm(lp(bp(rr.standard_normal(n), 60, 400), 300))

# ---------- a trilha ----------
humano0, humano1 = C(10), C(13)   # o bloco do quarto de hotel (planos 11 a 13)
noite_a, noite_b = -ENTRADA, humano0  # a noite no lago, até o corte
for a, b in [(noite_a, noite_b), (humano1, FIM)]:
    d = b - a
    sai = 0.001 if b >= FIM else 0.15  # no fim do vídeo não some: o loop volta para o mesmo ambiente
    poe(amb, fade(grilos(d), 0.02, sai), a, 0.22)
    poe(amb, fade(grilos(d, 4100, (0.8, 1.4), 11), 0.02, sai), a, 0.12)
    poe(amb, fade(agua(d), 0.02, sai), a, 0.4)
    poe(amb, fade(pad(d, [55, 82.4, 110]), 0.02, max(sai, 0.001)), a, 0.3)
poe(amb, fade(quarto(humano1 - humano0), 0.01, 0.1), humano0, 0.25)
poe(amb, fade(pad(humano1 - humano0, [49, 73.4, 98], 3), 0.01, 0.1), humano0, 0.2)
poe(amb, ronco(C(4) - C(2) + 0.6), C(2), 0.35)
PLIM = [T(4, 0.08), T(4, 0.55), F[9]["fim"] + 0.05, F[13]["fim"] + 0.15]  # a troca de olho cai no respiro depois da fala
for t in PLIM: poe(dest, plim(), t, 0.5)
T_GALHO = P(10, "predador") - 0.05  # o galho estala quando ela diz "predador"
poe(dest, galho(), T_GALHO, 0.6)
poe(dest, whoosh(), T_GALHO + 0.18, 0.45)
T_BIPE = P(13, "barulho") - 0.15
poe(dest, bipe_estranho(), T_BIPE, 0.35)

# ---------- a narração abaixa o ambiente enquanto fala ----------
sr_n, nar = wavfile.read(narr_wav)
nar = nar.astype(np.float64) / 32768 if nar.dtype == np.int16 else nar.astype(np.float64)
if nar.ndim > 1: nar = nar.mean(1)
if sr_n != SR: nar = signal.resample_poly(nar, SR, sr_n)
env = np.zeros(N); a0 = int(ENTRADA * SR); m = min(N - a0, len(nar)); env[a0:a0 + m] = np.abs(nar[:m])
env = np.convolve(env, np.ones(int(0.03 * SR)) / int(0.03 * SR), mode="same")
fala = np.convolve((env > 0.02).astype(float), np.ones(int(0.15 * SR)), mode="full")[:N] > 0
ganho = np.convolve(np.where(fala, 0.45, 1.0), np.ones(int(0.06 * SR)) / int(0.06 * SR), mode="same")
voz_db = rms_db(nar[np.abs(nar) > 0.02])
pausa = ~fala & (np.abs(amb) > 1e-5)
amb_m = amb * ganho
amb_m *= 10 ** ((voz_db - 11 - rms_db(amb_m[pausa])) / 20)  # ambiente bem abaixo da voz
dest_m = dest * 10 ** ((voz_db - 3 - rms_db(dest[np.abs(dest) > 1e-3])) / 20)
mix = np.clip(amb_m + dest_m, -0.97, 0.97)
wavfile.write(saida, SR, (mix * 32767).astype(np.int16))

fq = lambda t: int(round((t + ENTRADA) * FPS))
json.dump({"plim": [fq(t) for t in PLIM], "galho": fq(T_GALHO), "bipe": fq(T_BIPE)}, open(dados_json, "w"))
print(f"trilha: {N / SR:.1f} s · ambiente nas pausas {rms_db(amb_m[pausa]):.1f} dB · voz {voz_db:.1f} dB · começo {rms_db(mix[:int(0.25 * SR)]):.1f} dB · fim {rms_db(mix[-int(0.5 * SR):]):.1f} dB")
