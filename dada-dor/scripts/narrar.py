"""Fase 1: narração cena por cena -> narracao/cenas/cena_XX.mp3, concatenada com 0,4 s de silêncio
em narracao/narracao.mp3, normalizada em -16 LUFS.

Provedor: ElevenLabs se ELEVENLABS_API_KEY existir (eleven_multilingual_v2, voz ELEVENLABS_VOICE_ID,
stability 0.5, similarity 0.8, style 0.1); senão edge-tts pt-BR-AntonioNeural, rate -5%
(fallback pt-BR-FranciscaNeural).
Uso: .venv/bin/python scripts/narrar.py
"""
import asyncio, json, os, re, subprocess as sp, sys

CENAS = json.load(open("narracao/cenas_previstas.json"))
PASTA = "narracao/cenas"
SILENCIO = 0.4
ALVO_LUFS = -16
# Ajustes só de pronúncia (o texto do roteiro e da legenda não muda).
PRONUNCIA = {"islandes": "islandês", r"Nav1\.7": "Náv um ponto sete"}

def para_fala(t):
    for de, para in PRONUNCIA.items():
        t = re.sub(rf"\b{de}", para, t)
    return t

def ff(*a):
    sp.run(["ffmpeg", "-y", "-v", "error", *a], check=True)

def lufs(f):
    o = sp.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])

def duracao(f):
    return float(sp.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)

async def edge(texto, dst):
    import edge_tts
    for voz in ("pt-BR-AntonioNeural", "pt-BR-FranciscaNeural"):
        try:
            # o websocket do edge-tts não lê HTTPS_PROXY sozinho
            proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
            await edge_tts.Communicate(texto, voz, rate="-5%", proxy=proxy).save(dst)
            return voz
        except Exception as e:  # tenta a voz de fallback
            print(f"  {voz} falhou: {type(e).__name__}", file=sys.stderr)
    raise RuntimeError("edge-tts falhou nas duas vozes")

def eleven(texto, dst):
    import urllib.request
    voz = os.environ.get("ELEVENLABS_VOICE_ID")
    if not voz:
        sys.exit("ELEVENLABS_VOICE_ID não definido: liste as vozes pt-BR e escolha antes de gerar.")
    corpo = json.dumps({"text": texto, "model_id": "eleven_multilingual_v2",
                        "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.1}}).encode()
    r = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voz}", data=corpo,
                               headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json", "Accept": "audio/mpeg"})
    open(dst, "wb").write(urllib.request.urlopen(r, timeout=120).read())
    return voz

os.makedirs(PASTA, exist_ok=True)
usar_eleven = bool(os.environ.get("ELEVENLABS_API_KEY"))
partes, vozes = [], set()
ff("-f", "lavfi", "-i", f"anullsrc=r=24000:cl=mono", "-t", str(SILENCIO), "-c:a", "pcm_s16le", f"{PASTA}/_silencio.wav")
for c in CENAS:
    bruto = f"{PASTA}/cena_{c['id']:02d}.mp3"
    if not (os.path.exists(bruto) and os.path.getsize(bruto) > 0):
        texto = para_fala(c["narracao"])
        vozes.add(eleven(texto, bruto) if usar_eleven else asyncio.run(edge(texto, bruto)))
    # wav 24 kHz mono, sem o silêncio que o TTS põe nas pontas (o respiro entre cenas é o SILENCIO fixo)
    wav = f"{PASTA}/cena_{c['id']:02d}.wav"
    ff("-i", bruto, "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse",
       "-ar", "24000", "-ac", "1", wav)
    partes += [wav, f"{PASTA}/_silencio.wav"]
partes = partes[:-1]
lista = f"{PASTA}/_lista.txt"
open(lista, "w").write("".join(f"file '{os.path.abspath(p)}'\n" for p in partes))
ff("-f", "concat", "-safe", "0", "-i", lista, "-c:a", "pcm_s16le", f"{PASTA}/_concat.wav")
i, _ = lufs(f"{PASTA}/_concat.wav")
ganho = ALVO_LUFS - i
for _ in range(3):  # o limitador baixa a loudness: corrige o ganho até ficar a ±0,2 LU do alvo
    ff("-i", f"{PASTA}/_concat.wav", "-af", f"volume={ganho:.2f}dB,alimiter=limit=0.84:level=false", "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "192k", "narracao/narracao.mp3")
    medido, _ = lufs("narracao/narracao.mp3")
    if abs(medido - ALVO_LUFS) <= 0.2:
        break
    ganho += ALVO_LUFS - medido
# durações medidas, para a tabela previsto x medido e para o scenes.ts
t, medidas = 0.0, []
for c in CENAS:
    d = duracao(f"{PASTA}/cena_{c['id']:02d}.wav")
    medidas.append({"id": c["id"], "inicio": round(t, 3), "fala": round(d, 3)})
    t += d + SILENCIO
json.dump(medidas, open("narracao/cenas_medidas.json", "w"), indent=1)
print("provedor:", "elevenlabs" if usar_eleven else "edge-tts", "| vozes:", vozes or "(cache)")
print("narracao.mp3: %.1f LUFS, pico %.1f dBFS, %.2f s" % (*lufs("narracao/narracao.mp3"), duracao("narracao/narracao.mp3")))
