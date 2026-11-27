# Trilha do Short "o país que para sem Pix": um tom baixo de sinal com notificações curtas sintetizadas (nenhum som
# real de aplicativo), que morre quando a barrinha cai e vira um "tom morto"; os X dos aplicativos; o tom de conexão
# que morre no QR; o tic-tic de caixa acelerando com os contadores, cortado no meio e trocado por um zumbido oco; o
# beep feio da maquininha e meio segundo de silêncio; um contador seco. Sem música. O fim fica no tom morto do plano 1.
#
# uso: python scripts/sfx_pix.py <narracao.wav> <falas.json> <falas_audio.json> <saida.wav> <dados.json>
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
def seno(f, dur, fase=0.0):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, t.shape)) / SR + fase)

def tom_sinal(dur, morre_em=None):
    """o tom de rede viva: dois senos baixos com um brilho digital; morre_em: desce e vira o tom morto"""
    n = int(dur * SR); t = np.arange(n) / SR
    k = np.clip((t - morre_em) / 0.9, 0, 1) if morre_em is not None else np.zeros(n)
    f = 220 * (1 - 0.35 * k)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * (1 - k)
    x += 0.15 * np.sin(2 * np.pi * 1760 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t)) * (1 - k)
    return x * (1 - 0.5 * k)
def tom_morto(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    return 0.5 * (np.sin(2 * np.pi * 143 * t) + 0.6 * np.sin(2 * np.pi * 146.5 * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.3 * t))
def notificacao(f0=1320):
    a = fade(seno(f0, 0.07) * np.exp(-np.arange(int(0.07 * SR)) / (0.03 * SR)), 0.002, 0.01)
    b = fade(seno(f0 * 1.25, 0.11) * np.exp(-np.arange(int(0.11 * SR)) / (0.04 * SR)), 0.002, 0.02)
    return norm(np.concatenate([a, np.zeros(int(0.02 * SR)), b]))
def erro():
    x = np.concatenate([seno(330, 0.09), np.zeros(int(0.03 * SR)), seno(247, 0.14)])
    return norm(fade(np.tanh(3 * x), 0.003, 0.03))
def baque():
    t = np.arange(int(0.35 * SR)) / SR
    return norm(fade(np.sin(2 * np.pi * (70 - 30 * t) * t) * np.exp(-t / 0.08), 0.002, 0.05))
def estatica(dur):
    rr = np.random.default_rng(5); n = int(dur * SR); t = np.arange(n) / SR
    return norm(fade(bp(rr.standard_normal(n), 1500, 8000) * np.exp(-t / (dur * 0.5)) * (rr.random(n) < 0.3), 0.005, 0.1))
def tic():
    t = np.arange(int(0.05 * SR)) / SR
    return norm(fade(bp(np.random.default_rng(3).standard_normal(len(t)), 2500, 7000) * np.exp(-t / 0.006) + 0.4 * np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.01), 0.0005, 0.01))
def zumbido_oco(dur):
    rr = np.random.default_rng(8); n = int(dur * SR); t = np.arange(n) / SR
    x = lp(rr.standard_normal(n), 300) * 0.6 + 0.4 * np.sin(2 * np.pi * 55 * t)
    return norm(fade(x, 0.05, 0.3))
def beep_feio():
    x = np.concatenate([np.sign(seno(420, 0.18)), np.zeros(int(0.05 * SR)), np.sign(seno(300, 0.32))])
    return norm(fade(lp(x, 3000), 0.003, 0.04))

# ---------- a trilha ----------
T_MORRE = T(0, 0.55)
poe(amb, fade(tom_sinal(C(0) + ENTRADA + 0.3, morre_em=T_MORRE + ENTRADA), 0.001, 0.25), -ENTRADA, 1.0)
poe(amb, fade(tom_morto(FIM - C(0) + 0.2), 0.3, 0.001), C(0) - 0.1, 0.55)
NOTIF = [-0.15, 0.35, 0.8]
for k, t in enumerate(NOTIF): poe(dest, notificacao(1320 + 180 * k), t, 0.5)
X1 = [P(2, "mensagem"), P(2, "mapa"), P(2, "filme")]
for t in X1: poe(dest, erro(), t, 0.4)
poe(dest, baque(), C(2), 0.6)
T_QR = P(4, "conexão")
poe(dest, fade(tom_sinal(T_QR - C(3) + 1.0, morre_em=T_QR - C(3)), 0.1, 0.3), C(3) + 0.1, 0.25)
poe(dest, estatica(0.8), T_QR, 0.35)
# tic-tic de caixa acelerando do plano 5 ao 8, cortado no meio do plano 8
T_TIC0, T_CORTE = C(4) + 0.05, P(9, "essa roda") + 0.1
TICS, t, intervalo = [], T_TIC0, 0.26
while t < T_CORTE:
    TICS.append(t); poe(dest, tic(), t, 0.22)
    intervalo = max(0.085, intervalo * 0.985); t += intervalo
poe(dest, zumbido_oco(C(9) - T_CORTE + 0.4), T_CORTE, 0.5)
X2 = [P(11, "Máquina"), P(11, "banco"), P(11, "entrega")]
for t in X2: poe(dest, erro(), t, 0.4)
T_BEEP = F[11]["fim"] + 0.02
poe(dest, beep_feio(), T_BEEP, 0.5)
SILENCIO = (T_BEEP + 0.55, T_BEEP + 1.05)  # meio segundo de silêncio depois do beep
# contador seco do plano 11, que começa quando o silêncio acaba (o corte para o mapa)
T_SECO = []
t = SILENCIO[1] + 0.05
while t < C(12) - 0.2:
    T_SECO.append(t); poe(dest, tic(), t, 0.28); t += 0.11

# ---------- a narração abaixa o tom enquanto fala; os destaques ficam por cima; silêncio depois do beep ----------
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
amb_m *= 10 ** ((voz_db - 15 - rms_db(amb_m[pausa])) / 20)
dest_m = dest * 10 ** ((voz_db - 5 - rms_db(dest[np.abs(dest) > 1e-3])) / 20)
mix = amb_m + dest_m
s0, s1 = int((SILENCIO[0] + ENTRADA) * SR), int((SILENCIO[1] + ENTRADA) * SR)
mix[s0:s1] *= np.concatenate([np.linspace(1, 0, int(0.03 * SR)), np.zeros(s1 - s0 - int(0.06 * SR)), np.linspace(0, 1, int(0.03 * SR))])
mix = np.clip(mix, -0.97, 0.97)
wavfile.write(saida, SR, (mix * 32767).astype(np.int16))
fq = lambda t: int(round((t + ENTRADA) * FPS))
json.dump({"morre": fq(T_MORRE), "notif": [fq(t) for t in NOTIF], "x1": [fq(t) for t in X1], "qr": fq(T_QR), "tic0": fq(T_TIC0), "corte": fq(T_CORTE),
           "x2": [fq(t) for t in X2], "beep": fq(T_BEEP), "silencio": [fq(t) for t in SILENCIO]}, open(dados_json, "w"))
print(f"trilha: {N / SR:.1f} s · voz {voz_db:.1f} dB · {len(TICS)} tics · começo {rms_db(mix[:int(0.25 * SR)]):.1f} dB · fim {rms_db(mix[-int(0.5 * SR):]):.1f} dB")
