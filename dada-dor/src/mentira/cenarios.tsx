// Cenários novos do vídeo da mentira (mesmo traço de tirinha). Cada um exporta suas âncoras.
import React from "react";
import { LINHA } from "../teo/tira";

const W = 7;
type R = { x: number; y: number; w: number; h: number };
export const Cx: React.FC<R & { cor: string; rx?: number; sw?: number; op?: number }> = ({ x, y, w, h, cor, rx = 8, sw = W, op }) => <rect x={x} y={y} width={w} height={h} rx={rx} fill={cor} stroke={LINHA} strokeWidth={sw} opacity={op} />;
const Fundo: React.FC<{ cor: string; chao: number; piso: string; listra?: string; rodape?: string; linhaPiso?: string; largura?: number }> = ({ cor, chao, piso, listra, rodape = "#FBFBF7", linhaPiso, largura = 1920 }) => (
  <g>
    <rect x={-600} y={-600} width={largura + 1200} height={chao + 600} fill={cor} />
    {listra && Array.from({ length: Math.ceil((largura + 1200) / 80) }, (_, i) => <line key={i} x1={-560 + i * 80} y1={-600} x2={-560 + i * 80} y2={chao - 40} stroke={listra} strokeWidth={14} />)}
    <rect x={-600} y={chao} width={largura + 1200} height={900} fill={piso} />
    {linhaPiso && Array.from({ length: Math.ceil((largura + 1200) / 150) }, (_, i) => <line key={i} x1={-600 + i * 150 + (i % 2) * 60} y1={chao + 54} x2={-600 + i * 150 + (i % 2) * 60 + 100} y2={chao + 54} stroke={linhaPiso} strokeWidth={5} strokeLinecap="round" />)}
    {rodape && <rect x={-610} y={chao - 30} width={largura + 1220} height={30} fill={rodape} stroke={LINHA} strokeWidth={6} />}
    <line x1={-600} y1={chao} x2={largura + 600} y2={chao} stroke={LINHA} strokeWidth={9} />
  </g>
);
const Janela: React.FC<{ x: number; y: number; w?: number; h?: number; noite?: boolean }> = ({ x, y, w = 300, h = 260, noite }) => (
  <g>
    <Cx x={x} y={y} w={w} h={h} cor={noite ? "#1E2A5A" : "#BFE6FF"} />
    {!noite && <path d={`M ${x} ${y + h * 0.78} Q ${x + w * 0.3} ${y + h * 0.62} ${x + w * 0.55} ${y + h * 0.76} Q ${x + w * 0.8} ${y + h * 0.66} ${x + w} ${y + h * 0.78} L ${x + w} ${y + h} L ${x} ${y + h} Z`} fill="#9BD47A" stroke={LINHA} strokeWidth={5} />}
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={LINHA} strokeWidth={6} />
    <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={LINHA} strokeWidth={6} />
  </g>
);
export const Cadeira: React.FC<{ x: number; assento: number; chao: number; esq?: boolean; cor?: string }> = ({ x, assento, chao, esq, cor = "#E23B2E" }) => {
  const s = esq ? -1 : 1;
  return (
    <g transform={`translate(${x} 0) scale(${s} 1)`}>
      <rect x={-74} y={assento + 4} width={124} height={18} rx={6} fill={cor} stroke={LINHA} strokeWidth={6} />
      <path d={`M -74 ${assento + 8} L -86 ${assento - 150} L -60 ${assento - 152} L -50 ${assento + 8} Z`} fill={cor} stroke={LINHA} strokeWidth={6} strokeLinejoin="round" />
      <line x1={-62} y1={assento + 22} x2={-74} y2={chao} stroke={LINHA} strokeWidth={9} />
      <line x1={40} y1={assento + 22} x2={52} y2={chao} stroke={LINHA} strokeWidth={9} />
    </g>
  );
};

