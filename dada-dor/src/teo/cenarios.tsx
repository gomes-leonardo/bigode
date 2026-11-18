// Cenários do Téo desenhados em código (traço de tirinha). Cada um exporta suas âncoras:
// os personagens são posicionados por elas (chão, maca, balcão, muro...), nunca por x,y solto.
import React from "react";
import { FONTE } from "../theme";
import { LINHA } from "./tira";

const W = 7;
type R = { x: number; y: number; w: number; h: number };
const Caixa: React.FC<R & { cor: string; rx?: number; sw?: number }> = ({ x, y, w, h, cor, rx = 8, sw = W }) => <rect x={x} y={y} width={w} height={h} rx={rx} fill={cor} stroke={LINHA} strokeWidth={sw} />;

export const Parede: React.FC<{ cor: string; listra?: string; chao: number; largura?: number; passo?: number }> = ({ cor, listra, chao, largura = 1920, passo = 80 }) => (
  <g>
    <rect x={-400} y={-400} width={largura + 800} height={chao + 400} fill={cor} />
    {listra && Array.from({ length: Math.ceil((largura + 800) / passo) }, (_, i) => <line key={i} x1={-400 + 40 + i * passo} y1={-400} x2={-400 + 40 + i * passo} y2={chao - 40} stroke={listra} strokeWidth={14} />)}
  </g>
);
export const Piso: React.FC<{ cor: string; chao: number; largura?: number; linha?: string; rodape?: string }> = ({ cor, chao, largura = 1920, linha, rodape = "#FBFBF7" }) => (
  <g>
    <rect x={-400} y={chao} width={largura + 800} height={700} fill={cor} />
    {linha && Array.from({ length: Math.ceil((largura + 800) / 150) }, (_, i) => <line key={i} x1={-400 + i * 150 + (i % 2) * 60} y1={chao + 54} x2={-400 + i * 150 + (i % 2) * 60 + 100} y2={chao + 54} stroke={linha} strokeWidth={5} strokeLinecap="round" />)}
    {rodape && <rect x={-410} y={chao - 30} width={largura + 820} height={30} fill={rodape} stroke={LINHA} strokeWidth={6} />}
    <line x1={-400} y1={chao} x2={largura + 400} y2={chao} stroke={LINHA} strokeWidth={9} />
  </g>
);
export const Porta: React.FC<{ x: number; chao: number; cor?: string; aberta?: number }> = ({ x, chao, cor = "#E9A66E", aberta = 0 }) => (
  <g>
    <rect x={x} y={chao - 620} width={300} height={620} fill="#3A2A20" stroke={LINHA} strokeWidth={W} />
    <g transform={`translate(${x} 0) scale(${1 - 0.8 * aberta} 1)`}>
      <rect x={0} y={chao - 620} width={300} height={620} rx={6} fill={cor} stroke={LINHA} strokeWidth={W} />
      <circle cx={262} cy={chao - 300} r={14} fill="#FFD95A" stroke={LINHA} strokeWidth={5} />
    </g>
  </g>
);
const Nuvem: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#FBFBF7" stroke={LINHA} strokeWidth={6}>
    <path d="M 0 40 Q -10 0 40 6 Q 60 -26 100 0 Q 150 -10 150 34 Q 170 60 130 64 L 20 64 Q -20 64 0 40 Z" />
  </g>
);
const Casinha: React.FC<{ x: number; y: number; cor: string; s?: number; luz?: boolean }> = ({ x, y, cor, s = 1, luz }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={-150} width={200} height={150} fill={cor} stroke={LINHA} strokeWidth={W} />
    <path d="M -20 -150 L 100 -230 L 220 -150 Z" fill="#C9584A" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
    <rect x={30} y={-110} width={50} height={50} fill={luz ? "#FFD95A" : "#BFE6FF"} stroke={LINHA} strokeWidth={5} />
    <rect x={120} y={-90} width={50} height={90} fill="#8A5A3A" stroke={LINHA} strokeWidth={5} />
  </g>
);

