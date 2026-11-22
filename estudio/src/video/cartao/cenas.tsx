// Cenários extras do vídeo do cartão (capítulos 7 a 11), no mesmo traço dos cenários da Fase 4:
// rua de casas (plano aberto, escala 0.7), varanda com a porta da frente (escala 1.0) e o laboratório do banco.
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../../estilo";
import { Circle, Line, Papel, Path, Rect } from "../../components/prim";
import { lisoSet } from "../../cenarios/liso/Liso";
import type { CenarioDef } from "../../cenarios/Cena";
import { MARGEM } from "../../cenarios/pecas";
import { FONTE } from "../../fontes";

const LARGO = 1920 + 2 * MARGEM;

// ------------------------------------------------------------------ rua de casas
export type CasaDef = { x: number; cor: string; telhado: string; porta: string };
export const PALETAS_RUA: CasaDef[][] = [
  [
    { x: 250, cor: "#E9C46A", telhado: "#B5523B", porta: "#8A5E3F" },
    { x: 710, cor: "#9CC5A1", telhado: "#8E4A3A", porta: "#6E4B35" },
    { x: 1170, cor: "#E8A598", telhado: "#B5523B", porta: "#8A5E3F" },
    { x: 1630, cor: "#A9C4E2", telhado: "#8E4A3A", porta: "#6E4B35" },
  ],
  [
    { x: 250, cor: "#C9B8E0", telhado: "#6E5A8A", porta: "#5A3E2A" },
    { x: 710, cor: "#F2D9A6", telhado: "#B5523B", porta: "#6E4B35" },
    { x: 1170, cor: "#B8D8D0", telhado: "#3F6E66", porta: "#5A3E2A" },
    { x: 1630, cor: "#EBC1A0", telhado: "#8E4A3A", porta: "#6E4B35" },
  ],
];
export const CASA_TOPO = 480; // topo da parede
export const CASA_BASE = 900;
export const CasaRua: React.FC<CasaDef> = ({ x, cor, telhado, porta }) => (
  <Papel>
    <Rect x={x - 200} y={CASA_TOPO} width={400} height={CASA_BASE - CASA_TOPO} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} />
    <Path d={`M ${x - 234} ${CASA_TOPO + 14} L ${x} ${CASA_TOPO - 190} L ${x + 234} ${CASA_TOPO + 14} Z`} fill={telhado} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
    <Rect x={x - 62} y={CASA_BASE - 300} width={124} height={300} rx={6} fill={porta} stroke={LINHA} strokeWidth={CONTORNO} />
    <Rect x={x - 44} y={CASA_BASE - 280} width={88} height={110} rx={4} fill="none" stroke={escura(porta)} strokeWidth={INTERNA} />
    <Circle cx={x + 40} cy={CASA_BASE - 140} r={8} fill="#F2D16B" stroke={LINHA} strokeWidth={3} />
    {[-1, 1].map((s) => (
      <g key={s}>
        <Rect x={x + s * 132 - 52} y={CASA_TOPO + 60} width={104} height={100} rx={4} fill="#CFE6F0" stroke={LINHA} strokeWidth={CONTORNO} />
        <Line x1={x + s * 132} y1={CASA_TOPO + 60} x2={x + s * 132} y2={CASA_TOPO + 160} stroke={LINHA} strokeWidth={INTERNA} />
        <Rect x={x + s * 132 - 62} y={CASA_TOPO + 156} width={124} height={16} rx={4} fill={escura(cor, 0.85)} stroke={LINHA} strokeWidth={INTERNA} />
      </g>
    ))}
  </Papel>
);
export const ruaCasas = (paleta = 0): CenarioDef => {
  const set = lisoSet(0.7);
  set.id = `rua_casas_${paleta}`;
  set.nome = "Rua de casas";
  set.ancoras = { chao: { tipo: "chao", y: 962, yFundo: 930, x0: 40, x1: 1880 } };
  const Fundo: React.FC<{ t: number }> = ({ t }) => (
    <g>
      <rect x={-MARGEM} y={-MARGEM} width={LARGO} height={1200} fill="#BFDDEA" />
      {[0, 1, 2].map((i) => {
        const x = ((i * 700 + t * 12) % (1920 + 600)) - 300;
        return (
          <g key={i} transform={`translate(${x} ${120 + i * 60})`}>
            <ellipse cx={0} cy={0} rx={110} ry={40} fill="#FFFFFF" />
            <ellipse cx={60} cy={-20} rx={70} ry={40} fill="#FFFFFF" />
          </g>
        );
      })}
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-80 + i * 260} cy={600} r={120 + (i % 3) * 30} fill="#8DBF7E" />)}
    </g>
  );
  const Meio: React.FC<{ t: number }> = () => (
    <g>
      <Rect x={-MARGEM} y={820} width={LARGO} height={90} fill="#8DBF7E" stroke={LINHA} strokeWidth={CONTORNO} semSombra />
      {PALETAS_RUA[paleta].map((c) => <CasaRua key={c.x} {...c} />)}
      <Rect x={-MARGEM} y={900} width={LARGO} height={100} fill="#DCD5C8" stroke={LINHA} strokeWidth={CONTORNO} semSombra />
      {Array.from({ length: 16 }, (_, i) => <Line key={i} x1={-60 + i * 140} y1={900} x2={-90 + i * 140} y2={1000} stroke={escura("#DCD5C8", 0.85)} strokeWidth={3} semSombra />)}
      <Rect x={-MARGEM} y={1000} width={LARGO} height={16} fill="#B9B2A5" stroke={LINHA} strokeWidth={5} semSombra />
      <Rect x={-MARGEM} y={1016} width={LARGO} height={200} fill="#6B6E75" semSombra />
    </g>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Frente };
};
export const RUA_CASAS = ruaCasas(0);
export const RUA_VIZINHA = ruaCasas(1);

