// Sala de reunião (Banco Central): parede sóbria, janelão com prédios, placa, mesa comprida (plano "balcão": fica na
// frente de quem está sentado), cadeiras, planta.
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../../estilo";
import { Line, Papel, Rect } from "../../components/prim";
import { FONTE } from "../../fontes";
import { ancora, type SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { Janela, Parede, Piso, Planta, Rodape } from "../pecas";
import dados from "./set.json";

const set = dados as SetJson;
const PAREDE = 890;
const mesa = ancora(set, "mesa", "tampo");
const cadE = ancora(set, "cadeira_esq", "assento"), cadD = ancora(set, "cadeira_dir", "assento");

const fundo = (placa: string, corPlaca: string): React.FC<{ t: number }> => () => (
  <g>
    <Parede cor="#DDE3EA" base={PAREDE} />
    <Rect x={-400} y={560} width={2800} height={PAREDE - 560} fill="#C9D2DC" semSombra />
    <Line x1={-400} y1={560} x2={2400} y2={560} stroke={LINHA} strokeWidth={INTERNA} semSombra />
    <Janela x={1180} y={140} w={580} h={360}>
      <Rect x={1150} y={120} width={640} height={400} fill="#BFDDEA" semSombra />
      {[[1220, 260, 90, "#B9C9C2"], [1320, 200, 110, "#C7C0D6"], [1450, 240, 90, "#D6C7B5"], [1560, 180, 120, "#B9C9C2"], [1690, 260, 80, "#C7C0D6"]].map(([x, y, w, c], i) => (
        <Rect key={i} x={x as number} y={y as number} width={w as number} height={300} fill={c as string} stroke={LINHA} strokeWidth={INTERNA} />
      ))}
    </Janela>
    {placa && (
      <g>
        <Papel>
          <Rect x={260} y={180} width={520} height={110} rx={10} fill={corPlaca} stroke={LINHA} strokeWidth={CONTORNO} />
        </Papel>
        <text x={520} y={252} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={placa.length > 12 ? 50 : 60} fill="#E3B95B" letterSpacing={4}>{placa}</text>
      </g>
    )}
  </g>
);

const Cadeira: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <Papel>
    <Rect x={x - 62} y={y - 190} width={124} height={180} rx={26} fill="#3A3F4B" stroke={LINHA} strokeWidth={CONTORNO} />
    <Rect x={x - 70} y={y - 10} width={140} height={26} rx={12} fill="#2E323C" stroke={LINHA} strokeWidth={CONTORNO} />
  </Papel>
);

const Meio: React.FC<{ t: number }> = () => (
  <g>
    <Piso y0={PAREDE} cor="#B7B2A8" tipo="tabua" />
    <Rodape y={PAREDE} cor="#B8C1CC" />
    <Planta x={120} y={PAREDE + 4} s={1.4} tipo="espada" vaso="#3A3F4B" />
    <Cadeira x={cadE.x} y={cadE.y} />
    <Cadeira x={cadD.x} y={cadD.y} />
  </g>
);

/** mesa comprida: na frente de quem senta */
const Balcao: React.FC<{ t: number }> = () => (
  <Papel>
    <Rect x={mesa.x0 + 30} y={mesa.y + 14} width={24} height={1010 - mesa.y} fill="#5A4636" stroke={LINHA} strokeWidth={INTERNA} />
    <Rect x={mesa.x1 - 54} y={mesa.y + 14} width={24} height={1010 - mesa.y} fill="#5A4636" stroke={LINHA} strokeWidth={INTERNA} />
    <Rect x={mesa.x0} y={mesa.y - 6} width={mesa.x1 - mesa.x0} height={26} rx={6} fill="#7A5A44" stroke={LINHA} strokeWidth={CONTORNO} />
    <Rect x={mesa.x0 + 20} y={mesa.y + 20} width={mesa.x1 - mesa.x0 - 40} height={60} rx={4} fill={escura("#7A5A44", 0.85)} stroke={LINHA} strokeWidth={INTERNA} />
  </Papel>
);

const Frente: React.FC<{ t: number }> = () => null;

/** mesma sala com outra placa (clube, Congresso...) */
export const escritorioCom = (placa: string, corPlaca = "#2B3447"): CenarioDef => ({ set, Fundo: fundo(placa, corPlaca), Meio, Balcao, Frente });
export const ESCRITORIO: CenarioDef = escritorioCom("BANCO CENTRAL");