// ---------------------------------------------------------------- consultório
export const CONSULTORIO = { chao: 950, maca: { x0: 700, x1: 1150, assento: 700 } };
export const Consultorio: React.FC = () => {
  const { chao, maca } = CONSULTORIO;
  return (
    <g>
      <Parede cor="#DDEFE6" listra="#CFE6DA" chao={chao} />
      <Piso cor="#BFD6E0" chao={chao} linha="#9FB8C4" />
      {/* cartaz do corpo humano */}
      <Caixa x={180} y={210} w={260} h={360} cor="#FBFBF7" />
      <g stroke={LINHA} strokeWidth={6} fill="#F2C9A0" strokeLinejoin="round">
        <circle cx={310} cy={280} r={36} />
        <path d="M 270 320 L 350 320 L 360 440 L 260 440 Z" />
        <path d="M 270 330 L 230 430 M 350 330 L 390 430 M 285 440 L 280 540 M 335 440 L 340 540" fill="none" strokeWidth={14} strokeLinecap="round" stroke="#F2C9A0" />
        <path d="M 310 330 L 310 440 M 290 360 L 240 420 M 330 360 L 380 420" fill="none" stroke="#E8503A" strokeWidth={5} />
      </g>
      {/* armário */}
      <Caixa x={1460} y={330} w={320} h={chao - 330} cor="#F4F6F8" />
      <line x1={1620} y1={330} x2={1620} y2={chao} stroke={LINHA} strokeWidth={5} />
      <Caixa x={1490} y={360} w={260} h={140} cor="#BFE6FF" sw={5} />
      {[0, 1, 2].map((i) => <Caixa key={i} x={1510 + i * 80} y={420} w={46} h={70} cor={["#E9707F", "#86DDBE", "#FFD23F"][i]} rx={10} sw={4} />)}
      {/* maca */}
      <Caixa x={maca.x0} y={maca.assento + 40} w={maca.x1 - maca.x0} h={30} cor="#9AA0A8" />
      <rect x={maca.x0 + 30} y={maca.assento + 70} width={18} height={chao - maca.assento - 70} fill="#9AA0A8" stroke={LINHA} strokeWidth={5} />
      <rect x={maca.x1 - 48} y={maca.assento + 70} width={18} height={chao - maca.assento - 70} fill="#9AA0A8" stroke={LINHA} strokeWidth={5} />
      <Caixa x={maca.x0 - 10} y={maca.assento} w={maca.x1 - maca.x0 + 20} h={44} cor="#7FB7F0" rx={14} />
      <Caixa x={maca.x0} y={maca.assento - 14} w={maca.x1 - maca.x0} h={18} cor="#FBFBF7" rx={6} sw={5} />
    </g>
  );
};

// ---------------------------------------------------------------- pátio da escola
export const PATIO = { chao: 940, mesa: { x0: 1380, x1: 1720, topo: 760 }, fila: [1150, 960, 790, 620, 450, 280] };
export const Patio: React.FC = () => {
  const { chao, mesa } = PATIO;
  return (
    <g>
      <rect x={-400} y={-400} width={2800} height={chao + 400} fill="#F7E7B5" />
      {[0, 1, 2, 3, 4].map((i) => <g key={i}><Caixa x={60 + i * 380} y={180} w={240} h={200} cor="#BFE6FF" /><line x1={180 + i * 380} y1={180} x2={180 + i * 380} y2={380} stroke={LINHA} strokeWidth={6} /></g>)}
      <rect x={-400} y={470} width={2800} height={30} fill="#E9A66E" stroke={LINHA} strokeWidth={6} />
      <rect x={-400} y={chao} width={2800} height={700} fill="#D9C7A0" />
      <line x1={-400} y1={chao} x2={2400} y2={chao} stroke={LINHA} strokeWidth={9} />
      {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-300 + i * 180} y1={chao + 70} x2={-220 + i * 180} y2={chao + 70} stroke="#BFAE86" strokeWidth={6} strokeLinecap="round" />)}
      {/* mesa da vacina */}
      <Caixa x={mesa.x0} y={mesa.topo} w={mesa.x1 - mesa.x0} h={24} cor="#FBFBF7" />
      <rect x={mesa.x0 + 20} y={mesa.topo + 24} width={16} height={chao - mesa.topo - 24} fill="#9AA0A8" stroke={LINHA} strokeWidth={5} />
      <rect x={mesa.x1 - 36} y={mesa.topo + 24} width={16} height={chao - mesa.topo - 24} fill="#9AA0A8" stroke={LINHA} strokeWidth={5} />
      <Caixa x={mesa.x0 + 140} y={mesa.topo - 60} w={150} h={60} cor="#7FB7F0" sw={5} />
      <path d={`M ${mesa.x0 + 190} ${mesa.topo - 46} h 50 M ${mesa.x0 + 215} ${mesa.topo - 56} v 30`} stroke="#E8503A" strokeWidth={10} />
      {/* cartaz da campanha (sem texto) */}
      <Caixa x={1380} y={150} w={300} h={260} cor="#FBFBF7" />
      <circle cx={1530} cy={260} r={70} fill="#86DDBE" stroke={LINHA} strokeWidth={6} />
      <path d="M 1490 260 L 1570 260 M 1530 220 L 1530 300" stroke="#FBFBF7" strokeWidth={22} />
    </g>
  );
};