// ------------------------------------------------------------------ varanda: a fachada da casa do protagonista, porta da frente
export const PORTA = { x0: 420, x1: 650, topo: 380, base: 900 };
export const VARANDA: CenarioDef = (() => {
  const set = lisoSet(1.0);
  set.id = "varanda";
  set.nome = "Varanda";
  set.ancoras = { chao: { tipo: "chao", y: 966, yFundo: 930, x0: 40, x1: 1880 } };
  const Fundo: React.FC<{ t: number }> = () => (
    <g>
      <rect x={-MARGEM} y={-MARGEM} width={LARGO} height={1200} fill="#BFDDEA" />
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={1150 + i * 180} cy={660} r={110 + (i % 2) * 40} fill="#8DBF7E" />)}
      <rect x={1100} y={700} width={1000} height={400} fill="#9CC98A" />
    </g>
  );
  const Meio: React.FC<{ t: number }> = () => (
    <g>
      <Papel>
        {/* fachada */}
        <Rect x={-MARGEM} y={-MARGEM} width={1180 + MARGEM} height={900 + MARGEM} fill="#EFE3CC" stroke={LINHA} strokeWidth={CONTORNO} />
        {Array.from({ length: 14 }, (_, i) => <Line key={i} x1={-MARGEM} y1={60 + i * 64} x2={1180} y2={60 + i * 64} stroke={escura("#EFE3CC", 0.93)} strokeWidth={3} />)}
        {/* janela */}
        <Rect x={790} y={360} width={260} height={250} rx={6} fill="#CFE6F0" stroke={LINHA} strokeWidth={CONTORNO} />
        <Line x1={920} y1={360} x2={920} y2={610} stroke={LINHA} strokeWidth={INTERNA} />
        <Line x1={790} y1={485} x2={1050} y2={485} stroke={LINHA} strokeWidth={INTERNA} />
        <Rect x={770} y={600} width={300} height={24} rx={6} fill="#C9B79A" stroke={LINHA} strokeWidth={INTERNA} />
        {/* porta */}
        <Rect x={PORTA.x0 - 26} y={PORTA.topo - 26} width={PORTA.x1 - PORTA.x0 + 52} height={PORTA.base - PORTA.topo + 26} fill="#FFFFFF" stroke={LINHA} strokeWidth={CONTORNO} />
        <Rect x={PORTA.x0} y={PORTA.topo} width={PORTA.x1 - PORTA.x0} height={PORTA.base - PORTA.topo} fill="#2F5D50" stroke={LINHA} strokeWidth={CONTORNO} />
        <Rect x={PORTA.x0 + 34} y={PORTA.topo + 34} width={PORTA.x1 - PORTA.x0 - 68} height={170} rx={4} fill="none" stroke={escura("#2F5D50")} strokeWidth={INTERNA} />
        <Rect x={PORTA.x0 + 34} y={PORTA.topo + 250} width={PORTA.x1 - PORTA.x0 - 68} height={200} rx={4} fill="none" stroke={escura("#2F5D50")} strokeWidth={INTERNA} />
        <Circle cx={PORTA.x1 - 30} cy={PORTA.topo + 270} r={11} fill="#E3B95B" stroke={LINHA} strokeWidth={4} />
        {/* número e luz da varanda */}
        <Rect x={PORTA.x1 + 50} y={PORTA.topo + 10} width={70} height={56} rx={8} fill="#2B3447" stroke={LINHA} strokeWidth={INTERNA} />
        <Rect x={PORTA.x0 - 110} y={PORTA.topo + 30} width={40} height={60} rx={10} fill="#F2D16B" stroke={LINHA} strokeWidth={INTERNA} />
        {/* vaso */}
        <Path d="M 200 900 L 214 790 L 306 790 L 320 900 Z" fill="#C86F4E" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      </Papel>
      <text x={PORTA.x1 + 85} y={PORTA.topo + 51} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={34} fill="#FFFFFF">27</text>
      {[[230, 770], [260, 740], [292, 772], [250, 720], [280, 712]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={26} ry={44} fill="#6DAA5C" stroke={LINHA} strokeWidth={5} transform={`rotate(${(i - 2) * 18} ${x} ${y})`} />)}
      {/* piso da varanda e degrau */}
      <Rect x={-MARGEM} y={900} width={1240 + MARGEM} height={80} fill="#B98A5E" stroke={LINHA} strokeWidth={CONTORNO} semSombra />
      {Array.from({ length: 8 }, (_, i) => <Line key={i} x1={-40 + i * 170} y1={900} x2={-40 + i * 170} y2={980} stroke={escura("#B98A5E")} strokeWidth={3} semSombra />)}
      <Rect x={1240} y={930} width={LARGO} height={60} fill="#DCD5C8" stroke={LINHA} strokeWidth={CONTORNO} semSombra />
      <Rect x={-MARGEM} y={980} width={LARGO} height={200} fill="#CFC6B6" stroke={LINHA} strokeWidth={CONTORNO} semSombra />
      {/* cerquinha */}
      {Array.from({ length: 8 }, (_, i) => <Rect key={i} x={1290 + i * 90} y={780} width={30} height={150} rx={6} fill="#FFFFFF" stroke={LINHA} strokeWidth={5} semSombra />)}
      <Rect x={1270} y={820} width={760} height={20} fill="#FFFFFF" stroke={LINHA} strokeWidth={5} semSombra />
    </g>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Frente };
})();

