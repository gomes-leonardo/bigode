// Fase 3: folha do elenco. Em cima os 7 fixos, embaixo os figurantes (semente fixa). Todos respiram e piscam.
import React from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { Person, type PersonProps } from "../components/Person";
import { Palco } from "../components/Papel";
import { LINHA } from "../estilo";
import { FONTE, fontes } from "../fontes";
import { idle } from "../rig/actions";
import { ELENCO, figurante, type Ator } from "../elenco/elenco";

const Rotulo: React.FC<{ x: number; y: number; t: string; tam?: number; peso?: number; cor?: string }> = ({ x, y, t, tam = 26, peso = 800, cor = LINHA }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONTE} fontWeight={peso} fontSize={tam} fill={cor}>{t}</text>
);

/** pose parada do ator (respira e pisca), já na escala da cena */
export const atorParado = (a: Ator, x: number, y: number, s: number, f: number): PersonProps => {
  const { nome: _n, desc: _d, expr, scale, ...resto } = a;
  return { ...resto, ...idle({ x, y, scale: s * (scale ?? 1) })(f), expr };
};

const SF = 0.86; // escala da folha
export const FIGURANTES = [21, 12, 90, 28, 49, 18, 66, 24]; // sementes escolhidas para a folha mostrar a variedade
export const DURACAO_ELENCO = 150;

export const FolhaElenco: React.FC = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const f = useCurrentFrame();
  const xs = [140, 410, 680, 955, 1225, 1500, 1770];
  return (
    <Palco>
      {ELENCO.map((a, i) => (
        <g key={a.nome}>
          <Person {...atorParado(a, xs[i], 480, SF, f + i * 17)} semente={i + 1} />
          <Rotulo x={xs[i]} y={522} t={a.nome} />
          <Rotulo x={xs[i]} y={548} t={a.desc} tam={17} peso={600} cor="#6E6A62" />
        </g>
      ))}
      <line x1={80} y1={600} x2={1840} y2={600} stroke="#CFC9BE" strokeWidth={3} strokeDasharray="12 10" />
      {FIGURANTES.map((sem, i) => {
        const a = figurante(sem);
        const x = 150 + i * 231;
        return <Person key={sem} {...atorParado(a, x, 968, SF, f + i * 23)} semente={sem} />;
      })}
      <Rotulo x={960} y={1026} t="figurantes" tam={24} />
      <Rotulo x={960} y={1052} t="mesmo componente · cabelo, cor e roupa sorteados com semente fixa · scale 0.74 · expressão neutra · só piscam e respiram" tam={16} peso={600} cor="#6E6A62" />
    </Palco>
  );
};
