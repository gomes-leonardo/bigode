# Gera uma narração fala por fala com a voz Thalita (Microsoft, pt-BR), pelo serviço de leitura em voz alta do Edge
# (edge-tts, num ambiente virtual). Cada fala vira fNN.mp3; depois o scripts/monta_narracao.py junta tudo com as pausas.
# uso: python gera_narracao_edge.py <falas.json> <pasta_saida> [opções]
#   ritmo=+10%        velocidade da voz (padrão +8%)
#   grave=24,33       falas ditas mais devagar e mais graves (-6%, -6 Hz), para o tom de suspense
#   so=3,7            gera só essas falas (para refazer uma ou outra)
#   12=texto          texto só para a pronúncia daquela fala (a legenda continua a do roteiro)
import asyncio, json, os, sys
import edge_tts
falas = json.load(open(sys.argv[1], encoding="utf-8"))
dst = sys.argv[2]
opc = dict(a.split("=", 1) for a in sys.argv[3:])
TROCAS = {int(k): v for k, v in opc.items() if k.isdigit()}
GRAVES = {int(x) for x in opc.get("grave", "").split(",") if x}
SO = {int(x) for x in opc["so"].split(",")} if "so" in opc else None
VOZ, RATE = "pt-BR-ThalitaMultilingualNeural", opc.get("ritmo", "+8%")
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
                kw = dict(rate="-6%", pitch="-6Hz") if d["id"] in GRAVES else dict(rate=RATE)
                await edge_tts.Communicate(texto, VOZ, proxy=proxy, **kw).save(out)
                break
            except Exception as e:
                print("erro", d["id"], type(e).__name__, e, flush=True)
                await asyncio.sleep(2 + tent * 3)
        print(d["id"], texto, flush=True)
asyncio.run(main())
