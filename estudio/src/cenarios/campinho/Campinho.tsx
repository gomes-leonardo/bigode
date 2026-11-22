// Campinho: céu, morro com casinhas e árvores (fundo); muro grafitado com alambrado, gramado com terra batida,
// trave com rede e banco (meio); tufos de grama (frente).
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../../estilo";
import { Circle, Line, Papel, Path, Rect } from "../../components/prim";
import { ancora, type SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { Arvore, MARGEM, Nuvem, Parede } from "../pecas";
import dados from "./set.json";

const set = dados as SetJson;
const HORIZONTE = 720; // pé do muro
const banco = ancora(set, "banco", "assento");
const K = set.escala / 1.35;
const naEscala = (x: number, y: number) => `translate(${x} ${y}) scale(${K.toFixed(4)}) translate(${-x} ${-y})`;

const Casinha: React.FC<{ x: number; y: number; w: number; cor: string; telhado?: string }> = ({ x, y, w, cor, telhado = "#C86F4E" }) => (
  <g>
    <Rect x={x} y={y - w * 0.7} width={w} height={w * 0.7} fill={cor} stroke={LINHA} strokeWidth={INTERNA} />
    <Path d={`M ${x - 6} ${y - w * 0.7} L ${x + w / 2} ${y - w * 1.05} L ${x + w + 6} ${y - w * 0.7} Z`} fill={telhado} stroke={LINHA} strokeWidth={INTERNA} strokeLinejoin="round" />
    <Rect x={x + w * 0.2} y={y - w * 0.45} width={w * 0.22} height={w * 0.22} fill="#CFE6F0" stroke={LINHA} strokeWidth={3} />
  </g>
);

const Alambrado: React.FC = () => {
  const y0 = 230, y1 = 640;
  const linhas: React.ReactNode[] = [];
  for (let x = -MARGEM; x < 1920 + MARGEM; x += 34) {
    linhas.push(<Line key={`a${x}`} x1={x} y1={y0} x2={x + (y1 - y0)} y2={y1} stroke="#5E6670" strokeWidth={2.4} semSombra />);
    linhas.push(<Line key={`b${x}`} x1={x} y1={y1} x2={x + (y1 - y0)} y2={y0} stroke="#5E6670" strokeWidth={2.4} semSombra />);
  }
  return (
    <g>
      <g opacity={0.4}>{linhas}</g>
      <Line x1={-MARGEM} y1={y0} x2={1920 + MARGEM} y2={y0} stroke={LINHA} strokeWidth={6} semSombra />
      <Papel>
        {[-140, 240, 620, 1000, 1380, 1760, 2140].map((x) => <Rect key={x} x={x - 7} y={y0 - 14} width={14} height={y1 - y0 + 20} rx={4} fill="#7C838C" stroke={LINHA} strokeWidth={INTERNA} />)}
      </Papel>
    </g>
  );
};

/** muro baixo pintado (faixa colorida embaixo); liso na altura das cabeças para não atrapalhar a leitura */
const Muro: React.FC = () => (
  <Papel>
    <Rect x={-MARGEM} y={640} width={1920 + 2 * MARGEM} height={HORIZONTE - 640} fill="#EDE6DA" stroke={LINHA} strokeWidth={CONTORNO} />
    <Rect x={-MARGEM} y={690} width={1920 + 2 * MARGEM} height={HORIZONTE - 690} fill="#5AA5B8" stroke={LINHA} strokeWidth={INTERNA} />
    <Rect x={-MARGEM} y={630} width={1920 + 2 * MARGEM} height={16} fill="#D9D0C2" stroke={LINHA} strokeWidth={INTERNA} />
  </Papel>
);

const Fundo: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Parede cor="#BFDDEA" base={HORIZONTE} />
    <Nuvem x={260 + t * 5} y={110} s={0.9} />
    <Nuvem x={1250 + t * 4} y={70} s={0.75} />
    <Papel>
      <Path d={`M -${MARGEM} 560 Q 300 300 760 420 Q 1150 520 1500 360 Q 1800 240 ${1920 + MARGEM} 380 L ${1920 + MARGEM} ${HORIZONTE} L -${MARGEM} ${HORIZONTE} Z`} fill="#9CC48A" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
    </Papel>
    <Papel>
      {[[120, 520, 70, "#F2D16B"], [210, 470, 60, "#E37BA1"], [330, 450, 74, "#5AA5B8"], [460, 470, 60, "#F4F1EA"], [580, 500, 66, "#E0822E"], [1260, 460, 66, "#F4F1EA"], [1380, 420, 70, "#C0504D", "#7A5A44"], [1500, 400, 60, "#8E7CC3"], [1620, 380, 70, "#F2D16B"], [1760, 390, 64, "#5AA5B8"], [1050, 520, 60, "#E37BA1"]].map(([x, y, w, c, tel], i) => (
        <Casinha key={i} x={x as number} y={y as number} w={w as number} cor={c as string} telhado={(tel as string) ?? "#C86F4E"} />
      ))}
    </Papel>
    <Arvore x={780} y={560} s={0.6} />
    <Arvore x={900} y={580} s={0.5} copa="#8DB37A" />
    <Arvore x={40} y={600} s={0.55} />
    <Alambrado />
    <Muro />
  </g>
);