// ------------------------------------------------------------------ laboratório do banco: bancada (balcão) com scanner e microscópio
export const LAB: CenarioDef = (() => {
  const set = lisoSet(1.2);
  set.id = "lab";
  set.nome = "Laboratório";
  set.ancoras = { chao: { tipo: "chao", y: 962, yFundo: 930, x0: 40, x1: 1880 }, bancada: { tipo: "tampo", y: 820, x0: 360, x1: 1560 } };
  const Fundo: React.FC<{ t: number }> = () => (
    <g>
      <rect x={-MARGEM} y={-MARGEM} width={LARGO} height={1200} fill="#DDE8EE" />
      {[260, 1660].map((x) => (
        <g key={x}>
          <rect x={x - 150} y={200} width={300} height={16} fill="#B9C4CC" />
          {[0, 1, 2].map((i) => <rect key={i} x={x - 120 + i * 90} y={136} width={50} height={64} rx={10} fill={["#9ED8F5", "#B8E0B0", "#F2D16B"][i]} />)}
        </g>
      ))}
    </g>
  );
  const Meio: React.FC<{ t: number }> = () => (
    <g>
      <Rect x={-MARGEM} y={900} width={LARGO} height={200} fill="#C9D3DA" stroke={LINHA} strokeWidth={CONTORNO} semSombra />
    </g>
  );
  const Balcao: React.FC<{ t: number }> = () => (
    <Papel>
      <Rect x={340} y={820} width={1240} height={40} rx={8} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={370} y={860} width={1180} height={110} fill="#AEB8C6" stroke={LINHA} strokeWidth={CONTORNO} />
      {[0, 1, 2, 3].map((i) => <Rect key={i} x={390 + i * 290} y={874} width={270} height={80} rx={6} fill="none" stroke={escura("#AEB8C6")} strokeWidth={INTERNA} />)}
      {/* microscópio */}
      <Rect x={440} y={800} width={120} height={20} rx={6} fill="#3A3F4B" stroke={LINHA} strokeWidth={INTERNA} />
      <Path d="M 480 800 L 480 700 Q 480 660 520 650 L 540 646" stroke={LINHA} strokeWidth={22} fill="none" strokeLinecap="round" />
      <Path d="M 480 800 L 480 700 Q 480 660 520 650 L 540 646" stroke="#E9E4DA" strokeWidth={12} fill="none" strokeLinecap="round" />
      <Rect x={524} y={620} width={30} height={70} rx={8} fill="#3A3F4B" stroke={LINHA} strokeWidth={INTERNA} transform="rotate(-30 539 655)" />
      {/* scanner: braço com cabeça em cima do cartão */}
      <Rect x={1330} y={600} width={30} height={220} fill="#8A8F98" stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={1060} y={580} width={300} height={34} rx={10} fill="#8A8F98" stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={900} y={560} width={190} height={74} rx={14} fill="#3A3F4B" stroke={LINHA} strokeWidth={CONTORNO} />
      <Circle cx={940} cy={597} r={9} fill="#E0826E" />
    </Papel>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Balcao, Frente };
})();

