// Fase 1: folha com as 9 expressões e as 6 poses do protagonista.
import React from "react";
import { continueRender, delayRender } from "remotion";
import { Person } from "../components/Person";
import { EXPRESSOES } from "../components/Face";
import { Palco } from "../components/Papel";
import { LINHA } from "../estilo";
import { FONTE, fontes } from "../fontes";
import { POSES } from "./poses";

const Rotulo: React.FC<{ x: number; y: number; t: string; tam?: number; peso?: number; cor?: string }> = ({ x, y, t, tam = 26, peso = 800, cor = LINHA }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONTE} fontWeight={peso} fontSize={tam} fill={cor}>{t}</text>
);

export const Folha: React.FC = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  return (
    <Palco>
      {/* 9 expressões: busto (cabeça e ombros) */}
      {EXPRESSOES.map((e, i) => {
        const cx = 120 + i * 210;
        return (
          <g key={e}>
            <defs><clipPath id={`busto-${i}`}><rect x={cx - 100} y={40} width={200} height={268} /></clipPath></defs>
            <g clipPath={`url(#busto-${i})`}>
              <Person x={cx} y={460} scale={0.82} expr={e} blink={0} semente={i} lookAt={e === "olhar-lateral" || e === "sigma" ? [400, -330] : undefined} handL={[-74, -110]} handR={[76, -108]} />
            </g>
            <Rotulo x={cx} y={344} t={e} tam={24} />
          </g>
        );
      })}
      <line x1={80} y1={384} x2={1840} y2={384} stroke="#CFC9BE" strokeWidth={3} strokeDasharray="12 10" />
      {/* 6 poses */}
      {POSES.map(({ nome, pose }, i) => {
        const cx = 190 + i * 308;
        return (
          <g key={nome}>
            <Person x={cx} y={950} scale={0.92} blink={0} semente={i + 3} {...pose} />
            <Rotulo x={cx} y={1010} t={nome} tam={24} />
          </g>
        );
      })}
      <Rotulo x={960} y={1052} t="protagonista · careca, sigma" tam={18} peso={800} cor="#6E6A62" />
    </Palco>
  );
};