// ---------------------------------------------------------------- garagem do truco
export const GARAGEM = { chao: 930, mesa: { x0: 780, x1: 1140, topo: 712 }, assento: 770, xTeo: 650, xDudu: 1270 };
export const Garagem: React.FC = () => {
  const { chao } = GARAGEM;
  return (
    <g>
      <Fundo cor="#CFCBC2" chao={chao} piso="#9A968C" rodape="" linhaPiso="#86827A" />
      {Array.from({ length: 16 }, (_, j) => Array.from({ length: 30 }, (_, i) => <rect key={`${i}-${j}`} x={-560 + i * 120 + (j % 2) * 60} y={-120 + j * 60} width={116} height={56} fill="none" stroke="#BDB8AE" strokeWidth={3} />))}
      {/* porta de enrolar aberta, rua lá fora */}
      <rect x={1460} y={180} width={560} height={chao - 180} fill="#BFE6FF" stroke={LINHA} strokeWidth={W} />
      <rect x={1460} y={chao - 120} width={560} height={120} fill="#B9B2A4" />
      <rect x={1460} y={150} width={560} height={70} fill="#9AA0A8" stroke={LINHA} strokeWidth={W} />
      {[0, 1, 2].map((i) => <line key={i} x1={1460} y1={168 + i * 18} x2={2020} y2={168 + i * 18} stroke="#7F8590" strokeWidth={4} />)}
      {/* prateleira com latas e ferramentas, bicicleta pendurada */}
      <rect x={120} y={360} width={420} height={18} fill="#B4733F" stroke={LINHA} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => <Cx key={i} x={140 + i * 100} y={290} w={70} h={70} cor={["#E23B2E", "#3B6FD6", "#F2C94C", "#3FAF63"][i]} rx={10} sw={5} />)}
      <circle cx={260} cy={560} r={70} fill="none" stroke={LINHA} strokeWidth={10} />
      <circle cx={460} cy={560} r={70} fill="none" stroke={LINHA} strokeWidth={10} />
      <path d="M 260 560 L 340 470 L 430 470 L 460 560 M 340 470 L 360 560 L 260 560" stroke="#E23B2E" strokeWidth={10} fill="none" strokeLinejoin="round" />
      {/* lâmpada fluorescente */}
      <rect x={760} y={70} width={400} height={26} rx={12} fill="#FBFBF7" stroke={LINHA} strokeWidth={6} />
      <path d="M 760 96 L 640 260 L 1280 260 L 1160 96 Z" fill="#FFF6C8" opacity={0.18} />
    </g>
  );
};
/** mesa do truco (vai na frente dos meninos de trás) */
export const MesaTruco: React.FC<{ pizza?: boolean; pote?: boolean }> = ({ pizza = true, pote = true }) => {
  const { chao, mesa } = GARAGEM;
  return (
    <g>
      <rect x={mesa.x0 + 24} y={mesa.topo + 20} width={18} height={chao - mesa.topo - 20} fill="#9AA0A8" stroke={LINHA} strokeWidth={5} />
      <rect x={mesa.x1 - 42} y={mesa.topo + 20} width={18} height={chao - mesa.topo - 20} fill="#9AA0A8" stroke={LINHA} strokeWidth={5} />
      <Cx x={mesa.x0 - 10} y={mesa.topo} w={mesa.x1 - mesa.x0 + 20} h={24} cor="#3FAF63" rx={6} />
      {pizza && (
        <g transform={`translate(${mesa.x0 + 40} ${mesa.topo})`}>
          <path d="M 0 0 L 10 -22 L 110 -22 L 120 0 Z" fill="#E9D7B5" stroke={LINHA} strokeWidth={5} strokeLinejoin="round" />
          <path d="M 30 -22 L 80 -36 Q 86 -26 82 -22 Z" fill="#F2C94C" stroke={LINHA} strokeWidth={4} />
        </g>
      )}
      {pote && (
        <g transform={`translate(${mesa.x0 + 210} ${mesa.topo})`}>
          <rect x={-30} y={-74} width={60} height={74} rx={10} fill="rgba(220,240,255,0.85)" stroke={LINHA} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={-14 + (i % 3) * 14} cy={-12 - Math.floor(i / 3) * 12} rx={9} ry={5} fill="#F2C94C" stroke={LINHA} strokeWidth={2} />)}
        </g>
      )}
    </g>
  );
};
/** carta sobre a mesa: virada para baixo, ou mostrando um número de pintas (sem texto) */
export const Carta: React.FC<{ x: number; y: number; pintas?: number; naipe?: "paus" | "copas" | "espadas" | "ouros"; rot?: number; esc?: number }> = ({ x, y, pintas, naipe = "paus", rot = 0, esc = 1 }) => {
  const cor = naipe === "copas" || naipe === "ouros" ? "#E23B2E" : LINHA;
  const pos: [number, number][] = pintas ? [[-10, -16], [10, 16], [10, -16], [-10, 16], [0, 0], [-10, 0], [10, 0]].slice(0, pintas) as [number, number][] : [];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${esc})`}>
      <rect x={-26} y={-38} width={52} height={76} rx={6} fill={pintas ? "#FBFBF7" : "#3B6FD6"} stroke={LINHA} strokeWidth={4} />
      {!pintas && <rect x={-18} y={-30} width={36} height={60} rx={4} fill="none" stroke="#FBFBF7" strokeWidth={3} />}
      {pos.map(([a, b], i) => (naipe === "paus" ? <g key={i} fill={cor}><circle cx={a - 3} cy={b} r={3.5} /><circle cx={a + 3} cy={b} r={3.5} /><circle cx={a} cy={b - 4} r={3.5} /></g> : <circle key={i} cx={a} cy={b} r={5} fill={cor} />))}
    </g>
  );
};

// ---------------------------------------------------------------- sala (casa do Dudu, casa do Téo, casa da vó)
export const SALA = { chao: 940, sofa: { x0: 520, x1: 1240, assento: 730 }, porta: 1520 };
export const Sala: React.FC<{ parede?: string; sofa?: string; noite?: boolean; festa?: boolean; tv?: boolean; porta?: number }> = ({ parede = "#F3E3C8", sofa = "#7FB7F0", noite, festa, tv = true, porta = 0 }) => {
  const { chao, sofa: s } = SALA;
  return (
    <g>
      <Fundo cor={parede} chao={chao} piso="#C98450" listra={undefined} linhaPiso="#A86A3A" />
      <Janela x={200} y={200} noite={noite} />
      {tv && (
        <g>
          <rect x={1560} y={760} width={240} height={180} fill="#B4733F" stroke={LINHA} strokeWidth={W} />
          <Cx x={1530} y={520} w={300} h={210} cor="#2A2A35" rx={10} />
          <rect x={1550} y={540} width={260} height={170} fill={noite ? "#5A6AAA" : "#3A4A6A"} />
        </g>
      )}
      {/* porta de entrada */}
      <g transform={`translate(${SALA.porta} 0)`}>
        <rect x={-240} y={chao - 600} width={220} height={600} fill="#3A2A20" stroke={LINHA} strokeWidth={W} />
        <g transform={`translate(-240 0) scale(${1 - 0.85 * porta} 1)`}><rect x={0} y={chao - 600} width={220} height={600} rx={6} fill="#E9A66E" stroke={LINHA} strokeWidth={W} /><circle cx={190} cy={chao - 300} r={12} fill="#FFD95A" stroke={LINHA} strokeWidth={5} /></g>
      </g>
      {/* sofá */}
      <Cx x={s.x0 - 40} y={s.assento - 190} w={s.x1 - s.x0 + 80} h={200} cor={sofa} rx={30} />
      <Cx x={s.x0 - 70} y={s.assento - 70} w={80} h={chao - s.assento + 50} cor={sofa} rx={24} />
      <Cx x={s.x1 - 10} y={s.assento - 70} w={80} h={chao - s.assento + 50} cor={sofa} rx={24} />
      <Cx x={s.x0} y={s.assento} w={s.x1 - s.x0} h={chao - s.assento - 30} cor={sofa} rx={14} />
      {festa && (
        <g>
          <path d="M -200 120 Q 960 260 2100 120" stroke={LINHA} strokeWidth={4} fill="none" />
          {Array.from({ length: 18 }, (_, i) => { const x = -160 + i * 130; const y = 120 + 140 * Math.sin((Math.PI * (x + 200)) / 2300) * 0.95; return <path key={i} d={`M ${x} ${y} l 30 0 l -15 40 Z`} fill={["#E23B2E", "#FFD23F", "#3FAF63", "#3B6FD6", "#E9707F"][i % 5]} stroke={LINHA} strokeWidth={3} />; })}
          {[[300, 560, "#E23B2E"], [380, 500, "#FFD23F"], [1380, 520, "#3B6FD6"], [1460, 580, "#E9707F"], [1300, 600, "#3FAF63"]].map(([x, y, c], i) => (
            <g key={i}><line x1={x as number} y1={(y as number) + 60} x2={(x as number) + 10} y2={(y as number) + 260} stroke={LINHA} strokeWidth={3} /><ellipse cx={x as number} cy={y as number} rx={44} ry={56} fill={c as string} stroke={LINHA} strokeWidth={6} /></g>
          ))}
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- escrivaninha com o jogo online
export const MESA_PC = { chao: 940, topo: 700, x0: 820, x1: 1500, monitor: { x: 1000, y: 330, w: 460, h: 300 }, cadeira: 700, assento: 760 };
export const Escrivaninha: React.FC<{ tela?: React.ReactNode }> = ({ tela }) => {
  const { chao, topo, x0, x1, monitor: m } = MESA_PC;
  return (
    <g>
      <Fundo cor="#2E3A6A" chao={chao} piso="#4A4A6A" listra="#34407A" linhaPiso="#3A3A5A" />
      <rect x={-600} y={-600} width={3200} height={2200} fill="#1A2048" opacity={0.25} />
      <rect x={x0 + 60} y={m.y + m.h} width={40} height={topo - m.y - m.h} fill="#2A2A35" stroke={LINHA} strokeWidth={5} />
      <Cx x={x0} y={topo} w={x1 - x0} h={26} cor="#B4733F" rx={4} />
      <rect x={x0 + 20} y={topo + 26} width={20} height={chao - topo - 26} fill="#9A5F32" stroke={LINHA} strokeWidth={5} />
      <rect x={x1 - 40} y={topo + 26} width={20} height={chao - topo - 26} fill="#9A5F32" stroke={LINHA} strokeWidth={5} />
      <Cx x={m.x - 14} y={m.y - 14} w={m.w + 28} h={m.h + 28} cor="#2A2A35" rx={14} />
      <svg x={m.x} y={m.y} width={m.w} height={m.h} viewBox={`0 0 ${m.w} ${m.h}`}>
        <rect width={m.w} height={m.h} fill="#141A3A" />
        {tela}
      </svg>
      <rect x={m.x + m.w / 2 - 20} y={m.y + m.h + 14} width={40} height={topo - m.y - m.h - 14} fill="#2A2A35" stroke={LINHA} strokeWidth={5} />
      <rect x={x0 + 120} y={topo - 14} width={220} height={14} rx={4} fill="#3A3A48" stroke={LINHA} strokeWidth={4} />
      <path d={`M ${m.x - 40} ${m.y + m.h + 30} L ${m.x - 120} ${chao} L ${m.x + m.w + 120} ${chao} L ${m.x + m.w + 40} ${m.y + m.h + 30} Z`} fill="#6A8AFF" opacity={0.1} />
    </g>
  );
};
/** oito bonequinhos do jogo (cabecinhas com capacete), um deles é o traidor */
export const TelaJogo: React.FC<{ t: number; fala?: number; vitorias?: number; denuncias?: number }> = ({ t, fala = -1, vitorias = 0, denuncias = 0 }) => (
  <g>
    {Array.from({ length: 8 }, (_, i) => {
      const x = 70 + (i % 4) * 107, y = 92 + Math.floor(i / 4) * 120;
      const cor = ["#E23B2E", "#3B6FD6", "#3FAF63", "#FFD23F", "#9B6FD0", "#F2933A", "#86DDBE", "#E9707F"][i];
      const pula = i === fala ? Math.abs(Math.sin(t * 12)) * 6 : 0;
      return (
        <g key={i} transform={`translate(${x} ${y - pula})`}>
          <circle r={38} fill={cor} stroke="#FBFBF7" strokeWidth={5} />
          <rect x={-22} y={-14} width={44} height={22} rx={10} fill="#BFE6FF" stroke="#FBFBF7" strokeWidth={3} />
          <rect x={-30} y={34} width={60} height={14} rx={6} fill="#FBFBF7" opacity={0.85} />
        </g>
      );
    })}
    {vitorias > 0 && Array.from({ length: Math.min(30, Math.floor(vitorias)) }, (_, i) => <path key={i} transform={`translate(${24 + (i % 15) * 28} ${236 + Math.floor(i / 15) * 30}) scale(0.5)`} d="M 0 -20 L 6 -6 L 21 -6 L 9 3 L 13 18 L 0 9 L -13 18 L -9 3 L -21 -6 L -6 -6 Z" fill="#FFD23F" />)}
    {denuncias > 0 && Array.from({ length: Math.min(3, Math.floor(denuncias)) }, (_, i) => (
      <g key={i} transform={`translate(${120 + i * 110} 150)`}><rect x={-46} y={-40} width={92} height={80} rx={12} fill="#E23B2E" stroke="#FBFBF7" strokeWidth={5} /><path d="M -14 -22 L -14 24 M -14 -22 L 24 -10 L -14 4" stroke="#FBFBF7" strokeWidth={8} fill="none" /></g>
    ))}
  </g>
);

// ---------------------------------------------------------------- feira
export const FEIRA = { chao: 950, balcao: { x0: 620, x1: 1380, topo: 720 }, marta: 1060, caixaTras: { x: 1240, y: 520 } };
export const FeiraFundo: React.FC = () => {
  const { chao, caixaTras } = FEIRA;
  return (
    <g>
      <rect x={-600} y={-600} width={3200} height={chao + 600} fill="#BFE6FF" />
      {[[-300, "#E23B2E"], [600, "#3B6FD6"], [1500, "#3FAF63"]].map(([x, c], i) => (
        <g key={i}>
          <rect x={(x as number) + 20} y={200} width={20} height={chao - 200} fill="#9AA0A8" stroke={LINHA} strokeWidth={5} />
          <rect x={(x as number) + 740} y={200} width={20} height={chao - 200} fill="#9AA0A8" stroke={LINHA} strokeWidth={5} />
          <path d={`M ${(x as number) - 20} 240 L ${(x as number) + 60} 150 L ${(x as number) + 740} 150 L ${(x as number) + 820} 240 Z`} fill="#FBFBF7" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
          {Array.from({ length: 8 }, (_, j) => <path key={j} d={`M ${(x as number) + 60 + j * 85} 150 L ${(x as number) + 102 + j * 85} 150 L ${(x as number) + 92 + j * 95 - j * 10} 240 L ${(x as number) + 40 + j * 95 - j * 10} 240 Z`} fill={j % 2 ? (c as string) : "#FBFBF7"} />)}
          <path d={`M ${(x as number) - 20} 240 L ${(x as number) + 60} 150 L ${(x as number) + 740} 150 L ${(x as number) + 820} 240 Z`} fill="none" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
        </g>
      ))}
      <rect x={-600} y={chao} width={3200} height={900} fill="#8A8A96" />
      <line x1={-600} y1={chao} x2={2600} y2={chao} stroke={LINHA} strokeWidth={9} />
      {/* caixa de trás (a manga boa), numa prateleira atrás da Dona Marta */}
      <rect x={caixaTras.x - 110} y={caixaTras.y + 70} width={220} height={18} fill="#B4733F" stroke={LINHA} strokeWidth={5} />
      <Caixote x={caixaTras.x} y={caixaTras.y + 70} cor="#F2A65A" />
    </g>
  );
};
export const Caixote: React.FC<{ x: number; y: number; cor?: string; mangas?: number }> = ({ x, y, cor = "#F2C94C", mangas = 5 }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: mangas }, (_, i) => <ellipse key={i} cx={-60 + (i % 4) * 40 + (i >= 4 ? 20 : 0)} cy={-74 - (i >= 4 ? 26 : 0)} rx={24} ry={18} fill={cor} stroke={LINHA} strokeWidth={4} />)}
    <rect x={-90} y={-66} width={180} height={66} fill="#C98450" stroke={LINHA} strokeWidth={6} />
    {[0, 1].map((i) => <line key={i} x1={-90} y1={-44 + i * 24} x2={90} y2={-44 + i * 24} stroke="#9A5F32" strokeWidth={4} />)}
  </g>
);
export const FeiraBalcao: React.FC = () => {
  const { chao, balcao } = FEIRA;
  return (
    <g>
      <Cx x={balcao.x0} y={balcao.topo} w={balcao.x1 - balcao.x0} h={chao - balcao.topo} cor="#C98450" rx={4} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={balcao.x0} y1={balcao.topo + 50 + i * 50} x2={balcao.x1} y2={balcao.topo + 50 + i * 50} stroke="#9A5F32" strokeWidth={5} />)}
      <Caixote x={balcao.x0 + 140} y={balcao.topo} cor="#F2C94C" />
      <Caixote x={balcao.x0 + 380} y={balcao.topo} cor="#9BD47A" mangas={6} />
    </g>
  );
};

// ---------------------------------------------------------------- concessionária de usados
export const LOJA = { chao: 940, carro: { x: 980, y: 940 } };
export const Carro: React.FC<{ x: number; y: number; cor: string; esc?: number; amassado?: boolean; brilho?: number }> = ({ x, y, cor, esc = 1, amassado, brilho = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`}>
    <path d="M -330 -60 L -320 -150 L -180 -160 L -100 -250 L 140 -250 L 240 -160 L 330 -150 L 340 -60 Z" fill={cor} stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
    <path d="M -80 -236 L 130 -236 L 210 -166 L -150 -166 Z" fill="#BFE6FF" stroke={LINHA} strokeWidth={6} strokeLinejoin="round" />
    <line x1={30} y1={-236} x2={30} y2={-166} stroke={LINHA} strokeWidth={6} />
    <line x1={30} y1={-166} x2={20} y2={-70} stroke={LINHA} strokeWidth={5} />
    {amassado && (
      <g>
        <path d="M 120 -120 q 30 18 60 -4 q 22 20 54 4" stroke={LINHA} strokeWidth={4} fill="none" />
        <ellipse cx={180} cy={-108} rx={80} ry={36} fill="#FBFBF7" opacity={0.25 + 0.35 * brilho} />
        <path d="M 130 -130 l 30 -10 M 200 -126 l 24 -6" stroke="#FBFBF7" strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.5 * brilho} />
      </g>
    )}
    {[-210, 210].map((wx, i) => <g key={i}><circle cx={wx} cy={-50} r={56} fill="#2A2A35" stroke={LINHA} strokeWidth={W} /><circle cx={wx} cy={-50} r={22} fill="#9AA0A8" /></g>)}
    <rect x={-345} y={-100} width={30} height={20} rx={6} fill="#FFD23F" stroke={LINHA} strokeWidth={4} />
    <rect x={318} y={-100} width={30} height={20} rx={6} fill="#E23B2E" stroke={LINHA} strokeWidth={4} />
  </g>
);
/** placa de preço sem número: rabisco do valor; `risca` = valor riscado, `novo` = valor novo menor */
export const PlacaPreco: React.FC<{ x: number; y: number; risca?: number; novo?: number }> = ({ x, y, risca = 0, novo = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-6} y={0} width={12} height={180} fill="#9AA0A8" stroke={LINHA} strokeWidth={4} />
    <Cx x={-110} y={-110} w={220} h={120} cor="#FFD23F" rx={10} />
    <path d="M -80 -66 q 20 -26 40 0 t 40 0 t 40 0 t 40 0" stroke={LINHA} strokeWidth={9} fill="none" strokeLinecap="round" />
    {risca > 0 && <line x1={-90} y1={-50} x2={-90 + 180 * risca} y2={-84} stroke="#E23B2E" strokeWidth={10} strokeLinecap="round" />}
    {novo > 0 && <path d="M -60 -26 q 15 -18 30 0 t 30 0 t 30 0" stroke="#E23B2E" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={`${novo * 200} 400`} />}
  </g>
);
export const Loja: React.FC = () => {
  const { chao } = LOJA;
  return (
    <g>
      <rect x={-600} y={-600} width={3200} height={chao + 600} fill="#BFE6FF" />
      <rect x={1300} y={300} width={700} height={chao - 300} fill="#F2E3C8" stroke={LINHA} strokeWidth={W} />
      <rect x={1380} y={420} width={260} height={chao - 420} fill="#BFE6FF" stroke={LINHA} strokeWidth={W} />
      <path d="M -600 140 L 2600 200" stroke={LINHA} strokeWidth={4} />
      {Array.from({ length: 30 }, (_, i) => { const x = -560 + i * 110; const y = 140 + ((x + 600) / 3200) * 60; return <path key={i} d={`M ${x} ${y} l 36 0 l -18 44 Z`} fill={["#E23B2E", "#FFD23F", "#3B6FD6"][i % 3]} stroke={LINHA} strokeWidth={3} />; })}
      <rect x={-600} y={chao} width={3200} height={900} fill="#6E6E78" />
      <line x1={-600} y1={chao} x2={2600} y2={chao} stroke={LINHA} strokeWidth={9} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-400 + i * 700} y={chao + 70} width={220} height={14} fill="#FBFBF7" />)}
      <Carro x={-120} y={chao} cor="#3FAF63" esc={0.8} />
      <Carro x={1700} y={chao} cor="#E9707F" esc={0.8} />
    </g>
  );
};

