// Thumbnails do vídeo dos códigos de GTA, no mesmo traço do vídeo. Nada do visual do jogo (logo, fonte, personagens):
// só as peças genéricas do próprio vídeo. A: "1 carro = 2 milhões de bombas". B: "códigos de GTA na vida real?".
import React from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { Person, type PersonProps } from "../../components/Person";
import { scared } from "../../rig/actions";
import { PROTAGONISTA } from "../../elenco/elenco";
import { props } from "../../fase4/Cenarios";
import { fontes } from "../../fontes";
import { Texto } from "../graficos";
import { Escudo, Estrelas, Hatch, Tecla } from "./pecas";

const L = "#141414";
const brilho = (x: number, y: number, s: number, i: number) => (
  <path key={i} d="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" transform={`translate(${x} ${y}) scale(${s})`} fill="#FFFFFF" stroke={L} strokeWidth={4} />
);
const teo = (x: number, y: number, scale: number): PersonProps => {
  const p: PersonProps = { ...props(PROTAGONISTA), ...scared({ x, y, scale })(30), expr: "chocado" };
  p.lookAt = [x + 600, y - 900];
  return p;
};
const Raios: React.FC<{ cx: number; cy: number; cor: string; n?: number }> = ({ cx, cy, cor, n = 16 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a0 = (i / n) * Math.PI * 2, a1 = a0 + Math.PI / n;
      return <path key={i} d={`M ${cx} ${cy} L ${cx + Math.cos(a0) * 2400} ${cy + Math.sin(a0) * 2400} L ${cx + Math.cos(a1) * 2400} ${cy + Math.sin(a1) * 2400} Z`} fill={cor} />;
    })}
  </g>
);
const Circulo: React.FC<{ x: number; y: number; r?: number; children: React.ReactNode }> = ({ x, y, r = 190, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={9} cy={11} r={r} fill="#10131F" opacity={0.6} />
    <circle r={r} fill="#F4F1EA" stroke={L} strokeWidth={10} />
    {children}
  </g>
);

export const ThumbGta: React.FC<{ variante: "A" | "B" }> = ({ variante }) => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <defs>
          <radialGradient id="th-luz" cx="0.66" cy="0.62" r="0.75">
            <stop offset="0" stopColor="#FFF6CF" />
            <stop offset="0.28" stopColor="#F2C14E" />
            <stop offset="0.7" stopColor="#3B3060" />
            <stop offset="1" stopColor="#1B1D33" />
          </radialGradient>
          <radialGradient id="th-fundo" cx="0.5" cy="0.6" r="0.8">
            <stop offset="0" stopColor="#3A4C78" />
            <stop offset="1" stopColor="#141829" />
          </radialGradient>
        </defs>
        {variante === "A" ? (
          <>
            <rect width={1920} height={1080} fill="url(#th-luz)" />
            <g opacity={0.12}><Raios cx={1270} cy={680} cor="#FFFFFF" /></g>
            {/* o carro que apareceu do nada */}
            <g transform="translate(1400 900) scale(1.7)"><Hatch /></g>
            {[[1020, 560, 1.4], [1760, 540, 1.1], [1820, 840, 1.4], [1080, 400, 0.9], [1560, 380, 0.8]].map(([x, y, s], i) => brilho(x, y, s, i))}
            {/* as quatro teclas */}
            <g transform="translate(600 1000) rotate(-5) scale(0.66)">
              <rect x={-90} y={-95} width={720} height={190} rx={30} fill="#1A1F29" opacity={0.9} />
              {["V", "R", "U", "M"].map((l, i) => <g key={l} transform={`translate(${i * 180} 0)`}><Tecla letra={l} aperta={0} acesa /></g>)}
            </g>
            {/* o Téo, assustado */}
            <Person {...teo(400, 1330, 2.45)} semente={1} />
            {/* o texto */}
            <g transform="translate(1330 0) rotate(-3 0 300)">
              <Texto texto="1 CARRO =" tam={110} y={175} cor="#FFFFFF" />
              <Texto texto="2 MILHÕES" tam={168} y={350} cor="#F2D16B" />
              <Texto texto="DE BOMBAS" tam={118} y={480} cor="#FFFFFF" />
            </g>
          </>
        ) : (
          <>
            <rect width={1920} height={1080} fill="url(#th-fundo)" />
            <g opacity={0.07}><Raios cx={960} cy={760} cor="#FFFFFF" n={20} /></g>
            <Circulo x={330} y={700}><g transform="translate(0 70) scale(0.72)"><Hatch /></g></Circulo>
            <Circulo x={1590} y={700}><g transform="scale(1.5)"><Escudo /></g></Circulo>
            <g transform="translate(1590 430) scale(0.9)"><rect x={-260} y={-62} width={520} height={124} rx={62} fill="#1A1F29" stroke={L} strokeWidth={8} /><g transform="translate(-184 0)"><Estrelas n={5} r={40} /></g></g>
            <Person {...teo(960, 1400, 2.5)} semente={1} />
            <g transform="rotate(-2 960 200)">
              <Texto texto="CÓDIGOS DE GTA" tam={120} x={960} y={160} cor="#FFFFFF" />
              <Texto texto="NA VIDA REAL?" tam={150} x={960} y={320} cor="#F2D16B" />
            </g>
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};
