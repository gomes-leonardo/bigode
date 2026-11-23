// Efeitos sonoros do vídeo do cartão infinito (sintetizados por scripts/sfx_cartao.py, em public/sfx).
// Só onde o roteiro tem um som de verdade: o "Bip." (que saiu da narração e virou som), o telefone tocando, a batida
// na porta e os cliques das câmeras. Cada som é preso à sua fala, então acompanha a narração quando os tempos mudarem.
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { fracDe } from "./comum";
import { CORTE, T } from "./tempo";

type Som = "bip" | "telefone" | "toc" | "clique";
type Deixa = { de: number; som: Som; ate?: number; vol: number };
const DURACAO: Record<Som, number> = { bip: 7, telefone: 72, toc: 6, clique: 4 };

/** falas "Bip." do roteiro: viram som (a voz não fala e a legenda não aparece) */
export const SO_SOM = [1, 6, 12, 255];

const cliques = (de: number, passos: number[], vol: number): Deixa[] => {
  let f = de;
  return passos.map((p) => ({ de: (f += p), som: "clique" as const, vol }));
};

export const DEIXAS: Deixa[] = [
  // "Bip." (a maquininha aprovando; no fim, o último bip antes do silêncio)
  ...SO_SOM.map((id) => ({ de: T(id), som: "bip" as const, vol: 0.28 })),
  // "Seu telefone nunca para de tocar."
  { de: CORTE(183), ate: T(185), som: "telefone", vol: 0.28 },
  // "Seu telefone toca." (o Banco Central)
  { de: T(225, 0.1), ate: CORTE(225) + 8, som: "telefone", vol: 0.32 },
  // "Naquela noite, o presidente do Banco Central liga novamente."
  { de: T(269, fracDe(269, "liga")), ate: T(270), som: "telefone", vol: 0.28 },
  // "alguém bate à porta" (as duas batidas dos TOC! na tela)
  { de: T(279, fracDe(279, "bate")), som: "toc", vol: 0.4 },
  { de: T(279, fracDe(279, "bate")) + 8, som: "toc", vol: 0.4 },
  // "Câmeras." "Flashes." (cliques junto dos flashes; somem antes da mão tremendo)
  ...cliques(T(250, 0.4) - 3, [3, 9], 0.25),
  ...cliques(T(251) - 4, [4, 4, 3, 5, 4, 6, 3, 5, 4, 6], 0.35),
  ...cliques(CORTE(251), [3, 8, 7, 9, 8, 10], 0.22),
];

export const Efeitos: React.FC = () => (
  <>
    {DEIXAS.map((d, i) => (
      <Sequence key={i} from={d.de} durationInFrames={Math.max(1, (d.ate ?? d.de + DURACAO[d.som]) - d.de)} layout="none">
        <Audio src={staticFile(`sfx/${d.som}.wav`)} volume={d.vol} loop={d.som === "telefone"} />
      </Sequence>
    ))}
  </>
);
