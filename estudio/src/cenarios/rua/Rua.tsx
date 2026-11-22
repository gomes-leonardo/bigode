// Rua: céu, prédios ao longe (fundo); fachadas (casa, mercadinho, prédios), calçada, meio-fio, asfalto, poste,
// árvore, banco e lixeira (meio); carro estacionado e floreira (frente).
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../../estilo";
import { Circle, Line, Papel, Path, Rect } from "../../components/prim";
import { FONTE } from "../../fontes";
import { ancora, type SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { Arvore, MARGEM, Nuvem, Parede, Planta } from "../pecas";
import dados from "./set.json";

const set = dados as SetJson;
const FACHADA = 880; // base das fachadas
const banco = ancora(set, "banco", "assento");
const f1 = (n: number) => n.toFixed(1);

const Janelinhas: React.FC<{ x0: number; y0: number; cols: number; rows: number; w: number; h: number; dx: number; dy: number; cor?: string }> = ({ x0, y0, cols, rows, w, h, dx, dy, cor = "#CFE6F0" }) => (
  <g>
    {Array.from({ length: cols * rows }, (_, i) => (
      <Rect key={i} x={x0 + (i % cols) * dx} y={y0 + Math.floor(i / cols) * dy} width={w} height={h} rx={3} fill={cor} stroke={LINHA} strokeWidth={INTERNA} />
    ))}
  </g>
);

const Fundo: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Parede cor="#BFDDEA" base={FACHADA} />
    <Nuvem x={300 + t * 6} y={110} s={1} />
    <Nuvem x={1180 + t * 4} y={80} s={0.8} />
    <Nuvem x={1700 + t * 5} y={150} s={0.7} />
    <Papel>
      {[[-200, 200, 220, "#C7C0D6"], [40, 150, 180, "#B9C9C2"], [240, 240, 200, "#D6C7B5"], [1000, 170, 240, "#C7C0D6"], [1260, 120, 200, "#B9C9C2"], [1480, 200, 260, "#D6C7B5"], [1760, 140, 220, "#C7C0D6"]].map(([x, y, w, c], i) => (
        <g key={i}>
          <Rect x={x as number} y={y as number} width={w as number} height={600} fill={c as string} stroke={LINHA} strokeWidth={CONTORNO - 1} />
          <Janelinhas x0={(x as number) + 24} y0={(y as number) + 30} cols={3} rows={4} w={30} h={34} dx={(w as number) / 3 - 8} dy={60} cor={escura(c as string, 0.92)} />
        </g>
      ))}
    </Papel>
  </g>
);

// plano aberto: escala 0.9, então porta ~ 450 px e os prédios passam do topo do quadro
const Casa: React.FC = () => (
  <Papel>
    <Rect x={-MARGEM} y={120} width={700 + MARGEM} height={FACHADA - 120} fill="#E9C7A5" stroke={LINHA} strokeWidth={CONTORNO} />
    <Rect x={-MARGEM} y={100} width={720 + MARGEM} height={30} rx={4} fill="#C86F4E" stroke={LINHA} strokeWidth={CONTORNO} />
    <Rect x={150} y={430} width={180} height={FACHADA - 430} rx={6} fill="#8A5E3F" stroke={LINHA} strokeWidth={CONTORNO} />
    <Rect x={172} y={456} width={136} height={170} rx={4} fill="none" stroke={escura("#8A5E3F")} strokeWidth={INTERNA} />
    <Rect x={172} y={650} width={136} height={170} rx={4} fill="none" stroke={escura("#8A5E3F")} strokeWidth={INTERNA} />
    <Circle cx={310} cy={660} r={8} fill="#F2D16B" stroke={LINHA} strokeWidth={3} />
    <Rect x={-150} y={430} width={200} height={230} rx={4} fill="#CFE6F0" stroke={LINHA} strokeWidth={CONTORNO} />
    <Line x1={-50} y1={430} x2={-50} y2={660} stroke={LINHA} strokeWidth={INTERNA} />
    <Rect x={-166} y={652} width={232} height={28} rx={4} fill="#A9714E" stroke={LINHA} strokeWidth={INTERNA} />
    {[-130, -86, -40, 6, 44].map((x, i) => <Circle key={x} cx={x} cy={642} r={14} fill={["#E37BA1", "#F2D16B", "#E0826E", "#E37BA1", "#F2D16B"][i]} stroke={LINHA} strokeWidth={3} />)}
    <Rect x={420} y={250} width={200} height={230} rx={4} fill="#CFE6F0" stroke={LINHA} strokeWidth={CONTORNO} />
    <Line x1={520} y1={250} x2={520} y2={480} stroke={LINHA} strokeWidth={INTERNA} />
  </Papel>
);

