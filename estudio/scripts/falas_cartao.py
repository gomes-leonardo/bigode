# Divide o roteiro em falas (frases), marca parágrafo e citação, e estima o tamanho falado (números por extenso).
# O texto de cada fala é EXATAMENTE o do roteiro (nada é mudado); a contagem por extenso serve só para o tempo.
# uso: python3 scripts/falas_cartao.py roteiros/cartao-infinito.txt src/video/cartao/falas.json
import json, re, sys

UN = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze",
      "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"]
DZ = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
CT = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"]

def ate_mil(n):
    if n == 0: return ""
    if n == 100: return "cem"
    p = []
    if n >= 100: p.append(CT[n // 100]); n %= 100
    if n >= 20: p.append(DZ[n // 10]); n %= 10
    if n: p.append(UN[n])
    return " e ".join(p)

def extenso(n):
    if n == 0: return "zero"
    partes = []
    for valor, sing, plur in [(10**12, "trilhão", "trilhões"), (10**9, "bilhão", "bilhões"), (10**6, "milhão", "milhões"), (1000, "mil", "mil")]:
        if n >= valor:
            q = n // valor; n %= valor
            partes.append(("" if (valor == 1000 and q == 1) else ate_mil(q) + " ") + (sing if q == 1 else plur))
    if n: partes.append(ate_mil(n))
    return " e ".join(p.strip() for p in partes)

def falado(t):
    t = re.sub(r"R\$\s?(\d+),(\d+)", lambda m: f"{extenso(int(m.group(1)))} reais e {extenso(int(m.group(2)))} centavos", t)
    t = re.sub(r"R\$\s?(\d+)", lambda m: f"{extenso(int(m.group(1)))} reais", t)
    t = re.sub(r"(\d+)%", lambda m: f"{extenso(int(m.group(1)))} por cento", t)
    t = re.sub(r"(\d{1,3}(?:\.\d{3})+)", lambda m: extenso(int(m.group(1).replace(".", ""))), t)
    t = re.sub(r"\d+", lambda m: extenso(int(m.group(0))), t)
    return t

texto = open(sys.argv[1], encoding="utf-8").read()
paragrafos = [p.strip() for p in re.split(r"\n\s*\n", texto) if p.strip()]
falas = []
for ip, p in enumerate(paragrafos):
    # quebra em frases: fim de frase (. ? ! …) seguido de espaço, inclusive dentro de aspas
    pedacos = re.split(r"(?<=[.?!…])\s+(?=[“\"A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9])|(?<=[.?!…][”\"])\s+", p)
    aberta = False
    for k, s in enumerate(pedacos):
        s = s.strip()
        if not s: continue
        abre = "“" in s or (s.startswith('"'))
        fecha = "”" in s
        cit = aberta or abre
        if abre and not fecha: aberta = True
        if fecha: aberta = False
        fal = falado(s.replace("“", "").replace("”", ""))
        falas.append({
            "id": len(falas), "texto": s, "paragrafo": ip, "fimParagrafo": k == len(pedacos) - 1, "citacao": cit,
            "caracteres": len(re.sub(r"\s+", " ", fal)), "virgulas": fal.count(",") + fal.count(";") + fal.count(":"),
        })
json.dump(falas, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
# conferência: o texto das falas, juntado, tem que reproduzir o roteiro (só muda espaço/quebra de linha)
junto = re.sub(r"\s+", " ", " ".join(f["texto"] for f in falas)).strip()
orig = re.sub(r"\s+", " ", texto).strip()
print(f"{len(falas)} falas em {len(paragrafos)} parágrafos · texto idêntico ao roteiro: {junto == orig}")
print(f"caracteres falados: {sum(f['caracteres'] for f in falas)} · citações: {sum(f['citacao'] for f in falas)}")