// ------------------------------------------------------------------ plenário (Congresso): parede de madeira, bancada comprida com microfones
export const PLENARIO: CenarioDef = (() => {
  const set = lisoSet(1.3);
  set.id = "plenario";
  set.nome = "Plenário";
  set.ancoras = { chao: { tipo: "chao", y: 962, yFundo: 900, x0: 40, x1: 1880 }, bancada: { tipo: "tampo", y: 800, x0: 80, x1: 1840 } };
  const Fundo: React.FC<{ t: number }> = () => (
    <g>
      <rect x={-MARGEM} y={-MARGEM} width={LARGO} height={1200} fill="#B98A5E" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-MARGEM + i * 200} y={-MARGEM} width={14} height={1200} fill="#A67A50" />)}
      <rect x={-MARGEM} y={560} width={LARGO} height={30} fill="#8E6440" />
    </g>
  );
  const Meio: React.FC<{ t: number }> = () => (
    <g>
      <Rect x={-MARGEM} y={900} width={LARGO} height={200} fill="#5E7A5A" stroke={LINHA} strokeWidth={CONTORNO} semSombra />
    </g>
  );
  const Balcao: React.FC<{ t: number }> = () => (
    <Papel>
      <Rect x={-MARGEM} y={800} width={LARGO} height={36} rx={6} fill="#8E6440" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={-MARGEM} y={836} width={LARGO} height={140} fill="#A67A50" stroke={LINHA} strokeWidth={CONTORNO} />
      {Array.from({ length: 7 }, (_, i) => <Rect key={i} x={-60 + i * 300} y={856} width={260} height={100} rx={6} fill="none" stroke={escura("#A67A50")} strokeWidth={INTERNA} />)}
      {[330, 790, 1250, 1710].map((x) => (
        <g key={x}>
          <Path d={`M ${x} 800 L ${x} 740 Q ${x} 712 ${x - 24} 700`} stroke={LINHA} strokeWidth={7} fill="none" strokeLinecap="round" />
          <Rect x={x - 40} y={690} width={22} height={22} rx={8} fill="#3A3F4B" stroke={LINHA} strokeWidth={INTERNA} />
        </g>
      ))}
    </Papel>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Balcao, Frente };
})();
