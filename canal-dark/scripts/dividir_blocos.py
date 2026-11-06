"""Divide narrações contínuas em bloco_XX.wav (um por bloco do roteiro) e normaliza a narração em -14 LUFS (com saturação tanh bem sutil: textura, não distorção).

Uso: python scripts/dividir_blocos.py  (lê scripts/blocos_onze_setembro.json)
O corte é feito no meio do silêncio entre a última palavra de um bloco e a primeira do seguinte,
usando os tempos de palavra do faster-whisper (arquivo <audio>.words.json, gerado por transcrever.py).
"""
import json, re, subprocess as sp, sys

CFG = sys.argv[1] if len(sys.argv) > 1 else "scripts/blocos_onze_setembro.json"
cfg = json.load(open(CFG))
OUT = cfg["saida"]
ALVO = cfg.get("lufs", -14)

def ff(*a): sp.run(["ffmpeg", "-y", "-v", "error", *a], check=True)
def lufs(f):
    o = sp.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])

cortes = []
for arq in cfg["arquivos"]:
    words = json.load(open(arq["audio"] + ".words.json"))
    dur = float(sp.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", arq["audio"]], capture_output=True, text=True).stdout)
    inicios = [min(words, key=lambda w: abs(w["s"] - t)) for t in arq["inicio_blocos"]]   # palavra que abre cada bloco
    for i, w in enumerate(inicios):
        idx = words.index(w)
        a = 0.0 if idx == 0 else (words[idx - 1]["e"] + w["s"]) / 2
        if i + 1 < len(inicios):
            nxt = words.index(inicios[i + 1]); b = (words[nxt - 1]["e"] + inicios[i + 1]["s"]) / 2
        else:
            b = dur
        cortes.append((arq["audio"], round(a, 3), round(b, 3)))

# mesmo ganho para todos os blocos: normaliza a narração inteira, não cada bloco
ff(*sum([["-i", a] for a in dict.fromkeys(c[0] for c in cortes)], []), "-filter_complex",
   f"concat=n={len(set(c[0] for c in cortes))}:v=0:a=1", f"{OUT}/_narracao_completa.wav")
i, _ = lufs(f"{OUT}/_narracao_completa.wav")
ganho = ALVO - i
for passada in range(3):  # a saturação muda a loudness; ajusta o ganho até cair em ALVO ±0,2 LU
    for n, (src, a, b) in enumerate(cortes, 1):
        dst = f"{OUT}/bloco_{n:02d}.wav"
        # atrim + asetpts: o bloco começa em t=0, então o fade-out cai no fim do bloco (com -ss de saída, caía no tempo do original)
        ff("-i", src, "-af",
           f"atrim={a}:{b},asetpts=PTS-STARTPTS,volume={ganho:.2f}dB,highpass=f=70,volume=2dB,asoftclip=type=tanh,volume=-2dB,alimiter=limit=0.84:level=false:attack=1:release=50,afade=t=in:d=0.02,afade=t=out:st={b - a - 0.04:.3f}:d=0.04",
           "-ar", "48000", "-ac", "1", dst)
        print(f"bloco_{n:02d}  {b - a:5.2f}s   ({src.split('/')[-1]} {a:.2f}–{b:.2f})")
    ff(*sum([["-i", f"{OUT}/bloco_{n:02d}.wav"] for n in range(1, len(cortes) + 1)], []), "-filter_complex",
       f"concat=n={len(cortes)}:v=0:a=1", f"{OUT}/_narracao_completa.wav")
    medido, _ = lufs(f"{OUT}/_narracao_completa.wav")
    if abs(medido - ALVO) <= 0.2: break
    ganho += ALVO - medido
print("narração: %.1f LUFS, pico %.1f dBFS" % lufs(f"{OUT}/_narracao_completa.wav"))