// ---------------------------------------------------------------- delegacia (sala de entrevista)
export const DELEG = { chao: 940, mesa: { x0: 720, x1: 1220, topo: 716 }, assento: 772, xTeo: 600, xRose: 430, xSuspeito: 1340, xDelegado: 980 };
export const Delegacia: React.FC<{ flash?: boolean }> = () => {
  const { chao } = DELEG;
  return (
    <g>
      <Fundo cor="#B9C7B5" chao={chao} piso="#7F8A7A" listra="#AFBDAB" linhaPiso="#6E786A" />
      <Cx x={1260} y={200} w={520} h={340} cor="#2A3040" rx={6} />
      <path d="M 1300 230 L 1420 230 L 1300 380 Z" fill="#FBFBF7" opacity={0.12} />
      <line x1={960} y1={-200} x2={960} y2={210} stroke={LINHA} strokeWidth={6} />
      <path d="M 880 210 L 1040 210 L 1000 260 L 920 260 Z" fill="#3A3A48" stroke={LINHA} strokeWidth={6} />
      <path d="M 920 260 L 1000 260 L 1180 716 L 740 716 Z" fill="#FFF6C8" opacity={0.16} />
      <Cx x={160} y={240} w={300} h={200} cor="#E8E4DA" />
      {[0, 1, 2].map((i) => <line key={i} x1={190} y1={290 + i * 44} x2={430 - i * 40} y2={290 + i * 44} stroke="#9AA0A8" strokeWidth={8} />)}
    </g>
  );
};
export const MesaSimples: React.FC<{ x0: number; x1: number; topo: number; chao: number; cor?: string }> = ({ x0, x1, topo, chao, cor = "#9AA0A8" }) => (
  <g>
    <rect x={x0 + 20} y={topo + 22} width={18} height={chao - topo - 22} fill={cor} stroke={LINHA} strokeWidth={5} />
    <rect x={x1 - 38} y={topo + 22} width={18} height={chao - topo - 22} fill={cor} stroke={LINHA} strokeWidth={5} />
    <Cx x={x0 - 10} y={topo} w={x1 - x0 + 20} h={24} cor={cor} rx={4} />
  </g>
);

