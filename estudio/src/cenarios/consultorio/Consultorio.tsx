// Consultório: parede com barrado, cortina de privacidade, tabela de letras, diploma, armário de remédios,
// janela com persiana, maca (com degrau), cadeira da médica e mesa com notebook.
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../../estilo";
import { Circle, Line, Papel, Path, Rect } from "../../components/prim";
import { FONTE } from "../../fontes";
import { ancora, type SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { Janela, MARGEM, Nuvem, Parede, Piso, Planta, Rodape } from "../pecas";
import dados from "./set.json";

const set = dados as SetJson;
const PAREDE = 890, BASE = 905;
const maca = ancora(set, "maca", "maca");
const cadeira = ancora(set, "cadeira_medica", "assento");
const mesa = ancora(set, "mesa", "tampo");

const Fundo: React.FC<{ t: number }> = () => (
  <g>
    <Parede cor="#DCEBE6" base={PAREDE} />
    <Rect x={-MARGEM} y={640} width={1920 + 2 * MARGEM} height={PAREDE - 640} fill="#C6DED7" semSombra />
    <Line x1={-MARGEM} y1={640} x2={1920 + MARGEM} y2={640} stroke={LINHA} strokeWidth={INTERNA} semSombra />
    <Janela x={1440} y={170} w={310} h={290} persiana>
      <Rect x={1420} y={150} width={350} height={330} fill="#BFDDEA" semSombra />
      <Nuvem x={1600} y={380} s={0.6} />
    </Janela>
    {/* tabela de letras */}
    <Papel>
      <Rect x={200} y={190} width={170} height={250} rx={6} fill="#FFFFFF" stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
    {[["E", 64], ["F P", 38], ["T O Z", 26], ["L P E D", 18], ["P E C F D", 13]].map(([l, tam], i) => (
      <text key={i} x={285} y={[262, 312, 350, 382, 408][i]} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam as number} fill={LINHA}>{l}</text>
    ))}
    {/* diploma */}
    <Papel>
      <Rect x={1200} y={230} width={170} height={125} rx={4} fill="#6E4B35" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={1212} y={242} width={146} height={101} fill="#FFFDF4" stroke={LINHA} strokeWidth={INTERNA} />
      <Path d="M 1232 266 L 1338 266 M 1240 284 L 1330 284 M 1246 300 L 1300 300" stroke={escura("#FFFDF4", 0.6)} strokeWidth={4} strokeLinecap="round" />
      <Circle cx={1326} cy={318} r={14} fill="#C0504D" stroke={LINHA} strokeWidth={3} />
    </Papel>
    {/* armário de remédios */}
    <Papel>
      <Rect x={860} y={200} width={220} height={220} rx={6} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={874} y={214} width={92} height={192} fill="#D8EEF6" stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={974} y={214} width={92} height={192} fill="#D8EEF6" stroke={LINHA} strokeWidth={INTERNA} />
      <Line x1={874} y1={310} x2={1066} y2={310} stroke={LINHA} strokeWidth={INTERNA} />
      {[[896, "#E0822E"], [924, "#FFFFFF"], [994, "#5AA5B8"], [1030, "#F2D16B"]].map(([x, c], i) => (
        <Rect key={i} x={x as number} y={262} width={20} height={46} rx={5} fill={c as string} stroke={LINHA} strokeWidth={3} />
      ))}
      {[[900, "#7AA35B"], [1004, "#E37BA1"], [1036, "#FFFFFF"]].map(([x, c], i) => (
        <Rect key={i} x={x as number} y={366} width={24} height={38} rx={5} fill={c as string} stroke={LINHA} strokeWidth={3} />
      ))}
      <Circle cx={962} cy={318} r={5} fill={LINHA} />
      <Circle cx={978} cy={318} r={5} fill={LINHA} />
    </Papel>
    {/* cortina de privacidade */}
    <Papel>
      <Line x1={-MARGEM} y1={110} x2={250} y2={110} stroke={LINHA} strokeWidth={10} strokeLinecap="round" />
      <Path d="M -200 118 L 150 118 Q 136 500 160 880 Q 120 900 80 880 Q 40 900 0 880 Q -40 900 -200 880 Z" fill="#9CC6C9" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      <Path d="M 40 130 Q 30 500 46 868 M 100 130 Q 92 500 104 868" stroke={escura("#9CC6C9")} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
    </Papel>
  </g>
);

const Maca: React.FC = () => {
  const x0 = 320, x1 = 900, y = maca.y;
  const vinil = "#6FA4B0";
  return (
    <Papel>
      {/* gabinete */}
      <Rect x={x0 + 40} y={y + 26} width={x1 - x0 - 80} height={BASE - y - 26} rx={6} fill="#E3E6E6" stroke={LINHA} strokeWidth={CONTORNO} />
      <Line x1={(x0 + x1) / 2} y1={y + 26} x2={(x0 + x1) / 2} y2={BASE} stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={(x0 + x1) / 2 - 60} y={y + 44} width={36} height={8} rx={4} fill={LINHA} />
      <Rect x={(x0 + x1) / 2 + 24} y={y + 44} width={36} height={8} rx={4} fill={LINHA} />
      {/* estofado + cabeceira levantada */}
      <Rect x={x0 - 6} y={y - 52} width={130} height={34} rx={12} fill={vinil} stroke={LINHA} strokeWidth={CONTORNO} transform={`rotate(-16 ${x0 + 120} ${y - 20})`} />
      <Rect x={x0} y={y - 14} width={x1 - x0} height={42} rx={14} fill={vinil} stroke={LINHA} strokeWidth={CONTORNO} />
      {/* papel descartável com o rolo na ponta */}
      <Rect x={x0 + 110} y={y - 20} width={x1 - x0 - 120} height={14} rx={4} fill="#FFFFFF" stroke={LINHA} strokeWidth={INTERNA} />
      <Circle cx={x1 + 4} cy={y - 10} r={17} fill="#FFFFFF" stroke={LINHA} strokeWidth={INTERNA} />
      <Circle cx={x1 + 4} cy={y - 10} r={6} fill="#D6D2CA" />
    </Papel>
  );
};

