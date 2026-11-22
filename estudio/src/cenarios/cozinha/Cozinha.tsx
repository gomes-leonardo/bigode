// Cozinha: janela com cortina, armário de cima, azulejo, bancada, fogão e geladeira.
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../../estilo";
import { Circle, Ellipse, Line, Papel, Path, Rect } from "../../components/prim";
import { Azulejos, Bancada, Fogao } from "../../fase2/Cozinha";
import { ancora, type SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { Arvore, Janela, MARGEM, Nuvem, Parede, Piso, Planta, Rodape } from "../pecas";
import dados from "./set.json";

const set = dados as SetJson;
const PAREDE = 890; // linha da parede com o chão
const BASE = 905; // pé dos móveis encostados na parede
const tampo = ancora(set, "bancada", "tampo");
const b1 = ancora(set, "boca_fogao_1", "boca"), b2 = ancora(set, "boca_fogao_2", "boca");
const TOPO = tampo.y;
const FOG0 = b1.x - 92, FOG1 = b2.x + 92; // fogão em volta das bocas

const Fundo: React.FC<{ t: number }> = () => (
  <g>
    <Parede cor="#EFE2C6" base={PAREDE} />
    <Janela x={330} y={170} w={320} h={300} cortina="#E0826E">
      <Rect x={300} y={150} width={400} height={360} fill="#CFE6F0" semSombra />
      <Nuvem x={440} y={240} s={0.7} />
      <Path d="M 340 470 L 340 400 L 420 352 L 500 400 L 500 470 Z" fill="#E8C9A0" stroke={LINHA} strokeWidth={INTERNA} />
      <Arvore x={590} y={500} s={0.9} />
    </Janela>
    {/* armário de cima */}
    <Papel>
      <Rect x={720} y={150} width={440} height={185} rx={6} fill="#7FA39A" stroke={LINHA} strokeWidth={CONTORNO} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Rect x={734 + i * 142} y={164} width={128} height={157} rx={6} fill="none" stroke={escura("#7FA39A")} strokeWidth={INTERNA} />
          <Rect x={790 + i * 142} y={300} width={16} height={8} rx={4} fill={LINHA} />
        </g>
      ))}
    </Papel>
    <Azulejos x0={240} x1={FOG1 + 20} y0={TOPO - 190} y1={TOPO - 12} />
    {/* relógio em cima da geladeira */}
    <Papel>
      <Circle cx={1650} cy={200} r={50} fill="#FAF8F2" stroke={LINHA} strokeWidth={CONTORNO} />
      <Path d="M 1650 200 L 1650 170 M 1650 200 L 1672 212" stroke={LINHA} strokeWidth={5} strokeLinecap="round" />
      <Circle cx={1650} cy={200} r={5} fill={LINHA} />
    </Papel>
  </g>
);

const Geladeira: React.FC = () => {
  const x0 = 1520, x1 = 1780, y0 = 300;
  const cor = "#E4EAEE";
  return (
    <Papel>
      <Rect x={x0} y={y0} width={x1 - x0} height={BASE - y0} rx={16} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} />
      <Line x1={x0} y1={y0 + 190} x2={x1} y2={y0 + 190} stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={x0 + 20} y={y0 + 60} width={12} height={90} rx={6} fill={escura(cor, 0.7)} stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={x0 + 20} y={y0 + 230} width={12} height={150} rx={6} fill={escura(cor, 0.7)} stroke={LINHA} strokeWidth={INTERNA} />
      {/* bilhete e ímãs */}
      <Rect x={x0 + 120} y={y0 + 250} width={70} height={84} fill="#FFF7C2" stroke={LINHA} strokeWidth={INTERNA} transform={`rotate(-5 ${x0 + 155} ${y0 + 292})`} />
      <Path d={`M ${x0 + 132} ${y0 + 278} l 42 -3 M ${x0 + 133} ${y0 + 296} l 36 -3 M ${x0 + 135} ${y0 + 314} l 28 -2`} stroke={escura("#FFF7C2", 0.6)} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={x0 + 154} cy={y0 + 254} r={8} fill="#C0504D" stroke={LINHA} strokeWidth={3} />
      <Circle cx={x0 + 200} cy={y0 + 120} r={9} fill="#F2D16B" stroke={LINHA} strokeWidth={3} />
      <Rect x={x0 + 10} y={BASE - 14} width={x1 - x0 - 20} height={10} rx={4} fill={escura(cor, 0.75)} />
    </Papel>
  );
};

const Fruteira: React.FC<{ x: number }> = ({ x }) => (
  <Papel>
    {[[-22, -30, "#E0822E"], [4, -36, "#C0504D"], [26, -28, "#E0822E"], [-6, -48, "#7AA35B"]].map(([dx, dy, c], i) => (
      <Circle key={i} cx={x + (dx as number)} cy={TOPO + (dy as number)} r={17} fill={c as string} stroke={LINHA} strokeWidth={INTERNA} />
    ))}
    <Path d={`M ${x - 52} ${TOPO - 30} L ${x + 52} ${TOPO - 30} Q ${x + 46} ${TOPO} ${x} ${TOPO} Q ${x - 46} ${TOPO} ${x - 52} ${TOPO - 30} Z`} fill="#5AA5B8" stroke={LINHA} strokeWidth={CONTORNO - 1} strokeLinejoin="round" />
  </Papel>
);

const PoteUtensilios: React.FC<{ x: number }> = ({ x }) => (
  <Papel>
    <Path d={`M ${x - 8} ${TOPO - 56} L ${x - 22} ${TOPO - 108} M ${x + 4} ${TOPO - 56} L ${x + 6} ${TOPO - 116} M ${x + 14} ${TOPO - 56} L ${x + 30} ${TOPO - 100}`} stroke={LINHA} strokeWidth={6} strokeLinecap="round" />
    <Ellipse cx={x - 23} cy={TOPO - 112} rx={10} ry={14} fill="#B9BEC6" stroke={LINHA} strokeWidth={INTERNA} />
    <Rect x={x - 24} y={TOPO - 60} width={48} height={60} rx={6} fill="#F2D16B" stroke={LINHA} strokeWidth={CONTORNO - 1} />
  </Papel>
);

const Meio: React.FC<{ t: number }> = () => (
  <g>
    <Piso y0={PAREDE} cor="#DCCFB6" tipo="ladrilho" />
    <Rodape y={PAREDE} cor="#D3C19E" />
    <Bancada x0={240} x1={FOG0} topo={TOPO} base={BASE} />
    <Fogao x0={FOG0} x1={FOG1} topo={TOPO} base={BASE} bocas={[b1.x, b2.x]} />
    <Geladeira />
    <Fruteira x={370} />
    <PoteUtensilios x={1080} />
  </g>
);

const Frente: React.FC<{ t: number }> = ({ t }) => {
  const bal = Math.sin(t * 1.3) * 1.5; // a luminária balança de leve
  return (
    <g>
      <g transform={`rotate(${bal} 980 ${-MARGEM})`}>
        <Line x1={980} y1={-MARGEM} x2={980} y2={64} stroke={LINHA} strokeWidth={5} semSombra />
        <Papel>
          <Path d="M 922 128 Q 924 76 980 64 Q 1036 76 1038 128 Z" fill="#C0504D" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
          <Ellipse cx={980} cy={130} rx={20} ry={10} fill="#FFF3C4" stroke={LINHA} strokeWidth={INTERNA} />
        </Papel>
      </g>
      <Planta x={70} y={1130} s={1.6} tipo="costela" vaso="#C86F4E" />
    </g>
  );
};

export const COZINHA: CenarioDef = { set, Fundo, Meio, Frente };
