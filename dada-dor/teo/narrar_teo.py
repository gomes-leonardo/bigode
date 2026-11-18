"""Gera as falas do roteiro do Téo (edge-tts), monta a linha do tempo, os efeitos e o áudio final.

Saídas: teo/falas/*.wav (cache por texto+voz), public/teo/audio.wav (narração + efeitos, -16 LUFS),
src/teo/timeline.json (início e duração de cada plano e de cada fala, em segundos).
Uso: .venv/bin/python teo/narrar_teo.py
"""
import asyncio, hashlib, json, os, re, subprocess as sp, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from roteiro_teo import PERSONAGEM, PLANOS, VOZES  # noqa: E402

SR = 48000
GAP_FALAS = 0.3
GAP_PLANOS = 0.45
os.makedirs("teo/falas", exist_ok=True)
os.makedirs("teo/sfx", exist_ok=True)
os.makedirs("public/teo", exist_ok=True)
os.makedirs("src/teo", exist_ok=True)


def ff(*a):
    sp.run(["ffmpeg", "-y", "-v", "error", *a], check=True)


def duracao(f):
    return float(sp.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)


def lufs(f):
    o = sp.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])


async def tts(texto, voz, rate, pitch, dst):
    import edge_tts
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    await edge_tts.Communicate(texto, voz, rate=rate, pitch=pitch, proxy=proxy).save(dst)


def fala_wav(voz, personagem, texto):
    cfg = dict(VOZES[voz])
    if personagem:
        cfg.update(PERSONAGEM[personagem])
    chave = hashlib.sha1(f"{cfg}|{texto}".encode()).hexdigest()[:12]
    wav = f"teo/falas/{chave}.wav"
    if not os.path.exists(wav):
        mp3 = wav.replace(".wav", ".mp3")
        asyncio.run(tts(texto, cfg["voz"], cfg["rate"], cfg["pitch"], mp3))
        ff("-i", mp3, "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse", "-ar", str(SR), "-ac", "1", wav)
        os.remove(mp3)
    return wav


# efeitos sonoros sintetizados (sem material de terceiros)
SFX = {
    "quina": "aevalsrc='sin(2*PI*(90+200*exp(-30*t))*t)*exp(-14*t)':s=48000:d=0.5",
    "coco": "aevalsrc='(sin(2*PI*820*t)+0.6*sin(2*PI*1240*t))*exp(-38*t)':s=48000:d=0.35",
    "bola": "aevalsrc='sin(2*PI*(150+300*exp(-40*t))*t)*exp(-18*t)':s=48000:d=0.45",
    "sirene": "aevalsrc='0.6*sin(2*PI*(700+250*sin(2*PI*3*t))*t)*min(1,t*8)*min(1,(1.4-t)*4)':s=48000:d=1.4",
    "plim": "aevalsrc='(sin(2*PI*1320*t)*exp(-6*t)+0.7*sin(2*PI*1760*(t-0.12))*exp(-6*(t-0.12))*gte(t,0.12))':s=48000:d=0.8",
    "queda": "aevalsrc='sin(2*PI*(60+120*exp(-25*t))*t)*exp(-9*t)':s=48000:d=0.7",
    "pau": "aevalsrc='(sin(2*PI*520*t)+0.5*sin(2*PI*900*t))*exp(-45*t)':s=48000:d=0.3",
    "torcida": "anoisesrc=color=pink:sample_rate=48000:duration=2.4:seed=4",
    "toc": "aevalsrc='(sin(2*PI*(180+500*exp(-40*t))*t)+0.5*sin(2*PI*1400*t)*exp(-60*t))*exp(-22*t)':s=48000:d=0.4",
    "clac": "aevalsrc='(sin(2*PI*2400*t)+0.7*sin(2*PI*3300*t))*exp(-70*t)':s=48000:d=0.25",
    "belisco": "aevalsrc='(sin(2*PI*(1500-900*t)*t))*exp(-30*t)*0.8':s=48000:d=0.2",
    "sino": "aevalsrc='(sin(2*PI*880*t)+0.5*sin(2*PI*1760*t)+0.25*sin(2*PI*2640*t))*exp(-3*t)*0.6':s=48000:d=1.6",
    "trave": "aevalsrc='(sin(2*PI*620*t)+0.8*sin(2*PI*1710*t)+0.5*sin(2*PI*2950*t))*exp(-5*t)*0.6':s=48000:d=1.2",
    "vapor": "anoisesrc=color=white:sample_rate=48000:duration=2.2:seed=9",
    "prato": "aevalsrc='(sin(2*PI*1900*t)+0.7*sin(2*PI*2700*t)+0.5*sin(2*PI*4100*t))*exp(-9*t)*0.6':s=48000:d=0.7",
    "ambulancia": "aevalsrc='0.35*sin(2*PI*(if(lt(mod(t,1.2),0.6),660,880))*t)*min(1,t)*min(1,(6-t)/2)':s=48000:d=6",
}
for nome, src in SFX.items():
    dst = f"teo/sfx/{nome}.wav"
    filtro = {"torcida": "bandpass=f=1200:w=1800,afade=t=in:d=0.4,afade=t=out:st=1.6:d=0.8,volume=0.5",
              "vapor": "highpass=f=2500,afade=t=in:d=0.3,afade=t=out:st=1.4:d=0.8,volume=0.25"}.get(nome, "volume=0.9")
    ff("-f", "lavfi", "-i", src, "-af", filtro, "-ac", "1", dst)

