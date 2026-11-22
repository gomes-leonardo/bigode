// Quarto: janela com cortina, pôster, prateleira de livros, cama (com a quina para sentar), criado-mudo com abajur,
// escrivaninha com monitor e cadeira, tapete.
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../../estilo";
import { Circle, Line, Papel, Path, Rect } from "../../components/prim";
import { ancora, type SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { Janela, Livros, Nuvem, Parede, Piso, Planta, Prateleira, Quadro, Rodape } from "../pecas";
import dados from "./set.json";

const set = dados as SetJson;
const PAREDE = 890, BASE = 905;
const quina = ancora(set, "quina_cama", "quina");
const criado = ancora(set, "criado_mudo", "tampo");
const mesa = ancora(set, "escrivaninha", "tampo");
const cadeira = ancora(set, "cadeira", "assento");
const MADEIRA = "#9C6B4A";

const Fundo: React.FC<{ t: number }> = () => (
  <g>
    <Parede cor="#C8D5E2" base={PAREDE} />
    <Janela x={1230} y={160} w={300} h={290} cortina="#F2D16B">
      <Rect x={1200} y={140} width={360} height={340} fill="#BFDDEA" semSombra />
      <Nuvem x={1330} y={230} s={0.6} />
      <Path d="M 1250 450 L 1250 330 L 1320 330 L 1320 300 L 1380 300 L 1380 450 Z M 1420 450 L 1420 360 L 1500 360 L 1500 450 Z" fill="#E7DCC8" stroke={LINHA} strokeWidth={INTERNA} />
    </Janela>
    <Quadro x={290} y={200} w={210} h={280} moldura="#3A3F4B" fundo="#2F3A55" arte="circulos" cor="#E0826E" />
    <Quadro x={560} y={270} w={120} h={120} moldura="#A9714E" arte="flor" cor="#E37BA1" />
    <Prateleira x={1590} y={330} w={220} />
    <Livros x={1610} y={330} n={7} semente={2} />
    <Papel>
      <Path d="M 1770 330 L 1770 296 Q 1790 280 1800 296 L 1800 330 Z" fill="#F2D16B" stroke={LINHA} strokeWidth={INTERNA} />
    </Papel>
  </g>
);

const Tapete: React.FC = () => (
  <Papel>
    <Path d="M 470 936 L 1320 936 L 1400 1046 L 390 1046 Z" fill="#E7C56B" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
    <Path d="M 504 950 L 1290 950 L 1352 1032 L 438 1032 Z" fill="none" stroke="#C86F4E" strokeWidth={8} strokeLinejoin="round" />
  </Papel>
);

const CriadoMudo: React.FC = () => {
  const x0 = criado.x0 - 14, x1 = criado.x1 + 14, y = criado.y;
  return (
    <Papel>
      <Rect x={x0} y={y} width={x1 - x0} height={BASE - y} rx={6} fill="#B07B55" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={x0 + 12} y={y + 20} width={x1 - x0 - 24} height={44} rx={5} fill="none" stroke={escura("#B07B55")} strokeWidth={INTERNA} />
      <Circle cx={(x0 + x1) / 2} cy={y + 42} r={6} fill={LINHA} />
      {/* abajur */}
      <Path d={`M ${x0 + 14} ${y} L ${x0 + 24} ${y - 10} L ${x0 + 60} ${y - 10} L ${x0 + 70} ${y} Z`} fill="#3A3F4B" stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={x0 + 37} y={y - 64} width={10} height={56} fill="#3A3F4B" stroke={LINHA} strokeWidth={INTERNA} />
      <Path d={`M ${x0 + 4} ${y - 60} L ${x0 + 22} ${y - 118} L ${x0 + 62} ${y - 118} L ${x0 + 80} ${y - 60} Z`} fill="#F2D16B" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
    </Papel>
  );
};

const Cama: React.FC = () => {
  const xe = 250, xd = quina.x + 105; // cabeceira e pé da cama
  const topo = quina.y; // superfície onde senta
  const cobertor = "#5B7FC0";
  return (
    <Papel>
      {/* cabeceira */}
      <Path d={`M ${xe} ${BASE + 12} L ${xe} ${topo - 230} Q ${xe} ${topo - 262} ${xe + 34} ${topo - 262} Q ${xe + 70} ${topo - 262} ${xe + 70} ${topo - 230} L ${xe + 70} ${BASE + 12} Z`} fill={MADEIRA} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      {/* estrado e pés */}
      <Rect x={xe + 60} y={topo + 36} width={xd - xe - 60} height={22} fill={MADEIRA} stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={xd - 40} y={topo + 50} width={18} height={20} fill={escura(MADEIRA)} stroke={LINHA} strokeWidth={INTERNA} />
      {/* colchão + travesseiro */}
      <Rect x={xe + 60} y={topo - 20} width={xd - xe - 70} height={40} rx={10} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} />
      <Path d={`M ${xe + 80} ${topo - 18} Q ${xe + 76} ${topo - 58} ${xe + 120} ${topo - 58} L ${xe + 190} ${topo - 58} Q ${xe + 220} ${topo - 56} ${xe + 212} ${topo - 18} Z`} fill="#FFFFFF" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      <Path d={`M ${xe + 120} ${topo - 40} q 30 8 62 0`} stroke="#D6D2CA" strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
      {/* cobertor: em cima e caindo na frente */}
      <Path d={`M ${xe + 236} ${topo - 22} L ${xd - 8} ${topo - 22} Q ${xd + 2} ${topo - 20} ${xd} ${topo - 6} L ${xd - 4} ${topo + 40} Q ${(xe + xd) / 2 + 100} ${topo + 50} ${xe + 236} ${topo + 40} L ${xe + 228} ${topo - 6} Z`} fill={cobertor} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      <Path d={`M ${xe + 236} ${topo - 2} L ${xd - 4} ${topo - 2}`} stroke={escura(cobertor)} strokeWidth={INTERNA} strokeLinecap="round" />
      <Path d={`M ${xe + 330} ${topo + 4} q 6 16 2 34 M ${xe + 520} ${topo + 6} q -5 16 0 34`} stroke={escura(cobertor)} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
      {/* pezeira */}
      <Rect x={xd - 2} y={topo - 70} width={34} height={BASE - topo + 82} rx={8} fill={MADEIRA} stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
  );
};

