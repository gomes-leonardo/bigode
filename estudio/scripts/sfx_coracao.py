# Trilha do Short "o coração que bate 20 vezes por segundo": só batimento sintetizado (tum-tum), um pad leve e efeitos,
# colocados no tempo da narração. O batimento sai de uma curva de batidas por minuto: a 1.200/min as batidas se emendam
# num zumbido; no apagão ele falha e some; à noite cai para umas 50/min, grave e espaçado; no fim volta ao zumbido do
# começo (o vídeo fecha em loop). A narração abaixa os efeitos enquanto fala. Também grava, para o vídeo, a curva de
# batidas por minuto e o quadro de cada batida.
#
# uso: python scripts/sfx_coracao.py <narracao.wav> <falas.json> <falas_audio.json> <saida.wav> <dados.json>
import json, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
FPS = 30
ENTRADA, SAIDA = 0.25, 1.3
narr_wav, falas_json, audio_json, saida, dados_json = sys.argv[1:6]
textos = json.load(open(falas_json, encoding="utf-8"))
F = json.load(open(audio_json))

def T(i, k=0.0): return F[i]["ini"] + (F[i]["fim"] - F[i]["ini"]) * k
def C(i): return (F[i]["fim"] + F[i + 1]["ini"]) / 2 if i + 1 < len(F) else F[-1]["fim"] + SAIDA
def fr(i, trecho):
    t = textos[i]["texto"]
    return t.index(trecho) / len(t)
def P(i, trecho): return T(i, fr(i, trecho))
FIM = F[-1]["fim"] + SAIDA            # fim do vídeo, no relógio da narração
N = int(round((FIM + ENTRADA) * SR))  # a trilha começa junto com o vídeo
trilha = np.zeros(N)
def poe(x, t, ganho=1.0):
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

# ---------- uma batida ----------
def baque(dur, f0, f1, cheio=1.0):
    """um tum: seno grave caindo de f0 para f1, saturado de leve (para aparecer em alto-falante de celular)"""
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / (dur * 0.35))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = (1 - np.exp(-t / 0.004)) * np.exp(-t / (dur * 0.33))
    x = np.tanh(2.2 * x) * env
    pele = bp(np.random.default_rng(int(f0 * 10)).standard_normal(n), 120, 420) * np.exp(-t / 0.012) * 0.35
    return (x * (0.55 + 0.45 * cheio) + pele * cheio)

def batimento(t0, t1, bpm_de_t, forca=lambda t: 1.0, cheio=lambda t: 1.0):
    """batidas de t0 a t1; bpm_de_t(t) dá o ritmo; devolve o áudio e os instantes das batidas"""
    batidas, t = [], t0
    n = int((t1 - t0) * SR)
    x = np.zeros(n + SR)
    while t < t1:
        bpm = bpm_de_t(t)
        rr = 60 / bpm
        i = int((t - t0) * SR)
        dur = min(0.13, 0.6 * rr)
        c = cheio(t)
        lub = baque(dur, 75, 46, c) * forca(t)
        x[i:i + len(lub)] += lub
        if bpm < 260:  # o "tum-tum": a segunda batida, mais curta e um pouco mais aguda
            dub = baque(dur * 0.75, 92, 60, c) * 0.7 * forca(t)
            k = i + int(min(0.32, 0.38 * rr) * SR)
            x[k:k + len(dub)] += dub
        batidas.append(t)
        t += rr
    return x[:n], batidas

# ---------- o pad leve e os efeitos ----------
def pad(dur, notas, brilho=600, semente=0):
    r = np.random.default_rng(semente)
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f in notas:
        for d in (-0.15, 0.15):
            x += np.sin(2 * np.pi * f * (1 + d / 100) * t + r.uniform(0, 6.3)) + 0.3 * np.sin(2 * np.pi * 2 * f * t + r.uniform(0, 6.3))
    x *= 1 + 0.15 * np.sin(2 * np.pi * 0.18 * t)
    return norm(fade(lp(x, brilho), 1.2, 1.2))
