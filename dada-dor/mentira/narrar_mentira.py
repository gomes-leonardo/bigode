"""Narração provisória (edge-tts) do vídeo da mentira, linha do tempo com os balões e áudio final.

Saídas: mentira/falas/*.wav (cache), public/mentira/audio.wav (-16 LUFS), src/mentira/timeline.json
(planos com falas, efeitos e balões: quando cada balão nasce, quando a mentira cai e quando a verdade sobe).
Uma gravação do ElevenLabs em mentira/eleven/falas/<plano>_<i>.wav substitui a fala provisória.
Uso: .venv/bin/python mentira/narrar_mentira.py
"""
import asyncio, hashlib, json, os, re, subprocess as sp, sys, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from roteiro_mentira import PERSONAGEM, PLANOS, VOZES  # noqa: E402

SR = 48000
GAP_FALAS = 0.3
GAP_PLANOS = 0.45
for d in ("mentira/falas", "mentira/sfx", "public/mentira", "src/mentira", "mentira/eleven/norm"):
    os.makedirs(d, exist_ok=True)


def ff(*a):
    r = sp.run(["ffmpeg", "-y", "-v", "error", *a], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit("ffmpeg falhou: " + r.stderr[-600:])


def duracao(f):
    return float(sp.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)


def lufs(f):
    o = sp.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])


norm = lambda w: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", w.lower()).encode("ascii", "ignore").decode())


async def tts(texto, voz, rate, pitch, dst):
    import edge_tts
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    await edge_tts.Communicate(texto, voz, rate=rate, pitch=pitch, proxy=proxy).save(dst)


def fala_wav(pid, i, voz, personagem, texto):
    eleven = f"mentira/eleven/falas/{pid}_{i}.wav"
    if os.path.exists(eleven):
        n = eleven.replace("/falas/", "/norm/")
        if not os.path.exists(n) or os.path.getmtime(n) < os.path.getmtime(eleven):
            ganho = -19.0 - lufs(eleven)[0]
            ff("-i", eleven, "-af", f"volume={ganho:.2f}dB,alimiter=limit=0.9:level=false", "-ar", str(SR), "-ac", "1", n)
        return n
    cfg = dict(VOZES[voz])
    if personagem and personagem in PERSONAGEM:
        cfg.update(PERSONAGEM[personagem])
    chave = hashlib.sha1(f"{cfg}|{texto}".encode()).hexdigest()[:12]
    wav = f"mentira/falas/{chave}.wav"
    if not os.path.exists(wav) or os.path.getsize(wav) == 0:
        mp3 = wav.replace(".wav", ".mp3")
        for _ in range(3):
            asyncio.run(tts(texto, cfg["voz"], cfg["rate"], cfg["pitch"], mp3))
            if os.path.getsize(mp3) > 0:
                break
        ff("-i", mp3, "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse", "-ar", str(SR), "-ac", "1", wav)
        os.remove(mp3)
    return wav


# ---------------------------------------------------------------- palavras (faster-whisper, só onde precisa)
CACHE_PAL = "mentira/_palavras.json"
cache_pal = json.load(open(CACHE_PAL)) if os.path.exists(CACHE_PAL) else {}
_modelo = None


