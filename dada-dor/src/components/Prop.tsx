import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import manifesto from "../assets-manifest.json";
import { COR } from "../theme";

// Objetos do spec. PNG do Flow se existir em assets/; senão, desenho vetorial no estilo do spec
// (chapado, sem sombreamento interno, contorno de luz menta numa borda).
export type AssetProp =
  | "bicicleta" | "panela" | "xicara" | "dna" | "raio-x-pe" | "raio-x-pe-torto" | "olho" | "comprimido"
  | "rede-nervosa" | "neuronio" | "comporta-aceso" | "comporta-apagado" | "berco" | "seringa" | "prato"
  | "joelho-ralado" | "poeira" | "data-2025" | "gota";

const glow = (c: string, r = 10) => ({ filter: `drop-shadow(0 0 ${r}px ${c})` });

const Desenho: React.FC<{ asset: AssetProp; f: number }> = ({ asset, f }) => {
  switch (asset) {
    case "bicicleta":
      return (
        <g stroke={COR.menta} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx={-110} cy={60} r={78} strokeWidth={10} stroke="#3B3270" />
          <circle cx={110} cy={60} r={78} strokeWidth={10} stroke="#3B3270" />
          <path d="M -110 60 L -30 -40 L 70 -40 L 110 60 M -30 -40 L 10 60 L 70 -40 M 10 60 L -110 60 M -40 -70 L -18 -70 M 70 -40 L 60 -80 L 90 -84" />
        </g>
      );
    case "panela":
      return (
        <g>
          <rect x={-150} y={70} width={300} height={34} rx={10} fill="#2E2560" />
          <path d="M -120 -40 L 120 -40 L 108 70 L -108 70 Z" fill="#8A84B8" />
          <rect x={-136} y={-56} width={272} height={22} rx={8} fill="#A9A3D6" />
          <path d="M 120 -30 L 190 -40" stroke="#A9A3D6" strokeWidth={16} strokeLinecap="round" />
          {[-60, 0, 60].map((x, i) => (
            <path key={i} d={`M ${x} -80 q 14 -24 0 -48 q -14 -24 0 -48`} stroke={COR.coral} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(f * 0.2 + i)} transform={`translate(0 ${-((f * 1.2 + i * 20) % 30)})`} />
          ))}
          <ellipse cx={0} cy={112} rx={150} ry={10} fill={COR.coral} opacity={0.35 + 0.2 * Math.sin(f * 0.4)} style={glow(COR.coral, 14)} />
        </g>
      );
    case "xicara":
      return (
        <g>
          <path d="M -110 -40 L 110 -40 L 92 100 Q 0 130 -92 100 Z" fill={COR.coral} />
          <path d="M 108 -10 Q 175 -5 160 50 Q 148 85 98 80" stroke={COR.coral} strokeWidth={20} fill="none" />
          <ellipse cx={0} cy={-40} rx={110} ry={20} fill="#C2483F" />
          <path d="M -110 -40 L -92 100" stroke={COR.menta} strokeWidth={5} opacity={0.8} />
          {[-45, 5, 55].map((x, i) => (
            <path key={i} d={`M ${x} -70 q 18 -30 0 -60 q -18 -30 0 -60`} stroke="#E8E4F5" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.25 + 0.35 * (0.5 + 0.5 * Math.sin(f * 0.12 + i * 2))} transform={`translate(0 ${-((f * 0.8 + i * 25) % 40)})`} />
          ))}
        </g>
      );
    case "dna": {
      const pisca = interpolate(f, [30, 40, 60, 70, 90, 100, 150, 170], [0, 1, 0.3, 1, 0.3, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <g>
          {Array.from({ length: 15 }, (_, i) => {
            const y = -280 + i * 40;
            const fase = i * 0.55 + f * 0.04;
            const x = Math.sin(fase) * 110;
            const destaque = i >= 7 && i <= 9;
            const cor = destaque ? COR.coral : COR.menta;
            return (
              <g key={i} opacity={destaque ? 0.35 + 0.65 * pisca : 1} style={destaque ? glow(COR.coral, 12 * pisca) : undefined}>
                <line x1={x} y1={y} x2={-x} y2={y} stroke={cor} strokeWidth={6} opacity={0.6} />
                <circle cx={x} cy={y} r={14} fill={cor} />
                <circle cx={-x} cy={y} r={14} fill={destaque ? cor : "#2FA982"} />
              </g>
            );
          })}
        </g>
      );
    }
    case "raio-x-pe":
    case "raio-x-pe-torto": {
      const torto = asset === "raio-x-pe-torto";
      const brilho = 0.6 + 0.4 * Math.sin(f * 0.15);
      return (
        <g>
          <rect x={-240} y={-260} width={480} height={520} rx={24} fill="#0E1430" stroke="#2A3A6A" strokeWidth={4} />
          <g stroke="#9FC3E8" strokeWidth={26} strokeLinecap="round" fill="none" opacity={0.9}>
            <path d="M -40 -220 L -46 -40" />
            <path d="M 20 -220 L 30 -40" />
            <path d="M -60 -20 Q -10 20 40 -20" strokeWidth={34} />
            {[-90, -45, 0, 45, 90].map((x, i) => (
              <path key={i} d={torto && i === 2 ? `M ${x * 0.6} 30 L ${x - 6} 120 Q ${x + 30} 150 ${x + 14} 210` : `M ${x * 0.6} 30 L ${x} 130 L ${x + 4} 210`} strokeWidth={18} />
            ))}
          </g>
          {!torto && <path d="M -14 112 L 2 124 L -10 136 L 6 148" stroke={COR.coral} strokeWidth={7} fill="none" strokeLinecap="round" opacity={brilho} style={glow(COR.coral, 14)} />}
          {torto && <ellipse cx={14} cy={128} rx={30} ry={22} fill="none" stroke={COR.coral} strokeWidth={6} opacity={0.8} style={glow(COR.coral, 10)} />}
        </g>
      );
    }
    case "olho": {
      const seca = interpolate(f, [0, 300], [0, 1], { extrapolateRight: "clamp" });
      return (
        <g>
          <path d="M -360 0 Q 0 -260 360 0 Q 0 260 -360 0 Z" fill="#EDEAF7" />
          <circle cx={0} cy={0} r={130} fill={COR.menta} opacity={1 - seca * 0.4} />
          <circle cx={0} cy={0} r={60} fill={COR.indigo} />
          <circle cx={-34} cy={-40} r={22} fill="#fff" opacity={0.9 - seca * 0.8} />
          {[[-210, -40, -140, 10], [180, 30, 120, -20], [-150, 60, -90, 90], [240, -10, 170, 40]].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COR.coral} strokeWidth={5} strokeLinecap="round" opacity={interpolate(seca, [0.2 + i * 0.15, 0.45 + i * 0.15], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
          ))}
          <path d="M -360 0 Q 0 -260 360 0" stroke={COR.indigo} strokeWidth={18} fill="none" />
        </g>
      );
    }
    case "comprimido":
      return (
        <g style={glow(COR.menta, 22)}>
          <rect x={-180} y={-70} width={360} height={140} rx={70} fill="#F4F1FA" />
          <path d="M 0 -70 L 110 -70 A 70 70 0 0 1 110 70 L 0 70 Z" fill={COR.menta} />
          <rect x={-150} y={-50} width={90} height={18} rx={9} fill="#fff" opacity={0.7} />
        </g>
      );
    case "rede-nervosa": {
      const acende = interpolate(f, [10, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const ramos = [
        "M 0 -250 L 0 120", "M 0 -170 L -110 -130 L -150 20 L -170 120", "M 0 -170 L 110 -130 L 150 20 L 170 120",
        "M 0 120 L -60 270 L -70 400", "M 0 120 L 60 270 L 70 400", "M 0 -60 L -60 -20", "M 0 -60 L 60 -20", "M 0 40 L -50 80", "M 0 40 L 50 80",
        "M -150 20 L -190 60", "M 150 20 L 190 60", "M -60 270 L -100 300", "M 60 270 L 100 300",
      ];
      return (
        <g>
          <path d="M 0 -380 C 60 -380 80 -330 70 -290 C 120 -270 180 -240 180 -180 L 200 120 L 160 130 L 140 -100 L 120 120 L 100 420 L 30 420 L 0 160 L -30 420 L -100 420 L -120 120 L -140 -100 L -160 130 L -200 120 L -180 -180 C -180 -240 -120 -270 -70 -290 C -80 -330 -60 -380 0 -380 Z" fill={COR.indigo} stroke="#3B3270" strokeWidth={4} />
          {ramos.map((d, i) => (
            <path key={i} d={d} stroke={COR.menta} strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, Math.max(0, acende * 1.6 - i * 0.05))} style={glow(COR.menta, 8)} />
          ))}
        </g>
      );
    }
    case "neuronio": {
      const abre = interpolate(f, [60, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <g>
          <rect x={-900} y={-70} width={1800} height={140} fill="#2E2560" />
          <rect x={-900} y={-70} width={1800} height={14} fill="#4A3F8A" />
          <rect x={-900} y={56} width={1800} height={14} fill="#4A3F8A" />
          {[-600, -300, 0, 300, 600].map((x, i) => (
            <g key={i}>
              <rect x={x - 44 - abre * 16} y={-90} width={36} height={180} rx={14} fill={COR.menta} opacity={0.85} />
              <rect x={x + 8 + abre * 16} y={-90} width={36} height={180} rx={14} fill={COR.menta} opacity={0.85} />
              {abre > 0.2 &&
                [0, 1, 2].map((k) => {
                  const t = ((f * 2 + k * 30 + i * 13) % 90) / 90;
                  return <circle key={k} cx={x} cy={-110 + t * 260} r={10} fill={COR.amarelo} opacity={abre * (1 - t)} />;
                })}
            </g>
          ))}
        </g>
      );
    }
    case "comporta-aceso":
    case "comporta-apagado": {
      const aceso = asset === "comporta-aceso";
      return (
        <g style={aceso ? glow(COR.menta, 24) : undefined} opacity={aceso ? 1 : 0.55}>
          <ellipse cx={0} cy={-150} rx={80} ry={26} fill={aceso ? "#7DF0CC" : "#6B6690"} />
          <path d="M -80 -150 L -80 150 Q 0 180 80 150 L 80 -150 Z" fill={aceso ? COR.menta : "#4E4A6E"} />
          <rect x={-14} y={-140} width={28} height={290} rx={12} fill={aceso ? "#1E8F6E" : "#38345A"} />
        </g>
      );
    }
    case "berco":
      return (
        <g>
          <rect x={-260} y={-40} width={520} height={30} rx={12} fill="#3B3270" />
          <rect x={-260} y={140} width={520} height={30} rx={12} fill="#3B3270" />
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={i} x={-250 + i * 50} y={-40} width={14} height={200} rx={7} fill="#3B3270" />
          ))}
          <rect x={-280} y={-90} width={30} height={330} rx={12} fill="#2E2560" />
          <rect x={250} y={-90} width={30} height={330} rx={12} fill="#2E2560" />
        </g>
      );
    case "seringa":
      return (
        <g>
          <rect x={-160} y={-26} width={240} height={52} rx={10} fill="#E8E4F5" opacity={0.9} />
          <rect x={-120} y={-18} width={150} height={36} rx={6} fill={COR.menta} opacity={0.6} />
          <rect x={-210} y={-8} width={60} height={16} fill="#A9A3D6" />
          <rect x={-240} y={-34} width={30} height={68} rx={6} fill="#A9A3D6" />
          <path d="M 80 -4 L 190 0 L 80 4 Z" fill="#E8E4F5" />
        </g>
      );
    case "prato":
      return (
        <g>
          <ellipse cx={0} cy={0} rx={200} ry={44} fill="#E8E4F5" />
          <ellipse cx={0} cy={-6} rx={130} ry={24} fill="#C9C3E6" />
          <circle cx={-40} cy={-20} r={22} fill={COR.amarelo} />
          <circle cx={20} cy={-16} r={18} fill={COR.amarelo} />
        </g>
      );
    case "joelho-ralado": {
      const brilho = 0.7 + 0.3 * Math.sin(f * 0.12);
      return (
        <g>
          <path d="M -170 -320 Q -200 0 -150 320 L 150 320 Q 200 0 170 -320 Z" fill={COR.coral} />
          <ellipse cx={10} cy={20} rx={120} ry={90} fill="#C2483F" />
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M ${-90 + i * 22} ${-30 + (i % 3) * 10} l 26 ${40 + (i % 2) * 18}`} stroke={COR.rosa} strokeWidth={8} strokeLinecap="round" opacity={brilho} />
          ))}
          <path d="M -170 -320 Q -200 0 -150 320" stroke={COR.menta} strokeWidth={6} fill="none" />
        </g>
      );
    }
    case "poeira":
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => {
            const t = Math.min(1, f / 40);
            return <circle key={i} cx={(i - 4) * 50 * (0.4 + t)} cy={-30 * t * (1 + (i % 3))} r={30 + (i % 3) * 14} fill="#C9A98A" opacity={0.45 * (1 - Math.max(0, (f - 30) / 50))} />;
          })}
        </g>
      );
    case "gota":
      return <path d="M 0 -60 C 20 -20 40 0 40 24 C 40 48 22 64 0 64 C -22 64 -40 48 -40 24 C -40 0 -20 -20 0 -60 Z" fill={COR.coral} style={glow(COR.coral, 8)} />;
    case "data-2025":
      return (
        <text x={0} y={120} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={420} fill={COR.amarelo} opacity={0.9} style={glow(COR.amarelo, 30)}>
          2025
        </text>
      );
  }
};

type Props = { asset: AssetProp; x: number; y: number; scale: number; animate?: "float" | "spin" | "shake"; rotacao?: number };

export const Prop: React.FC<Props> = ({ asset, x, y, scale, animate, rotacao = 0 }) => {
  const f = useCurrentFrame();
  const dy = animate === "float" ? Math.sin(f * 0.06) * 14 : 0;
  const giro = animate === "spin" ? f * 1.6 : 0;
  const tremor = animate === "shake" ? Math.sin(f * 2.1) * 4 : 0;
  const tamanho = 400 * scale;
  if ((manifesto as string[]).includes(asset)) {
    return <Img src={staticFile(`assets/${asset}.png`)} style={{ position: "absolute", left: x - tamanho / 2 + tremor, top: y - tamanho / 2 + dy, width: tamanho, transform: `rotate(${rotacao + giro}deg)` }} />;
  }
  return (
    <svg width={tamanho * 2} height={tamanho * 2} viewBox="-400 -400 800 800" style={{ position: "absolute", left: x - tamanho + tremor, top: y - tamanho + dy, overflow: "visible" }}>
      <g transform={`rotate(${rotacao + giro})`}>
        <Desenho asset={asset} f={f} />
      </g>
    </svg>
  );
};
