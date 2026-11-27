# Junta a narração gerada fala por fala (scripts/gera_narracao_edge.py) numa trilha só, com as pausas escolhidas aqui,
# e grava os tempos de cada fala (falas_audio.json) para o vídeo. Como cada fala é um arquivo, não precisa transcrever
# para achar os cortes: o começo e o fim da voz saem do próprio arquivo.
# uso: python3 scripts/monta_narracao.py <pasta_das_falas> <falas.json> <saida.wav> <falas_audio.json> <video>
import json, subprocess, sys, wave
import numpy as np

SR = 44100
CONF = {
    # pausa (voz a voz) depois de cada fala: curta dentro do parágrafo, um pouco maior entre parágrafos e um respiro
    # nas viradas (antes do "Dez e dez", depois da pergunta da marca, no "É só design" e antes da pergunta final)
    "relogio": dict(dentro=0.24, paragrafo=0.32,
                    depois={1: 0.42, 2: 0.5, 3: 0.5, 11: 0.45, 12: 0.42, 18: 0.4, 23: 0.4, 24: 0.5, 27: 0.42}),
    # o mundo do GTA: respiro na virada da câmera, no "deixou de existir", nas revelações e antes da pergunta final
    "gtamundo": dict(dentro=0.2, paragrafo=0.27,
                     depois={2: 0.36, 3: 0.5, 4: 0.4, 6: 0.36, 11: 0.36, 15: 0.4, 17: 0.4, 20: 0.36, 23: 0.45, 24: 0.42,
                             30: 0.45, 31: 0.36, 32: 0.55}),
}
pasta, falas, saida, tempos_json, video = sys.argv[1:6]
cfg = CONF[video]
dados = json.load(open(falas, encoding="utf-8"))

def le(arq):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", arq, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768

def voz(x, limiar_db=-50, janela=0.01):
    """primeira e última amostra com voz (energia em janelas de 10 ms acima do limiar)"""
    n = int(janela * SR)
    q = len(x) // n
    db = 20 * np.log10(np.sqrt((x[: q * n].reshape(q, n) ** 2).mean(1)) + 1e-9)
    ativos = np.nonzero(db > limiar_db)[0]
    return ativos[0] * n, (ativos[-1] + 1) * n

ANTES, DEPOIS = 0.02, 0.06  # folga de silêncio mantida em volta da voz (respiração e cauda do som)
trilha, tempos, pos = [], [], 0.0
for i, d in enumerate(dados):
    x = le(f"{pasta}/f{d['id']:02d}.mp3")
    a, b = voz(x)
    a0, b0 = max(0, a - int(ANTES * SR)), min(len(x), b + int(DEPOIS * SR))
    if i == 0:
        trilha.append(np.zeros(int(ANTES * SR), np.float32)); pos += ANTES
        trecho = x[a:b0]
    else:
        trecho = x[a0:b0]
    ini = pos + (a - a0 if i else 0) / SR
    fim = ini + (b - a) / SR
    tempos.append({"id": d["id"], "ini": round(ini, 3), "fim": round(fim, 3)})
    trilha.append(trecho); pos += len(trecho) / SR
    if i + 1 < len(dados):
        pausa = cfg["depois"].get(d["id"], cfg["paragrafo"] if d["fimParagrafo"] else cfg["dentro"])
        resto = pausa - DEPOIS - ANTES  # o que falta de silêncio além das folgas dos dois lados
        trilha.append(np.zeros(max(0, int(resto * SR)), np.float32)); pos += max(0, int(resto * SR)) / SR
y = np.concatenate(trilha)
crua = saida.replace(".wav", "_cru.wav")
with wave.open(crua, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
# volume padrão de vídeo (-16 LUFS), limitador em -1,5 dB (o mesmo do sincroniza_narracao.py)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", crua, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), "-ac", "1", saida], check=True)
json.dump(tempos, open(tempos_json, "w"), indent=0)
print(f"trilha: {len(y) / SR:.1f} s · {len(tempos)} falas · voz {sum(t['fim'] - t['ini'] for t in tempos):.1f} s")
