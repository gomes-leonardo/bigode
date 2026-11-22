// Padaria: porta de vidro, prateleiras de pães, placa, lousa do cardápio, máquina de café; o balcão com vitrine
// fica no plano "balcão" (na frente do padeiro, atrás dos clientes). Piso xadrez.
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../../estilo";
import { Circle, Ellipse, Line, Papel, Path, Rect } from "../../components/prim";
import { FONTE } from "../../fontes";
import { ancora, type SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { MARGEM, Parede, Piso, Rodape } from "../pecas";
import dados from "./set.json";

const set = dados as SetJson;
const PAREDE = 880;
const balcao = ancora(set, "balcao", "tampo");
const MADEIRA = "#A26B45";
const PAO = "#D99A4E";
const CASCA = "#B5763A";

const Baguete: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`rotate(${a} ${x} ${y})`}>
    <Rect x={x - 16} y={y - 96} width={32} height={120} rx={16} fill={PAO} stroke={LINHA} strokeWidth={INTERNA} />
    {[0, 1, 2].map((i) => <Path key={i} d={`M ${x - 8} ${y - 70 + i * 30} q 8 -8 16 0`} stroke={CASCA} strokeWidth={3.5} fill="none" strokeLinecap="round" />)}
  </g>
);
const PaoRedondo: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 34 }) => (
  <g>
    <Path d={`M ${x - r} ${y} Q ${x - r} ${y - r * 1.2} ${x} ${y - r * 1.2} Q ${x + r} ${y - r * 1.2} ${x + r} ${y} Z`} fill={PAO} stroke={LINHA} strokeWidth={INTERNA} strokeLinejoin="round" />
    <Path d={`M ${x - r * 0.5} ${y - r * 0.6} l ${r * 0.3} -${r * 0.3} M ${x} ${y - r * 0.7} l ${r * 0.3} -${r * 0.3}`} stroke={CASCA} strokeWidth={3.5} strokeLinecap="round" />
  </g>
);
const PaoFrances: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <Ellipse cx={x} cy={y - 14} rx={28} ry={16} fill={PAO} stroke={LINHA} strokeWidth={INTERNA} />
    <Path d={`M ${x - 16} ${y - 18} q 16 -8 32 0`} stroke="#F2D9A6" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
const Cesto: React.FC<{ x: number; y: number; w: number; children?: React.ReactNode }> = ({ x, y, w, children }) => (
  <g>
    {children}
    <Path d={`M ${x - w / 2} ${y - 40} L ${x + w / 2} ${y - 40} L ${x + w / 2 - 12} ${y} L ${x - w / 2 + 12} ${y} Z`} fill="#C9955E" stroke={LINHA} strokeWidth={CONTORNO - 1} strokeLinejoin="round" />
    {[-1, 0, 1].map((k) => <Line key={k} x1={x - w / 2 + 8} y1={y - 26 + k * 10} x2={x + w / 2 - 8} y2={y - 26 + k * 10} stroke={escura("#C9955E")} strokeWidth={3} />)}
  </g>
);

