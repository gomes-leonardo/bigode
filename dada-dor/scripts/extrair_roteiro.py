"""Extrai do spec.pdf a narração das 24 cenas -> narracao/roteiro.txt e narracao/cenas_previstas.json."""
import json, re, subprocess

# -layout: a descrição visual e a fala ficam separadas por linha em branco
txt = subprocess.run(["pdftotext", "-layout", "spec.pdf", "-"], capture_output=True, text=True, check=True).stdout
txt = txt.replace("\f", "\n")
# remove cabeçalho e rodapé de página
linhas = [l for l in txt.split("\n") if l.strip() not in ("E se você parasse de sentir dor: roteiro e spec de produção",) and not re.fullmatch(r"\s*Page \d+ of \d+\s*", l)]
txt = "\n".join(l.strip() for l in linhas)
roteiro = txt[txt.index("Cena 01 ("):txt.index("Prompts para o Google Flow")]
partes = re.split(r"(Cena (\d{2}) \((\d+):(\d{2}), (\d+)s\))", roteiro)
cenas = []
for i in range(1, len(partes), 6):
    _, num, mm, ss, dur, corpo = partes[i:i + 6]
    blocos = [b for b in re.split(r"\n\s*\n", corpo.strip()) if b.strip()]
    visual = " ".join(blocos[0].split())          # 1º parágrafo: descrição visual
    fala = " ".join(" ".join(blocos[1:]).split())  # resto: narração
    cenas.append({"id": int(num), "inicio_previsto": int(mm) * 60 + int(ss), "duracao_prevista": int(dur), "visual": visual, "narracao": fala})
assert len(cenas) == 24, len(cenas)
proibidos = [c["id"] for c in cenas if re.search("[–—]", c["narracao"])]
open("narracao/roteiro.txt", "w").write("\n\n".join(c["narracao"] for c in cenas) + "\n")
json.dump(cenas, open("narracao/cenas_previstas.json", "w"), ensure_ascii=False, indent=1)
total = sum(len(c["narracao"].split()) for c in cenas)
print(f"cenas: {len(cenas)}  palavras: {total}  travessões: {proibidos or 'nenhum'}")
for c in cenas:
    print(f'{c["id"]:02d} {c["inicio_previsto"]:3d}s +{c["duracao_prevista"]:2d}s  {len(c["narracao"].split()):3d} pal  {c["narracao"][:70]}')
