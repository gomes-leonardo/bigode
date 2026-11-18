import React from "react";
import type { Extras } from "../components/Puppet";
import { COR } from "../theme";

// Elenco do roteiro v2: variante de cor do rig (assets/rig/<variante>), escala relativa e acessórios
// desenhados em px da parte (cabeça 222x287, rosto em 127,165; tronco 177x245; mão no fim do antebraço).
export type NomeElenco = "gotinha" | "lucia" | "zefa" | "tiao" | "caco" | "helena" | "mae_tiao" | "vizinho" | "turma1" | "turma2" | "turma3" | "turma4";
type Membro = { variante: string; escala: number; semArcos?: boolean; extras?: Extras };

const Bone: React.FC = () => (
  <g>
    <path d="M 38 104 Q 44 14 104 2 Q 172 18 186 104 Q 112 84 38 104 Z" fill="#2E2A5C" />
    <path d="M 56 70 Q 110 40 168 70" stroke={COR.menta} strokeWidth={6} fill="none" opacity={0.8} />
    <path d="M 176 96 Q 236 88 250 106 Q 214 116 172 108 Z" fill="#2E2A5C" />
  </g>
);
const Oculos: React.FC = () => (
  <g stroke="#F4F1FA" strokeWidth={6} fill="rgba(255,255,255,0.08)">
    <rect x={56} y={142} width={58} height={44} rx={16} />
    <rect x={138} y={142} width={58} height={44} rx={16} />
    <path d="M 114 160 Q 126 152 138 160" fill="none" />
  </g>
);
const Coque: React.FC = () => (
  <g>
    <circle cx={98} cy={10} r={30} fill="#B9B4C8" />
    <path d="M 70 4 Q 98 -16 126 4" stroke="#8D88A3" strokeWidth={5} fill="none" />
    <path d="M 60 40 Q 98 22 140 40" stroke="#B9B4C8" strokeWidth={12} fill="none" strokeLinecap="round" />
  </g>
);
const Avental: React.FC = () => (
  <g>
    <path d="M 46 52 L 56 104 M 130 50 L 122 104" stroke={COR.rosa} strokeWidth={7} />
    <rect x={30} y={100} width={120} height={140} rx={16} fill={COR.rosa} />
    <rect x={62} y={160} width={56} height={38} rx={8} fill="#D9578A" />
  </g>
);
const Listras: React.FC = () => (
  <g opacity={0.9}>
    <defs>
      <clipPath id="listras-tronco">
        <ellipse cx={88} cy={128} rx={82} ry={112} />
      </clipPath>
    </defs>
    <g clipPath="url(#listras-tronco)">
      {[62, 104, 146, 188, 230].map((y) => (
        <rect key={y} x={-10} y={y} width={200} height={14} fill="#2A8A4A" />
      ))}
    </g>
  </g>
);
const Vestido: React.FC<{ cor: string }> = ({ cor }) => <path d="M 18 166 L 160 166 L 196 292 Q 88 312 -18 292 Z" fill={cor} />;
const Jaleco: React.FC = () => (
  <g>
    <path d="M 60 40 L 88 120 L 118 40" stroke="#C9C4D8" strokeWidth={6} fill="none" />
    <line x1={88} y1={120} x2={88} y2={240} stroke="#C9C4D8" strokeWidth={5} />
    <rect x={108} y={140} width={40} height={36} rx={6} fill="#DAD6E6" />
    <rect x={118} y={128} width={6} height={30} rx={3} fill={COR.menta} />
  </g>
);

export const ELENCO: Record<NomeElenco, Membro> = {
  gotinha: { variante: "gotinha", escala: 1 },
  tiao: { variante: "tiao", escala: 1.02, extras: { tronco: <Listras /> } },
  caco: { variante: "caco", escala: 1.12, extras: { cabeca: <Bone /> } },
  lucia: { variante: "lucia", escala: 1.3, extras: { tronco: <Vestido cor={COR.amarelo} /> } },
  zefa: { variante: "zefa", escala: 1.24, extras: { cabeca: <Coque />, tronco: <Avental /> } },
  helena: { variante: "helena", escala: 1.3, extras: { cabeca: <Oculos />, tronco: <Jaleco /> } },
  mae_tiao: { variante: "mae_tiao", escala: 1.3, extras: { tronco: <Vestido cor="#4FB3BF" /> } },
  vizinho: { variante: "vizinho", escala: 1.3 },
  turma1: { variante: "turma1", escala: 0.98, semArcos: true },
  turma2: { variante: "turma2", escala: 1.0, semArcos: true },
  turma3: { variante: "turma3", escala: 0.96, semArcos: true },
  turma4: { variante: "turma4", escala: 1.02, semArcos: true },
};

// objetos de mão (coordenadas do antebraço: a mão fica perto de 151,81)
export const NaMao = {
  colher: <g transform="translate(150 80) rotate(-70)"><rect x={-6} y={-150} width={12} height={150} rx={6} fill="#B07A4A" /><ellipse cx={0} cy={-160} rx={22} ry={30} fill="#C68A55" /></g>,
  celular: <g transform="translate(160 66) rotate(-10)"><rect x={-22} y={-40} width={44} height={74} rx={8} fill="#141024" stroke={COR.menta} strokeWidth={4} /><circle cx={0} cy={-26} r={5} fill={COR.coral} /></g>,
  pimenta: <g transform="translate(165 70) rotate(-30)"><path d="M -6 -40 Q 18 -10 6 34 Q -2 40 -10 30 Q -12 -10 -6 -40 Z" fill="#E23B2E" /><rect x={-8} y={-52} width={10} height={14} rx={3} fill="#3FAF63" /></g>,
  controle: <g transform="translate(165 70)"><rect x={-40} y={-20} width={80} height={40} rx={18} fill="#2E2A5C" /><circle cx={20} cy={-2} r={6} fill={COR.coral} /><circle cx={-20} cy={-2} r={6} fill={COR.menta} /></g>,
  agulha: <g transform="translate(165 72) rotate(-20)"><rect x={-10} y={-10} width={70} height={20} rx={5} fill="#E8E4F5" /><rect x={-28} y={-4} width={20} height={8} fill="#A9A3D6" /><path d="M 60 -2 L 110 0 L 60 2 Z" fill="#E8E4F5" /></g>,
  pena: <g transform="translate(165 72) rotate(-40)"><path d="M 0 0 Q 40 -50 100 -70 Q 70 -20 0 0 Z" fill="#F4F1FA" /><line x1={0} y1={0} x2={96} y2={-66} stroke="#C9C4D8" strokeWidth={3} /></g>,
  clipe: <g transform="translate(165 72)"><path d="M -10 -20 L 30 -20 Q 40 -20 40 -10 L 40 10 Q 40 20 30 20 L -10 20" stroke="#C9C4D8" strokeWidth={6} fill="none" /></g>,
  panela: <g transform="translate(150 80)"><rect x={10} y={-50} width={150} height={100} rx={18} fill="#A9A3D6" /><rect x={0} y={-62} width={170} height={20} rx={8} fill="#C9C4D8" /><rect x={-40} y={-10} width={60} height={14} rx={7} fill="#2E2A5C" /></g>,
};
