// Quarto do Téo, desenhado em código no traço de tirinha. Mundo com 3920 px de largura:
// 0 a 1920 = cama e janela (plano 1), 2000 a 3920 = tapete com os brinquedos do irmão (plano 3).
// Todas as interações usam as âncoras de Q, nunca coordenadas soltas.
import React from "react";

export const Q = {
  largura: 3920,
  chao: 920,
  colchao: 752, // topo do colchão (assento)
  cabeceira: 420,
  poste: 1240, // face esquerda do poste do pé da cama: a quina
  posteL: 54,
  posteTopo: 690,
};
export const LINHA = "#151515";
const W = 7;

export type Peca = { x: number; cor: string; larg?: number };
export const ALTURA_PECA = 24; // 18 de bloco + 6 dos pinos

const Pecinha: React.FC<{ p: Peca; pulo?: number }> = ({ p, pulo = 0 }) => {
  const l = p.larg ?? 44;
  const y = Q.chao - 18 - pulo;
  return (
    <g>
      <rect x={p.x - l / 2 + 5} y={y - 6} width={12} height={8} rx={2} fill={p.cor} stroke={LINHA} strokeWidth={4} />
      <rect x={p.x + l / 2 - 17} y={y - 6} width={12} height={8} rx={2} fill={p.cor} stroke={LINHA} strokeWidth={4} />
      <rect x={p.x - l / 2} y={y} width={l} height={18} rx={3} fill={p.cor} stroke={LINHA} strokeWidth={5} />
    </g>
  );
};

const Janela: React.FC<{ x: number; y: number; noite?: boolean }> = ({ x, y, noite }) => (
  <g>
    <rect x={x - 26} y={y - 30} width={392} height={420} fill="#F3B6A0" stroke={LINHA} strokeWidth={W} />
    <rect x={x} y={y} width={340} height={340} fill={noite ? "#1E2A5A" : "#BFE6FF"} stroke={LINHA} strokeWidth={W} />
    {noite ? <g><circle cx={x + 250} cy={y + 90} r={40} fill="#F4F1D0" stroke={LINHA} strokeWidth={6} /><circle cx={x + 268} cy={y + 78} r={34} fill="#1E2A5A" /></g> : <circle cx={x + 250} cy={y + 90} r={46} fill="#FFD95A" stroke={LINHA} strokeWidth={6} />}
    <path d={`M ${x} ${y + 270} Q ${x + 90} ${y + 220} ${x + 180} ${y + 262} Q ${x + 260} ${y + 230} ${x + 340} ${y + 266} L ${x + 340} ${y + 340} L ${x} ${y + 340} Z`} fill="#9BD47A" stroke={LINHA} strokeWidth={6} />
    <line x1={x + 170} y1={y} x2={x + 170} y2={y + 340} stroke={LINHA} strokeWidth={W} />
    <line x1={x} y1={y + 170} x2={x + 340} y2={y + 170} stroke={LINHA} strokeWidth={W} />
    <rect x={x - 40} y={y + 340} width={420} height={22} rx={6} fill="#FBFBF7" stroke={LINHA} strokeWidth={W} />
  </g>
);