const Fundo: React.FC<{ t: number }> = () => (
  <g>
    <Parede cor="#F1DDB9" base={PAREDE} />
    <Rect x={-MARGEM} y={620} width={1920 + 2 * MARGEM} height={PAREDE - 620} fill="#F6EBDD" semSombra />
    {Array.from({ length: 30 }, (_, i) => <Line key={i} x1={-MARGEM + i * 90} y1={620} x2={-MARGEM + i * 90} y2={PAREDE} stroke={escura("#F6EBDD", 0.9)} strokeWidth={3} semSombra />)}
    <Line x1={-MARGEM} y1={620} x2={1920 + MARGEM} y2={620} stroke={LINHA} strokeWidth={INTERNA} semSombra />
    {/* porta de vidro (de onde vem a luz) */}
    <Papel>
      <Rect x={40} y={180} width={240} height={PAREDE - 180} rx={6} fill="#FAF8F2" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={58} y={198} width={204} height={PAREDE - 240} fill="#CFE6F0" stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={226} y={500} width={14} height={90} rx={7} fill="#B9BEC6" stroke={LINHA} strokeWidth={INTERNA} />
    </Papel>
    {/* placa */}
    <Papel>
      <Rect x={760} y={62} width={420} height={84} rx={12} fill={MADEIRA} stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
    <text x={970} y={122} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={50} fill="#FFF3D6" letterSpacing={6}>PADARIA</text>
    {/* prateleiras com pães */}
    <Papel>
      <Rect x={520} y={180} width={900} height={440} rx={6} fill={escura(MADEIRA, 0.8)} stroke={LINHA} strokeWidth={CONTORNO} />
      {[320, 460, 600].map((y) => <Rect key={y} x={520} y={y} width={900} height={18} fill={MADEIRA} stroke={LINHA} strokeWidth={INTERNA} />)}
    </Papel>
    <Papel>
      {[620, 760, 900].map((x, i) => <Cesto key={x} x={x} y={320} w={110}>{[-16, 6, 26].map((dx, j) => <Baguete key={j} x={x + dx} y={300} a={-14 + j * 12 + i * 3} />)}</Cesto>)}
      {[1080, 1180, 1290].map((x) => <PaoRedondo key={x} x={x} y={320} />)}
      {[600, 660, 720, 780, 860, 920, 980, 1040, 1120, 1180, 1240, 1320].map((x) => <PaoFrances key={x} x={x} y={460} />)}
      {[640, 760, 880].map((x) => <PaoRedondo key={x} x={x} y={600} r={28} />)}
      {[1060, 1150, 1240, 1330].map((x) => <PaoFrances key={x} x={x} y={600} />)}
    </Papel>
    {/* lousa */}
    <Papel>
      <Rect x={1530} y={190} width={280} height={300} rx={8} fill="#A26B45" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={1546} y={206} width={248} height={268} rx={4} fill="#34423D" stroke={LINHA} strokeWidth={INTERNA} />
    </Papel>
    <text x={1670} y={256} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={30} fill="#F4F1EA">CARDÁPIO</text>
    {["pão francês", "pão de queijo", "café", "bolo"].map((l, i) => (
      <g key={l}>
        <text x={1568} y={306 + i * 44} fontFamily={FONTE} fontWeight={600} fontSize={22} fill="#F4F1EA" opacity={0.92}>{l}</text>
        <Line x1={1568 + l.length * 12} y1={300 + i * 44} x2={1772} y2={300 + i * 44} stroke="#F4F1EA" strokeWidth={2} strokeDasharray="3 6" opacity={0.6} semSombra />
      </g>
    ))}
  </g>
);

/** bancada de trás (atrás do padeiro) com a máquina de café */
const Meio: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Piso y0={PAREDE} cor="#EADBC2" tipo="xadrez" cor2="#C98E6A" passo={120} />
    <Rodape y={PAREDE} cor="#D9C4A3" />
    <Papel>
      <Rect x={520} y={700} width={900} height={PAREDE - 700 + 6} rx={6} fill="#E9E4DA" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={510} y={690} width={920} height={20} rx={4} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} />
      {/* máquina de café */}
      <Rect x={560} y={560} width={150} height={130} rx={12} fill="#C0504D" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={582} y={600} width={106} height={40} rx={6} fill="#3A3F4B" stroke={LINHA} strokeWidth={INTERNA} />
      <Circle cx={610} cy={580} r={8} fill="#F2D16B" stroke={LINHA} strokeWidth={3} />
      <Circle cx={640} cy={580} r={8} fill="#F4F1EA" stroke={LINHA} strokeWidth={3} />
    </Papel>
    <Path d={`M 620 548 q 8 -10 0 -20 q -8 -10 0 -20`} stroke={LINHA} strokeWidth={3} fill="none" opacity={0.4 + 0.2 * Math.sin(t * 3)} />
  </g>
);

