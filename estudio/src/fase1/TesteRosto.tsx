// Fase 1: teste curto em vídeo das trocas de expressão (interpolação), piscada automática e olhar.
import React from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { Person } from "../components/Person";
import { EXPRESSOES, expressaoNoQuadro } from "../components/Face";
import { Palco } from "../components/Papel";
import { LINHA } from "../estilo";
import { FONTE, fontes } from "../fontes";

const TROCAS = EXPRESSOES.map((e, i) => [i * 22, e] as [number, (typeof EXPRESSOES)[number]]);
export const DURACAO_TESTE_ROSTO = 22 * EXPRESSOES.length + 30;

export const TesteRosto: React.FC = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const f = useCurrentFrame();
  const rosto = expressaoNoQuadro(TROCAS, f, 8);
  const atual = TROCAS.filter(([q]) => f >= q).pop()![1];
  const resp = 0.5 - 0.5 * Math.cos((2 * Math.PI * f) / 60);
  // os olhos viram para o alvo 4 quadros antes da cabeça
  const alvoEm = (q: number): [number, number] => [Math.sin(q / 25) * 500, -330 + Math.cos(q / 31) * 200];
  const olhar = alvoEm(f);
  const cabeca = alvoEm(f - 4);
  return (
    <Palco>
      <g transform={`translate(960 ${1010}) scale(${1 + 0.015 * resp} ${1 + 0.015 * resp}) translate(-960 -1010)`}>
        <Person x={960} y={1010} scale={2.1} expr={rosto} headTilt={(cabeca[0] / 500) * 6} lookAt={olhar} handL={[-74, -110]} handR={[76, -108]} semente={2} />
      </g>
      <text x={960} y={90} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={44} fill={LINHA}>{atual}</text>
    </Palco>
  );
};
