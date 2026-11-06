#!/usr/bin/env bash
# Efeitos gerados só com ffmpeg (sem download, sem licença de terceiros) -> public/sfx/
# Troque qualquer arquivo por um som melhor mantendo o mesmo nome.
set -euo pipefail
cd "$(dirname "$0")/../public/sfx"
SR=48000
ff() { ffmpeg -y -v error "$@"; }

# drone grave contínuo: ruído marrom filtrado + senoides graves, "estourado" (saturação forte + bitcrush)
ff -f lavfi -i "anoisesrc=color=brown:sample_rate=$SR:duration=95:seed=3" \
   -f lavfi -i "aevalsrc='0.55*sin(2*PI*44*t)*(0.65+0.35*sin(2*PI*0.06*t))+0.3*sin(2*PI*66*t+0.8*sin(2*PI*0.09*t))':s=$SR:d=95" \
   -filter_complex "[0]lowpass=f=170,volume=0.9[r];[r][1]amix=inputs=2:normalize=0,volume=12dB,asoftclip=type=tanh,acrusher=bits=6:mix=0.25:mode=log,lowpass=f=900,afade=t=in:d=2,afade=t=out:st=92:d=3,volume=-24dB" \
   drone_grave.wav

# estática curta para transições (0,35 s): ruído branco recortado + crush
ff -f lavfi -i "anoisesrc=color=white:sample_rate=$SR:duration=0.35:seed=9" \
   -af "bandpass=f=3000:w=4000,volume='0.9*(0.4+0.6*gt(sin(2*PI*31*t),0))':eval=frame,volume=10dB,asoftclip=type=hard,acrusher=bits=5:mix=0.6,afade=t=in:d=0.01,afade=t=out:st=0.25:d=0.1,volume=-14dB" \
   estatica_transicao.wav

# estática longa crescente para o corte final (2,5 s)
ff -f lavfi -i "anoisesrc=color=white:sample_rate=$SR:duration=2.5:seed=13" \
   -af "bandpass=f=2800:w=4500,volume='pow(t/2.5,1.6)':eval=frame,volume=12dB,asoftclip=type=hard,acrusher=bits=4:mix=0.7,volume=-12dB" \
   estatica_final.wav

# hit grave do zoom-punch: sweep 120->38 Hz com decaimento + ruído, saturado
ff -f lavfi -i "aevalsrc='sin(2*PI*(38+82*exp(-14*t))*t)*exp(-3.5*t)':s=$SR:d=1.4" \
   -f lavfi -i "anoisesrc=color=brown:sample_rate=$SR:duration=1.4:seed=5" \
   -filter_complex "[1]lowpass=f=400,volume='exp(-7*t)':eval=frame[n];[0][n]amix=inputs=2:normalize=0,volume=9dB,asoftclip=type=tanh,volume=-6dB" \
   hit_zoom_punch.wav
ls -1
