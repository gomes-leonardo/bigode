// Efeitos do Shorts (sintetizados por scripts/sfx_dedo.py): o estalo quando a cavidade abre, a garrafa abrindo e o
// relógio acelerado. Só onde a história tem um som de verdade.
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { FALAS, T, fracDe } from "./tempo";

export const QUADRO_ESTALO = T(12, fracDe(12, "se abre"));
export const QUADRO_GARRAFA = T(10, fracDe(10, "abre a garrafa"));

type Deixa = { de: number; som: "estalo" | "garrafa" | "tique"; dur: number; vol: number };
const tiques: Deixa[] = [];
for (let f = T(19) - 6; f < FALAS[19].fim + 6; f += 3) tiques.push({ de: f, som: "tique", dur: 2, vol: 0.35 });

const DEIXAS: Deixa[] = [
  { de: QUADRO_ESTALO, som: "estalo", dur: 6, vol: 0.9 },
  { de: QUADRO_GARRAFA, som: "garrafa", dur: 38, vol: 0.5 },
  ...tiques,
];

export const EfeitosDedo: React.FC = () => (
  <>
    {DEIXAS.map((d, i) => (
      <Sequence key={i} from={d.de} durationInFrames={d.dur} layout="none">
        <Audio src={staticFile(`sfx/${d.som}.wav`)} volume={d.vol} />
      </Sequence>
    ))}
  </>
);
