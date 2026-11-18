"""Confere planos: renderiza um trecho em baixa resolução e monta uma grade de quadros.
Uso: .venv/bin/python teo/stills.py c1_noite:1.0 c1_quina:3.6 ... [--saida grade.png]"""
import json, os, subprocess as sp, sys
args = [a for a in sys.argv[1:] if not a.startswith("--")]
saida = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--saida=")), "/tmp/claude-0/-home-user-bigode/dfee3a3f-5c88-514e-9270-06ac83a27a69/scratchpad/teo/grade.png")
comp = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--comp=")), "VideoTeo")
tlp = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--tl=")), "src/teo/timeline.json")
tl = json.load(open(tlp))
ini = {p["id"]: p["inicio"] for p in tl["planos"]}
quadros = []
for a in args:
    pid, t = a.split(":")
    quadros.append(round((ini[pid] + float(t)) * 30))
d = os.path.dirname(saida)
os.makedirs(d, exist_ok=True)
lo, hi = min(quadros), max(quadros)
vid = f"{d}/_trecho.mp4"
sp.run(["npx", "remotion", "render", comp, vid, f"--frames={lo}-{hi}", "--scale=0.4", "--concurrency=4", "--log=error", "--muted", "--overwrite"], check=True)
imgs = []
for i, q in enumerate(quadros):
    out = f"{d}/_q{i}.png"
    sp.run(["ffmpeg", "-v", "error", "-y", "-i", vid, "-vf", f"select=eq(n\\,{q - lo})", "-frames:v", "1", out], check=True)
    imgs.append(out)
cols = 4
linhas = []
for r in range(0, len(imgs), cols):
    grupo = imgs[r:r + cols]
    while len(grupo) < cols:
        grupo.append(grupo[-1])
    o = f"{d}/_l{r}.png"
    sp.run(["ffmpeg", "-v", "error", "-y", *sum([["-i", g] for g in grupo], []), "-filter_complex", "".join(f"[{i}]" for i in range(cols)) + f"hstack={cols}", o], check=True)
    linhas.append(o)
if len(linhas) == 1:
    os.replace(linhas[0], saida)
else:
    sp.run(["ffmpeg", "-v", "error", "-y", *sum([["-i", l] for l in linhas], []), "-filter_complex", "".join(f"[{i}]" for i in range(len(linhas))) + f"vstack={len(linhas)}", saida], check=True)
print(saida)