const Gramado: React.FC = () => {
  const y0 = HORIZONTE;
  return (
    <g>
      <Rect x={-MARGEM} y={y0} width={1920 + 2 * MARGEM} height={1080 + MARGEM - y0} fill="#8DBA6A" semSombra />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = y0 + 30 + i * i * 22 + i * 40, b = a + 26 + i * 12;
        return <Rect key={i} x={-MARGEM} y={a} width={1920 + 2 * MARGEM} height={b - a} fill="#84B160" semSombra />;
      })}
      <Line x1={-MARGEM} y1={y0} x2={1920 + MARGEM} y2={y0} stroke={LINHA} strokeWidth={CONTORNO - 1} semSombra />
      {/* terra batida */}
      <Path d="M 1240 880 Q 1300 840 1560 850 Q 1820 856 1880 900 Q 1840 960 1560 960 Q 1290 958 1240 880 Z" fill="#C9A26E" semSombra />
      <Path d="M 640 960 Q 700 920 900 926 Q 1100 932 1140 970 Q 1080 1010 880 1008 Q 680 1004 640 960 Z" fill="#C9A26E" semSombra />
      {/* linhas de cal, apagadas */}
      <Path d={`M -${MARGEM} 772 L ${1920 + MARGEM} 772`} stroke="#F4F1EA" strokeWidth={6} opacity={0.6} />
      <Path d="M 1240 772 L 1180 900 L 1920 900" stroke="#F4F1EA" strokeWidth={6} opacity={0.5} fill="none" />
    </g>
  );
};

const Trave: React.FC = () => {
  const x0 = 1330, x1 = 1830, topo = 520, base = 860;
  const fx0 = x0 + 50, fx1 = x1 - 30, ftopo = topo + 40, fbase = base - 40; // fundo da rede
  const rede: React.ReactNode[] = [];
  for (let i = 0; i <= 12; i++) {
    const x = fx0 + ((fx1 - fx0) * i) / 12;
    rede.push(<Line key={`v${i}`} x1={x} y1={ftopo} x2={x} y2={fbase} stroke="#F4F1EA" strokeWidth={2.5} semSombra />);
  }
  for (let j = 0; j <= 7; j++) {
    const y = ftopo + ((fbase - ftopo) * j) / 7;
    rede.push(<Line key={`h${j}`} x1={fx0} y1={y} x2={fx1} y2={y} stroke="#F4F1EA" strokeWidth={2.5} semSombra />);
  }
  return (
    <g>
      <g opacity={0.85}>
        {rede}
        <Path d={`M ${x0} ${topo} L ${fx0} ${ftopo} L ${fx0} ${fbase} L ${x0} ${base} M ${x1} ${topo} L ${fx1} ${ftopo} L ${fx1} ${fbase} L ${x1} ${base} M ${fx0} ${ftopo} L ${fx1} ${ftopo}`} stroke="#F4F1EA" strokeWidth={3} fill="none" />
      </g>
      <Papel>
        <Path d={`M ${x0} ${base} L ${x0} ${topo} L ${x1} ${topo} L ${x1} ${base}`} stroke={LINHA} strokeWidth={22} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <Path d={`M ${x0} ${base} L ${x0} ${topo} L ${x1} ${topo} L ${x1} ${base}`} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      </Papel>
    </g>
  );
};

const Banco: React.FC = () => {
  const { x, y } = banco;
  return (
    <g transform={naEscala(x, y)}>
      <Papel>
        {[-1, 1].map((k) => <Rect key={k} x={x + k * 120 - 30} y={y + 14} width={60} height={64} rx={4} fill="#B9B4AA" stroke={LINHA} strokeWidth={CONTORNO} />)}
        <Rect x={x - 180} y={y - 8} width={360} height={24} rx={6} fill="#A9714E" stroke={LINHA} strokeWidth={CONTORNO} />
        <Line x1={x - 160} y1={y + 4} x2={x + 160} y2={y + 4} stroke={escura("#A9714E")} strokeWidth={INTERNA} />
      </Papel>
    </g>
  );
};

const Meio: React.FC<{ t: number }> = () => (
  <g>
    <Gramado />
    <Trave />
    <Banco />
  </g>
);

const Tufo: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Papel>
      <Path d="M -30 0 Q -26 -40 -34 -62 Q -14 -34 -8 0 Q -2 -56 6 -80 Q 10 -40 10 0 Q 18 -40 34 -58 Q 26 -26 30 0 Z" fill="#5E9A4E" stroke={LINHA} strokeWidth={INTERNA} strokeLinejoin="round" />
    </Papel>
  </g>
);

const Frente: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[[60, 1090, 1.6], [180, 1100, 1.2], [1500, 1100, 1.4], [1640, 1095, 1.1], [1860, 1100, 1.7], [880, 1110, 1]].map(([x, y, s], i) => <Tufo key={i} x={x} y={y} s={s} />)}
    <g transform={`rotate(${Math.sin(t * 1.6) * 3} 300 1100) translate(-190 0)`}>
      <Line x1={300} y1={1100} x2={312} y2={900} stroke="#5E9A4E" strokeWidth={6} />
      <Papel>
        {[0, 60, 120, 180, 240, 300].map((a) => <Circle key={a} cx={312 + Math.cos((a * Math.PI) / 180) * 18} cy={896 + Math.sin((a * Math.PI) / 180) * 18} r={11} fill="#FFFFFF" stroke={LINHA} strokeWidth={3} />)}
        <Circle cx={312} cy={896} r={12} fill="#F2D16B" stroke={LINHA} strokeWidth={3} />
      </Papel>
    </g>
  </g>
);

export const CAMPINHO: CenarioDef = { set, Fundo, Meio, Frente };