t = 0.0
planos, pedacos, efeitos = [], [], []
for p in PLANOS:
    t += p.get("pausa_antes", 0)
    inicio = t
    falas = []
    local = 0.25  # pequena entrada antes da primeira fala
    for i, (voz, pers, texto) in enumerate(p["falas"]):
        wav = f"teo/eleven/falas/{p['id']}_{i}.wav"  # gravação do ElevenLabs, quando existir
        if os.path.exists(wav):
            norm_wav = wav.replace("/falas/", "/norm/")
            if not os.path.exists(norm_wav) or os.path.getmtime(norm_wav) < os.path.getmtime(wav):
                os.makedirs(os.path.dirname(norm_wav), exist_ok=True)
                ganho = -19.0 - lufs(wav)[0]
                ff("-i", wav, "-af", f"volume={ganho:.2f}dB,alimiter=limit=0.9:level=false", "-ar", str(SR), "-ac", "1", norm_wav)
            wav = norm_wav
        else:
            wav = fala_wav(voz, pers, texto)
        d = duracao(wav)
        falas.append({"voz": voz, "personagem": pers, "texto": texto, "inicio": round(local, 3), "duracao": round(d, 3)})
        pedacos.append((inicio + local, wav))
        local += d
        if i < len(p["falas"]) - 1:
            local += (p.get("gap") or [])[i] if i < len(p.get("gap") or []) else GAP_FALAS
    dur = max(local + 0.35 + p.get("pausa_depois", 0), p.get("minimo", 0))
    for nome, k, off in p.get("sfx", []):
        em = inicio + off if k is None else (inicio + falas[k]["inicio"] + falas[k]["duracao"] + off if off < 0 else inicio + falas[k]["inicio"] + off)
        efeitos.append((em, f"teo/sfx/{nome}.wav", nome))
    planos.append({"id": p["id"], "cap": p["cap"], "inicio": round(inicio, 3), "duracao": round(dur, 3), "falas": falas,
                   "sfx": [{"nome": n, "em": round(a - inicio, 3)} for a, _, n in efeitos if inicio <= a < inicio + dur]})
    t = inicio + dur + GAP_PLANOS
total = t - GAP_PLANOS

# mixagem: cada fala e efeito no seu tempo (adelay), soma, -16 LUFS
entradas, filtros, rotulos = [], [], []
for k, (em, arq) in enumerate(pedacos + [(a, f) for a, f, _ in efeitos]):
    entradas += ["-i", arq]
    vol = "volume=0.55," if arq.startswith("teo/sfx") else ""
    filtros.append(f"[{k}]{vol}adelay={int(em * 1000)}|{int(em * 1000)}[s{k}]")
    rotulos.append(f"[s{k}]")
lista = "teo/_mix_filtros.txt"
open(lista, "w").write(";".join(filtros) + ";" + "".join(rotulos) + f"amix=inputs={len(rotulos)}:normalize=0:duration=longest,apad=whole_dur={total + 0.2}[m]")
ff(*entradas, "-filter_complex_script", lista, "-map", "[m]", "-ar", str(SR), "-ac", "1", "teo/_mix.wav")
i, _ = lufs("teo/_mix.wav")
ganho = -19 - i  # mono: -19 LUFS soa -16 LUFS quando duplicado em estéreo
for _ in range(3):
    ff("-i", "teo/_mix.wav", "-af", f"volume={ganho:.2f}dB,alimiter=limit=0.84:level=false,pan=stereo|c0=c0|c1=c0", "public/teo/audio.wav")
    m, _ = lufs("public/teo/audio.wav")
    if abs(m + 16) <= 0.2:
        break
    ganho += -16 - m
json.dump({"duracao": round(total + 0.2, 3), "planos": planos}, open("src/teo/timeline.json", "w"), ensure_ascii=False, indent=1)
print("planos", len(planos), "duração %.1f s" % total, "| áudio %.1f LUFS, pico %.1f dBFS" % lufs("public/teo/audio.wav"))
for p in planos:
    print(f'{p["id"]:15s} {p["inicio"]:6.1f} +{p["duracao"]:5.2f}s  sfx {[s["nome"] for s in p["sfx"]]}')
