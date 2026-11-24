# Efeitos sonoros do vídeo dos códigos de GTA, sintetizados (nada baixado), seguindo a tabela de efeitos do roteiro:
# toques de tecla, whoosh de materialização, ambiente submerso, baque surdo, bip de HUD (radar) e o tique do cursor.
# uso: python3 scripts/sfx_gta.py public/sfx
import sys, wave, numpy as np

SR = 44100
rng = np.random.default_rng(11)


def salva(nome, x, pico=0.8):
    x = x / max(1e-9, np.max(np.abs(x))) * pico
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(f"{sys.argv[1]}/{nome}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def passa_alta(x, a=0.97):  # um polo: tira o grave
    y = np.zeros_like(x); ant_x = ant_y = 0.0
    for i, v in enumerate(x):
        ant_y = a * (ant_y + v - ant_x); ant_x = v; y[i] = ant_y
    return y


def passa_baixa(x, a=0.2):
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y


def passa_banda(x, fc):  # filtro de variável de estado com corte variando no tempo (fc: array em Hz)
    y = np.zeros_like(x); low = band = 0.0; q = 0.6
    for i, v in enumerate(x):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR)
        low += f * band
        high = v - low - q * band
        band += f * high
        y[i] = band
    return y


t_ = lambda d: np.arange(int(d * SR)) / SR

# tecla: estalo seco do contato + um corpo curto embaixo + o retorno da tecla
t = t_(0.07)
tecla = passa_alta(rng.normal(0, 1, len(t)), 0.5) * np.exp(-t / 0.003)
tecla += 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.010)
o = int(0.028 * SR); m = len(t) - o
tecla[o:] += 0.35 * passa_alta(rng.normal(0, 1, m), 0.5) * np.exp(-t[:m] / 0.002)
salva("tecla", tecla, 0.8)

# whoosh de materialização (0,4 s): ruído com a banda subindo e descendo + um brilho subindo
t = t_(0.42)
k = t / t[-1]
fc = 350 + 3200 * np.sin(np.pi * k) ** 2
corpo = passa_banda(rng.normal(0, 1, len(t)), fc) * np.sin(np.pi * k) ** 1.5
brilho = np.sin(2 * np.pi * np.cumsum(1100 + 1500 * k) / SR) * np.sin(np.pi * np.clip(k * 1.4 - 0.2, 0, 1)) ** 2
salva("whoosh", corpo / np.max(np.abs(corpo)) + 0.12 * brilho, 0.75)

# submerso (4 s, emenda sem estalo): rumor grave abafado que respira devagar, com bolhas de vez em quando
D = 4.0; X = 0.5
t = t_(D + X)
marrom = np.cumsum(rng.normal(0, 1, len(t))); marrom -= passa_baixa(marrom, 0.0005)
rumor = passa_baixa(passa_baixa(marrom, 0.04), 0.04)
rumor = rumor / np.max(np.abs(rumor)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.25 * t))
bolhas = np.zeros_like(t)
for ini in [0.35, 0.9, 1.05, 1.9, 2.6, 2.72, 3.4]:
    n = int(0.05 * SR); tb = np.arange(n) / SR
    f = 280 + 900 * tb / tb[-1]
    s = int(ini * SR)
    bolhas[s:s + n] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tb / 0.015) * 0.35
sub = rumor + bolhas
ini, fim = sub[: int(X * SR)], sub[int(D * SR):]
r = np.linspace(0, 1, len(ini))
sub = sub[: int(D * SR)].copy(); sub[: len(ini)] = ini * r + fim * (1 - r)
salva("submerso", sub, 0.6)

# baque surdo: queda de tom no grave + ruído abafado curto
t = t_(0.55)
f = 75 * np.exp(-t / 0.25) + 42
baque = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13)
baque += 0.35 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR) * np.exp(-t / 0.06)
baque += 0.8 * passa_baixa(rng.normal(0, 1, len(t)), 0.03) * np.exp(-t / 0.03) * 6
salva("baque", baque, 0.9)

# HUD (1 s, repete): dois bips de radar, agudo e médio, com um eco curto
t = t_(1.0)
hud = np.zeros_like(t)
for ini, fr in [(0.0, 1320), (0.5, 990)]:
    n = int(0.07 * SR); tb = np.arange(n) / SR
    bip = np.sin(2 * np.pi * fr * tb) * np.minimum(1, tb / 0.004) * np.exp(-tb / 0.03)
    s = int(ini * SR); hud[s:s + n] += bip
    e = s + int(0.09 * SR); hud[e:e + n] += 0.25 * bip
salva("hud", hud, 0.5)

# tique do cursor: clique curtinho e limpo
t = t_(0.03)
cursor = np.sin(2 * np.pi * 2900 * t) * np.exp(-t / 0.003) + 0.3 * passa_alta(rng.normal(0, 1, len(t)), 0.5) * np.exp(-t / 0.0015)
salva("cursor", cursor, 0.5)
print("ok")
