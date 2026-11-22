// Sala: janela grande, quadros, estante de livros, luminária de pé, sofá de três lugares, mesinha lateral,
// tapete e mesa de centro (plano "balcão": fica na frente de quem está sentado).
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../../estilo";
import { Line, Papel, Path, Rect } from "../../components/prim";
import { ancora, type SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { Arvore, Janela, Livros, Nuvem, Parede, Piso, Planta, Quadro, Rodape } from "../pecas";
import dados from "./set.json";

const set = dados as SetJson;
const PAREDE = 890, BASE = 905;
const assento = ancora(set, "sofa_meio", "assento").y;
const centro = ancora(set, "mesa_centro", "tampo");
const mesinha = ancora(set, "mesinha", "tampo");
const SOFA = "#557C9A";
const MADEIRA = "#A9714E";

const Fundo: React.FC<{ t: number }> = () => (
  <g>
    <Parede cor="#CFD8C2" base={PAREDE} />
    <Janela x={1330} y={150} w={360} h={330} cortina="#E0826E">
      <Rect x={1300} y={120} width={420} height={400} fill="#BFDDEA" semSombra />
      <Nuvem x={1450} y={220} s={0.7} />
      <Arvore x={1600} y={520} s={1} />
      <Arvore x={1420} y={540} s={0.8} copa="#93BC72" />
    </Janela>
    <Quadro x={640} y={300} w={180} h={130} moldura="#3A3F4B" arte="montanha" cor="#7AA35B" />
    <Quadro x={860} y={262} w={140} h={180} moldura="#A9714E" arte="sol" cor="#E0826E" fundo="#F2E3C6" />
  </g>
);

const Estante: React.FC = () => {
  const x0 = 80, x1 = 330, y0 = 330;
  return (
    <g>
      <Papel>
        <Rect x={x0} y={y0} width={x1 - x0} height={BASE - y0} rx={6} fill={MADEIRA} stroke={LINHA} strokeWidth={CONTORNO} />
        <Rect x={x0 + 14} y={y0 + 14} width={x1 - x0 - 28} height={BASE - y0 - 28} fill={escura(MADEIRA, 0.8)} stroke={LINHA} strokeWidth={INTERNA} />
        {[450, 570, 690, 810].map((y) => <Rect key={y} x={x0 + 14} y={y} width={x1 - x0 - 28} height={12} fill={MADEIRA} stroke={LINHA} strokeWidth={INTERNA} />)}
      </Papel>
      <Livros x={x0 + 22} y={450} n={8} semente={1} />
      <Livros x={x0 + 22} y={570} n={5} semente={4} />
      <Livros x={x0 + 120} y={690} n={6} semente={3} />
      <Livros x={x0 + 22} y={810} n={9} semente={5} />
      <Planta x={x0 + 70} y={y0} s={0.55} tipo="redonda" vaso="#F4F1EA" />
    </g>
  );
};

const Luminaria: React.FC<{ x: number }> = ({ x }) => (
  <Papel>
    <Path d={`M ${x - 34} ${BASE} Q ${x} ${BASE - 16} ${x + 34} ${BASE} Z`} fill="#3A3F4B" stroke={LINHA} strokeWidth={INTERNA} />
    <Line x1={x} y1={BASE - 8} x2={x} y2={560} stroke={LINHA} strokeWidth={9} strokeLinecap="round" />
    <Line x1={x} y1={BASE - 8} x2={x} y2={560} stroke="#B9BEC6" strokeWidth={3} strokeLinecap="round" />
    <Path d={`M ${x - 60} 566 L ${x - 38} 490 L ${x + 38} 490 L ${x + 60} 566 Z`} fill="#F4E7C6" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
  </Papel>
);

const Sofa: React.FC = () => {
  const x0 = 470, x1 = 1230;
  const y = assento;
  const claro = "#6990AE";
  return (
    <Papel>
      {/* encosto */}
      <Rect x={x0 + 20} y={y - 205} width={x1 - x0 - 40} height={215} rx={34} fill={SOFA} stroke={LINHA} strokeWidth={CONTORNO} />
      {[0, 1, 2].map((i) => <Rect key={i} x={x0 + 50 + i * ((x1 - x0 - 100) / 3)} y={y - 186} width={(x1 - x0 - 100) / 3 - 6} height={178} rx={28} fill={claro} stroke={LINHA} strokeWidth={INTERNA} />)}
      {/* assento */}
      <Rect x={x0 + 40} y={y - 6} width={x1 - x0 - 80} height={BASE - y + 2} rx={10} fill={SOFA} stroke={LINHA} strokeWidth={CONTORNO} />
      <Line x1={x0 + 40} y1={y + 6} x2={x1 - 40} y2={y + 6} stroke={escura(SOFA)} strokeWidth={INTERNA} />
      {[1, 2].map((i) => <Line key={i} x1={x0 + 40 + i * ((x1 - x0 - 80) / 3)} y1={y - 4} x2={x0 + 40 + i * ((x1 - x0 - 80) / 3)} y2={y + 26} stroke={escura(SOFA)} strokeWidth={INTERNA} />)}
      {/* braços */}
      <Rect x={x0} y={y - 96} width={84} height={BASE - y + 106} rx={32} fill={SOFA} stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={x1 - 84} y={y - 96} width={84} height={BASE - y + 106} rx={32} fill={SOFA} stroke={LINHA} strokeWidth={CONTORNO} />
      {/* almofadas soltas nos cantos */}
      <Rect x={x0 + 70} y={y - 92} width={90} height={84} rx={18} fill="#E7C56B" stroke={LINHA} strokeWidth={CONTORNO} transform={`rotate(-12 ${x0 + 115} ${y - 50})`} />
      <Rect x={x1 - 160} y={y - 92} width={90} height={84} rx={18} fill="#E0826E" stroke={LINHA} strokeWidth={CONTORNO} transform={`rotate(10 ${x1 - 115} ${y - 50})`} />
      {/* pés */}
      <Rect x={x0 + 26} y={BASE + 8} width={16} height={16} fill={escura(MADEIRA)} stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={x1 - 42} y={BASE + 8} width={16} height={16} fill={escura(MADEIRA)} stroke={LINHA} strokeWidth={INTERNA} />
    </Papel>
  );
};

const Mesinha: React.FC = () => (
  <Papel>
    <Rect x={mesinha.x0 + 40} y={mesinha.y + 10} width={16} height={BASE - mesinha.y} fill={MADEIRA} stroke={LINHA} strokeWidth={INTERNA} />
    <Path d={`M ${mesinha.x0 + 10} ${BASE + 6} L ${mesinha.x1 - 10} ${BASE + 6}`} stroke={LINHA} strokeWidth={10} strokeLinecap="round" />
    <Rect x={mesinha.x0 - 12} y={mesinha.y - 2} width={mesinha.x1 - mesinha.x0 + 24} height={16} rx={8} fill={MADEIRA} stroke={LINHA} strokeWidth={CONTORNO} />
  </Papel>
);

const Tapete: React.FC = () => (
  <Papel>
    <Path d="M 470 934 L 1250 934 L 1330 1080 L 390 1080 Z" fill="#8FB7B0" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
    <Path d="M 506 948 L 1214 948 L 1280 1066 L 440 1066 Z" fill="none" stroke="#F4F1EA" strokeWidth={7} strokeLinejoin="round" strokeDasharray="22 14" />
  </Papel>
);

const Meio: React.FC<{ t: number }> = () => (
  <g>
    <Piso y0={PAREDE} cor="#B58C68" tipo="tabua" />
    <Rodape y={PAREDE} cor="#BFC8B2" />
    <Tapete />
    <Estante />
    <Luminaria x={400} />
    <Sofa />
    <Mesinha />
    <Planta x={(mesinha.x0 + mesinha.x1) / 2} y={mesinha.y} s={0.6} tipo="redonda" vaso="#5AA5B8" />
  </g>
);

/** mesa de centro: na frente de quem está sentado no sofá */
const Balcao: React.FC<{ t: number }> = () => {
  const { x0, x1, y } = centro;
  const m = "#C98F5A";
  return (
    <Papel>
      {[x0 - 4, x1 - 12].map((x, i) => <Rect key={i} x={x} y={y + 14} width={16} height={60} fill={escura(m)} stroke={LINHA} strokeWidth={INTERNA} />)}
      <Rect x={x0 - 24} y={y - 8} width={x1 - x0 + 48} height={22} rx={6} fill={m} stroke={LINHA} strokeWidth={CONTORNO} />
      <Line x1={x0 - 14} y1={y + 2} x2={x1 + 14} y2={y + 2} stroke={escura(m)} strokeWidth={INTERNA} strokeLinecap="round" />
    </Papel>
  );
};

const Frente: React.FC<{ t: number }> = () => <Planta x={1835} y={1160} s={2} tipo="costela" vaso="#E9E4DA" folha="#3F7A5A" />;

export const SALA: CenarioDef = { set, Fundo, Meio, Balcao, Frente };
