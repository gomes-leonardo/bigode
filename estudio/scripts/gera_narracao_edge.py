# Gera uma narração fala por fala com a voz Thalita (Microsoft, pt-BR), pelo serviço de leitura em voz alta do Edge
# (edge-tts, num ambiente virtual). Cada fala vira fNN.mp3; depois o scripts/monta_narracao.py junta tudo com as pausas.
# uso: python gera_narracao_edge.py <falas.json> <pasta_saida> [id=texto_para_pronuncia ...]
import asyncio, json, os, sys
import edge_tts
falas = json.load(open(sys.argv[1], encoding="utf-8"))
dst = sys.argv[2]
TROCAS = {int(a.split("=", 1)[0]): a.split("=", 1)[1] for a in sys.argv[3:]}
SO = set(TROCAS) if TROCAS else None
VOZ, RATE = "pt-BR-ThalitaMultilingualNeural", "+8%"
async def main():
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    os.makedirs(dst, exist_ok=True)
    for d in falas:
        if SO is not None and d["id"] not in SO:
            continue
        texto = TROCAS.get(d["id"], d["texto"])
        out = os.path.join(dst, f"f{d['id']:02d}.mp3")
        for tent in range(4):
            try:
                await edge_tts.Communicate(texto, VOZ, rate=RATE, proxy=proxy).save(out)
                break
            except Exception as e:
                print("erro", d["id"], type(e).__name__, e, flush=True)
                await asyncio.sleep(2 + tent * 3)
        print(d["id"], texto, flush=True)
asyncio.run(main())
