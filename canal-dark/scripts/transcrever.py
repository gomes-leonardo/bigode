"""Transcreve áudio com faster-whisper (small, CPU) e imprime palavras com tempo."""
import sys, json, subprocess
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    # decodifica com ffmpeg (o PyAV instalado não aceita o argumento que o faster-whisper passa)
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    segs, _ = m.transcribe(np.frombuffer(pcm, np.float32), language="pt", word_timestamps=True, vad_filter=False)
    words = [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
    json.dump(words, open(f + ".words.json", "w"), ensure_ascii=False)
    print("==", f); print(" ".join(f'{x["w"]}@{x["s"]}' for x in words))
