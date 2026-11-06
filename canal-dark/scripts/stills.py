"""Renderiza stills (1º, meio e último quadro de cada cena) e monta folhas de contato.

Uso: python3 scripts/stills.py [pasta_saida] [--extra 123,456]
Os quadros vêm de public/timestamps.json (mesma conta do <Series> da composição).
"""
import json, os, subprocess as sp, sys

saida = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else "out/stills"
T = json.load(open("public/timestamps.json"))
fps, quadros, rotulos, ini = 30, [], [], 0
for i, b in enumerate(T["blocos"], 1):
    d = round(b["duracaoMs"] / 1000 * fps)
    for nome, q in (("ini", ini), ("meio", ini + d // 2), ("fim", ini + d - 1)):
        quadros.append(q); rotulos.append(f"c{i:02d}-{nome}")
    ini += d
if "--extra" in sys.argv:
    for q in sys.argv[sys.argv.index("--extra") + 1].split(","):
        quadros.append(int(q)); rotulos.append(f"q{int(q):04d}")
os.makedirs(saida, exist_ok=True)
sp.run(["npx", "remotion", "render", "OnzeDeSetembro", f"{saida}/q", f"--frames={','.join(map(str, sorted(set(quadros))))}",
        "--image-format=png", "--log=error", "--overwrite"], check=True)
# nomes legíveis: c03-meio_q0612.png
arquivos = {}
for f in sorted(os.listdir(f"{saida}/q")):
    n = int("".join(ch for ch in f if ch.isdigit()) or -1)
    arquivos[n] = f"{saida}/q/{f}"
nomes = []
for q, r in zip(quadros, rotulos):
    dst = f"{saida}/{r}_q{q:04d}.png"
    if q in arquivos: os.replace(arquivos.pop(q), dst) if not os.path.exists(dst) else None; nomes.append(dst)
for k in range(0, len(nomes), 9):
    sp.run(["montage", *nomes[k:k + 9], "-tile", "9x1", "-geometry", "300x533+4+4", "-background", "#333",
            "-title", f"cenas {k // 3 + 1}-{min(len(nomes), k + 9) // 3}", f"{saida}/folha_{k // 9 + 1}.png"], check=True)
print("\n".join(nomes))