// ---------------------------------------------------------------- venda do Seu Nelson
export const VENDA = { chao: 950, balcao: { x0: 160, x1: 1500, topo: 700 }, pote: { x: 980 }, nelson: 1260 };
export const VendaFundo: React.FC = () => {
  const { chao } = VENDA;
  return (
    <g>
      <Parede cor="#F3D9B1" listra="#EBCB9C" chao={chao} />
      <Piso cor="#C98450" chao={chao} linha="#A86A3A" rodape="" />
      {[230, 420].map((y, j) => (
        <g key={j}>
          <rect x={180} y={y} width={1320} height={18} fill="#B4733F" stroke={LINHA} strokeWidth={6} />
          {Array.from({ length: 12 }, (_, i) => {
            const cor = ["#E23B2E", "#3FAF63", "#FFD23F", "#7FB7F0", "#F2A65A", "#9B6FD0"][(i + j) % 6];
            return i % 3 === 1 ? <Caixa key={i} x={210 + i * 105} y={y - 100} w={60} h={100} cor={cor} rx={16} sw={5} /> : <Caixa key={i} x={200 + i * 105} y={y - 80} w={80} h={80} cor={cor} rx={6} sw={5} />;
          })}
        </g>
      ))}
      {/* ventilador de teto e lâmpada */}
      <line x1={1700} y1={-100} x2={1700} y2={120} stroke={LINHA} strokeWidth={6} />
      <circle cx={1700} cy={140} r={28} fill="#FFD95A" stroke={LINHA} strokeWidth={6} />
    </g>
  );
};
export const VendaBalcao: React.FC<{ potePimentas?: number }> = ({ potePimentas = 6 }) => {
  const { chao, balcao, pote } = VENDA;
  return (
    <g>
      <Caixa x={balcao.x0} y={balcao.topo} w={balcao.x1 - balcao.x0} h={chao - balcao.topo} cor="#B4733F" rx={4} />
      <Caixa x={balcao.x0 - 20} y={balcao.topo - 12} w={balcao.x1 - balcao.x0 + 40} h={30} cor="#C98450" rx={6} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={balcao.x0 + 40 + i * 340} y1={balcao.topo + 60} x2={balcao.x0 + 40 + i * 340} y2={chao - 30} stroke="#9A5F32" strokeWidth={6} strokeLinecap="round" />)}
      {/* pote de pimenta */}
      <g transform={`translate(${pote.x} ${balcao.topo - 12})`}>
        <path d="M -60 0 L -66 -130 Q 0 -146 66 -130 L 60 0 Z" fill="#E8F4F8" stroke={LINHA} strokeWidth={6} strokeLinejoin="round" opacity={0.95} />
        {Array.from({ length: potePimentas }, (_, i) => <path key={i} d={`M ${-40 + (i % 3) * 30} ${-20 - Math.floor(i / 3) * 44} q 12 -16 4 -38 q -12 8 -14 30 Z`} fill="#E23B2E" stroke={LINHA} strokeWidth={4} />)}
        <rect x={-58} y={-160} width={116} height={26} rx={8} fill="#E23B2E" stroke={LINHA} strokeWidth={6} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- campinho