const Mercado: React.FC<{ t: number }> = () => {
  const x0 = 680, x1 = 1400;
  return (
    <g>
      <Papel>
        <Rect x={x0} y={150} width={x1 - x0} height={FACHADA - 150} fill="#A9C4B5" stroke={LINHA} strokeWidth={CONTORNO} />
        <Rect x={x0 + 50} y={190} width={x1 - x0 - 100} height={96} rx={12} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} />
      </Papel>
      <text x={(x0 + x1) / 2} y={262} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={62} fill="#C0504D" letterSpacing={5}>MERCADO</text>
      <Papel>
        {/* vitrine com prateleiras */}
        <Rect x={x0 + 40} y={470} width={380} height={FACHADA - 486} rx={4} fill="#E3F1F6" stroke={LINHA} strokeWidth={CONTORNO} />
        {[600, 730].map((y) => <Line key={y} x1={x0 + 40} y1={y} x2={x0 + 420} y2={y} stroke={LINHA} strokeWidth={INTERNA} />)}
        {Array.from({ length: 16 }, (_, i) => (
          <Rect key={i} x={x0 + 56 + (i % 8) * 45} y={(i < 8 ? 600 : 730) - 56 + (i % 3) * 8} width={32} height={56 - (i % 3) * 8} rx={3} fill={["#E0822E", "#5AA5B8", "#F2D16B", "#C0504D", "#7AA35B"][i % 5]} stroke={LINHA} strokeWidth={3} />
        ))}
        {/* porta de vidro */}
        <Rect x={x0 + 470} y={430} width={190} height={FACHADA - 430} rx={4} fill="#E3F1F6" stroke={LINHA} strokeWidth={CONTORNO} />
        <Line x1={x0 + 565} y1={430} x2={x0 + 565} y2={FACHADA} stroke={LINHA} strokeWidth={INTERNA} />
        <Rect x={x0 + 540} y={620} width={12} height={80} rx={6} fill="#B9BEC6" stroke={LINHA} strokeWidth={3} />
        <Rect x={x0 + 578} y={620} width={12} height={80} rx={6} fill="#B9BEC6" stroke={LINHA} strokeWidth={3} />
      </Papel>
      {/* toldo listrado com borda ondulada */}
      <Papel>
        <Path d={`M ${x0 + 10} 320 L ${x1 - 10} 320 L ${x1 + 14} 400 ${Array.from({ length: 12 }, (_, i) => `Q ${f1(x1 + 14 - (i + 0.5) * ((x1 - x0 + 28) / 12))} 440 ${f1(x1 + 14 - (i + 1) * ((x1 - x0 + 28) / 12))} 400`).join(" ")} Z`} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
        {Array.from({ length: 6 }, (_, i) => {
          const w = (x1 - x0 + 28) / 12;
          const xa = x0 - 14 + i * 2 * w;
          return <Path key={i} d={`M ${f1(xa + 24 - i * 2)} 320 L ${f1(xa + w + 24 - i * 2)} 320 L ${f1(xa + w)} 400 Q ${f1(xa + w / 2)} 440 ${f1(xa)} 400 Z`} fill="#C0504D" stroke={LINHA} strokeWidth={INTERNA} strokeLinejoin="round" />;
        })}
      </Papel>
    </g>
  );
};

