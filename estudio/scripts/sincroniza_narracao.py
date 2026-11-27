# Sincroniza a narração (5 partes do ElevenLabs) com as falas do roteiro e monta a trilha final.
# 1) alinha a transcrição (palavras com tempo) ao texto de cada fala; 2) acerta os limites de cada fala no ponto mais
#    silencioso entre uma fala e outra; 3) monta a narração inteira: encurta pausas longas, abre o respiro dos "Bip."
#    (que saíram da voz e viraram efeito) e junta as partes; 4) grava a trilha e os tempos de cada fala.
# uso: python3 scripts/sincroniza_narracao.py <asr.json> <falas.json> <saida.wav> <falas_audio.json> [cartao|gta|dedo|gtamundo]
import json, re, subprocess, sys, unicodedata, difflib
import numpy as np

SR = 44100
asr = json.load(open(sys.argv[1], encoding="utf-8"))
falas = json.load(open(sys.argv[2], encoding="utf-8"))
VIDEO = sys.argv[5] if len(sys.argv) > 5 else "cartao"
CONF = {
    # vídeo 1: cinco partes; os "Bip." viram som; da mão tremendo em diante as pausas ficam como a voz fez
    "cartao": dict(partes=["Mas, honestamente, o primeiro mês", "Então você vai atrás daquilo", "E existe um custo.", "Você olha para o cartão."],
                   so_som={1, 6, 12, 255}, gap_bip={1: 0.6, 6: 0.6, 12: 0.6, 255: 0.9}, bip_em={1: 0.12, 6: 0.12, 12: 0.12, 255: 0.3},
                   drama=252, pausa_fixa={}, janela_esq=0.25, janela_dir=0.25, perto_da_transcricao=False),
    # vídeo 2: três partes; pausas pedidas no roteiro (de voz a voz, em segundos): os quatro toques de tecla depois da
    # fala 0, a tela branca de 1,5 s depois da 5, o silêncio de 1 s antes e depois do "Dois milhões." (28 e 29);
    # no final, um respiro antes e depois do "Téo fecha o teclado." e antes da pergunta. A busca do ponto de corte vai
    # mais longe para a direita: a transcrição às vezes cola a palavra seguinte no fim da fala (sem enxergar a pausa)
    "gta": dict(partes=["Téo aprende a lição", "Sobrou o último código"], so_som=set(), gap_bip={}, bip_em={},
                drama=999, pausa_fixa={0: 1.1, 5: 1.8, 28: 1.0, 29: 1.0, 95: 0.8, 96: 0.8, 97: 1.0}, janela_esq=0.4, janela_dir=0.5, perto_da_transcricao=True),
    # Shorts do dedo: uma parte só, pausas curtas (ritmo de vídeo curto)
    "dedo": dict(partes=[], so_som=set(), gap_bip={}, bip_em={}, drama=999, pausa_fixa={}, pausa_max=0.3,
                 janela_esq=0.4, janela_dir=0.5, perto_da_transcricao=True),
    "gtamundo": dict(partes=[], so_som=set(), gap_bip={}, bip_em={}, drama=999, pausa_fixa={}, pausa_max=0.3,
                     janela_esq=0.4, janela_dir=0.5, perto_da_transcricao=True),
}[VIDEO]
SO_SOM = CONF["so_som"]          # falas que viram som: a voz não fala
GAP_BIP = CONF["gap_bip"]        # respiro em volta de cada som (s)
BIP_EM = CONF["bip_em"]
PAUSA_MAX = CONF.get("pausa_max", 0.7)  # pausas maiores que isso encolhem (vídeo mais vivo)
DRAMA = CONF["drama"]
PAUSA_FIXA = CONF["pausa_fixa"]
JANELA_ESQ = CONF["janela_esq"]  # até onde (s) a busca do silêncio entre duas falas vai antes do fim da fala
JANELA_DIR = CONF["janela_dir"]  # e depois do começo da seguinte
# escolhe o corte pelo silêncio mais fundo, mas desconta a distância até a pausa que a transcrição viu (20 dB por segundo
# fora dela): entre duas pausas curtas parecidas fica a da transcrição; uma pausa funda um pouco depois ainda ganha
PERTO = CONF["perto_da_transcricao"]
ENTRE_PARTES = 0.6

def ini_parte(texto):
    return next(f["id"] for f in falas if f["texto"].startswith(texto))
cortes = [0] + [ini_parte(t) for t in CONF["partes"]] + [len(falas)]
NP = len(cortes) - 1

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

# cada parte é reconhecida pelo começo do texto (os arquivos podem chegar fora de ordem)
def parecido(a, b):
    return difflib.SequenceMatcher(None, norm(a)[:60], norm(b)[:60], autojunk=False).ratio()
ordem = []
for p in range(NP):
    primeira = next(f["texto"] for f in falas[cortes[p]:] if f["id"] not in SO_SOM)
    ordem.append(max(asr, key=lambda k: parecido(" ".join(s[2] for s in asr[k]["segmentos"][:3]), primeira)))
assert len(set(ordem)) == NP, ordem

trilha, tempos, relatorio = [], {}, []
pos = 0.0  # segundos já escritos na trilha final
for p in range(NP):
    dados = asr[ordem[p]]
    x = decodifica(dados["arquivo"])
    db, hop = envelope(x)
    piso = np.percentile(db, 10)
    voz = db > piso + 10
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
        a, b = quadro(min(fim[i], ini[j]) - JANELA_ESQ), quadro(max(fim[i], ini[j]) + JANELA_DIR)
        if b > a and PERTO:
            liso = np.convolve(db, np.ones(3) / 3, mode="same")[a:b + 1]
            t0, t1 = min(fim[i], ini[j]), max(fim[i], ini[j])
            ts = (a + np.arange(len(liso))) * hop
            fora = np.maximum(0, np.maximum(t0 - ts, ts - t1))
            c = a + int(np.argmin(liso + 20 * fora))
        else:
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
    PRE, POS = 0.08, 0.12
    if p > 0:
        trilha.append(np.zeros(int(ENTRE_PARTES * SR), np.float32)); pos += ENTRE_PARTES
    copiado = 0.0  # até onde o áudio desta parte já foi copiado (nada se repete)
    for k, i in enumerate(ids):
        a, b = max(0.0, ini[i] - PRE, copiado), min(len(x) / SR, fim[i] + POS)
        if k + 1 < len(ids): b = min(b, max(a + 0.05, ini[ids[k + 1]] - PRE))
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
            elif i in PAUSA_FIXA:  # de voz a voz: tira as folgas PRE e POS que já estão nos trechos
                alvo = max(0.0, PAUSA_FIXA[i] - PRE - POS)
            elif i >= DRAMA:
                alvo = pausa_orig
            else:
                alvo = min(pausa_orig, PAUSA_MAX)
            # pausa: se encolhe, corta o MEIO da pausa original (guarda o fim da fala e o começo da próxima);
            # se cresce (respiro do bip), completa com silêncio no meio
            prox = max(b, ini[j] - PRE)
            if pausa_orig >= alvo:
                meia = alvo / 2
                partes_p = [x[int(b * SR): int((b + meia) * SR)], x[int((prox - meia) * SR): int(prox * SR)]]
            else:
                meia = pausa_orig / 2
                partes_p = [x[int(b * SR): int((b + meia) * SR)], np.zeros(int((alvo - pausa_orig) * SR), np.float32), x[int((prox - meia) * SR): int(prox * SR)]]
            for q in partes_p:
                trilha.append(q); pos += len(q) / SR
            copiado = prox
        else:
            copiado = b
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
