# Efeitos do Shorts "por que seu dedo estala", sintetizados: o estalo da junta, a garrafa abrindo (psst + chiado do gás)
# e o tique acelerado do relógio. uso: python3 scripts/sfx_dedo.py public/sfx
import sys, wave, numpy as np

SR = 44100
rng = np.random.default_rng(23)


def salva(nome, x, pico=0.8):
    x = x / max(1e-9, np.max(np.abs(x))) * pico
    with wave.open(f"{sys.argv[1]}/{nome}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def passa_alta(x, a=0.97):
    y = np.zeros_like(x); ax = ay = 0.0
    for i, v in enumerate(x):
        ay = a * (ay + v - ax); ax = v; y[i] = ay
    return y


def passa_baixa(x, a=0.2):
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y


t_ = lambda d: np.arange(int(d * SR)) / SR

# estalo da junta: um estalo seco e curto (clique de banda larga) com um corpo oco que some rápido
t = t_(0.18)
clique = passa_alta(rng.normal(0, 1, len(t)), 0.3) * np.exp(-t / 0.0025)
corpo = np.sin(2 * np.pi * 520 * t + 3 * np.exp(-t / 0.01)) * np.exp(-t / 0.018)
oco = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.03)
estalo = 1.0 * clique + 0.55 * corpo + 0.35 * oco
d = int(0.012 * SR)  # um segundo estalinho colado (o som tem duas batidas bem juntas)
estalo[d:] += 0.45 * estalo[:-d] * np.exp(-t[:-d] / 0.01)
salva("estalo", estalo, 0.9)

# garrafa abrindo: psst (chiado agudo que cai) + o gás chiando (estalinhos de bolha) por mais um tempo
t = t_(1.6)
psst = passa_alta(rng.normal(0, 1, len(t)), 0.92) * np.exp(-t / 0.18) * np.minimum(1, t / 0.01)
chiado = np.zeros_like(t)
for _ in range(900):
    s = int(rng.uniform(0.05, 1.55) * SR)
    n = int(0.004 * SR)
    if s + n < len(t):
        chiado[s:s + n] += rng.normal(0, 1, n) * np.exp(-np.arange(n) / (0.0008 * SR)) * np.exp(-t[s] / 0.9)
chiado = passa_alta(chiado, 0.8)
salva("garrafa", psst + 0.6 * chiado, 0.7)

# tique de relógio: clique de mecanismo
t = t_(0.04)
tique = passa_alta(rng.normal(0, 1, len(t)), 0.6) * np.exp(-t / 0.002) + 0.4 * np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.004)
salva("tique", tique, 0.6)
print("ok")
