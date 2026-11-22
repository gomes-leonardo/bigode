// Loja de tênis: parede de prateleiras com tênis coloridos, letreiro, porta de vidro; balcão (na frente do
// atendente) com a maquininha; banquinho para provar.
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../../estilo";
import { Papel, Rect } from "../../components/prim";
import { FONTE } from "../../fontes";
import { ancora, type SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { Parede, Piso, Planta, Rodape } from "../pecas";
import { CAIXA_TENIS, TENIS } from "../../objects/extras";
import dados from "./set.json";

const set = dados as SetJson;
const PAREDE = 880;
const balcao = ancora(set, "balcao", "tampo");
const banco = ancora(set, "banco", "assento");
const CORES = ["#C0504D", "#5AA5B8", "#F2D16B", "#7AA35B", "#8E7CC3", "#E0822E", "#3A3F4B", "#E37BA1", "#FFFFFF"];

const Fundo: React.FC<{ t: number }> = () => (
  <g>
    <Parede cor="#E6E1EE" base={PAREDE} />
    {/* parede de tênis */}
    <Papel>
      <Rect x={360} y={150} width={1200} height={560} rx={8} fill="#D4CDE0" stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
    {[270, 400, 530, 660].map((y, r) => (
      <g key={y}>
        <Papel><Rect x={380} y={y} width={1160} height={14} rx={3} fill="#F4F1EA" stroke={LINHA} strokeWidth={INTERNA} /></Papel>
        {Array.from({ length: 13 }, (_, i) => (
          <g key={i} transform={`translate(${430 + i * 86} ${y}) scale(0.95)`}>
            <TENIS.Desenho t={0} cor={CORES[(i + r * 4) % CORES.length]} />
          </g>
        ))}
      </g>
    ))}
    <Papel>
      <Rect x={760} y={58} width={400} height={74} rx={37} fill="#3A3F4B" stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
    <text x={960} y={110} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={46} fill="#F2D16B" letterSpacing={8}>TÊNIS</text>
    {/* porta de vidro */}
    <Papel>
      <Rect x={1640} y={170} width={230} height={PAREDE - 170} rx={6} fill="#FAF8F2" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={1658} y={188} width={194} height={PAREDE - 230} fill="#CFE6F0" stroke={LINHA} strokeWidth={INTERNA} />
    </Papel>
    <Papel>
      <Rect x={60} y={300} width={240} height={180} rx={6} fill="#FFFFFF" stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
    <text x={180} y={378} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={40} fill="#C0504D">-50%</text>
    <text x={180} y={430} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={24} fill={LINHA}>só hoje</text>
  </g>
);

const Meio: React.FC<{ t: number }> = () => (
  <g>
    <Piso y0={PAREDE} cor="#D9CFC1" tipo="tabua" />
    <Rodape y={PAREDE} cor="#C9C2D6" />
    {/* banquinho de provar */}
    <Papel>
      <Rect x={banco.x - 120} y={banco.y + 8} width={18} height={70} fill="#6E4B35" stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={banco.x + 102} y={banco.y + 8} width={18} height={70} fill="#6E4B35" stroke={LINHA} strokeWidth={INTERNA} />
      <Rect x={banco.x - 140} y={banco.y - 8} width={280} height={26} rx={12} fill="#5AA5B8" stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
  </g>
);

/** balcão: na frente do atendente */
const Balcao: React.FC<{ t: number }> = () => {
  const x0 = balcao.x0 - 20, x1 = balcao.x1 + 20, y = balcao.y;
  const cor = "#3A3F4B";
  return (
    <g>
      <Papel>
        <Rect x={x0} y={y + 10} width={x1 - x0} height={935 - y - 10} rx={6} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} />
        <Rect x={x0 + 30} y={y + 40} width={x1 - x0 - 60} height={70} rx={8} fill={escura(cor, 1.25)} stroke={LINHA} strokeWidth={INTERNA} />
        <Rect x={x0 - 10} y={y - 6} width={x1 - x0 + 20} height={22} rx={6} fill="#F4F1EA" stroke={LINHA} strokeWidth={CONTORNO} />
      </Papel>
      <text x={(x0 + x1) / 2} y={y + 88} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={34} fill="#F2D16B" letterSpacing={6}>CAIXA</text>
      {/* pilha de caixas na ponta do balcão */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${x0 + 70} ${y - 4 - i * 40})`}>
          <CAIXA_TENIS.Desenho t={0} cor={["#E0822E", "#5AA5B8", "#C0504D"][i]} />
        </g>
      ))}
    </g>
  );
};

const Frente: React.FC<{ t: number }> = () => <Planta x={1840} y={1150} s={1.8} tipo="espada" vaso="#F4F1EA" />;

export const LOJA: CenarioDef = { set, Fundo, Meio, Balcao, Frente };
