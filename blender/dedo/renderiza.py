"""Renderiza os planos do Shorts em série (render.json), codifica cada um em MP4 para o Remotion e apaga os PNGs.
uso: python3 dedo/renderiza.py [amostras] [numeros...]"""
import json, os, subprocess, sys, time

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
PUB = os.path.join(RAIZ, "estudio", "public", "dedo")
CLIPES = os.path.join(RAIZ, "estudio", "src", "video", "dedo", "clipes.json")
amostras = sys.argv[1] if len(sys.argv) > 1 else "5"
so = [int(x) for x in sys.argv[2:]]
planos = json.load(open(os.path.join(AQUI, "render.json")))
os.makedirs(PUB, exist_ok=True)
t0 = time.time()
for p in planos:
    r, n = p["render"], p["quadros"]
    if so and r not in so:
        continue
    pasta = os.path.join(RAIZ, "out", "dedo", "final", f"p{r:02d}")
    subprocess.run(["rm", "-rf", pasta])
    extras = [f"{k}={v}" for k, v in p.items() if k.endswith("_u")]
    t = time.time()
    subprocess.run([os.path.join(RAIZ, "blender", ".venv", "bin", "python"), os.path.join(AQUI, "plano.py"), str(r), str(n), pasta, "final", amostras, *extras],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    mp4 = os.path.join(PUB, f"p{r:02d}.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "24", "-i", os.path.join(pasta, "q%04d.png"), "-c:v", "libx264", "-crf", "15",
                    "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], check=True)
    subprocess.run(["cp", os.path.join(pasta, "q0001.png"), os.path.join(RAIZ, "out", "dedo", "final", f"p{r:02d}_primeiro.png")])
    subprocess.run(["rm", "-rf", pasta])
    feitos = sorted(set(json.load(open(CLIPES)) + [r]))
    json.dump(feitos, open(CLIPES, "w"))
    print(f"plano {p['plano']} (render {r}): {n} quadros em {time.time() - t:.0f} s · total {time.time() - t0:.0f} s", flush=True)
print("FIM", flush=True)
