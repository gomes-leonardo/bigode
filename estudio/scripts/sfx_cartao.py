# Efeitos sonoros do vídeo do cartão infinito, sintetizados (nada baixado): bip da maquininha, telefone tocando,
# batida na porta e clique de câmera. uso: python3 scripts/sfx_cartao.py public/sfx
import sys, wave, numpy as np

SR = 44100
rng = np.random.default_rng(7)

def env(n, ataque, soltura):
    e = np.ones(n)
    a, s = int(ataque * SR), int(soltura * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if s: e[-s:] = np.linspace(1, 0, s)
    return e

def salva(nome, x, pico=0.8):
    x = x / max(1e-9, np.max(np.abs(x))) * pico
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(f"{sys.argv[1]}/{nome}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def passa_alta(x, a=0.97):  # filtro simples de um polo (tira o grave)
    y = np.zeros_like(x); ant_x = ant_y = 0.0
    for i, v in enumerate(x):
        ant_y = a * (ant_y + v - ant_x); ant_x = v; y[i] = ant_y
    return y

def passa_baixa(x, a=0.2):
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y

# bip da maquininha: apito de buzzer (onda quase quadrada: harmônicos ímpares), curto, com um resto de eco bem leve
n = int(0.15 * SR); t = np.arange(n) / SR
f0 = 2400
bip = (np.sin(2 * np.pi * f0 * t) + 0.3 * np.sin(2 * np.pi * 3 * f0 * t) + 0.12 * np.sin(2 * np.pi * 5 * f0 * t)) * env(n, 0.002, 0.02)
bip = np.concatenate([bip, np.zeros(int(0.12 * SR))])
eco = np.zeros_like(bip); d = int(0.045 * SR); eco[d:] = 0.18 * bip[:-d]
salva("bip", bip + eco, 0.7)

# telefone: dois toques "trim" (dois tons alternando 20 vezes por segundo), pausa curta; 2,4 s, feito para repetir
def toque(d):
    n = int(d * SR); t = np.arange(n) / SR
    f = np.where((np.floor(t * 20) % 2) == 0, 1400, 1750)
    fase = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(fase) + 0.25 * np.sin(2 * fase)) * env(n, 0.01, 0.04)
tel = np.concatenate([toque(0.85), np.zeros(int(0.3 * SR)), toque(0.85), np.zeros(int(0.4 * SR))])
salva("telefone", tel, 0.5)

# batida na porta: baque grave curto + estalo de madeira
n = int(0.2 * SR); t = np.arange(n) / SR
baque = np.sin(2 * np.pi * 130 * t) * np.exp(-t / 0.035)
madeira = passa_baixa(passa_alta(rng.normal(0, 1, n), 0.9), 0.35) * np.exp(-t / 0.012)
salva("toc", baque * 0.9 + madeira * 1.6, 0.85)

# clique de câmera: dois estalos secos (abre e fecha o obturador)
def estalo(n, tau):
    t = np.arange(n) / SR
    return passa_alta(rng.normal(0, 1, n), 0.6) * np.exp(-t / tau)
n = int(0.12 * SR)
clique = np.zeros(n)
clique[: int(0.03 * SR)] += estalo(int(0.03 * SR), 0.004)
o = int(0.055 * SR); clique[o : o + int(0.03 * SR)] += 0.8 * estalo(int(0.03 * SR), 0.005)
salva("clique", clique, 0.6)
print("ok")