// ---------------------------------------------------------------- galpão da Dutra
export const GALPAO = { chao: 950, carro: 980 };
export const Galpao: React.FC<{ lona?: number }> = ({ lona = 0 }) => {
  const { chao, carro } = GALPAO;
  return (
    <g>
      <rect x={-600} y={-600} width={3200} height={chao + 600} fill="#8A96A6" />
      {Array.from({ length: 50 }, (_, i) => <line key={i} x1={-600 + i * 64} y1={-600} x2={-600 + i * 64} y2={chao} stroke="#7A8696" strokeWidth={10} />)}
      <rect x={1460} y={260} width={480} height={chao - 260} fill="#1E2430" stroke={LINHA} strokeWidth={W} />
      <rect x={1460} y={220} width={480} height={60} fill="#6E7A8A" stroke={LINHA} strokeWidth={W} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${200 + i * 520} -200 L ${200 + i * 520} 120 M ${140 + i * 520} 120 L ${260 + i * 520} 120 L ${230 + i * 520} 150 L ${170 + i * 520} 150 Z`} stroke={LINHA} strokeWidth={6} fill="#F2C94C" />)}
      <rect x={-600} y={chao} width={3200} height={900} fill="#6E6A60" />
      <line x1={-600} y1={chao} x2={2600} y2={chao} stroke={LINHA} strokeWidth={9} />
      <Carro x={carro} y={chao} cor="#3B6FD6" />
      {lona < 1 && (
        <g transform={`translate(${lona * 900} ${lona * lona * 200}) rotate(${lona * 20} ${carro} ${chao})`}>
          <path d={`M ${carro - 380} ${chao} Q ${carro - 360} ${chao - 190} ${carro - 140} ${chao - 270} Q ${carro + 40} ${chao - 300} ${carro + 200} ${chao - 250} Q ${carro + 360} ${chao - 180} ${carro + 380} ${chao} Z`} fill="#6A7A4A" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
          {[0, 1, 2].map((i) => <path key={i} d={`M ${carro - 260 + i * 220} ${chao - 220 + (i % 2) * 30} q 30 60 10 200`} stroke="#4A5A34" strokeWidth={6} fill="none" />)}
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- sala de reunião do clube
export const CLUBE = { chao: 940, mesa: { x0: 480, x1: 1480, topo: 716 }, assento: 772 };
export const Clube: React.FC = () => {
  const { chao } = CLUBE;
  return (
    <g>
      <Fundo cor="#2E3E6E" chao={chao} piso="#5A4A6A" listra="#34467A" linhaPiso="#4A3A5A" />
      <g transform="translate(960 300)">
        <path d="M -120 -150 L 120 -150 L 120 20 Q 120 120 0 170 Q -120 120 -120 20 Z" fill="#FBFBF7" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
        <path d="M -120 -60 L 120 -60 L 120 0 L -120 0 Z" fill="#E23B2E" />
        <path d="M 0 -10 L 14 30 L 56 30 L 22 54 L 36 94 L 0 70 L -36 94 L -22 54 L -56 30 L -14 30 Z" fill="#FFD23F" stroke={LINHA} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -120 -150 L 120 -150 L 120 20 Q 120 120 0 170 Q -120 120 -120 20 Z" fill="none" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
      </g>
      <Janela x={1400} y={170} w={380} h={300} />
      <rect x={1400} y={350} width={380} height={120} fill="#3FAF63" />
      <path d="M 1590 350 L 1590 470 M 1400 410 L 1780 410" stroke="#FBFBF7" strokeWidth={5} />
      <Cx x={1400} y={170} w={380} h={300} cor="none" />
      <rect x={140} y={340} width={340} height={18} fill="#B4733F" stroke={LINHA} strokeWidth={5} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${180 + i * 110} 340 L ${170 + i * 110} 290 Q ${200 + i * 110} 260 ${230 + i * 110} 290 L ${220 + i * 110} 340 Z`} fill="#F2C94C" stroke={LINHA} strokeWidth={5} />)}
    </g>
  );
};

