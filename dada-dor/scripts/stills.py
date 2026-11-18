"""Stills de revisão: meio de cada cena (+ quadros extras) e folhas de contato em exportacao/stills/."""
import json, os, subprocess as sp, sys
T = json.load(open("src/tempos.json")); fps = 30
quadros = {round((t["start"] + t["duration"] / 2) * fps): f"c{t['id']:02d}" for t in T}
for q in (sys.argv[1].split(",") if len(sys.argv) > 1 else []):
    quadros[int(q)] = f"q{int(q)}"
out = "exportacao/stills"; os.makedirs(out, exist_ok=True)
sp.run(["npx", "remotion", "render", "Video", f"{out}/raw", f"--frames={','.join(map(str, sorted(quadros)))}", "--image-format=png", "--log=error", "--overwrite"], check=True)
nomes = []
for f in sorted(os.listdir(f"{out}/raw")):
    n = int("".join(c for c in f if c.isdigit()))
    if n in quadros:
        dst = f"{out}/{quadros[n]}_f{n:05d}.png"; os.replace(f"{out}/raw/{f}", dst); nomes.append(dst)
nomes.sort()
for k in range(0, len(nomes), 8):
    sp.run(["montage", *nomes[k:k + 8], "-tile", "4x2", "-geometry", "480x270+4+4", "-background", "#222", f"{out}/folha_{k // 8 + 1}.png"], check=True)
print(len(nomes), "stills")
