"""Gera a narração: um arquivo por bloco do roteiro (public/audio/bloco_XX.mp3).

Provedor por variável de ambiente:
  TTS_PROVIDER=google      (padrão) Google Cloud Text-to-Speech, voz Chirp 3 HD pt-BR
                           credencial: GOOGLE_TTS_API_KEY, ou injetada pelo proxy no header X-Goog-Api-Key
                           TTS_VOICE=pt-BR-Chirp3-HD-<Nome>
  TTS_PROVIDER=elevenlabs  ELEVENLABS_API_KEY (ou injetada pelo proxy), TTS_VOICE=<voice_id>, modelo eleven_multilingual_v2
Nunca imprime chaves.

Uso:
  python3 scripts/narrar.py vozes                 # lista vozes pt-BR do provedor
  python3 scripts/narrar.py blocos roteiro.txt    # um bloco por linha não vazia -> bloco_01.mp3, bloco_02.mp3...
  python3 scripts/narrar.py blocos roteiro.txt --so 1 --voz X --saida public/audio/amostras  # só o bloco 1 com a voz X
Depois: scripts/timestamps.py (tempo das palavras) e a composição se ajusta sozinha.
Obs.: no 11 de setembro a narração veio pronta do ElevenLabs (2 arquivos); ela foi dividida com scripts/dividir_blocos.py.
"""
import base64, json, os, sys, urllib.request

PROV = os.environ.get("TTS_PROVIDER", "google").lower()

def req(url, corpo=None, headers=None):
    r = urllib.request.Request(url, data=json.dumps(corpo).encode() if corpo is not None else None, headers=headers or {})
    with urllib.request.urlopen(r, timeout=120) as resp:
        return resp.read()

def cab_google():
    # a chave vem do ambiente; se não houver, o proxy da sessão injeta o header (valor "placeholder" é substituído)
    return {"X-Goog-Api-Key": os.environ.get("GOOGLE_TTS_API_KEY", "placeholder"), "Content-Type": "application/json"}

def cab_eleven():
    return {"xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "placeholder"), "Content-Type": "application/json", "Accept": "audio/mpeg"}

def vozes():
    if PROV == "google":
        dados = json.loads(req("https://texttospeech.googleapis.com/v1/voices?languageCode=pt-BR", headers=cab_google()))
        for v in dados.get("voices", []):
            if "Chirp3-HD" in v["name"]:
                print(v["name"], v.get("ssmlGender", ""))
    else:
        dados = json.loads(req("https://api.elevenlabs.io/v2/voices?page_size=100", headers=cab_eleven()))
        for v in dados.get("voices", []):
            print(v["voice_id"], v["name"], v.get("labels", {}))

def falar(texto, voz):
    if PROV == "google":
        corpo = {"input": {"text": texto}, "voice": {"languageCode": "pt-BR", "name": voz}, "audioConfig": {"audioEncoding": "MP3", "sampleRateHertz": 48000}}
        return base64.b64decode(json.loads(req("https://texttospeech.googleapis.com/v1/text:synthesize", corpo, cab_google()))["audioContent"])
    corpo = {"text": texto, "model_id": "eleven_multilingual_v2", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.3}}
    return req(f"https://api.elevenlabs.io/v1/text-to-speech/{voz}", corpo, cab_eleven())

def blocos(arquivo, args):
    voz = args[args.index("--voz") + 1] if "--voz" in args else os.environ.get("TTS_VOICE")
    if not voz:
        sys.exit("defina TTS_VOICE ou --voz")
    saida = args[args.index("--saida") + 1] if "--saida" in args else "public/audio"
    so = int(args[args.index("--so") + 1]) if "--so" in args else None
    os.makedirs(saida, exist_ok=True)
    textos = [l.strip() for l in open(arquivo, encoding="utf-8") if l.strip()]
    for i, t in enumerate(textos, 1):
        if so and i != so:
            continue
        nome = f"{saida}/bloco_{i:02d}" + (f"_{voz.split('-')[-1]}" if so else "") + ".mp3"
        open(nome, "wb").write(falar(t, voz))
        print("ok", nome)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "vozes":
        vozes()
    elif len(sys.argv) > 2 and sys.argv[1] == "blocos":
        blocos(sys.argv[2], sys.argv[3:])
    else:
        print(__doc__)