// ---------------------------------------------------------------- estúdio de TV (truco ao vivo)
export const ESTUDIO = { chao: 940, mesa: { x0: 780, x1: 1140, topo: 712 }, assento: 770, xTeo: 650, xCampeao: 1270 };
export const Estudio: React.FC<{ t: number }> = ({ t }) => {
  const { chao } = ESTUDIO;
  return (
    <g>
      <rect x={-600} y={-600} width={3200} height={2200} fill="#1A1430" />
      {[[300, "#E9707F"], [960, "#FFD23F"], [1620, "#86DDBE"]].map(([x, c], i) => (
        <path key={i} d={`M ${(x as number) - 40} -100 L ${(x as number) + 40} -100 L ${(x as number) + 260 + Math.sin(t + i) * 40} ${chao} L ${(x as number) - 260 + Math.sin(t + i) * 40} ${chao} Z`} fill={c as string} opacity={0.13} />
      ))}
      {/* plateia: fileiras de cabeças */}
      {[0, 1, 2].map((j) => Array.from({ length: 22 }, (_, i) => <circle key={`${j}-${i}`} cx={-200 + i * 110 + (j % 2) * 55} cy={420 + j * 70 + Math.sin(t * 6 + i + j) * 2} r={34} fill={["#3A3060", "#4A4070", "#2E2650"][j]} />))}
      <rect x={-600} y={600} width={3200} height={40} fill="#3A3060" />
      <rect x={-600} y={chao} width={3200} height={900} fill="#2E2650" />
      <line x1={-600} y1={chao} x2={2600} y2={chao} stroke={LINHA} strokeWidth={9} />
      <ellipse cx={960} cy={chao + 4} rx={620} ry={40} fill="#FFD23F" opacity={0.18} />
      {/* câmera de estúdio */}
      <g transform={`translate(1760 ${chao})`}>
        <path d="M -60 0 L 0 -200 L 60 0" stroke={LINHA} strokeWidth={8} fill="none" />
        <Cx x={-90} y={-300} w={170} h={100} cor="#3A3A48" />
        <circle cx={-110} cy={-250} r={34} fill="#2A2A35" stroke={LINHA} strokeWidth={6} />
        <circle cx={40} cy={-280} r={8} fill={Math.floor(t * 2) % 2 ? "#E23B2E" : "#7A1A14"} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- sala branca dos cientistas
export const BRANCA = { chao: 950, mesa: { x0: 760, x1: 1160, topo: 716 }, assento: 772 };
export const SalaBranca: React.FC<{ certos?: number }> = ({ certos = 0 }) => {
  const { chao } = BRANCA;
  return (
    <g>
      <Fundo cor="#F4F6F8" chao={chao} piso="#E4E8EC" rodape="#FBFBF7" linhaPiso="#D0D6DC" />
      {Array.from({ length: 200 }, (_, i) => {
        const x = 150 + (i % 20) * 82, y = 70 + Math.floor(i / 20) * 50;
        const ok = i < certos;
        return (
          <g key={i}>
            <rect x={x} y={y} width={72} height={42} rx={4} fill={ok ? "#DDF5E6" : "#3A4A6A"} stroke={LINHA} strokeWidth={3} />
            {ok ? <path d={`M ${x + 22} ${y + 22} l 10 10 l 18 -18`} stroke="#3FAF63" strokeWidth={6} fill="none" strokeLinecap="round" /> : <circle cx={x + 36} cy={y + 20} r={9} fill="#C9895E" />}
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- quarto do Dudu
export const QDUDU = { chao: 940, cama: { x0: 1100, x1: 1760, topo: 740 }, cadeira: 640, assento: 772 };
export const QuartoDudu: React.FC<{ noite?: boolean }> = ({ noite }) => {
  const { chao, cama } = QDUDU;
  return (
    <g>
      <Fundo cor="#CFE8D8" chao={chao} piso="#C98450" listra="#C2E0CE" linhaPiso="#A86A3A" />
      <Janela x={300} y={190} noite={noite} />
      {/* pôsteres sem texto: bola, guitarra, foguete */}
      <Cx x={760} y={170} w={200} h={260} cor="#3B6FD6" />
      <circle cx={860} cy={290} r={60} fill="#FBFBF7" stroke={LINHA} strokeWidth={6} />
      <Cx x={1010} y={200} w={200} h={240} cor="#FFD23F" />
      <path d="M 1110 230 L 1150 330 L 1110 410 L 1070 330 Z" fill="#E23B2E" stroke={LINHA} strokeWidth={6} strokeLinejoin="round" />
      {/* cama */}
      <rect x={cama.x1 - 20} y={cama.topo - 160} width={40} height={chao - cama.topo + 160} rx={10} fill="#B4733F" stroke={LINHA} strokeWidth={W} />
      <Cx x={cama.x0} y={cama.topo + 40} w={cama.x1 - cama.x0} h={44} cor="#C98450" />
      <Cx x={cama.x0} y={cama.topo} w={cama.x1 - cama.x0} h={48} cor="#FBFBF7" rx={10} />
      <path d={`M ${cama.x0 + 20} ${cama.topo - 10} Q ${cama.x0 + 200} ${cama.topo - 30} ${cama.x1 - 160} ${cama.topo - 8} L ${cama.x1 - 160} ${cama.topo + 70} L ${cama.x0 + 20} ${cama.topo + 70} Z`} fill="#E23B2E" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
      <rect x={cama.x0 + 10} y={cama.topo + 84} width={18} height={chao - cama.topo - 84} fill="#9A5F32" stroke={LINHA} strokeWidth={5} />
    </g>
  );
};

// ---------------------------------------------------------------- laje do Tio Beto, Réveillon
export const LAJE = { chao: 960, topo: 520, x0: 360, x1: 1480, espessura: 30, escada: { baixo: [1800, 960] as [number, number], cima: [1500, 520] as [number, number] }, portao: 170, caixa: 1290, beirada: 420 };
export const LajeFundo: React.FC<{ t: number; fogos?: number }> = ({ t, fogos = -1 }) => {
  const { chao, topo, x0, x1 } = LAJE;
  return (
    <g>
      <rect x={-800} y={-800} width={3600} height={chao + 800} fill="#141C46" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 397) % 2800 - 400} cy={(i * 131) % 380 - 60} r={2 + (i % 3)} fill="#F4F1D0" />)}
      {fogos >= 0 && <Fogos t={fogos} />}
      {/* casas vizinhas */}
      {[[-500, "#5A4A7A"], [1820, "#4A5A8A"], [2240, "#6A4A6A"]].map(([x, c], i) => (
        <g key={i}><rect x={x as number} y={chao - 360} width={380} height={360} fill={c as string} stroke={LINHA} strokeWidth={W} /><rect x={(x as number) + 60} y={chao - 280} width={80} height={80} fill="#FFD95A" stroke={LINHA} strokeWidth={5} /></g>
      ))}
      {/* casa do Tio Beto: térreo + laje */}
      <rect x={x0} y={topo + 28} width={x1 - x0} height={chao - topo - 28} fill="#E9C9A0" stroke={LINHA} strokeWidth={W} />
      <rect x={x0 + 140} y={chao - 280} width={160} height={280} fill="#8A5A3A" stroke={LINHA} strokeWidth={W} />
      {[0, 1].map((i) => <Cx key={i} x={x0 + 420 + i * 340} y={chao - 300} w={200} h={150} cor="#FFD95A" />)}
      {/* varal de lampadinhas sobre a laje */}
      <line x1={x0 + 20} y1={topo - 300} x2={x0 + 20} y2={topo} stroke={LINHA} strokeWidth={6} />
      <line x1={x1 - 20} y1={topo - 300} x2={x1 - 20} y2={topo} stroke={LINHA} strokeWidth={6} />
      <path d={`M ${x0 + 20} ${topo - 290} Q ${(x0 + x1) / 2} ${topo - 200} ${x1 - 20} ${topo - 290}`} stroke={LINHA} strokeWidth={3} fill="none" />
      {Array.from({ length: 16 }, (_, i) => { const k = (i + 0.5) / 16; const x = x0 + 20 + k * (x1 - x0 - 40); const y = topo - 290 + 4 * 90 * k * (1 - k); return <circle key={i} cx={x} cy={y + 8} r={9} fill={["#FFD23F", "#E9707F", "#86DDBE", "#7FB7F0"][(i + Math.floor(t * 3)) % 4]} stroke={LINHA} strokeWidth={3} />; })}
      {/* chão do quintal */}
      <rect x={-800} y={chao} width={3600} height={900} fill="#5A5A4A" />
      <line x1={-800} y1={chao} x2={2800} y2={chao} stroke={LINHA} strokeWidth={9} />
    </g>
  );
};
/** frente da laje (a placa de concreto), a escada de ferro, o portão; rachaduras por cima */
export const LajeFrente: React.FC<{ racha?: number; rachaLonga?: number; xRacha?: number; t: number }> = ({ racha = 0, rachaLonga = 0, xRacha = 900 }) => {
  const { chao, topo, x0, x1, espessura, escada, portao } = LAJE;
  const [bx, by] = escada.baixo, [cx, cy] = escada.cima;
  return (
    <g>
      <rect x={x0 - 20} y={topo} width={x1 - x0 + 40} height={espessura} fill="#B9B9C2" stroke={LINHA} strokeWidth={W} />
      {racha > 0 && <path d={`M ${xRacha} ${topo} l -8 ${12 * racha} l 12 ${8 * racha} l -6 ${10 * racha}`} stroke={LINHA} strokeWidth={5} fill="none" strokeLinejoin="round" />}
      {rachaLonga > 0 && <path d={`M ${x0} ${topo + 12} ${Array.from({ length: 24 }, (_, i) => `L ${x0 + ((x1 - x0) * (i + 1) * rachaLonga) / 24} ${topo + 8 + ((i * 37) % 17)}`).join(" ")}`} stroke={LINHA} strokeWidth={6} fill="none" strokeLinejoin="round" />}
      {/* escada de ferro */}
      <line x1={bx} y1={by} x2={cx} y2={cy} stroke="#3A3A48" strokeWidth={14} />
      <line x1={bx + 50} y1={by} x2={cx + 50} y2={cy} stroke="#3A3A48" strokeWidth={14} />
      {Array.from({ length: 11 }, (_, i) => { const k = (i + 0.5) / 11; return <line key={i} x1={bx + (cx - bx) * k} y1={by + (cy - by) * k} x2={bx + 50 + (cx - bx) * k} y2={by + (cy - by) * k} stroke="#3A3A48" strokeWidth={10} />; })}
      <line x1={bx + 50} y1={by - 120} x2={cx + 50} y2={cy - 120} stroke="#3A3A48" strokeWidth={8} />
      {/* portão de grade */}
      <g>
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={portao - 120 + i * 40} y1={chao - 300} x2={portao - 120 + i * 40} y2={chao} stroke="#3A3A48" strokeWidth={8} />)}
        <line x1={portao - 130} y1={chao - 300} x2={portao + 130} y2={chao - 300} stroke="#3A3A48" strokeWidth={10} />
        <line x1={portao - 130} y1={chao - 150} x2={portao + 130} y2={chao - 150} stroke="#3A3A48" strokeWidth={8} />
      </g>
    </g>
  );
};
/** caixa de som em cima da laje (pulsa com a música) */
export const CaixaSom: React.FC<{ x: number; y: number; ligada: boolean; t: number }> = ({ x, y, ligada, t }) => {
  const p = ligada ? 1 + 0.06 * Math.abs(Math.sin(t * Math.PI * 4)) : 1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <Cx x={-60} y={-200} w={120} h={200} cor="#2A2A35" rx={10} />
      <circle cx={0} cy={-140} r={34 * p} fill="#3A3A48" stroke={LINHA} strokeWidth={5} />
      <circle cx={0} cy={-60} r={40 * p} fill="#3A3A48" stroke={LINHA} strokeWidth={5} />
      <circle cx={40} cy={-188} r={7} fill={ligada ? "#3FAF63" : "#5A2A2A"} />
      {ligada && [0, 1, 2].map((i) => <path key={i} d={`M ${70 + i * 20} -150 q 14 30 0 60`} stroke="#86DDBE" strokeWidth={5} fill="none" opacity={0.4 + 0.4 * Math.abs(Math.sin(t * 8 + i))} />)}
    </g>
  );
};
/** fogos de artifício: estouros em sequência (t = segundos desde a meia-noite) */
export const Fogos: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {[0, 0.55, 1.1, 1.65, 2.2, 2.75, 3.3].map((t0, i) => {
      const d = t - t0;
      if (d < 0 || d > 1.4) return null;
      const x = [700, 1200, 400, 1500, 950, 600, 1300][i], y = [140, 80, 220, 160, 40, 120, 200][i];
      const cor = ["#FFD23F", "#E9707F", "#86DDBE", "#7FB7F0", "#F2933A", "#FBFBF7", "#9B6FD0"][i];
      const r = 40 + 200 * (1 - Math.exp(-4 * d));
      return (
        <g key={i} opacity={Math.max(0, 1 - d / 1.4)}>
          {Array.from({ length: 14 }, (_, j) => { const a = (j / 14) * Math.PI * 2; return <line key={j} x1={x + Math.cos(a) * r * 0.55} y1={y + Math.sin(a) * r * 0.55 + d * d * 40} x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r + d * d * 60} stroke={cor} strokeWidth={8} strokeLinecap="round" />; })}
        </g>
      );
    })}
  </g>
);

