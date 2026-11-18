"""Gera ROTEIRO_TEO.md com o roteiro final (tempos do vídeo, falas e o que aparece em cada plano)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from quadros import QUADROS
tl = json.load(open("src/mentira/timeline.json"))
CAPS = {1: "A mão de truco", 2: "Por que ninguém pega mentira", 3: "Começando pequeno", 4: "O detector de mentiras do bairro", 5: "Quando isso importa", 6: "O preço", 7: "A laje", 8: "O último balão"}
NOME = {"teo": "Téo", "dudu": "Dudu", "caco": "Caco", "rose": "Dona Rose", "cida": "Vó Cida", "helena": "Dra. Helena", "vizinho": "vizinho", "livia": "Lívia", "menina": "menina", "jorge": "Seu Jorge", "beto": "Tio Beto", "marta": "Dona Marta", "vendedor": "vendedor", "jogador": "jogador", "adversario": "adversário", "atacante": "jogador", "reporter": "repórter", "campeao": "campeão", "suspeito": "suspeito", "audio": "áudio"}
mmss = lambda s: f"{int(s // 60)}:{int(s % 60):02d}"
L = ["# Já imaginou se você pudesse ver quem está mentindo pra você? — Roteiro final (Téo)", "",
     f"Duração: {mmss(tl['duracao'])}. 16:9, 1920x1080, 30 fps. Tirinha de traço grosso, tudo desenhado em código.",
     "Voz A (mulher, rápida, calorosa): narradora, em segunda pessoa. Voz B (homem, seco): personagens e comentários; o personagem vai entre parênteses.",
     "Sem travessão, sem legenda. Texto em tela só em cartelas.",
     "Mecânica: toda fala com voz sai num balão. Verdade flutua e some. Mentira fica cinza, cai com plóc e fica no chão até a cena acabar.", ""]
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
        bal = {"v": " · balão: flutua", "m": " · balão: cai (plóc)", "M": " · balão: cai (plóc grande)", "?": " · balão: ninguém vê o fim"}
        marca = "".join(sorted({bal[c] for c in (f.get("balao") or "") if c in bal}))
        L.append(f"- {quem}: {f['texto']}{marca}")
    L.append("")
open("mentira/ROTEIRO_MENTIRA.md", "w").write("\n".join(L))
print("\n".join(L))
