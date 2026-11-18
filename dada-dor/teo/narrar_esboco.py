"""Esboço do Téo (cap. 1, 0:07 a 0:21): narração edge-tts provisória + efeitos -> public/teo/esboco.wav
e src/teo/esboco.json (início/duração de cada fala e dos efeitos, em segundos)."""
import asyncio, json, os, re, subprocess as sp

FALAS = [
    ("A", "Terça de manhã. Você levanta e enfia o dedinho do pé na quina da cama.", 0.4),
    ("A", "Nada.", 0.9),
    ("A", "Você pisa numa pecinha do seu irmão. Com força.", 0.7),
]
VOZ = {"A": ("pt-BR-FranciscaNeural", "+10%")}
SR = 48000
os.makedirs("teo/falas", exist_ok=True)

def ff(*a):
    sp.run(["ffmpeg", "-y", "-v", "error", *a], check=True)

def dur(f):
    return float(sp.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)

async def tts(texto, voz, rate, dst):
    import edge_tts
    await edge_tts.Communicate(texto, voz, rate=rate, proxy=os.environ.get("HTTPS_PROXY")).save(dst)

t, falas, entradas = 0.0, [], []
for i, (v, texto, pausa) in enumerate(FALAS):
    wav = f"teo/falas/esboco_{i}.wav"
    asyncio.run(tts(texto, *VOZ[v], wav.replace(".wav", ".mp3")))
    ff("-i", wav.replace(".wav", ".mp3"), "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse", "-ar", str(SR), "-ac", "1", wav)
    t += pausa
    d = dur(wav)
    falas.append({"texto": texto, "inicio": round(t, 3), "duracao": round(d, 3)})
    entradas.append((t, wav))
    t += d
total = t + 1.0
# efeitos: "toc" do dedinho na quina e o "clac" da pecinha (os instantes vêm da cena; aqui só os arquivos)
ff("-f", "lavfi", "-i", "aevalsrc='(sin(2*PI*(180+500*exp(-40*t))*t)+0.5*sin(2*PI*1400*t)*exp(-60*t))*exp(-22*t)':s=48000:d=0.4", "-ac", "1", "teo/toc.wav")
ff("-f", "lavfi", "-i", "aevalsrc='(sin(2*PI*2400*t)+0.7*sin(2*PI*3300*t))*exp(-70*t)':s=48000:d=0.25", "-ac", "1", "teo/clac.wav")
json.dump({"duracao": round(total, 3), "falas": falas}, open("src/teo/esboco.json", "w"), ensure_ascii=False, indent=1)
print(json.dumps(falas, ensure_ascii=False, indent=1), "total", round(total, 2))