/** tudo que fica atrás do Téo */
export const QuartoFundo: React.FC<{ pecas: Peca[]; pulos?: number[]; noite?: boolean }> = ({ pecas, pulos = [], noite }) => (
  <g>
    {/* parede e chão */}
    <rect x={0} y={0} width={Q.largura} height={Q.chao} fill="#F6ECDA" />
    {Array.from({ length: 50 }, (_, i) => (
      <line key={i} x1={40 + i * 80} y1={0} x2={40 + i * 80} y2={Q.chao - 40} stroke="#EBDCC2" strokeWidth={14} />
    ))}
    <rect x={0} y={Q.chao} width={Q.largura} height={300} fill="#E3B884" />
    {Array.from({ length: 30 }, (_, i) => (
      <line key={i} x1={i * 150 + (i % 2) * 60} y1={Q.chao + 54} x2={i * 150 + (i % 2) * 60 + 100} y2={Q.chao + 54} stroke="#B98A57" strokeWidth={5} strokeLinecap="round" />
    ))}
    <rect x={-10} y={Q.chao - 30} width={Q.largura + 20} height={30} fill="#FBFBF7" stroke={LINHA} strokeWidth={6} />
    <line x1={0} y1={Q.chao} x2={Q.largura} y2={Q.chao} stroke={LINHA} strokeWidth={9} />

    {/* plano 1: janela com sol de manhã, luz no chão, quadro */}
    <Janela x={1440} y={230} noite={noite} />
    {!noite && <path d={`M 1440 ${Q.chao + 4} L 1780 ${Q.chao + 4} L 1900 1080 L 1380 1080 Z`} fill="#FFE9A8" opacity={0.55} />}
    <rect x={660} y={250} width={190} height={150} rx={6} fill="#FBFBF7" stroke={LINHA} strokeWidth={W} />
    <path d="M 680 380 L 730 300 L 770 350 L 800 320 L 830 380 Z" fill="#7FB7F0" stroke={LINHA} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={810} cy={290} r={16} fill="#FFD95A" stroke={LINHA} strokeWidth={5} />

    {/* cama: cabeceira, travesseiro, colchão, lençol e estrado */}
    <rect x={Q.cabeceira - 60} y={540} width={70} height={Q.chao - 540} rx={14} fill="#B4733F" stroke={LINHA} strokeWidth={W} />
    <circle cx={Q.cabeceira - 25} cy={532} r={26} fill="#C98450" stroke={LINHA} strokeWidth={W} />
    <rect x={Q.cabeceira} y={Q.colchao + 50} width={Q.poste - Q.cabeceira} height={48} fill="#C98450" stroke={LINHA} strokeWidth={W} />
    <rect x={Q.cabeceira} y={Q.colchao} width={Q.poste - Q.cabeceira} height={52} rx={10} fill="#FBFBF7" stroke={LINHA} strokeWidth={W} />
    <path d={`M ${Q.cabeceira + 18} ${Q.colchao - 44} Q ${Q.cabeceira + 90} ${Q.colchao - 66} ${Q.cabeceira + 160} ${Q.colchao - 44} Q ${Q.cabeceira + 172} ${Q.colchao - 6} ${Q.cabeceira + 150} ${Q.colchao + 4} L ${Q.cabeceira + 24} ${Q.colchao + 4} Q ${Q.cabeceira + 6} ${Q.colchao - 14} ${Q.cabeceira + 18} ${Q.colchao - 44} Z`} fill="#FBFBF7" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
    <path d={`M ${Q.cabeceira + 520} ${Q.colchao - 12} Q ${Q.cabeceira + 640} ${Q.colchao - 30} ${Q.poste - 8} ${Q.colchao - 10} L ${Q.poste - 8} ${Q.colchao + 92} Q ${Q.cabeceira + 700} ${Q.colchao + 110} ${Q.cabeceira + 560} ${Q.colchao + 88} Q ${Q.cabeceira + 500} ${Q.colchao + 40} ${Q.cabeceira + 520} ${Q.colchao - 12} Z`} fill="#6F8FEF" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={Q.cabeceira + 600 + i * 70} cy={Q.colchao + 30 + (i % 2) * 22} r={10} fill="#FFD95A" stroke={LINHA} strokeWidth={4} />
    ))}

    {/* plano 3: caixa de brinquedos, estante, porta e tapete */}
    <rect x={2120} y={300} width={300} height={24} rx={6} fill="#C98450" stroke={LINHA} strokeWidth={W} />
    <rect x={2150} y={230} width={56} height={70} rx={8} fill="#F07C6A" stroke={LINHA} strokeWidth={6} />
    <circle cx={2268} cy={262} r={36} fill="#FFD95A" stroke={LINHA} strokeWidth={6} />
    <rect x={2330} y={210} width={60} height={90} rx={6} fill="#7FB7F0" stroke={LINHA} strokeWidth={6} />
    <rect x={3420} y={300} width={300} height={Q.chao - 300} rx={8} fill="#E9A66E" stroke={LINHA} strokeWidth={W} />
    <circle cx={3460} cy={640} r={14} fill="#FFD95A" stroke={LINHA} strokeWidth={5} />
    <rect x={3080} y={700} width={260} height={Q.chao - 700} rx={10} fill="#F07C6A" stroke={LINHA} strokeWidth={W} />
    <rect x={3060} y={680} width={300} height={40} rx={10} fill="#E0604E" stroke={LINHA} strokeWidth={W} />
    <path d={`M 2140 ${Q.chao + 30} L 3020 ${Q.chao + 30} L 3110 ${Q.chao + 120} L 2060 ${Q.chao + 120} Z`} fill="#F2A65A" stroke={LINHA} strokeWidth={6} strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={2140 + i * 240} y1={Q.chao + 60} x2={2220 + i * 240} y2={Q.chao + 60} stroke="#D9853A" strokeWidth={6} strokeLinecap="round" />
    ))}
    {/* carrinho do irmão */}
    <g transform={`translate(2960 ${Q.chao - 54})`}>
      <path d="M 0 30 L 10 6 L 70 0 L 96 30 L 120 34 L 120 50 L 0 50 Z" fill="#E23B2E" stroke={LINHA} strokeWidth={6} strokeLinejoin="round" />
      <rect x={24} y={8} width={30} height={18} fill="#BFE6FF" stroke={LINHA} strokeWidth={4} />
      <circle cx={26} cy={52} r={12} fill={LINHA} />
      <circle cx={96} cy={52} r={12} fill={LINHA} />
    </g>
    {pecas.map((p, i) => (
      <Pecinha key={i} p={p} pulo={pulos[i] ?? 0} />
    ))}
  </g>
);

/** o que fica na frente do Téo: o poste do pé da cama (a quina) */
export const QuartoFrente: React.FC<{ tremor?: number }> = ({ tremor = 0 }) => (
  <g transform={`translate(${tremor} 0)`}>
    <rect x={Q.poste} y={Q.posteTopo} width={Q.posteL} height={Q.chao - Q.posteTopo} rx={6} fill="#B4733F" stroke={LINHA} strokeWidth={W} />
    <circle cx={Q.poste + Q.posteL / 2} cy={Q.posteTopo - 16} r={24} fill="#C98450" stroke={LINHA} strokeWidth={W} />
    <line x1={Q.poste + 14} y1={Q.posteTopo + 30} x2={Q.poste + 14} y2={Q.chao - 30} stroke="#9A5F32" strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** traços de impacto de tirinha em volta de um ponto (ângulos em graus, 0 = direita, -90 = para cima) */
export const Impacto: React.FC<{ x: number; y: number; d: number; angulos: number[]; raio?: number }> = ({ x, y, d, angulos, raio = 30 }) => {
  if (d < 0 || d > 7) return null;
  const k = d / 7;
  return (
    <g>
      {angulos.map((a, i) => {
        const r1 = raio + 40 * k;
        const r2 = r1 + 34 * (1 - k) + 8;
        const ar = (a * Math.PI) / 180;
        return <line key={i} x1={x + Math.cos(ar) * r1} y1={y + Math.sin(ar) * r1} x2={x + Math.cos(ar) * r2} y2={y + Math.sin(ar) * r2} stroke={LINHA} strokeWidth={8 * (1 - k) + 3} strokeLinecap="round" />;
      })}
    </g>
  );
};
