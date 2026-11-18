import subprocess as sp, numpy as np, json, sys
from faster_whisper import WhisperModel
f = sys.argv[1]
raw = sp.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.float32)
m = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = m.transcribe(a, language="pt", word_timestamps=True)
out = []
for s in segs:
    out.append({"ini": round(s.start, 2), "fim": round(s.end, 2), "texto": s.text.strip(), "palavras": [(w.word, round(w.start, 2), round(w.end, 2)) for w in s.words]})
    print(f"{s.start:7.2f} {s.end:7.2f} {s.text.strip()}", flush=True)
json.dump(out, open(sys.argv[2], "w"), ensure_ascii=False)