const Degrau: React.FC = () => {
  const y = maca.chao;
  return (
    <Papel>
      <Rect x={maca.x - 92} y={y} width={184} height={36} rx={4} fill="#B9BEC6" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={maca.x - 92} y={y - 4} width={184} height={10} rx={4} fill="#3A3F4B" stroke={LINHA} strokeWidth={INTERNA} />
    </Papel>
  );
};

const CadeiraMedica: React.FC = () => {
  const { x, y } = cadeira;
  const cor = "#2F5D66";
  return (
    <Papel>
      <Rect x={x - 54} y={y - 176} width={108} height={156} rx={24} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={x - 6} y={y + 10} width={12} height={36} fill="#B9BEC6" stroke={LINHA} strokeWidth={INTERNA} />
      <Path d={`M ${x - 62} ${y + 58} L ${x} ${y + 44} L ${x + 62} ${y + 58}`} stroke={LINHA} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={x - 62} cy={y + 64} r={8} fill={LINHA} />
      <Circle cx={x + 62} cy={y + 64} r={8} fill={LINHA} />
      <Rect x={x - 66} y={y - 10} width={132} height={26} rx={12} fill={escura(cor, 0.85)} stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
  );
};

const Mesa: React.FC = () => {
  const x0 = mesa.x0 - 18, x1 = mesa.x1 + 18, y = mesa.y;
  return (
    <Papel>
      <Rect x={x0 + 14} y={y + 14} width={170} height={BASE - y - 14} rx={4} fill="#E9E4DA" stroke={LINHA} strokeWidth={CONTORNO} />
      {[y + 70, y + 120].map((yy) => <Line key={yy} x1={x0 + 14} y1={yy} x2={x0 + 184} y2={yy} stroke={LINHA} strokeWidth={INTERNA} />)}
      <Rect x={x1 - 30} y={y + 14} width={18} height={BASE - y - 14} fill="#E9E4DA" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={x0} y={y - 4} width={x1 - x0} height={20} rx={4} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} />
      {/* notebook aberto */}
      <Path d={`M ${x1 - 230} ${y - 4} L ${x1 - 214} ${y - 130} L ${x1 - 66} ${y - 130} L ${x1 - 50} ${y - 4} Z`} fill="#3A3F4B" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      <Path d={`M ${x1 - 212} ${y - 18} L ${x1 - 200} ${y - 118} L ${x1 - 80} ${y - 118} L ${x1 - 68} ${y - 18} Z`} fill="#9ED8F5" />
      <Rect x={x1 - 250} y={y - 8} width={220} height={10} rx={4} fill="#B9BEC6" stroke={LINHA} strokeWidth={INTERNA} />
      {/* papéis e porta-canetas */}
      <Rect x={x0 + 40} y={y - 12} width={110} height={10} fill="#FFFFFF" stroke={LINHA} strokeWidth={3} transform={`rotate(-3 ${x0 + 95} ${y - 7})`} />
      <Rect x={x0 + 190} y={y - 46} width={34} height={44} rx={5} fill="#C0504D" stroke={LINHA} strokeWidth={INTERNA} />
      <Path d={`M ${x0 + 200} ${y - 46} l -6 -26 M ${x0 + 212} ${y - 46} l 4 -30`} stroke={LINHA} strokeWidth={6} strokeLinecap="round" />
    </Papel>
  );
};

const Lixeira: React.FC<{ x: number }> = ({ x }) => (
  <Papel>
    <Path d={`M ${x - 40} ${BASE - 120} L ${x + 40} ${BASE - 120} L ${x + 34} ${BASE} L ${x - 34} ${BASE} Z`} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
    <Rect x={x - 46} y={BASE - 134} width={92} height={18} rx={8} fill="#E3E6E6" stroke={LINHA} strokeWidth={CONTORNO} />
    <Rect x={x - 30} y={BASE - 6} width={26} height={10} rx={3} fill="#B9BEC6" stroke={LINHA} strokeWidth={3} />
  </Papel>
);

const Meio: React.FC<{ t: number }> = () => (
  <g>
    <Piso y0={PAREDE} cor="#CDD5D3" tipo="ladrilho" />
    <Rodape y={PAREDE} cor="#B5CCC5" />
    <Maca />
    <Degrau />
    <Mesa />
    <CadeiraMedica />
    <Lixeira x={1800} />
  </g>
);

const Frente: React.FC<{ t: number }> = () => <Planta x={70} y={1150} s={1.6} tipo="redonda" vaso="#F4F1EA" folha="#4F8A6B" />;

export const CONSULTORIO: CenarioDef = { set, Fundo, Meio, Frente };
