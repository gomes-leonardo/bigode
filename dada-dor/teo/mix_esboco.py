"""Mixa as falas do esboço + toc/clac nos instantes de src/teo/esboco.json -> public/teo/esboco.wav (-16 LUFS)."""
import json, subprocess as sp
d = json.load(open("src/teo/esboco.json"))
ent = [(f["inicio"], f"teo/falas/esboco_{i}.wav", 1.0) for i, f in enumerate(d["falas"])]
ent += [(s["em"], f"teo/{s['nome']}.wav", 0.55) for s in d["sfx"]]
args, filt = [], []
for i, (t, arq, g) in enumerate(ent):
    args += ["-i", arq]
    filt.append(f"[{i}]aresample=48000,volume={g},adelay={int(t*1000)}|{int(t*1000)}[a{i}]")
filt.append("".join(f"[a{i}]" for i in range(len(ent))) + f"amix=inputs={len(ent)}:normalize=0,apad,atrim=0:{d['duracao']},loudnorm=I=-19:TP=-2:LRA=11,aresample=48000,pan=stereo|c0=c0|c1=c0[o]")
sp.run(["ffmpeg", "-y", "-v", "error", *args, "-filter_complex", ";".join(filt), "-map", "[o]", "-ar", "48000", "public/teo/esboco.wav"], check=True)
print("ok")