const Predio: React.FC<{ x0: number; x1: number; cor: string }> = ({ x0, x1, cor }) => {
  const n = Math.floor((x1 - x0 - 80) / 190);
  return (
    <Papel>
      <Rect x={x0} y={-MARGEM} width={x1 - x0} height={FACHADA + MARGEM} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} />
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <Rect x={x0 + 70 + i * 190} y={60} width={120} height={180} rx={4} fill="#CFE6F0" stroke={LINHA} strokeWidth={INTERNA + 1} />
          <Rect x={x0 + 58 + i * 190} y={236} width={144} height={18} rx={4} fill={escura(cor, 0.8)} stroke={LINHA} strokeWidth={INTERNA} />
        </g>
      ))}
      <Rect x={x0 + 90} y={430} width={180} height={FACHADA - 430} rx={6} fill="#6E4B35" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={x0 + 330} y={470} width={140} height={190} rx={4} fill="#CFE6F0" stroke={LINHA} strokeWidth={INTERNA + 1} />
      <Rect x={x0 + 520} y={470} width={140} height={190} rx={4} fill="#CFE6F0" stroke={LINHA} strokeWidth={INTERNA + 1} />
    </Papel>
  );
};

const Calcada: React.FC = () => {
  const y0 = FACHADA, y1 = 990;
  const linha = escura("#D6D0C4", 0.85);
  return (
    <g>
      <Rect x={-MARGEM} y={y0} width={1920 + 2 * MARGEM} height={y1 - y0} fill="#D6D0C4" semSombra />
      {[915, 952].map((y) => <Line key={y} x1={-MARGEM} y1={y} x2={1920 + MARGEM} y2={y} stroke={linha} strokeWidth={3} semSombra />)}
      {Array.from({ length: 22 }, (_, i) => {
        const x = -MARGEM + i * 120;
        return <Line key={i} x1={x} y1={y0} x2={x + (x - 960) * 0.08} y2={y1} stroke={linha} strokeWidth={3} semSombra />;
      })}
      <Line x1={-MARGEM} y1={y0} x2={1920 + MARGEM} y2={y0} stroke={LINHA} strokeWidth={CONTORNO - 1} semSombra />
      {/* meio-fio e asfalto */}
      <Rect x={-MARGEM} y={y1} width={1920 + 2 * MARGEM} height={22} fill="#BDB6A8" stroke={LINHA} strokeWidth={CONTORNO - 1} semSombra />
      <Rect x={-MARGEM} y={y1 + 22} width={1920 + 2 * MARGEM} height={MARGEM} fill="#7C7F87" semSombra />
      {Array.from({ length: 10 }, (_, i) => <Rect key={i} x={-MARGEM + 40 + i * 300} y={1066} width={150} height={10} rx={4} fill="#F4F1EA" semSombra />)}
    </g>
  );
};

const Poste: React.FC<{ x: number }> = ({ x }) => (
  <Papel>
    <Rect x={x - 11} y={140} width={22} height={770} rx={7} fill="#3F5F55" stroke={LINHA} strokeWidth={CONTORNO} />
    <Rect x={x - 24} y={884} width={48} height={26} rx={6} fill="#3F5F55" stroke={LINHA} strokeWidth={CONTORNO} />
    <Path d={`M ${x} 146 Q ${x} 80 ${x + 70} 80 L ${x + 110} 80`} stroke={LINHA} strokeWidth={20} fill="none" strokeLinecap="round" />
    <Path d={`M ${x} 146 Q ${x} 80 ${x + 70} 80 L ${x + 110} 80`} stroke="#3F5F55" strokeWidth={9} fill="none" strokeLinecap="round" />
    <Path d={`M ${x + 80} 84 L ${x + 140} 84 L ${x + 128} 124 L ${x + 92} 124 Z`} fill="#F2D16B" stroke={LINHA} strokeWidth={INTERNA} strokeLinejoin="round" />
  </Papel>
);

