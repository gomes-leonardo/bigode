# Transcreve as partes da narração (palavras com tempo) para o sincroniza_narracao.py.
# Precisa do faster-whisper (num ambiente virtual). O áudio é decodificado pelo ffmpeg (sem PyAV).
# uso: python3 scripts/transcreve.py <saida.json> <parte1.mp3> [parte2.mp3 ...]
import sys, json, time, subprocess, numpy as np
from faster_whisper import WhisperModel

m = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=4)
saida = {}
for i, f in enumerate(sys.argv[2:], start=1):
    t0 = time.time()
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, info = m.transcribe(audio, language="pt", word_timestamps=True, vad_filter=False, beam_size=5)
    palavras, textos = [], []
    for s in segs:
        textos.append((round(s.start, 2), round(s.end, 2), s.text.strip()))
        palavras += [{"w": w.word.strip(), "a": round(w.start, 3), "b": round(w.end, 3), "p": round(w.probability, 3)} for w in s.words]
    saida[i] = {"arquivo": f, "duracao": info.duration, "palavras": palavras, "segmentos": textos}
    print(i, f"{time.time() - t0:.0f}s", textos[0][2][:60], "...", textos[-1][2][-60:], flush=True)
json.dump(saida, open(sys.argv[1], "w"), ensure_ascii=False)
