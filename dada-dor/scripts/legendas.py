"""Fase 1: whisper (medium, pt, timestamps por palavra) sobre narracao/narracao.mp3 -> narracao/captions.json.

O texto da legenda vem do roteiro (roteiro.txt), não do whisper: as palavras do roteiro são alinhadas às
do whisper (difflib) e herdam os tempos. Onde o whisper errou (Nav1.7, SCN9A, suzetrigine, Dadá, números),
o tempo vem da palavra alinhada ou é interpolado entre as vizinhas. Gera também narracao/correcoes.txt.
"""
import difflib, json, re, subprocess as sp
import numpy as np
from faster_whisper import WhisperModel

norm = lambda w: re.sub(r"[^\w]", "", w.lower())
roteiro = [w for w in open("narracao/roteiro.txt").read().split()]

pcm = sp.run(["ffmpeg", "-v", "error", "-i", "narracao/narracao.mp3", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
modelo = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = modelo.transcribe(np.frombuffer(pcm, np.float32), language="pt", word_timestamps=True, beam_size=5)
wh = [{"word": w.word.strip(), "start": w.start, "end": w.end} for s in segs for w in s.words]
json.dump(wh, open("narracao/whisper_bruto.json", "w"), ensure_ascii=False, indent=0)

sm = difflib.SequenceMatcher(a=[norm(w) for w in roteiro], b=[norm(w["word"]) for w in wh], autojunk=False)
tempos = [None] * len(roteiro)
correcoes = []
for tag, a0, a1, b0, b1 in sm.get_opcodes():
    if tag == "equal":
        for k in range(a1 - a0):
            tempos[a0 + k] = (wh[b0 + k]["start"], wh[b0 + k]["end"])
    elif tag in ("replace",) and b1 > b0:
        s, e = wh[b0]["start"], wh[b1 - 1]["end"]
        n = a1 - a0
        for k in range(n):
            tempos[a0 + k] = (s + (e - s) * k / n, s + (e - s) * (k + 1) / n)
        correcoes.append(f'{" ".join(w["word"] for w in wh[b0:b1])!r} -> {" ".join(roteiro[a0:a1])!r}')
    elif tag == "insert":
        correcoes.append(f'{" ".join(w["word"] for w in wh[b0:b1])!r} -> (descartado)')
# palavras do roteiro sem par no whisper ("delete"): interpola entre vizinhas
for i, t in enumerate(tempos):
    if t is None:
        prev = next((tempos[j][1] for j in range(i - 1, -1, -1) if tempos[j]), 0.0)
        nxt = next((tempos[j][0] for j in range(i + 1, len(tempos)) if tempos[j]), prev + 0.3)
        tempos[i] = (prev, max(prev + 0.05, min(nxt, prev + 0.4)))
        correcoes.append(f"(sem par) -> {roteiro[i]!r}")
caps = [{"word": w, "start": round(t[0], 3), "end": round(t[1], 3)} for w, t in zip(roteiro, tempos)]
json.dump(caps, open("narracao/captions.json", "w"), ensure_ascii=False, indent=0)
open("narracao/correcoes.txt", "w").write("\n".join(correcoes) + "\n")
iguais = sum(b.size for b in sm.get_matching_blocks())
print(f"roteiro {len(roteiro)} palavras | whisper {len(wh)} | iguais {iguais} ({iguais / len(roteiro):.0%})")
print("\n".join(correcoes))
