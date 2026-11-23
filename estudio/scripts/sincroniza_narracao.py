# Sincroniza a narração (5 partes do ElevenLabs) com as falas do roteiro e monta a trilha final.
# 1) alinha a transcrição (palavras com tempo) ao texto de cada fala; 2) acerta os limites de cada fala no ponto mais
#    silencioso entre uma fala e outra; 3) monta a narração inteira: encurta pausas longas, abre o respiro dos "Bip."
#    (que saíram da voz e viraram efeito) e junta as partes; 4) grava a trilha e os tempos de cada fala.
# uso: python3 scripts/sincroniza_narracao.py <asr.json> <falas.json> <saida.wav> <falas_audio.json>
import json, re, subprocess, sys, unicodedata, difflib
import numpy as np

SR = 44100
asr = json.load(open(sys.argv[1], encoding="utf-8"))
falas = json.load(open(sys.argv[2], encoding="utf-8"))
SO_SOM = {1, 6, 12, 255}                      # "Bip." viram som: a voz não fala
GAP_BIP = {1: 0.6, 6: 0.6, 12: 0.6, 255: 0.9}  # respiro em volta de cada bip (s)
BIP_EM = {1: 0.12, 6: 0.12, 12: 0.12, 255: 0.3}
PAUSA_MAX = 0.7        # pausas maiores que isso encolhem (vídeo mais vivo)
DRAMA = 252            # da mão tremendo em diante, as pausas ficam como a voz fez
ENTRE_PARTES = 0.6

def ini_parte(texto):
    return next(f["id"] for f in falas if f["texto"].startswith(texto))
cortes = [0, ini_parte("Mas, honestamente, o primeiro mês"), ini_parte("Então você vai atrás daquilo"), ini_parte("E existe um custo."), ini_parte("Você olha para o cartão."), len(falas)]

def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.replace("r$", "")
    return re.sub(r"[^a-z0-9]", "", s)

def decodifica(f):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768

def envelope(x, hop=0.01):
    n = int(hop * SR)
    k = len(x) // n
    r = np.sqrt(np.mean(x[: k * n].reshape(k, n) ** 2, axis=1) + 1e-12)
    return 20 * np.log10(r), hop

trilha, tempos, relatorio = [], {}, []
pos = 0.0  # segundos já escritos na trilha final
for p in range(5):
    dados = asr[str(p + 1)]
    x = decodifica(dados["arquivo"])
    db, hop = envelope(x)
    piso = np.percentile(db, 10)
    voz = db > piso + 14
    ids = [i for i in range(cortes[p], cortes[p + 1]) if i not in SO_SOM]
    # --- alinhamento por caracteres: roteiro x transcrição
    S, donoS = [], []
    for i in ids:
        for c in norm(falas[i]["texto"]): S.append(c); donoS.append(i)
    A, donoA = [], []
    for k, w in enumerate(dados["palavras"]):
        for c in norm(w["w"]): A.append(c); donoA.append(k)
    sm = difflib.SequenceMatcher(None, "".join(S), "".join(A), autojunk=False)
    casa = {}
    for a, b, n in sm.get_matching_blocks():
        for j in range(n):
            casa[a + j] = b + j
    faixa = {}
    for si, i in enumerate(donoS):
        if si in casa:
            w = dados["palavras"][donoA[casa[si]]]
            lo, hi = faixa.get(i, (1e9, -1e9))
            faixa[i] = (min(lo, w["a"]), max(hi, w["b"]))
    cobertura = sum(1 for si in range(len(S)) if si in casa) / max(1, len(S))
    # falas sem casamento (raro): entre as vizinhas
    for k, i in enumerate(ids):
        if i not in faixa:
            ant = faixa.get(ids[k - 1], (0, 0))[1] if k else 0
            prox = next((faixa[j][0] for j in ids[k + 1:] if j in faixa), dados["duracao"])
            faixa[i] = (ant + 0.05, max(ant + 0.3, prox - 0.05))
    # --- limites finos: corte no quadro mais silencioso entre uma fala e a próxima
    ini = {i: faixa[i][0] for i in ids}
    fim = {i: faixa[i][1] for i in ids}
    def quadro(t): return int(np.clip(t / hop, 0, len(db) - 1))
    for k in range(len(ids) - 1):
        i, j = ids[k], ids[k + 1]
        a, b = quadro(min(fim[i], ini[j]) - 0.25), quadro(max(fim[i], ini[j]) + 0.25)
        c = a + int(np.argmin(db[a:b + 1])) if b > a else a
        e = c
        while e > quadro(ini[i]) and not voz[e]: e -= 1
        s = c
        while s < quadro(fim[j]) and not voz[s]: s += 1
        fim[i] = max(ini[i] + 0.15, (e + 1) * hop)
        ini[j] = min(fim[j] - 0.15, s * hop)
    # começo da primeira e fim da última fala da parte: pela voz
    q = quadro(ini[ids[0]] - 0.3)
    while q < len(voz) - 1 and not voz[q]: q += 1
    ini[ids[0]] = q * hop
    q = quadro(fim[ids[-1]] + 0.4)
    while q > 0 and not voz[q]: q -= 1
    fim[ids[-1]] = (q + 1) * hop
    # --- monta: cada fala com uma folga, pausas encurtadas, respiro dos bips
    PRE, POS = 0.04, 0.10
    if p > 0:
        trilha.append(np.zeros(int(ENTRE_PARTES * SR), np.float32)); pos += ENTRE_PARTES
    for k, i in enumerate(ids):
        a, b = max(0.0, ini[i] - PRE), min(len(x) / SR, fim[i] + POS)
        trecho = x[int(a * SR): int(b * SR)]
        tempos[i] = (pos + (ini[i] - a), pos + (ini[i] - a) + (fim[i] - ini[i]))
        trilha.append(trecho); pos += len(trecho) / SR
        if k + 1 < len(ids):
            j = ids[k + 1]
            pausa_orig = max(0.0, (ini[j] - PRE) - b)
            bip = next((s for s in SO_SOM if i < s < j), None)
            if bip is not None:
                alvo = GAP_BIP[bip]
                tempos[bip] = (pos + BIP_EM[bip], pos + BIP_EM[bip] + 0.3)
            elif i >= DRAMA:
                alvo = pausa_orig
            else:
                alvo = min(pausa_orig, PAUSA_MAX)
            # silêncio: o começo da pausa original (respiração) e o resto em silêncio digital
            meio = x[int(b * SR): int((b + min(pausa_orig, alvo)) * SR)]
            trilha.append(meio)
            falta = alvo - len(meio) / SR
            if falta > 0: trilha.append(np.zeros(int(falta * SR), np.float32))
            pos += len(meio) / SR + max(0.0, falta)
    relatorio.append(f"parte {p + 1}: falas {ids[0]}-{ids[-1]} · cobertura do texto {cobertura:.0%} · {dados['duracao']:.1f}s na voz")

y = np.concatenate(trilha)
crua = sys.argv[3].replace(".wav", "_cru.wav")
import wave
with wave.open(crua, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
# volume padrão de vídeo (-16 LUFS), limitador em -1,5 dB
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", crua, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), "-ac", "1", sys.argv[3]], check=True)
json.dump([{"id": i, "ini": round(tempos[i][0], 3), "fim": round(tempos[i][1], 3)} for i in sorted(tempos)], open(sys.argv[4], "w"), indent=0)
for r in relatorio: print(r)
print(f"trilha: {len(y) / SR:.1f} s · {len(tempos)} falas com tempo")