/** coisas do tamanho de gente: desenhadas para escala 1.35 e reduzidas para a escala da rua */
const K = set.escala / 1.35;
const naEscala = (x: number, y: number) => `translate(${x} ${y}) scale(${K.toFixed(4)}) translate(${-x} ${-y})`;

const Banco: React.FC = () => {
  const { x, y } = banco;
  const m = "#A9714E";
  return (
    <g transform={naEscala(x, y)}>
      <Papel>
        {[0, 1, 2].map((i) => <Rect key={i} x={x - 150} y={y - 92 + i * 26} width={300} height={18} rx={6} fill={m} stroke={LINHA} strokeWidth={INTERNA + 1} />)}
        {[-1, 1].map((k) => (
          <Path key={k} d={`M ${x + k * 132} ${y - 100} L ${x + k * 132} ${y + 54} M ${x + k * 132} ${y - 20} Q ${x + k * 160} ${y - 24} ${x + k * 156} ${y + 4}`} stroke={LINHA} strokeWidth={12} fill="none" strokeLinecap="round" />
        ))}
        <Rect x={x - 160} y={y - 4} width={320} height={20} rx={6} fill={escura(m, 0.9)} stroke={LINHA} strokeWidth={CONTORNO} />
      </Papel>
    </g>
  );
};

const Lixeira: React.FC<{ x: number }> = ({ x }) => (
  <g transform={naEscala(x, 912)}>
    <Papel>
      <Rect x={x - 10} y={830} width={20} height={82} fill="#3F5F55" stroke={LINHA} strokeWidth={INTERNA} />
      <Path d={`M ${x - 40} 760 L ${x + 40} 760 L ${x + 34} 846 Q ${x} 856 ${x - 34} 846 Z`} fill="#E0822E" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      <Rect x={x - 46} y={750} width={92} height={16} rx={6} fill={escura("#E0822E", 0.85)} stroke={LINHA} strokeWidth={INTERNA} />
    </Papel>
  </g>
);

const Meio: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Casa />
    <Mercado t={t} />
    <Predio x0={1400} x1={2300} cor="#D9CFE8" />
    <Calcada />
    <Arvore x={560} y={905} s={2.3} />
    <Poste x={1250} />
    <Banco />
    <Lixeira x={1790} />
  </g>
);

const Carro: React.FC = () => {
  const cor = "#C0504D";
  return (
    <g transform="translate(-60 0)">
      <Papel>
        <Path d={`M -${MARGEM} 900 L 150 900 Q 230 900 280 960 L 380 972 Q 410 976 412 1000 L 412 1060 Q 412 1090 380 1090 L -${MARGEM} 1090 Z`} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
        <Path d={`M -${MARGEM} 916 L 140 916 Q 200 918 236 960 L -${MARGEM} 960 Z`} fill="#CFE6F0" stroke={LINHA} strokeWidth={INTERNA} strokeLinejoin="round" />
        <Rect x={360} y={992} width={44} height={28} rx={8} fill="#F2D16B" stroke={LINHA} strokeWidth={INTERNA} />
        <Line x1={-MARGEM} y1={1010} x2={340} y2={1010} stroke={escura(cor)} strokeWidth={INTERNA} />
        <Circle cx={250} cy={1092} r={62} fill="#2A2A35" stroke={LINHA} strokeWidth={CONTORNO} />
        <Circle cx={250} cy={1092} r={26} fill="#B9BEC6" stroke={LINHA} strokeWidth={INTERNA} />
      </Papel>
    </g>
  );
};

const Frente: React.FC<{ t: number }> = () => (
  <g>
    <Carro />
    <Papel>
      <Path d="M 1730 1000 L 2000 1000 L 1990 1100 L 1740 1100 Z" fill="#BDB6A8" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
    </Papel>
    <Planta x={1800} y={1010} s={0.9} tipo="redonda" vaso="#BDB6A8" folha="#5E9A62" />
    <Planta x={1900} y={1010} s={1.0} tipo="espada" vaso="#BDB6A8" folha="#4F8A6B" />
  </g>
);

export const RUA: CenarioDef = { set, Fundo, Meio, Frente };
