"""Stills de revisão do v2: quadros escolhidos de cada plano + folhas de contato (exportacao/v2/)."""
import json, os, subprocess as sp, sys
T = json.load(open("src/v2/timeline.json")); fps = 30
pos = [float(x) for x in (sys.argv[1].split(",") if len(sys.argv) > 1 else ["0.5"])]  # frações do plano
quadros = {}
for p in T["planos"]:
    for fr in pos:
        quadros[round((p["inicio"] + p["duracao"] * fr) * fps)] = f'{p["id"]}_{int(fr * 100):02d}'
out = "exportacao/v2/stills"; os.makedirs(out, exist_ok=True)
sp.run(["npx", "remotion", "render", "VideoV2", f"{out}/raw", f"--frames={','.join(map(str, sorted(quadros)))}", "--image-format=jpeg", "--log=error", "--overwrite", "--concurrency=4"], check=True)
nomes = []
for f in sorted(os.listdir(f"{out}/raw")):
    n = int("".join(c for c in f if c.isdigit()))
    if n in quadros:
        dst = f"{out}/{n:05d}_{quadros[n]}.jpg"; os.replace(f"{out}/raw/{f}", dst); nomes.append(dst)
nomes.sort()
for k in range(0, len(nomes), 12):
    sp.run(["montage", *nomes[k:k + 12], "-tile", "4x3", "-geometry", "480x270+3+3", "-background", "#111", "-pointsize", "16", "-fill", "white", "-label", "%t", f"exportacao/v2/folha_{k // 12 + 1}.jpg"], check=True)
print(len(nomes), "stills")