def grilos(dur, semente=5):
    r = np.random.default_rng(semente)
    n = int(dur * SR); x = np.zeros(n); t = r.uniform(0, 0.4)
    while t < dur - 0.2:
        for k in range(3):
            i = int((t + k * 0.034) * SR); m = int(0.02 * SR)
            if i + m < n: x[i:i + m] += np.sin(2 * np.pi * 4600 * np.arange(m) / SR) * np.hanning(m)
        t += r.uniform(0.55, 0.95)
    return norm(x)
def bipe(f=880, dur=0.11):
    t = np.arange(int(dur * SR)) / SR
    return fade(np.sin(2 * np.pi * f * t) * 0.8 + 0.2 * np.sin(2 * np.pi * 2 * f * t), 0.004, 0.03)
def desce(dur, f0, f1):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dur), 0.01, 0.1)
def tremor(dur, semente=9):
    r = np.random.default_rng(semente)
    n = int(dur * SR); t = np.arange(n) / SR
    x = bp(r.standard_normal(n), 1800, 6500) * (0.5 + 0.5 * np.sin(2 * np.pi * 26 * t)) ** 2
    return norm(fade(x * np.sin(np.pi * t / dur), 0.05, 0.1))
def zum(dur, f0=180, f1=1200):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    x = bp(np.random.default_rng(3).standard_normal(len(t)), 300, 3000) * (t / dur) ** 2
    return norm(fade(x + 0.3 * np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / dur) ** 2, 0.01, 0.05))

# ================= a trilha =================
BEIJA = 1200
todas = []
def poe_batidas(t0, t1, bpm, ganho, **kw):
    x, bs = batimento(t0, t1, bpm, **kw)
    poe(fade(x, 0.01, 0.05), t0, ganho)
    todas.extend(bs)
    return bs

# 1-2: o zumbido de 20 batidas por segundo (desde o primeiro quadro, para o loop emendar)
poe_batidas(-ENTRADA, C(2), lambda t: BEIJA, 0.9)
# 3: tela dividida: o beija-flor baixinho, o seu coração (70) em primeiro plano
poe_batidas(C(2), C(3), lambda t: BEIJA, 0.25)
HUMANO = poe_batidas(C(2) + 0.1, C(3), lambda t: 70, 1.0)
# 4: o coração do beija-flor no seu peito: zumbido e alerta
poe_batidas(C(3), C(4), lambda t: BEIJA, 0.85)
for k in range(3): poe(bipe(), C(3) + 0.25 + k * 0.32, 0.5)
# 5: o coração enchendo no tempo normal
NORMAL = poe_batidas(C(4) + 0.15, C(5), lambda t: 70, 1.0)
# 6: acelerado: fecha antes de encher (batida fraca e vazia)
RAPIDO = poe_batidas(C(5), C(6), lambda t: 330 + 400 * min(1, (t - C(5)) / 1.5), 0.85, cheio=lambda t: 0.15)
# 7: falha e some (batidas irregulares cada vez mais fracas)
t_apaga = P(7, "e você apaga")
FALHA = []
t, rr = C(6), 0.2
r = np.random.default_rng(4)
while t < t_apaga + 0.25:
    k = (t - C(6)) / max(0.1, t_apaga + 0.25 - C(6))
    poe(baque(0.09, 70, 48, 0.2) * (1 - k) ** 1.5, t, 0.8)
    FALHA.append(t)
    t += rr * r.uniform(0.7, 1.9) * (1 + 1.5 * k)