export const CAMPINHO = { chao: 900, trave: { x: 1600, topo: 540 } };
export const Campinho: React.FC<{ final?: boolean; largura?: number }> = ({ final, largura = 1920 }) => {
  const { chao, trave } = CAMPINHO;
  return (
    <g>
      <rect x={-400} y={-400} width={largura + 800} height={chao + 400} fill="#BFE6FF" />
      <Nuvem x={200} y={90} />
      <Nuvem x={1250} y={60} s={0.8} />
      {[-200, 150, 520, 900, 1700, 2100].map((x, i) => <Casinha key={i} x={x} y={chao - 250} cor={["#F2A65A", "#86DDBE", "#E9707F", "#FFD23F", "#7FB7F0", "#C9B3F0"][i]} s={0.9} />)}
      {/* muro do campinho */}
      <rect x={-400} y={chao - 260} width={largura + 800} height={110} fill="#E8DCC4" stroke={LINHA} strokeWidth={W} />
      {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-400 + i * 80} y1={chao - 260} x2={-400 + i * 80} y2={chao - 150} stroke="#CFC2A6" strokeWidth={5} />)}
      {final && (
        <g>
          <path d={`M -300 ${chao - 330} Q ${largura / 2} ${chao - 270} ${largura + 300} ${chao - 330}`} stroke={LINHA} strokeWidth={4} fill="none" />
          {Array.from({ length: 30 }, (_, i) => {
            const x = -280 + i * ((largura + 560) / 30);
            const y = chao - 330 + 60 * Math.sin((Math.PI * (x + 300)) / (largura + 600)) * 0.98;
            return <path key={i} d={`M ${x} ${y} l 24 0 l -12 30 Z`} fill={["#E23B2E", "#FFD23F", "#3FAF63", "#3B6FD6"][i % 4]} stroke={LINHA} strokeWidth={3} />;
          })}
          <g transform={`translate(${largura / 2 - 260} ${chao - 470}) rotate(-2)`}>
            <rect x={10} y={10} width={520} height={130} rx={10} fill={LINHA} />
            <rect width={520} height={130} rx={10} fill="#FBFBF7" stroke={LINHA} strokeWidth={8} />
            <text x={260} y={98} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={96} fill="#E23B2E">FINAL</text>
          </g>
        </g>
      )}
      <rect x={-400} y={chao - 150} width={largura + 800} height={150} fill="#D9A86A" />
      <rect x={-400} y={chao} width={largura + 800} height={700} fill="#C98E52" />
      <line x1={-400} y1={chao} x2={largura + 400} y2={chao} stroke={LINHA} strokeWidth={9} />
      {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={-300 + i * 170 + (i % 3) * 30} cy={chao + 60 + (i % 2) * 50} rx={18} ry={6} fill="#B07A44" />)}
      {/* trave (gol) vista de lado: rede atrás do poste */}
      <g>
        <path d={`M ${trave.x} ${trave.topo} L ${trave.x + 220} ${trave.topo + 40} L ${trave.x + 260} ${chao} L ${trave.x} ${chao} Z`} fill="rgba(255,255,255,0.35)" stroke="#9AA0A8" strokeWidth={4} />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={trave.x + i * 37} y1={trave.topo + i * 6} x2={trave.x + i * 37 + 6} y2={chao} stroke="#9AA0A8" strokeWidth={3} />)}
        {Array.from({ length: 8 }, (_, i) => <line key={i} x1={trave.x} y1={trave.topo + i * 46} x2={trave.x + 225 + i * 4} y2={trave.topo + 40 + i * 42} stroke="#9AA0A8" strokeWidth={3} />)}
        <rect x={trave.x + 200} y={trave.topo + 30} width={16} height={chao - trave.topo - 30} fill="#E4E4E4" stroke={LINHA} strokeWidth={5} />
      </g>
    </g>
  );
};
/** poste da frente da trave (desenhado na frente dos atores) */
export const TraveFrente: React.FC<{ tremor?: number }> = ({ tremor = 0 }) => {
  const { chao, trave } = CAMPINHO;
  return (
    <g transform={`translate(${tremor} 0)`}>
      <rect x={trave.x - 14} y={trave.topo - 14} width={240} height={26} rx={8} fill="#FBFBF7" stroke={LINHA} strokeWidth={W} transform={`rotate(10 ${trave.x} ${trave.topo})`} />
      <rect x={trave.x - 14} y={trave.topo - 14} width={28} height={chao - trave.topo + 14} rx={8} fill="#FBFBF7" stroke={LINHA} strokeWidth={W} />
    </g>
  );
};