const Escrivaninha: React.FC = () => {
  const x0 = mesa.x0 - 16, x1 = mesa.x1 + 16, y = mesa.y;
  return (
    <Papel>
      <Rect x={x0 + 10} y={y + 14} width={20} height={BASE - y - 14} fill="#E9E4DA" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={x1 - 150} y={y + 14} width={140} height={BASE - y - 14} rx={4} fill="#E9E4DA" stroke={LINHA} strokeWidth={CONTORNO} />
      <Line x1={x1 - 150} y1={y + 60} x2={x1 - 10} y2={y + 60} stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={x1 - 96} y={y + 32} width={32} height={8} rx={4} fill={LINHA} />
      <Rect x={x0} y={y - 4} width={x1 - x0} height={20} rx={4} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} />
      {/* monitor */}
      <Rect x={x1 - 190} y={y - 150} width={170} height={110} rx={8} fill="#3A3F4B" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={x1 - 178} y={y - 138} width={146} height={86} rx={3} fill="#9ED8F5" />
      <Path d={`M ${x1 - 112} ${y - 40} L ${x1 - 120} ${y - 4} L ${x1 - 90} ${y - 4} L ${x1 - 98} ${y - 40} Z`} fill="#3A3F4B" stroke={LINHA} strokeWidth={INTERNA} />
      {/* livros deitados */}
      <Rect x={x0 + 60} y={y - 22} width={90} height={18} rx={3} fill="#C0504D" stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={x0 + 66} y={y - 40} width={80} height={18} rx={3} fill="#7AA35B" stroke={LINHA} strokeWidth={INTERNA} />
    </Papel>
  );
};

const Cadeira: React.FC = () => {
  const { x, y } = cadeira;
  const cor = "#3A3F4B";
  return (
    <Papel>
      <Rect x={x - 54} y={y - 170} width={108} height={150} rx={24} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={x - 6} y={y + 10} width={12} height={36} fill="#B9BEC6" stroke={LINHA} strokeWidth={INTERNA} />
      <Path d={`M ${x - 62} ${y + 58} L ${x} ${y + 44} L ${x + 62} ${y + 58}`} stroke={LINHA} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={x - 62} cy={y + 64} r={8} fill={LINHA} />
      <Circle cx={x + 62} cy={y + 64} r={8} fill={LINHA} />
      <Rect x={x - 66} y={y - 10} width={132} height={26} rx={12} fill={escura(cor, 0.85)} stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
  );
};

const Meio: React.FC<{ t: number }> = () => (
  <g>
    <Piso y0={PAREDE} cor="#C9AE8C" tipo="tabua" />
    <Rodape y={PAREDE} cor="#B3BFCB" />
    <Tapete />
    <CriadoMudo />
    <Cama />
    <Escrivaninha />
    <Cadeira />
  </g>
);

const Frente: React.FC<{ t: number }> = () => (
  <g>
    <Planta x={1850} y={1135} s={1.7} tipo="espada" vaso="#E9E4DA" />
  </g>
);

export const QUARTO: CenarioDef = { set, Fundo, Meio, Frente };
