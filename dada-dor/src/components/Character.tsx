import { Img } from "remotion";
import React from "react";
import { staticFile } from "remotion";
import manifesto from "../assets-manifest.json";
import { COR } from "../theme";
import { ArcMood, Arcs } from "./Arcs";

// Personagens do spec. Se o PNG do Flow existir (assets/personagens/<asset>.png), usa o PNG;
// senão desenha a versão vetorial baseada na folha da Dadá (cabeça de gota invertida, arcos menta,
// macacão com faixa menta, mãos e botas índigo, luz de borda menta à esquerda).
export type Pose = "neutral" | "walking" | "sitting" | "armsUp" | "back" | "holding" | "clipboard" | "kneeling" | "riding" | "bikeBack" | "fallen";
export type AssetPersonagem = "dada" | "dada-adulta" | "mae" | "medica" | "figurante" | "senhor";

type P2 = [number, number];
type Esqueleto = { tronco: number; inclina: number; maoE: P2; maoD: P2; peE: P2; peD: P2; costas?: boolean; deitado?: boolean };

// Coordenadas com origem nos pés (0,0); y negativo para cima. Escala 1 ≈ 380 px de altura.
const POSES: Record<Pose, Esqueleto> = {
  neutral: { tronco: 0, inclina: 0, maoE: [-80, -100], maoD: [80, -100], peE: [-24, -8], peD: [24, -8] },
  walking: { tronco: 0, inclina: 4, maoE: [-96, -116], maoD: [92, -104], peE: [-46, -8], peD: [40, -16] },
  sitting: { tronco: 58, inclina: 0, maoE: [-64, -40], maoD: [64, -40], peE: [-34, -8], peD: [96, -10] },
  armsUp: { tronco: 0, inclina: 0, maoE: [-150, -300], maoD: [150, -300], peE: [-24, -8], peD: [24, -8] },
  back: { tronco: 0, inclina: 0, maoE: [-80, -100], maoD: [80, -100], peE: [-24, -8], peD: [24, -8], costas: true },
  holding: { tronco: 0, inclina: 6, maoE: [-80, -100], maoD: [120, -140], peE: [-24, -8], peD: [24, -8] },
  clipboard: { tronco: 0, inclina: 0, maoE: [-34, -132], maoD: [36, -128], peE: [-24, -8], peD: [24, -8] },
  kneeling: { tronco: 50, inclina: 8, maoE: [-80, -64], maoD: [124, -116], peE: [-56, -8], peD: [40, -8] },
  riding: { tronco: 30, inclina: 10, maoE: [70, -138], maoD: [84, -132], peE: [-10, -20], peD: [34, -40] },
  bikeBack: { tronco: 40, inclina: 0, maoE: [-70, -150], maoD: [70, -150], peE: [-30, -40], peD: [30, -40], costas: true },
  fallen: { tronco: 70, inclina: -14, maoE: [-90, -30], maoD: [70, -44], peE: [-110, -6], peD: [90, -14] },
};

type Visual = { roupa: string; listra: string | null; extremidade: string; alturaExtra: number; jaleco?: boolean; unica?: string };
const VISUAL: Record<AssetPersonagem, Visual> = {
  dada: { roupa: COR.coral, listra: COR.menta, extremidade: COR.indigo, alturaExtra: 0 },
  "dada-adulta": { roupa: COR.coral, listra: COR.menta, extremidade: COR.indigo, alturaExtra: 60 },
  mae: { roupa: COR.amarelo, listra: COR.menta, extremidade: COR.indigo, alturaExtra: 50 },
  medica: { roupa: "#F4F1FA", listra: null, extremidade: COR.indigo, alturaExtra: 40, jaleco: true },
  figurante: { roupa: "#2E2560", listra: null, extremidade: "#2E2560", alturaExtra: 20, unica: "#2E2560" },
  senhor: { roupa: "#3A3170", listra: COR.menta, extremidade: COR.indigo, alturaExtra: 40 },
};

const CABECA = "M 0 -100 C 22 -100 90 -30 90 30 C 90 75 52 100 0 100 C -52 100 -90 75 -90 30 C -90 -30 -22 -100 0 -100 Z";
const BORDA = "M -8 -97 C -40 -68 -90 -20 -90 30 C -90 60 -76 82 -54 94";

type Props = {
  asset: AssetPersonagem;
  pose: Pose;
  x: number;
  y: number; // y dos pés
  scale: number;
  arcs: ArcMood;
  arcsDe?: ArcMood;
  arcsTrocaEm?: number;
  espelhar?: boolean;
};