// ---------------------------------------------------------------- cozinha da Vó Cida
export const COZINHA = { chao: 940, pia: { x0: 260, x1: 720, topo: 690 }, fogao: { x0: 1240, x1: 1560, topo: 690 }, panela: { x: 1400 }, mesa: { x0: 760, x1: 1120, topo: 720 }, cadeira: { x: 800, assento: 760 } };
export const Cozinha: React.FC<{ noite?: boolean; semPanela?: boolean; vapor?: number; t?: number }> = ({ noite, semPanela, vapor = 0, t = 0 }) => {
  const { chao, pia, fogao, panela } = COZINHA;
  return (
    <g>
      <Parede cor="#F3EBD8" chao={chao} />
      {Array.from({ length: 30 }, (_, i) => Array.from({ length: 4 }, (_, j) => <rect key={`${i}-${j}`} x={-200 + i * 90} y={420 + j * 70} width={86} height={66} fill={(i + j) % 2 ? "#DDEFE6" : "#F7FBF8"} />))}
      <Piso cor="#C9584A" chao={chao} linha="#A8463A" rodape="" />
      {/* janela sobre a pia */}
      <Caixa x={360} y={130} w={260} h={220} cor={noite ? "#1E2A5A" : "#BFE6FF"} />
      <line x1={490} y1={130} x2={490} y2={350} stroke={LINHA} strokeWidth={6} />
      {noite && <circle cx={560} cy={190} r={26} fill="#F4F1D0" stroke={LINHA} strokeWidth={5} />}
      {/* pia */}
      <Caixa x={pia.x0} y={pia.topo} w={pia.x1 - pia.x0} h={chao - pia.topo} cor="#FBFBF7" rx={4} />
      <Caixa x={pia.x0 - 14} y={pia.topo - 14} w={pia.x1 - pia.x0 + 28} h={28} cor="#9AA0A8" rx={4} />
      <path d={`M ${pia.x0 + 220} ${pia.topo - 14} L ${pia.x0 + 220} ${pia.topo - 90} Q ${pia.x0 + 220} ${pia.topo - 120} ${pia.x0 + 260} ${pia.topo - 120} L ${pia.x0 + 270} ${pia.topo - 100}`} stroke={LINHA} strokeWidth={14} fill="none" strokeLinecap="round" />
      {[0, 1].map((i) => <line key={i} x1={pia.x0 + 30 + i * 230} y1={pia.topo + 40} x2={pia.x0 + 200 + i * 230} y2={pia.topo + 40} stroke={LINHA} strokeWidth={4} />)}
      {/* fogão */}
      <Caixa x={fogao.x0} y={fogao.topo} w={fogao.x1 - fogao.x0} h={chao - fogao.topo} cor="#FBFBF7" rx={6} />
      <Caixa x={fogao.x0 + 40} y={fogao.topo + 60} w={fogao.x1 - fogao.x0 - 80} h={140} cor="#2A2A35" rx={6} sw={5} />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={fogao.x0 + 50 + i * 70} cy={fogao.topo + 26} r={10} fill="#9AA0A8" stroke={LINHA} strokeWidth={4} />)}
      <rect x={fogao.x0 - 6} y={fogao.topo - 14} width={fogao.x1 - fogao.x0 + 12} height={16} rx={4} fill="#2A2A35" stroke={LINHA} strokeWidth={5} />
      {!semPanela && <Panela x={panela.x} y={fogao.topo - 14} />}
      {!semPanela && <Fogo x={panela.x} y={fogao.topo - 14} t={t} />}
      {vapor > 0 && <Vapor x={panela.x} y={fogao.topo - 150} t={t} k={vapor} />}
      {/* armário alto */}
      <Caixa x={1640} y={160} w={240} h={300} cor="#86DDBE" />
      <line x1={1760} y1={160} x2={1760} y2={460} stroke={LINHA} strokeWidth={5} />
      {noite && <g><line x1={940} y1={-200} x2={940} y2={180} stroke={LINHA} strokeWidth={5} /><path d="M 880 180 L 1000 180 L 970 230 L 910 230 Z" fill="#FFD95A" stroke={LINHA} strokeWidth={6} /></g>}
    </g>
  );
};
/** mesa e cadeira da cozinha (na frente da vó sentada) */
export const MesaCozinha: React.FC = () => {
  const { chao, mesa } = COZINHA;
  return (
    <g>
      <Caixa x={mesa.x0} y={mesa.topo} w={mesa.x1 - mesa.x0} h={26} cor="#B4733F" />
      <rect x={mesa.x0 + 20} y={mesa.topo + 26} width={20} height={chao - mesa.topo - 26} fill="#9A5F32" stroke={LINHA} strokeWidth={5} />
      <rect x={mesa.x1 - 40} y={mesa.topo + 26} width={20} height={chao - mesa.topo - 26} fill="#9A5F32" stroke={LINHA} strokeWidth={5} />
      <path d={`M ${mesa.x0 - 10} ${mesa.topo + 4} L ${mesa.x0 + 120} ${mesa.topo + 4} L ${mesa.x0 + 100} ${mesa.topo + 40} L ${mesa.x0 + 10} ${mesa.topo + 40} Z`} fill="#F2A65A" opacity={0.0} />
    </g>
  );
};
export const Cadeira: React.FC<{ x: number; assento: number; chao: number; esq?: boolean }> = ({ x, assento, chao, esq }) => {
  const s = esq ? -1 : 1;
  return (
    <g transform={`translate(${x} 0) scale(${s} 1)`}>
      <rect x={-70} y={assento + 4} width={120} height={20} rx={5} fill="#C98450" stroke={LINHA} strokeWidth={6} />
      <rect x={-70} y={assento - 150} width={18} height={chao - assento + 150} rx={5} fill="#C98450" stroke={LINHA} strokeWidth={6} />
      <rect x={34} y={assento + 24} width={16} height={chao - assento - 24} fill="#B4733F" stroke={LINHA} strokeWidth={5} />
    </g>
  );
};
export const Panela: React.FC<{ x: number; y: number; giro?: number }> = ({ x, y, giro = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro})`}>
    <rect x={-90} y={-110} width={180} height={110} rx={16} fill="#B9BEC6" stroke={LINHA} strokeWidth={W} />
    <path d="M -100 -110 Q 0 -150 100 -110 Z" fill="#9AA0A8" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
    <rect x={-14} y={-162} width={28} height={30} rx={6} fill="#2A2A35" stroke={LINHA} strokeWidth={5} />
    {/* alça comprida para a esquerda: o Téo pega aqui */}
    <rect x={-210} y={-100} width={130} height={26} rx={12} fill="#2A2A35" stroke={LINHA} strokeWidth={6} />
    <rect x={80} y={-100} width={46} height={24} rx={10} fill="#2A2A35" stroke={LINHA} strokeWidth={6} />
  </g>
);
/** ponto da alça da panela, relativo ao centro da base */
export const ALCA_PANELA: [number, number] = [-170, -87];
export const Fogo: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g>
    {[-50, -16, 18, 52].map((dx, i) => <path key={i} d={`M ${x + dx - 12} ${y + 2} Q ${x + dx} ${y - 30 - 8 * Math.sin(t * 20 + i)} ${x + dx + 12} ${y + 2} Z`} fill="#3B8FF0" stroke={LINHA} strokeWidth={3} />)}
  </g>
);
export const Vapor: React.FC<{ x: number; y: number; t: number; k?: number }> = ({ x, y, t, k = 1 }) => (
  <g opacity={Math.min(1, k)}>
    {[0, 1, 2, 3].map((i) => {
      const fase = (t * 0.9 + i * 0.25) % 1;
      return <path key={i} d={`M ${x - 40 + i * 26} ${y - fase * 160} q 20 -20 0 -40 q -20 -20 0 -40`} stroke="#FBFBF7" strokeWidth={14 * (1 - fase)} fill="none" strokeLinecap="round" opacity={1 - fase} />;
    })}
  </g>
);

// ---------------------------------------------------------------- hospital
export const HOSPITAL = { chao: 940, negatoscopio: { x: 1100, y: 220, w: 640, h: 440 } };
export const Hospital: React.FC<{ brilho?: number; antigas?: number; t?: number }> = ({ brilho = 1, antigas = 0, t = 0 }) => {
  const { chao, negatoscopio: n } = HOSPITAL;
  return (
    <g>
      <Parede cor="#D6E4F0" listra="#C9D9E8" chao={chao} />
      <Piso cor="#AFC3D3" chao={chao} linha="#93A9BB" />
      <Caixa x={n.x - 20} y={n.y - 20} w={n.w + 40} h={n.h + 40} cor="#9AA0A8" />
      <rect x={n.x} y={n.y} width={n.w} height={n.h} fill="#EAF6FF" stroke={LINHA} strokeWidth={6} />
      <RaioX x={n.x + n.w / 2} y={n.y + n.h / 2} brilho={brilho} antigas={antigas} t={t} />
      <Caixa x={140} y={300} w={220} h={160} cor="#FBFBF7" />
      <path d="M 160 400 L 210 400 L 230 340 L 260 440 L 280 380 L 340 380" stroke="#3FAF63" strokeWidth={6} fill="none" />
    </g>
  );
};
/** raio-x do pé (de lado): ossos, uma fratura brilhando e duas marcas antigas */
export const RaioX: React.FC<{ x: number; y: number; brilho: number; antigas: number; t: number }> = ({ x, y, brilho, antigas, t }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-300} y={-200} width={600} height={400} fill="#1A2030" />
    <g stroke="#E8F0F8" strokeWidth={22} strokeLinecap="round" fill="none" opacity={0.9}>
      <line x1={-120} y1={-180} x2={-110} y2={10} />
      <line x1={-80} y1={-180} x2={-76} y2={10} strokeWidth={14} />
      <path d="M -150 30 Q -110 -10 -60 40" />
      <line x1={-60} y1={50} x2={60} y2={80} />
      <line x1={-40} y1={70} x2={80} y2={110} />
      <line x1={-50} y1={90} x2={100} y2={130} strokeWidth={18} />
      <line x1={80} y1={84} x2={190} y2={100} strokeWidth={14} />
      <line x1={100} y1={114} x2={200} y2={130} strokeWidth={14} />
      <line x1={-170} y1={60} x2={-60} y2={110} strokeWidth={26} />
    </g>
    {/* fratura nova: brilha */}
    <g opacity={brilho}>
      <path d="M 10 76 L 22 88 L 8 98 L 24 112" stroke="#FF5A4A" strokeWidth={8} fill="none" strokeLinejoin="round" />
      <circle cx={16} cy={94} r={42 + 6 * Math.sin(t * 8)} stroke="#FF5A4A" strokeWidth={6} fill="none" />
    </g>
    {/* fraturas antigas: marcas apagadas */}
    {antigas > 0 && (
      <g opacity={0.35 + 0.45 * antigas}>
        <circle cx={-114} cy={-80} r={30} stroke="#FFD23F" strokeWidth={5} fill="none" strokeDasharray="10 8" />
        <circle cx={150} cy={98} r={26} stroke="#FFD23F" strokeWidth={5} fill="none" strokeDasharray="10 8" />
      </g>
    )}
  </g>
);

// ---------------------------------------------------------------- rua com guia
export const RUA = { calcada: 920, rua: 975, guia: 1080 };
export const Rua: React.FC<{ largura?: number }> = ({ largura = 1920 }) => {
  const { calcada, rua, guia } = RUA;
  return (
    <g>
      <rect x={-400} y={-400} width={largura + 800} height={calcada + 400} fill="#BFE6FF" />
      <Nuvem x={1400} y={90} />
      <rect x={-400} y={calcada - 480} width={largura + 800} height={480} fill="#F2C9A0" stroke={LINHA} strokeWidth={W} />
      {[0, 1, 2, 3].map((i) => <g key={i}><Caixa x={-100 + i * 600} y={calcada - 400} w={200} h={200} cor="#BFE6FF" /><Caixa x={200 + i * 600} y={calcada - 360} w={160} h={360} cor={["#3FAF63", "#E9707F", "#7FB7F0", "#FFD23F"][i]} /></g>)}
      <rect x={-400} y={calcada} width={guia + 400} height={rua - calcada + 300} fill="#CFC9BE" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-300 + i * 120} y1={calcada} x2={-300 + i * 120} y2={rua + 300} stroke="#B9B2A4" strokeWidth={4} />)}
      <rect x={guia} y={rua} width={largura + 400} height={400} fill="#6E6E78" />
      <line x1={-400} y1={calcada} x2={guia} y2={calcada} stroke={LINHA} strokeWidth={9} />
      <path d={`M ${guia} ${calcada} L ${guia} ${rua} L ${largura + 400} ${rua}`} stroke={LINHA} strokeWidth={9} fill="none" />
      <rect x={guia - 30} y={calcada} width={30} height={rua - calcada} fill="#E4E0D6" stroke={LINHA} strokeWidth={6} />
      {[0, 1, 2].map((i) => <rect key={i} x={guia + 120 + i * 300} y={rua + 60} width={140} height={14} fill="#FBFBF7" />)}
    </g>
  );
};

// ---------------------------------------------------------------- quintal com muro, noite
export const QUINTAL = { chao: 930, muro: { x0: 260, x1: 1420, topo: 560 } };
export const Quintal: React.FC<{ ambulancia?: number; t?: number }> = ({ ambulancia = 0, t = 0 }) => {
  const { chao, muro } = QUINTAL;
  const pisca = Math.floor(t * 4) % 2;
  return (
    <g>
      <rect x={-400} y={-400} width={2800} height={chao + 400} fill="#1E2A5A" />
      {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={(i * 397) % 2200 - 100} cy={(i * 131) % 400 + 40} r={3 + (i % 3)} fill="#F4F1D0" />)}
      <circle cx={1560} cy={170} r={76} fill="#F4F1D0" stroke={LINHA} strokeWidth={W} />
      <circle cx={1590} cy={150} r={14} fill="#E2DDB0" />
      {/* casas do outro lado do muro */}
      <Casinha x={-150} y={muro.topo + 40} cor="#5A6A9A" luz />
      <Casinha x={1500} y={muro.topo + 40} cor="#6A5A8A" luz s={1.1} />
      {ambulancia > 0 && (
        <g transform={`translate(${1500 + (1 - ambulancia) * 500} ${muro.topo + 10})`}>
          <rect x={0} y={-120} width={300} height={120} rx={14} fill="#FBFBF7" stroke={LINHA} strokeWidth={W} />
          <path d="M 120 -90 h 60 M 150 -116 v 52" stroke="#E23B2E" strokeWidth={14} />
          <rect x={40} y={-150} width={40} height={30} rx={6} fill={pisca ? "#E23B2E" : "#7A1A14"} stroke={LINHA} strokeWidth={5} />
          <rect x={220} y={-150} width={40} height={30} rx={6} fill={pisca ? "#2A4ABF" : "#5A8AFF"} stroke={LINHA} strokeWidth={5} />
        </g>
      )}
      {/* muro de tijolo */}
      <rect x={muro.x0} y={muro.topo} width={muro.x1 - muro.x0} height={chao - muro.topo} fill="#B5654A" stroke={LINHA} strokeWidth={W} />
      {Array.from({ length: Math.floor((chao - muro.topo) / 46) }, (_, j) => Array.from({ length: 13 }, (_, i) => <rect key={`${i}-${j}`} x={muro.x0 + i * 92 + (j % 2) * 46 - 46} y={muro.topo + 8 + j * 46} width={88} height={40} fill="#C27458" stroke="#8E4A36" strokeWidth={3} />))}
      <rect x={muro.x0} y={muro.topo} width={muro.x1 - muro.x0} height={chao - muro.topo} fill="none" stroke={LINHA} strokeWidth={W} />
      <rect x={muro.x0 - 14} y={muro.topo - 18} width={muro.x1 - muro.x0 + 28} height={22} rx={4} fill="#9A9AA6" stroke={LINHA} strokeWidth={6} />
      {/* varal */}
      <line x1={-100} y1={420} x2={240} y2={460} stroke="#D0D0DA" strokeWidth={4} />
      <rect x={60} y={430} width={70} height={80} fill="#E9707F" stroke={LINHA} strokeWidth={5} />
      <rect x={-400} y={chao} width={2800} height={700} fill="#3E6A3A" />
      <line x1={-400} y1={chao} x2={2400} y2={chao} stroke={LINHA} strokeWidth={9} />
      {ambulancia > 0 && <rect x={-400} y={-400} width={2800} height={2000} fill={pisca ? "#E23B2E" : "#2A4ABF"} opacity={0.08 * ambulancia} />}
    </g>
  );
};

// ---------------------------------------------------------------- ladeira (montagem do rolimã)
export const LADEIRA = { y0: 520, y1: 980, x0: -200, x1: 2120 };
export const ladeiraY = (x: number) => LADEIRA.y0 + ((x - LADEIRA.x0) / (LADEIRA.x1 - LADEIRA.x0)) * (LADEIRA.y1 - LADEIRA.y0);
export const LADEIRA_ANG = (Math.atan2(LADEIRA.y1 - LADEIRA.y0, LADEIRA.x1 - LADEIRA.x0) * 180) / Math.PI;
export const Ladeira: React.FC = () => (
  <g>
    <rect x={-400} y={-400} width={2800} height={2000} fill="#BFE6FF" />
    <Nuvem x={300} y={80} />
    {[0, 1, 2, 3, 4].map((i) => <Casinha key={i} x={-100 + i * 440} y={ladeiraY(-100 + i * 440) - 60} cor={["#F2A65A", "#86DDBE", "#E9707F", "#FFD23F", "#7FB7F0"][i]} />)}
    <path d={`M ${LADEIRA.x0} ${LADEIRA.y0} L ${LADEIRA.x1} ${LADEIRA.y1} L ${LADEIRA.x1} 1500 L ${LADEIRA.x0} 1500 Z`} fill="#8A8A96" />
    <line x1={LADEIRA.x0} y1={LADEIRA.y0} x2={LADEIRA.x1} y2={LADEIRA.y1} stroke={LINHA} strokeWidth={9} />
    {Array.from({ length: 8 }, (_, i) => { const x = -100 + i * 300; return <line key={i} x1={x} y1={ladeiraY(x) + 50} x2={x + 140} y2={ladeiraY(x + 140) + 50} stroke="#FBFBF7" strokeWidth={12} />; })}
  </g>
);

// ---------------------------------------------------------------- fundo liso (cartelas, painéis, close)
export const Liso: React.FC<{ cor: string; padrao?: string }> = ({ cor, padrao }) => (
  <g>
    <rect x={-1000} y={-1000} width={4000} height={3200} fill={cor} />
    {padrao && Array.from({ length: 30 }, (_, i) => Array.from({ length: 18 }, (_, j) => <circle key={`${i}-${j}`} cx={i * 80 + (j % 2) * 40 - 200} cy={j * 80 - 100} r={6} fill={padrao} />))}
  </g>
);