const Doce: React.FC<{ x: number; y: number; tipo: number }> = ({ x, y, tipo }) =>
  tipo === 0 ? (
    <Path d={`M ${x - 18} ${y} Q ${x - 18} ${y - 22} ${x} ${y - 40} Q ${x + 18} ${y - 22} ${x + 18} ${y} Z`} fill="#E3A23B" stroke={LINHA} strokeWidth={3.5} strokeLinejoin="round" />
  ) : tipo === 1 ? (
    <Circle cx={x} cy={y - 14} r={14} fill="#F2D16B" stroke={LINHA} strokeWidth={3.5} />
  ) : (
    <g>
      <Ellipse cx={x} cy={y - 16} rx={24} ry={16} fill={PAO} stroke={LINHA} strokeWidth={3.5} />
      <Path d={`M ${x - 16} ${y - 22} q 16 -10 32 0`} stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );

/** balcão com vitrine: na frente de quem atende, atrás de quem compra */
const Balcao: React.FC<{ t: number }> = () => {
  const x0 = balcao.x0 - 20, x1 = balcao.x1 + 20, y = balcao.y;
  const base = 935;
  return (
    <g>
      <Papel>
        <Rect x={x0} y={y + 10} width={x1 - x0} height={base - y - 10} rx={6} fill="#C86F4E" stroke={LINHA} strokeWidth={CONTORNO} />
        <Rect x={x0 + 24} y={y + 26} width={x1 - x0 - 48} height={104} rx={6} fill="#E3F1F6" stroke={LINHA} strokeWidth={INTERNA} />
        <Line x1={x0 + 24} y1={y + 92} x2={x1 - 24} y2={y + 92} stroke={LINHA} strokeWidth={INTERNA} />
      </Papel>
      <Papel>
        {Array.from({ length: 14 }, (_, i) => <Doce key={i} x={x0 + 70 + i * 74} y={y + 88} tipo={i % 3} />)}
        {Array.from({ length: 12 }, (_, i) => <Doce key={`b${i}`} x={x0 + 100 + i * 84} y={y + 126} tipo={(i + 1) % 3} />)}
      </Papel>
      <Path d={`M ${x0 + 40} ${y + 40} l 40 40 M ${x0 + 64} ${y + 36} l 50 50`} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
      <Papel>
        <Rect x={x0} y={base - 26} width={x1 - x0} height={26} rx={4} fill={escura("#C86F4E", 0.7)} stroke={LINHA} strokeWidth={CONTORNO} />
        <Rect x={x0 - 10} y={y - 6} width={x1 - x0 + 20} height={22} rx={6} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} />
        {/* caixa registradora */}
        <Rect x={x1 - 190} y={y - 70} width={140} height={64} rx={8} fill="#3A3F4B" stroke={LINHA} strokeWidth={CONTORNO} />
        <Rect x={x1 - 176} y={y - 100} width={80} height={36} rx={4} fill="#9ED8F5" stroke={LINHA} strokeWidth={INTERNA} />
      </Papel>
    </g>
  );
};

const Frente: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[700, 1240].map((x, i) => {
      const bal = Math.sin(t * 1.1 + i) * 1.2;
      return (
        <g key={x} transform={`rotate(${bal} ${x} ${-MARGEM})`}>
          <Line x1={x} y1={-MARGEM} x2={x} y2={36} stroke={LINHA} strokeWidth={5} semSombra />
          <Papel>
            <Path d={`M ${x - 54} 96 L ${x - 20} 34 L ${x + 20} 34 L ${x + 54} 96 Z`} fill="#3A3F4B" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
            <Ellipse cx={x} cy={98} rx={22} ry={9} fill="#FFF3C4" stroke={LINHA} strokeWidth={INTERNA} />
          </Papel>
        </g>
      );
    })}
    <g transform="translate(120 1110) scale(1.5)">
      <Papel>
        <Cesto x={0} y={0} w={150}>{[-40, -10, 22, 46].map((dx, j) => <Baguete key={j} x={dx} y={-20} a={-24 + j * 14} />)}</Cesto>
      </Papel>
    </g>
  </g>
);

export const PADARIA: CenarioDef = { set, Fundo, Meio, Balcao, Frente };
