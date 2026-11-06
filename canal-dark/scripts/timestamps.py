"""Tempo de cada palavra dos blocos (faster-whisper small, CPU) -> public/timestamps.json.

Uso: python scripts/timestamps.py [scripts/blocos_onze_setembro.json]
Lê public/audio/bloco_XX.wav, aplica as correções de transcrição e marca as palavras-chave (destaques).
A legenda segue o formato Caption do @remotion/captions (tempos em ms desde o início do vídeo) + "destaque".
"""
import glob, json, re, subprocess as sp, sys
import numpy as np
from faster_whisper import WhisperModel

cfg = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "scripts/blocos_onze_setembro.json"))
pasta, respiro = cfg["saida"], cfg.get("respiro_s", 0.3)
norm = lambda w: re.sub(r"[^\wÀ-ú0-9-]", "", w).lower().strip("-")

def corrigir(toks, de, para):
    src, dst = de.split(), para.split()
    for i in range(len(toks) - len(src) + 1):
        if [norm(t["w"]) for t in toks[i:i + len(src)]] == [norm(s) for s in src]:
            s, e = toks[i]["s"], toks[i + len(src) - 1]["e"]
            pont = re.findall(r"[.,?!…:]+$", toks[i + len(src) - 1]["w"])
            if pont and not re.search(r"[.,?!…:]$", dst[-1]): dst = dst[:-1] + [dst[-1] + pont[0]]
            novos = [{"w": w, "s": s + (e - s) * k / len(dst), "e": s + (e - s) * (k + 1) / len(dst)} for k, w in enumerate(dst)]
            if len(dst) == len(src): novos = [{"w": w, "s": t["s"], "e": t["e"]} for w, t in zip(dst, toks[i:i + len(src)])]
            return toks[:i] + novos + toks[i + len(src):]
    return toks

modelo = WhisperModel("small", device="cpu", compute_type="int8")
blocos, t0 = [], 0.0
for arq in sorted(glob.glob(f"{pasta}/bloco_*.wav")):
    pcm = sp.run(["ffmpeg", "-v", "error", "-i", arq, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    dur = len(pcm) / 4 / 16000
    segs, _ = modelo.transcribe(np.frombuffer(pcm, np.float32), language="pt", word_timestamps=True)
    toks = [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in s.words]
    for de, para in cfg.get("correcoes", []): toks = corrigir(toks, de, para)
    for frase in cfg.get("destaques", []):
        f = [norm(x) for x in frase.split()]
        for i in range(len(toks) - len(f) + 1):
            if [norm(t["w"]) for t in toks[i:i + len(f)]] == f:
                for t in toks[i:i + len(f)]: t["destaque"] = True
    legenda = [{"text": t["w"], "startMs": round((t0 + t["s"]) * 1000), "endMs": round((t0 + t["e"]) * 1000),
                "timestampMs": None, "confidence": None, "destaque": bool(t.get("destaque"))} for t in toks]
    nome = arq.split("/")[-1]
    blocos.append({"id": nome[:-4], "arquivo": f"audio/{nome}", "inicioMs": round(t0 * 1000), "duracaoMs": round((dur + respiro) * 1000), "legenda": legenda})
    print(f"{nome}: {dur:.2f}s  " + " ".join(("*" if x["destaque"] else "") + x["text"] for x in legenda))
    t0 += dur + respiro
json.dump({"estimado": False, "duracaoMs": round(t0 * 1000), "blocos": blocos}, open("public/timestamps.json", "w"), ensure_ascii=False, indent=1)
print(f"total {t0:.2f}s")
