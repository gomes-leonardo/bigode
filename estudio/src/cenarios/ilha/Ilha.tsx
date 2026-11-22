// Ilha (exemplo dos 100 pães): céu, sol, mar, ilha de areia com coqueiros e uma barraquinha de pão.
import React from "react";
import { CONTORNO, INTERNA, LINHA } from "../../estilo";
import { Circle, Ellipse, Line, Papel, Path, Rect } from "../../components/prim";
import { ancora, type SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { MARGEM, Nuvem, Parede } from "../pecas";
import dados from "./set.json";

const set = dados as SetJson;
const barraca = ancora(set, "barraca", "tampo");

const Coqueiro: React.FC<{ x: number; y: number; s?: number; inclina?: number }> = ({ x, y, s = 1, inclina = 8 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Papel>
      <Path d={`M -10 0 Q ${-4 + inclina} -150 ${inclina * 2} -300 L ${inclina * 2 + 16} -300 Q ${12 + inclina} -150 10 0 Z`} fill="#A9714E" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      {[-150, -110, -60, -20, 30, 70].map((a, i) => (
        <Path key={i} d={`M ${inclina * 2 + 8} -300 q ${Math.cos((a * Math.PI) / 180) * 60} ${-40 + Math.sin((a * Math.PI) / 180) * 30} ${Math.cos((a * Math.PI) / 180) * 130} ${Math.sin((a * Math.PI) / 180) * 70 + 20}`} stroke={LINHA} strokeWidth={26} fill="none" strokeLinecap="round" />
      ))}
      {[-150, -110, -60, -20, 30, 70].map((a, i) => (
        <Path key={`v${i}`} d={`M ${inclina * 2 + 8} -300 q ${Math.cos((a * Math.PI) / 180) * 60} ${-40 + Math.sin((a * Math.PI) / 180) * 30} ${Math.cos((a * Math.PI) / 180) * 130} ${Math.sin((a * Math.PI) / 180) * 70 + 20}`} stroke="#5E9A4E" strokeWidth={14} fill="none" strokeLinecap="round" />
      ))}
      <Circle cx={inclina * 2 + 2} cy={-292} r={10} fill="#6E4B35" stroke={LINHA} strokeWidth={3} />
      <Circle cx={inclina * 2 + 16} cy={-288} r={10} fill="#6E4B35" stroke={LINHA} strokeWidth={3} />
    </Papel>
  </g>
);

const Fundo: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Parede cor="#BFE3F0" base={700} />
    <Papel><Circle cx={1600} cy={170} r={80} fill="#F2D16B" stroke={LINHA} strokeWidth={CONTORNO} /></Papel>
    <Nuvem x={380 + t * 5} y={150} s={1} />
    <Nuvem x={1050 + t * 4} y={110} s={0.75} />
    <Rect x={-MARGEM} y={600} width={1920 + 2 * MARGEM} height={500} fill="#5AA5B8" semSombra />
    <Line x1={-MARGEM} y1={600} x2={1920 + MARGEM} y2={600} stroke={LINHA} strokeWidth={INTERNA} semSombra />
    {Array.from({ length: 9 }, (_, i) => <Path key={i} d={`M ${i * 240 - 100 + ((t * 20) % 60)} ${640 + (i % 3) * 30} q 20 -10 40 0`} stroke="#E3F1F6" strokeWidth={4} fill="none" opacity={0.7} />)}
  </g>
);

const Meio: React.FC<{ t: number }> = () => (
  <g>
    <Papel>
      <Ellipse cx={960} cy={1000} rx={980} ry={300} fill="#EBD5A6" stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
    <Coqueiro x={330} y={860} s={1.1} inclina={10} />
    <Coqueiro x={1630} y={850} s={1.25} inclina={-12} />
    {/* barraquinha */}
    <Papel>
      <Rect x={barraca.x0 + 10} y={barraca.y + 10} width={barraca.x1 - barraca.x0 - 20} height={880 - barraca.y - 10} fill="#C9955E" stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={barraca.x0 - 10} y={barraca.y - 6} width={barraca.x1 - barraca.x0 + 20} height={20} rx={5} fill="#E9DFCB" stroke={LINHA} strokeWidth={CONTORNO} />
      {[barraca.x0 + 6, barraca.x1 - 18].map((x) => <Rect key={x} x={x} y={500} width={12} height={barraca.y - 500} fill="#A9714E" stroke={LINHA} strokeWidth={INTERNA} />)}
      <Path d={`M ${barraca.x0 - 40} 520 L ${barraca.x1 + 40} 520 L ${barraca.x1 + 20} 470 L ${barraca.x0 - 20} 470 Z`} fill="#E0826E" stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => <Path key={i} d={`M ${barraca.x0 - 40 + i * ((barraca.x1 - barraca.x0 + 80) / 6)} 520 q ${(barraca.x1 - barraca.x0 + 80) / 12} 26 ${(barraca.x1 - barraca.x0 + 80) / 6} 0`} fill={i % 2 ? "#F4F1EA" : "#E0826E"} stroke={LINHA} strokeWidth={INTERNA} />)}
    </Papel>
  </g>
);

const Frente: React.FC<{ t: number }> = () => (
  <Papel>
    <Ellipse cx={120} cy={1070} rx={80} ry={24} fill="#C9B48A" stroke={LINHA} strokeWidth={INTERNA} />
    <Path d="M 1780 1080 q 20 -60 60 -80 q -10 40 -20 80 Z" fill="#5E9A4E" stroke={LINHA} strokeWidth={INTERNA} />
  </Papel>
);

export const ILHA: CenarioDef = { set, Fundo, Meio, Frente };

