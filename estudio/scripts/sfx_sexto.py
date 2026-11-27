# Trilha do Short "o sexto sentido que você não sente": um pad baixo de documentário (sem melodia), o mesmo "tic" de
# dedo no nariz e nas articulações, um whoosh curto de equilíbrio, o tom das ondas do cérebro que "murcha" quando o
# campo gira (e some no rosto em branco), asas sintetizadas no bando, e o mesmo tom voltando como uma nota estável,
# feito agulha de bússola parando. Sem música. O fim volta ao pad do começo (loop).
#
# uso: python scripts/sfx_sexto.py <narracao.wav> <falas.json> <falas_audio.json> <saida.wav> <dados.json>
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

def pad(dur, notas, semente=0):
    rr = np.random.default_rng(semente); n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for k, f in enumerate(notas):
        for d in (-0.12, 0.12):
            x += (1 / (1 + k * 0.4)) * np.sin(2 * np.pi * f * (1 + d / 100) * t + rr.uniform(0, 6.3))
    return norm(lp(x * (1 + 0.1 * np.sin(2 * np.pi * 0.11 * t)), 700))
def tic():
    t = np.arange(int(0.09 * SR)) / SR
    x = np.sin(2 * np.pi * 1900 * t) * np.exp(-t / 0.008) + 0.5 * bp(np.random.default_rng(2).standard_normal(len(t)), 2000, 8000) * np.exp(-t / 0.003)
    return norm(fade(x, 0.0005, 0.02))
def whoosh(dur=0.35, semente=4):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.random.default_rng(semente).standard_normal(n); y = np.zeros(n)
    for k, (lo, hi) in enumerate([(250, 800), (500, 1600), (1000, 3200), (1800, 5500)]):
        y += bp(x, lo, hi) * np.exp(-((t - dur * (0.3 + 0.12 * k)) / (dur * 0.25)) ** 2)
    return norm(fade(y, 0.01, 0.05))
def tom_ondas(dur, cai_em=None, estabiliza=False):
    """o tom das ondas: um seno agudo pulsando como as ondas alfa (~10 por segundo); murcha a partir de cai_em;
    estabiliza=True: o pulso some e o tom assenta numa nota fixa (a agulha parando)"""
    n = int(dur * SR); t = np.arange(n) / SR
    prof = np.full(n, 0.8)
    amp = np.ones(n); f = np.full(n, 880.0)
    if cai_em is not None:
        k = np.clip((t - cai_em) / 0.45, 0, 1)
        amp *= 1 - 0.6 * k; f *= 1 - 0.04 * k
    if estabiliza:
        k = np.clip(t / (0.6 * dur), 0, 1)
        prof *= 1 - k; f = 820 + 60 * (1 - k) * np.sin(2 * np.pi * 1.5 * t) * (1 - k)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * amp * (1 - prof * (0.5 + 0.5 * np.sin(2 * np.pi * 10 * t)))
    return norm(fade(x, 0.15, 0.08))
def asas(dur, n_aves=5, semente=6):
    rr = np.random.default_rng(semente); n = int(dur * SR); x = np.zeros(n)
    for a in range(n_aves):
        t, ritmo = rr.uniform(0, 0.3), rr.uniform(4.2, 6.0)
        while t < dur - 0.1:
            i = int(t * SR); m = int(0.06 * SR)
            if i + m < n: x[i:i + m] += rr.uniform(0.5, 1) * lp(rr.standard_normal(m), 1400) * np.hanning(m)
            t += 1 / ritmo
    return norm(fade(x, 0.1, 0.2))
def assenta():
    t = np.arange(int(0.25 * SR)) / SR
    return norm(fade(np.sin(2 * np.pi * 1640 * t) * np.exp(-t / 0.05) + 0.3 * np.sin(2 * np.pi * 2460 * t) * np.exp(-t / 0.03), 0.001, 0.03))

# ---------- a trilha ----------
poe(amb, fade(pad(FIM + ENTRADA + 0.1, [73.4, 110, 146.8, 174.6]), 0.001, 0.001), -ENTRADA, 1.0)
T_TOQUE = F[3]["fim"] + 0.12
poe(dest, tic(), T_TOQUE, 0.7)
ARTIC = [T(4, k) for k in (0.12, 0.32, 0.52, 0.72)]
for t in ARTIC: poe(dest, tic(), t, 0.55)
T_EQUI = [T(5, 0.3), T(5, 0.75)]
for t in T_EQUI: poe(dest, whoosh(), t, 0.5)
T_GIRA = P(8, "gira")
T_SENSA = T(11)
poe(dest, tom_ondas(T_SENSA - C(7), cai_em=T_GIRA - C(7)), C(7), 0.22)
poe(dest, asas(C(12) - C(11) + 0.2), C(11), 0.45)
T_HIP = C(13) + 0.15
T_AGULHA = P(14, "você apontaria")
poe(dest, tom_ondas(C(14) - T_HIP + 0.3, estabiliza=True), T_HIP, 0.22)
poe(dest, assenta(), T_AGULHA, 0.35)

# ---------- a narração abaixa o pad enquanto fala; os destaques ficam por cima ----------
sr_n, nar = wavfile.read(narr_wav)
nar = nar.astype(np.float64) / 32768 if nar.dtype == np.int16 else nar.astype(np.float64)
if nar.ndim > 1: nar = nar.mean(1)
if sr_n != SR: nar = signal.resample_poly(nar, SR, sr_n)
env = np.zeros(N); a0 = int(ENTRADA * SR); m = min(N - a0, len(nar)); env[a0:a0 + m] = np.abs(nar[:m])
env = np.convolve(env, np.ones(int(0.03 * SR)) / int(0.03 * SR), mode="same")
fala = np.convolve((env > 0.02).astype(float), np.ones(int(0.15 * SR)), mode="full")[:N] > 0
ganho = np.convolve(np.where(fala, 0.5, 1.0), np.ones(int(0.06 * SR)) / int(0.06 * SR), mode="same")
voz_db = rms_db(nar[np.abs(nar) > 0.02])
pausa = ~fala & (np.abs(amb) > 1e-5)
amb_m = amb * ganho
amb_m *= 10 ** ((voz_db - 13 - rms_db(amb_m[pausa])) / 20)
dest_m = dest * 10 ** ((voz_db - 6 - rms_db(dest[np.abs(dest) > 1e-3])) / 20)
mix = np.clip(amb_m + dest_m, -0.97, 0.97)
wavfile.write(saida, SR, (mix * 32767).astype(np.int16))
fq = lambda t: int(round((t + ENTRADA) * FPS))
json.dump({"toque": fq(T_TOQUE), "artic": [fq(t) for t in ARTIC], "equilibrio": [fq(t) for t in T_EQUI], "gira": fq(T_GIRA), "sensacao": fq(T_SENSA),
           "hipotese": fq(T_HIP), "agulha": fq(T_AGULHA)}, open(dados_json, "w"))
print(f"trilha: {N / SR:.1f} s · pad nas pausas {rms_db(amb_m[pausa]):.1f} dB · voz {voz_db:.1f} dB · começo {rms_db(mix[:int(0.25 * SR)]):.1f} dB · fim {rms_db(mix[-int(0.5 * SR):]):.1f} dB")
