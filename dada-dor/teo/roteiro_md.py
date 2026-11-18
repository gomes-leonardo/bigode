"""Gera ROTEIRO_TEO.md com o roteiro final (tempos do vídeo, falas e o que aparece em cada plano)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from quadros import QUADROS
tl = json.load(open("src/teo/timeline.json"))
CAPS = {1: "A terça em que nada doeu", 2: "Pra que serve a dor", 3: "Uma vida sem dor", 4: "O menino de pedra", 5: "O preço", 6: "A noite do muro", 7: "As mãos da vó"}
NOME = {"teo": "Téo", "dudu": "Dudu", "caco": "Caco", "rose": "Dona Rose", "cida": "Vó Cida", "helena": "Dra. Helena", "nelson": "Seu Nelson", "vizinho": "vizinho", "radio": "narrador de rádio", "torcida": "torcida"}
mmss = lambda s: f"{int(s // 60)}:{int(s % 60):02d}"
L = ["# E se você parasse de sentir dor? — Roteiro final (Téo)", "",
     f"Duração: {mmss(tl['duracao'])}. 16:9, 1920x1080, 30 fps. Tirinha de traço grosso, tudo desenhado em código.",
     "Voz A (mulher, rápida, calorosa): narradora, em segunda pessoa. Voz B (homem, seco): personagens e comentários; o personagem vai entre parênteses.",
     "Sem travessão, sem legenda. Texto em tela só em cartelas.", ""]
cap = 0
for p in tl["planos"]:
    if p["cap"] != cap:
        cap = p["cap"]
        fim = max(q["inicio"] + q["duracao"] for q in tl["planos"] if q["cap"] == cap)
        ini = min(q["inicio"] for q in tl["planos"] if q["cap"] == cap)
        L += [f"## {cap}. {CAPS[cap]} ({mmss(ini)} a {mmss(fim)})", ""]
    L.append(f"**{mmss(p['inicio'])}** {QUADROS[p['id']]}")
    for f in p["falas"]:
        quem = "A" if f["voz"] == "A" else ("B" + (f" ({NOME[f['personagem']]})" if f["personagem"] else ""))
        L.append(f"- {quem}: {f['texto']}")
    L.append("")
open("teo/ROTEIRO_TEO.md", "w").write("\n".join(L))
print("\n".join(L))
