"""Fatia uma gravação do ElevenLabs com o roteiro inteiro em uma fala por arquivo.
Alinha as palavras transcritas (faster-whisper) com o texto do roteiro e corta cada fala da voz pedida.
Uso: .venv/bin/python teo/fatiar_eleven.py teo/eleven/vozB.mp3 teo/_vozB.json B
Saída: teo/eleven/falas/<plano>_<i>.wav (as falas dessa voz)."""
import difflib, json, os, re, subprocess as sp, sys, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from roteiro_teo import PLANOS

audio, trans, voz = sys.argv[1], sys.argv[2], sys.argv[3]
norm = lambda w: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", w.lower()).encode("ascii", "ignore").decode())
palavras = [(norm(w), a, b) for s in json.load(open(trans)) for (w, a, b) in s["palavras"] if norm(w)]
rot = []  # (token, plano, i)
for p in PLANOS:
    for i, (v, _, texto) in enumerate(p["falas"]):
        for w in texto.split():
            if norm(w):
                rot.append((norm(w), p["id"], i, v))
sm = difflib.SequenceMatcher(None, [r[0] for r in rot], [w[0] for w in palavras], autojunk=False)
tempo = {}
for a, b, n in sm.get_matching_blocks():
    for k in range(n):
        _, pid, i, v = rot[a + k]
        _, ini, fim = palavras[b + k]
        t = tempo.setdefault((pid, i, v), [ini, fim, 0])
        t[0], t[1], t[2] = min(t[0], ini), max(t[1], fim), t[2] + 1
os.makedirs("teo/eleven/falas", exist_ok=True)
falas = sorted(tempo.items(), key=lambda kv: kv[1][0])
total = {(p["id"], i): len([w for w in t.split() if norm(w)]) for p in PLANOS for i, (_, _, t) in enumerate(p["falas"])}
for j, ((pid, i, v), (ini, fim, n)) in enumerate(falas):
    if v != voz:
        continue
    ant = falas[j - 1][1][1] if j else 0
    prox = falas[j + 1][1][0] if j + 1 < len(falas) else fim + 1
    a = max(ant + 0.02, ini - 0.12)
    b = min(prox - 0.02, fim + 0.18)
    dst = f"teo/eleven/falas/{pid}_{i}.wav"
    sp.run(["ffmpeg", "-y", "-v", "error", "-i", audio, "-af", f"atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse", "-ar", "48000", "-ac", "1", dst], check=True)
    print(f"{pid:15s} {i}  {a:7.2f}-{b:7.2f}  palavras {n}/{total[(pid, i)]}")