export const Character: React.FC<Props> = ({ asset, pose, x, y, scale, arcs, arcsDe, arcsTrocaEm, espelhar }) => {
  // PNG do Flow por personagem (nomes do prompt). A Dadá criança não tem PNG próprio: a folha é só referência.
  const nomePng: Partial<Record<AssetPersonagem, string>> = {
    mae: "mae-bracos-cruzados",
    medica: "medica-prancheta",
    figurante: "figurante",
    ...(pose === "bikeBack" ? { "dada-adulta": "dada-adulta-bike" } : {}),
  };
  const png = nomePng[asset] && (manifesto as string[]).includes(nomePng[asset]!) ? nomePng[asset] : undefined;
  if (png) {
    return <Img src={staticFile(`assets/${png}.png`)} style={{ position: "absolute", left: x - 200 * scale, top: y - 400 * scale, width: 400 * scale, transform: espelhar ? "scaleX(-1)" : undefined }} />;
  }
  const v = VISUAL[asset];
  const e = POSES[pose];
  const extra = v.alturaExtra;
  const quadril = -78 - extra * 0.45 + e.tronco;
  const ombro = -170 - extra + e.tronco;
  const cabecaY = ombro - 92;
  const semArcos = asset === "figurante" || e.costas;
  const mood: ArcMood = semArcos ? "none" : arcs;
  const fill = (c: string) => v.unica ?? c;
  const pernas = (pe: P2, lado: number) => `M ${lado * 22} ${quadril} Q ${lado * 26 + (pe[0] - lado * 22) * 0.3} ${(quadril + pe[1]) / 2} ${pe[0]} ${pe[1] - 8}`;
  const braco = (mao: P2, lado: number) => `M ${lado * 40} ${ombro + 14} Q ${lado * 78} ${ombro + 10} ${mao[0]} ${mao[1]}`;

  return (
    <svg
      width={600 * scale}
      height={720 * scale}
      viewBox="-300 -620 600 720"
      style={{ position: "absolute", left: x - 300 * scale, top: y - 620 * scale, overflow: "visible", transform: espelhar ? "scaleX(-1)" : undefined, opacity: asset === "figurante" ? 0.25 : 1 }}
    >
      <g transform={`rotate(${e.inclina} 0 ${quadril})`}>
        {/* pernas e botas */}
        {[[e.peE, -1], [e.peD, 1]].map(([pe, lado], i) => (
          <g key={i}>
            <path d={pernas(pe as P2, lado as number)} stroke={fill(v.jaleco ? COR.indigo : v.roupa)} strokeWidth={36} strokeLinecap="round" fill="none" />
            <ellipse cx={(pe as P2)[0]} cy={(pe as P2)[1] - 2} rx={26} ry={14} fill={fill(v.extremidade)} />
          </g>
        ))}
        {/* tronco */}
        <path
          d={`M ${-46} ${ombro} Q 0 ${ombro - 12} 46 ${ombro} L ${v.jaleco ? 62 : 52} ${quadril + (v.jaleco ? 40 : 6)} Q 0 ${quadril + (v.jaleco ? 52 : 18)} ${v.jaleco ? -62 : -52} ${quadril + (v.jaleco ? 40 : 6)} Z`}
          fill={fill(v.roupa)}
        />
        {v.jaleco && <line x1={0} y1={ombro + 4} x2={0} y2={quadril + 48} stroke={COR.indigo} strokeWidth={6} />}
        {v.listra && !e.costas && (
<path d={e.tronco === 0 ? `M -40 ${ombro + 8} L -47 ${quadril + 4} L ${e.peE[0] + 8} ${e.peE[1] - 24}` : `M -40 ${ombro + 8} L -47 ${quadril + 4}`} stroke={v.listra} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* braços e luvas */}
        {[[e.maoE, -1], [e.maoD, 1]].map(([mao, lado], i) => (
          <g key={i}>
            <path d={braco(mao as P2, lado as number)} stroke={fill(v.jaleco ? "#F4F1FA" : v.roupa)} strokeWidth={30} strokeLinecap="round" fill="none" />
            <circle cx={(mao as P2)[0]} cy={(mao as P2)[1]} r={18} fill={fill(v.extremidade)} />
          </g>
        ))}
        {pose === "bikeBack" && (
          <g>
            <ellipse cx={0} cy={-6} rx={16} ry={70} fill={COR.indigo} stroke={COR.menta} strokeWidth={6} />
            <line x1={-90} y1={-150} x2={90} y2={-150} stroke={COR.menta} strokeWidth={10} strokeLinecap="round" />
          </g>
        )}
        {pose === "clipboard" && <rect x={-58} y={ombro + 36} width={92} height={118} rx={8} fill={COR.menta} opacity={0.9} transform={`rotate(-8 0 ${ombro + 90})`} />}
        {/* cabeça de gota invertida */}
        <g transform={`translate(0 ${cabecaY})`}>
          <path d={CABECA} fill={fill(COR.indigo)} />
          {!v.unica && <path d={BORDA} stroke={COR.menta} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />}
          <g transform="translate(0 26)">
            <Arcs mood={mood} de={semArcos ? undefined : arcsDe} trocaEm={arcsTrocaEm} />
          </g>
        </g>
      </g>
    </svg>
  );
};