todas.extend(FALHA)
# 8: silêncio (a queda e a tela preta)
# 9: a noite: pad escuro e grilos; o beija-flor pousado, coração em repouso (rápido, baixo)
t_noite = C(7)
poe(pad(FIM - t_noite - 3.5, [55, 82.4, 110], brilho=500), t_noite, 0.35)
poe(grilos(C(12) - t_noite), t_noite + 0.3, 0.18)
poe_batidas(t_noite + 0.4, C(9), lambda t: 250, 0.35)
# 10: a energia acabando
poe_batidas(C(9), C(10), lambda t: 250 - 60 * (t - C(9)) / (C(10) - C(9)), 0.35)
poe(desce(C(10) - C(9) - 0.2, 660, 160), C(9) + 0.1, 0.25)
# 11-12: quase desliga: o coração desacelera até umas 50, grave e espaçado
d11 = C(12) - C(10)
LENTO = poe_batidas(C(10), C(12), lambda t: max(50, 190 * (50 / 190) ** min(1, (t - C(10)) / (0.55 * d11))), 1.0,
                    forca=lambda t: 0.8 + 0.2 * min(1, (t - C(10)) / d11))
# 13: amanhece: treme, esquenta, e o coração volta a subir
poe(tremor(1.6), P(13, "treme") - 0.1, 0.45)
t_acel = P(13, "e acelera")
poe_batidas(C(12), t_acel, lambda t: 50 + 250 * ((t - C(12)) / (t_acel - C(12))) ** 2, 0.9)
# 14: acelera até o zumbido, o mesmo do começo
poe_batidas(t_acel, FIM, lambda t: 300 * (BEIJA / 300) ** min(1, (t - t_acel) / 1.6), 0.9)
poe(zum(1.6), t_acel, 0.2)

# ---------- a narração abaixa os efeitos enquanto fala ----------
sr_n, nar = wavfile.read(narr_wav)
nar = nar.astype(np.float64) / 32768 if nar.dtype == np.int16 else nar.astype(np.float64)
if nar.ndim > 1: nar = nar.mean(1)
if sr_n != SR: nar = signal.resample_poly(nar, SR, sr_n)
env = np.zeros(N); a0 = int(ENTRADA * SR); m = min(N - a0, len(nar)); env[a0:a0 + m] = np.abs(nar[:m])
janela = int(0.03 * SR)
env = np.convolve(env, np.ones(janela) / janela, mode="same")
fala = env > 0.02
k = int(0.15 * SR); fala = np.convolve(fala.astype(float), np.ones(k), mode="full")[:N] > 0
ganho = np.convolve(np.where(fala, 0.42, 1.0), np.ones(int(0.06 * SR)) / int(0.06 * SR), mode="same")
mix = trilha * ganho
voz_db = rms_db(nar[np.abs(nar) > 0.02])
pausa = ~fala & (np.abs(mix) > 1e-4)
mix *= 10 ** ((voz_db - 5 - rms_db(mix[pausa])) / 20)
mix = np.clip(mix, -0.97, 0.97)
wavfile.write(saida, SR, (mix * 32767).astype(np.int16))

# ---------- dados para o vídeo ----------
fq = lambda t: int(round((t + ENTRADA) * FPS))
NQ = fq(FIM)
bpm = np.zeros(NQ)
bs = sorted(set(round(b, 4) for b in todas))
for a, b in zip(bs[:-1], bs[1:]):
    bpm[fq(a):fq(b) + 1] = 60 / max(1e-3, b - a)
bpm[fq(bs[-1]):] = BEIJA
json.dump({
    "bpm": [round(float(v)) for v in bpm],
    "batidas": [fq(b) for b in bs],
    "humano": [fq(b) for b in HUMANO], "normal": [fq(b) for b in NORMAL], "rapido": [fq(b) for b in RAPIDO],
    "falha": [fq(b) for b in FALHA], "lento": [fq(b) for b in LENTO],
}, open(dados_json, "w"), separators=(",", ":"))
print(f"trilha: {N / SR:.1f} s · {len(bs)} batidas · nível na pausa {rms_db(mix[pausa]):.1f} dB (voz {voz_db:.1f} dB)")