// ---------------------------------------------------------------- celular em tela cheia
export const Celular: React.FC<{ x?: number; y?: number; esc?: number; rot?: number; children: React.ReactNode; fundo?: string }> = ({ x = 960, y = 560, esc = 1, rot = -3, children, fundo = "#FBFBF7" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${esc})`}>
    <rect x={-330 + 16} y={-500 + 16} width={660} height={1000} rx={60} fill={LINHA} />
    <rect x={-330} y={-500} width={660} height={1000} rx={60} fill="#2A2A35" stroke={LINHA} strokeWidth={9} />
    <svg x={-290} y={-440} width={580} height={880} viewBox="0 0 580 880">
      <rect width={580} height={880} fill={fundo} />
      {children}
    </svg>
  </g>
);
/** contador de views */
export const Views: React.FC<{ x: number; y: number; n: number; esc?: number }> = ({ x, y, n, esc = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`}>
    <rect x={8} y={8} width={400} height={84} rx={42} fill={LINHA} />
    <rect width={400} height={84} rx={42} fill="#FBFBF7" stroke={LINHA} strokeWidth={7} />
    <path d="M 30 42 Q 54 14 78 42 Q 54 70 30 42 Z" fill="#FBFBF7" stroke={LINHA} strokeWidth={5} />
    <circle cx={54} cy={42} r={9} fill={LINHA} />
    <text x={230} y={58} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} fill={LINHA}>{Math.floor(n).toLocaleString("pt-BR")}</text>
  </g>
);