def palavras(wav):
    global _modelo
    chave = f"{wav}|{os.path.getmtime(wav):.0f}"
    if chave not in cache_pal:
        import numpy as np
        from faster_whisper import WhisperModel
        if _modelo is None:
            _modelo = WhisperModel("small", device="cpu", compute_type="int8")
        raw = sp.run(["ffmpeg", "-v", "error", "-i", wav, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
        segs, _ = _modelo.transcribe(np.frombuffer(raw, np.float32), language="pt", word_timestamps=True)
        cache_pal[chave] = [(w.word.strip(), round(w.start, 3), round(w.end, 3)) for s in segs for w in s.words]
        json.dump(cache_pal, open(CACHE_PAL, "w"), ensure_ascii=False)
    return cache_pal[chave]


def momentos(fala, alvo, wav):
    """instantes (relativos ao início da fala) das ocorrências de uma palavra; whisper quando der, senão proporção do texto"""
    texto = fala["texto"]
    toks = texto.split()
    pos, acc = [], 0
    total = len(texto)
    for t in toks:
        i = texto.index(t, acc)
        acc = i + len(t)
        if alvo(norm(t)):
            pos.append(fala["duracao"] * i / total)
    try:
        ws = [(norm(w), a) for w, a, _ in palavras(wav)]
        achados = [a for w, a in ws if alvo(w)]
        if len(achados) == len(pos):
            return achados
    except Exception as e:  # noqa: BLE001
        print("aviso: palavras", wav, e)
    return pos


eh_ploc = lambda w: bool(re.match(r"^[pb]lo+[ckq]", w)) or w in ("ploque",)
eh = lambda alvo: (lambda w: w.startswith(alvo))

# ---------------------------------------------------------------- efeitos sintetizados
SFX = {
    "ploc": ("aevalsrc='(sin(2*PI*(110+260*exp(-22*t))*t)*exp(-16*t)+0.25*sin(2*PI*900*t)*exp(-60*t))':s=48000:d=0.45", "volume=1.0"),
    "pop": ("aevalsrc='sin(2*PI*(700+900*t)*t)*exp(-40*t)*0.6':s=48000:d=0.18", "volume=0.5"),
    "torcida": ("anoisesrc=color=pink:sample_rate=48000:duration=2.4:seed=4", "bandpass=f=1200:w=1800,afade=t=in:d=0.3,afade=t=out:st=1.5:d=0.9,volume=0.55"),
    "surpresa": ("anoisesrc=color=pink:sample_rate=48000:duration=1.8:seed=7", "bandpass=f=1400:w=2000,afade=t=in:d=0.08,afade=t=out:st=0.8:d=1.0,volume=0.55"),
    "sino": ("aevalsrc='(sin(2*PI*880*t)+0.5*sin(2*PI*1760*t)+0.25*sin(2*PI*2640*t))*exp(-3*t)*0.6':s=48000:d=1.6", "volume=0.9"),
    "carta": ("anoisesrc=color=white:sample_rate=48000:duration=0.12:seed=3", "highpass=f=1500,afade=t=out:st=0.02:d=0.1,volume=0.7"),
    "almofada": ("aevalsrc='sin(2*PI*(70+90*exp(-30*t))*t)*exp(-18*t)':s=48000:d=0.35", "volume=0.9"),
    "moeda": ("aevalsrc='(sin(2*PI*2600*t)+0.6*sin(2*PI*3900*t))*exp(-9*t)*0.5':s=48000:d=0.6", "volume=0.8"),
    "plim": ("aevalsrc='(sin(2*PI*1320*t)*exp(-6*t)+0.7*sin(2*PI*1760*(t-0.12))*exp(-6*(t-0.12))*gte(t,0.12))':s=48000:d=0.8", "volume=0.9"),
    "queda": ("aevalsrc='sin(2*PI*(60+120*exp(-25*t))*t)*exp(-9*t)':s=48000:d=0.7", "volume=0.9"),
    "estalo": ("aevalsrc='(sin(2*PI*(160+600*exp(-50*t))*t)*exp(-12*t))+0.5*(random(0)*2-1)*exp(-25*t)':s=48000:d=0.6", "volume=0.9"),
    "tique": ("aevalsrc='sin(2*PI*1800*t)*exp(-80*t)':s=48000:d=0.12", "volume=0.6"),
    "fogos": ("aevalsrc='(random(0)*2-1)*(exp(-14*mod(t,0.55))*gte(mod(t,0.55),0))*0.8 + sin(2*PI*(80+60*exp(-20*mod(t,0.55)))*t)*exp(-10*mod(t,0.55))*0.6':s=48000:d=4.5", "afade=t=out:st=3.5:d=1.0,volume=0.7"),
    "musica": ("aevalsrc='0.55*sin(2*PI*(55+70*exp(-30*mod(t,0.5)))*t)*exp(-9*mod(t,0.5)) + 0.18*(random(0)*2-1)*exp(-40*mod(t+0.25,0.5))*gte(mod(t+0.25,1),0.5) + 0.07*(random(1)*2-1)*exp(-90*mod(t,0.125)) + 0.12*sin(2*PI*(220+110*floor(mod(t,2)))*t)*(0.5+0.5*sin(2*PI*2*t))':s=48000:d=90", "volume=0.45"),
}
for nome, (src, filtro) in SFX.items():
    dst = f"mentira/sfx/{nome}.wav"
    if not os.path.exists(dst):
        ff("-f", "lavfi", "-i", src, "-af", filtro, "-ac", "1", dst)

# ---------------------------------------------------------------- linha do tempo
t = 0.0
planos, pedacos, efeitos, marcas = [], [], [], []
corte_musica = None
for p in PLANOS:
    t += p.get("pausa_antes", 0)
    inicio = t
    falas = []
    local = p.get("entrada", 0.25)
    for i, (voz, pers, texto, bal) in enumerate(p["falas"]):
        wav = fala_wav(p["id"], i, voz, pers, texto)
        d = duracao(wav)
        falas.append({"voz": voz, "personagem": pers, "texto": texto, "inicio": round(local, 3), "duracao": round(d, 3), "balao": bal, "_wav": wav})
        pedacos.append((inicio + local, wav))
        local += d
        if i < len(p["falas"]) - 1:
            gaps = p.get("gap") or []
            local += gaps[i] if i < len(gaps) else GAP_FALAS
    extras = p.get("extras", [])
    dur = max(local + 0.35 + p.get("pausa_depois", 0), p.get("minimo", 0), max([e[3] + 0.6 for e in extras], default=0))

    # balões das falas
    baloes = []
    for i, f in enumerate(falas):
        if not f["balao"]:
            continue
        n = len(f["balao"])
        for k, tipo in enumerate(f["balao"]):
            baloes.append({"fala": i, "k": k, "n": n, "tipo": tipo, "rotulo": f["personagem"], "emite": round(f["inicio"] + f["duracao"] * k / n, 3), "fimFala": round(f["inicio"] + f["duracao"] * (k + 1) / n, 3)})
    # plócs disponíveis nas falas da narradora (em ordem)
    plocs = []
    for i, f in enumerate(falas):
        if f["voz"] == "A" and "plóc" in f["texto"].lower():
            plocs += [(i, f["inicio"] + a) for a in momentos(f, eh_ploc, f["_wav"])]
    for b in baloes:
        if b["tipo"] in "mM":
            livre = [x for x in plocs if x[0] > b["fala"] and x[1] > b["fimFala"]]
            if livre:
                b["queda"] = round(livre[0][1], 3)
                plocs.remove(livre[0])
            else:
                cai = [f["inicio"] + a for j, f in enumerate(falas) if j > b["fala"] and f["voz"] == "A" for a in momentos(f, eh("cai"), f["_wav"])]
                b["queda"] = round(cai[0] if cai else b["fimFala"] + 0.7, 3)
        elif b["tipo"] == "v":
            prox = falas[b["fala"] + 1] if b["fala"] + 1 < len(falas) else None
            b["sobe"] = round(prox["inicio"] if prox and prox["voz"] == "A" and prox["texto"].startswith("Flutua") and b["k"] == b["n"] - 1 else b["fimFala"] + 0.15, 3)
    for rot, tipo, emite, fim in extras:
        b = {"fala": None, "k": 0, "n": 1, "tipo": tipo, "rotulo": rot, "emite": emite, "fimFala": round(emite + 0.5, 3)}
        b["queda" if tipo in "mM" else "sobe"] = fim
        baloes.append(b)
    dur = max(dur, max([b.get("queda", b.get("sobe", 0)) + 0.8 for b in baloes], default=0))
    for b in baloes:
        if "queda" in b:
            efeitos.append((inicio + b["queda"], "mentira/sfx/ploc.wav", "ploc"))
        elif "sobe" in b:
            efeitos.append((inicio + b["sobe"] + 1.15, "mentira/sfx/pop.wav", "pop"))

    # efeitos do roteiro
    for s in p.get("sfx", []):
        nome, k = s[0], s[1]
        if len(s) == 4:
            f = falas[k]
            ms = momentos(f, eh(norm(s[2])), f["_wav"])
            em = inicio + f["inicio"] + (ms[0] if ms else f["duracao"] / 2) + s[3]
        else:
            off = s[2]
            em = inicio + off if k is None else (inicio + falas[k]["inicio"] + falas[k]["duracao"] + off if off < 0 else inicio + falas[k]["inicio"] + off)
        if nome == "corta_musica":
            corte_musica = em
            marcas.append((em, nome))
            continue
        efeitos.append((max(0.0, em), f"mentira/sfx/{nome}.wav", nome))
    for f in falas:
        f.pop("_wav")
    planos.append({"id": p["id"], "cap": p["cap"], "inicio": round(inicio, 3), "duracao": round(dur, 3), "falas": falas, "baloes": baloes,
                   "sfx": [{"nome": n, "em": round(a - inicio, 3)} for a, _, n in efeitos if inicio - 0.01 <= a < inicio + dur + GAP_FALAS]
                   + [{"nome": n, "em": round(a - inicio, 3)} for a, n in marcas if inicio - 0.01 <= a < inicio + dur + GAP_FALAS]})
    t = inicio + dur + GAP_PLANOS
total = t - GAP_PLANOS

# ---------------------------------------------------------------- mixagem
entradas, filtros, rotulos = [], [], []
for k, (em, arq) in enumerate(pedacos + [(a, f) for a, f, _ in efeitos]):
    entradas += ["-i", arq]
    vol = "volume=0.6," if arq.startswith("mentira/sfx") else ""
    corte = ""
    if arq.endswith("musica.wav") and corte_musica:
        corte = f"atrim=0:{max(0.1, corte_musica - em):.3f},afade=t=out:st={max(0.0, corte_musica - em - 0.06):.3f}:d=0.06,"
    filtros.append(f"[{k}]{corte}{vol}adelay={int(em * 1000)}|{int(em * 1000)}[s{k}]")
    rotulos.append(f"[s{k}]")
lista = "mentira/_mix_filtros.txt"
open(lista, "w").write(";".join(filtros) + ";" + "".join(rotulos) + f"amix=inputs={len(rotulos)}:normalize=0:duration=longest,atrim=0:{total + 0.2:.3f},apad=whole_dur={total + 0.2}[m]")
ff(*entradas, "-filter_complex_script", lista, "-map", "[m]", "-ar", str(SR), "-ac", "1", "mentira/_mix.wav")
i, _ = lufs("mentira/_mix.wav")
ganho = -19 - i
for _ in range(3):
    ff("-i", "mentira/_mix.wav", "-af", f"volume={ganho:.2f}dB,alimiter=limit=0.84:level=false,pan=stereo|c0=c0|c1=c0", "public/mentira/audio.wav")
    m, _ = lufs("public/mentira/audio.wav")
    if abs(m + 16) <= 0.2:
        break
    ganho += -16 - m
ff("-i", "public/mentira/audio.wav", "-c:a", "libmp3lame", "-b:a", "256k", "public/mentira/audio.mp3")
json.dump({"duracao": round(total + 0.2, 3), "planos": planos}, open("src/mentira/timeline.json", "w"), ensure_ascii=False, indent=1)
print("planos", len(planos), "duração %.1f s (%d:%02d)" % (total, total // 60, total % 60), "| áudio %.1f LUFS, pico %.1f dBFS" % lufs("public/mentira/audio.wav"))
for p in planos:
    print(f'{p["id"]:14s} {p["inicio"]:6.1f} +{p["duracao"]:5.2f}s  balões {[(b["tipo"], b.get("queda", b.get("sobe"))) for b in p["baloes"]]}')
