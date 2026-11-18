import React from "react";
import { useCurrentFrame } from "remotion";
import { COR, FONTE } from "../theme";

// Objetos do roteiro v2 desenhados em código (chapados, contorno de luz menta numa borda).
// Todos recebem (x, y) em px de tela; y é a base do objeto.

export const Maca: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-220} y={-170} width={440} height={46} rx={18} fill="#E8E4F5" />
    <rect x={-210} y={-126} width={420} height={24} rx={8} fill="#A9A3D6" />
    <rect x={-190} y={-102} width={22} height={102} fill="#7C76AE" />
    <rect x={168} y={-102} width={22} height={102} fill="#7C76AE" />
    <path d="M -220 -150 L -220 -124" stroke={COR.menta} strokeWidth={4} />
  </g>
);

export const Cama: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-300} y={-210} width={40} height={210} rx={10} fill="#8A5A3C" />
    <rect x={-270} y={-120} width={560} height={70} rx={16} fill="#F4F1FA" />
    <rect x={-270} y={-140} width={190} height={40} rx={18} fill="#D8D2EE" />
    <rect x={-60} y={-130} width={350} height={80} rx={16} fill="#6A64B0" />
    <rect x={-270} y={-50} width={560} height={30} rx={8} fill="#8A5A3C" />
    <rect x={270} y={-150} width={34} height={150} rx={8} fill="#8A5A3C" />
  </g>
);

export const Pecinhas: React.FC<{ x: number; y: number; n?: number }> = ({ x, y, n = 9 }) => {
  const cores = [COR.coral, COR.amarelo, COR.menta, COR.rosa, "#5B8DEF"];
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const px = x + ((i * 173) % 700) - 350;
        const py = y - ((i * 47) % 40);
        return (
          <g key={i} transform={`translate(${px} ${py}) rotate(${(i * 37) % 50 - 25})`}>
            <rect x={-26} y={-18} width={52} height={30} rx={4} fill={cores[i % cores.length]} />
            <rect x={-18} y={-28} width={12} height={12} rx={3} fill={cores[i % cores.length]} />
            <rect x={6} y={-28} width={12} height={12} rx={3} fill={cores[i % cores.length]} />
          </g>
        );
      })}
    </g>
  );
};

export const Estrela: React.FC<{ x: number; y: number; r?: number; cor?: string }> = ({ x, y, r = 30, cor = COR.amarelo }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
  }).join(" ");
  return <polygon points={pts} fill={cor} stroke="#FFFFFF" strokeWidth={3} />;
};

export const Mapa: React.FC<{ x: number; y: number; acesas: number }> = ({ x, y, acesas }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -260 -120 Q -200 -230 -60 -220 Q 80 -260 180 -150 Q 270 -60 210 60 Q 120 170 -20 150 Q -170 170 -240 60 Q -300 -40 -260 -120 Z" fill="#3B3270" stroke={COR.menta} strokeWidth={4} />
    {[[-110, -80], [40, -120], [110, 10]].map(([cx, cy], i) => (
      <g key={i} transform={`translate(${cx} ${cy})`} opacity={i < acesas ? 1 : 0.25}>
        <rect x={-26} y={-20} width={52} height={40} fill={i < acesas ? COR.amarelo : "#6B6690"} />
        <path d="M -34 -20 L 0 -50 L 34 -20 Z" fill={i < acesas ? COR.coral : "#6B6690"} />
        {i < acesas && <circle cx={0} cy={0} r={60} fill={COR.amarelo} opacity={0.18} />}
      </g>
    ))}
  </g>
);

export const Interfone: React.FC<{ x: number; y: number; aperta: boolean }> = ({ x, y, aperta }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-160} y={-300} width={320} height={420} rx={26} fill="#C9C4D8" />
    <rect x={-120} y={-260} width={240} height={110} rx={12} fill="#2E2A5C" />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={-70 + c * 70} cy={-100 + r * 60} r={22} fill="#A9A3D6" />))}
    <circle cx={0} cy={80} r={34} fill={aperta ? "#7C76AE" : "#E8E4F5"} />
    <path d="M 0 120 L 0 220 M -6 220 L 8 232" stroke="#2E2A5C" strokeWidth={10} strokeLinecap="round" />
    <path d="M 0 250 Q 10 300 -10 360" stroke="#2E2A5C" strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

export const Churrasqueira: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-150} y={-260} width={300} height={70} rx={14} fill="#2E2A5C" />
      <rect x={-140} y={-190} width={22} height={190} fill="#2E2A5C" />
      <rect x={118} y={-190} width={22} height={190} fill="#2E2A5C" />
      {[-90, -20, 50].map((cx, i) => <rect key={i} x={cx} y={-290} width={56} height={28} rx={10} fill="#B5543C" />)}
      {[0, 1, 2].map((i) => <path key={i} d={`M ${-80 + i * 70} -310 q 14 -30 0 -60`} stroke="#E8E4F5" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.4 + 0.3 * Math.sin(f * 0.15 + i)} transform={`translate(0 ${-((f + i * 15) % 40)})`} />)}
    </g>
  );
};

export const Bola: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 34, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="#F4F1FA" stroke="#2E2A5C" strokeWidth={4} />
    <polygon points={`0,${-r * 0.4} ${r * 0.38},${-r * 0.12} ${r * 0.24},${r * 0.32} ${-r * 0.24},${r * 0.32} ${-r * 0.38},${-r * 0.12}`} fill="#2E2A5C" />
  </g>
);

export const CelularGrande: React.FC<{ x: number; y: number; contador: number; titulo?: string }> = ({ x, y, contador, titulo }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-210} y={-400} width={420} height={760} rx={50} fill="#141024" stroke={COR.menta} strokeWidth={6} />
    <rect x={-180} y={-350} width={360} height={560} rx={20} fill="#2E2570" />
    <circle cx={0} cy={-60} r={70} fill={COR.coral} opacity={0.9} />
    <polygon points="-20,-95 -20,-25 40,-60" fill="#FFFFFF" />
    <text x={0} y={120} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={64} fill="#FFFFFF">{contador.toLocaleString("pt-BR")}</text>
    <text x={0} y={168} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={30} fill={COR.menta}>visualizações</text>
    {titulo && <text x={0} y={-300} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={30} fill="#FFFFFF">{titulo}</text>}
  </g>
);

export const Muro: React.FC<{ x: number; y: number; w?: number; h?: number; noite?: boolean }> = ({ x, y, w = 700, h = 330, noite }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill={noite ? "#3A3268" : "#C27B5A"} />
    {Array.from({ length: Math.floor(h / 50) }, (_, r) => Array.from({ length: Math.ceil(w / 110) }, (_, c) => (
      <rect key={`${r}-${c}`} x={-w / 2 + c * 110 + (r % 2) * 55} y={-h + r * 50 + 4} width={100} height={42} rx={4} fill={noite ? "#463D7A" : "#D08A68"} />
    )))}
    <rect x={-w / 2 - 10} y={-h - 18} width={w + 20} height={22} rx={6} fill={noite ? "#2A2452" : "#A8644A"} />
  </g>
);

export const Vela: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-26} y={-180} width={52} height={180} rx={8} fill="#F4F1FA" />
      <path d={`M 0 -250 Q ${24 + Math.sin(f * 0.5) * 5} -200 0 -184 Q ${-24 + Math.sin(f * 0.4) * 5} -200 0 -250 Z`} fill={COR.amarelo} />
      <circle cx={0} cy={-205} r={50} fill={COR.amarelo} opacity={0.18} />
    </g>
  );
};

export const Poste: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-22} y={-720} width={44} height={720} fill="#5B5480" />
    <path d="M 0 -700 Q 80 -760 160 -700" stroke="#5B5480" strokeWidth={18} fill="none" />
    <rect x={130} y={-710} width={70} height={30} rx={8} fill="#FFE9A8" />
  </g>
);

export const Trave: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-10} y={-300} width={20} height={300} fill="#F4F1FA" />
    <rect x={380} y={-300} width={20} height={300} fill="#F4F1FA" />
    <rect x={-10} y={-310} width={410} height={20} fill="#F4F1FA" />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={i * 52} y1={-290} x2={i * 52 + 30} y2={0} stroke="#E8E4F5" strokeWidth={2} opacity={0.5} />)}
  </g>
);

export const CanelaRoxa: React.FC<{ x: number; y: number; roxo: number }> = ({ x, y, roxo }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -180 -520 Q -210 -100 -160 380 L 160 380 Q 210 -100 180 -520 Z" fill={COR.coral} />
    <path d="M -180 -520 Q -210 -100 -160 380" stroke={COR.menta} strokeWidth={8} fill="none" />
    <ellipse cx={10} cy={-30} rx={120 * roxo} ry={150 * roxo} fill="#5B3A8C" opacity={0.9} />
    <ellipse cx={30} cy={-50} rx={70 * roxo} ry={90 * roxo} fill="#7A4DB0" opacity={0.8} />
    <rect x={-170} y={380} width={340} height={140} rx={30} fill={COR.indigo} />
  </g>
);

export const PanelaPressao: React.FC<{ x: number; y: number; vapor?: boolean }> = ({ x, y, vapor = true }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-130} y={-150} width={260} height={150} rx={22} fill="#A9A3D6" />
      <rect x={-140} y={-176} width={280} height={34} rx={14} fill="#C9C4D8" />
      <rect x={-20} y={-214} width={40} height={40} rx={8} fill="#2E2A5C" />
      <rect x={130} y={-140} width={110} height={24} rx={12} fill="#2E2A5C" />
      {vapor && [0, 1, 2].map((i) => <path key={i} d={`M ${-10 + i * 14} -230 q 18 -36 0 -72`} stroke="#F4F1FA" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.35 + 0.3 * Math.sin(f * 0.2 + i)} transform={`translate(0 ${-((f * 1.5 + i * 18) % 50)})`} />)}
    </g>
  );
};

export const NarizFlores: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -120 -200 Q -60 40 -150 120 Q -60 170 20 120" stroke={COR.indigo} strokeWidth={0} fill={COR.indigo} />
    <path d="M -120 -200 Q -60 40 -150 120 Q -60 170 20 120" stroke={COR.menta} strokeWidth={8} fill="none" />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${220 + i * 120} ${60 - i * 40})`}>
        <line x1={0} y1={0} x2={0} y2={200} stroke="#3FAF63" strokeWidth={10} />
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 34} cy={Math.sin((a * Math.PI) / 180) * 34} rx={26} ry={18} transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * 34} ${Math.sin((a * Math.PI) / 180) * 34})`} fill={[COR.rosa, COR.amarelo, COR.coral][i]} />)}
        <circle r={18} fill={COR.amarelo} />
      </g>
    ))}
  </g>
);

export const CamaHospital: React.FC<{ x: number; y: number; acorda: number }> = ({ x, y, acorda }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-360} y={-150} width={720} height={60} rx={20} fill="#F4F1FA" />
    <rect x={-360} y={-90} width={720} height={30} rx={8} fill="#9FB2CC" />
    <rect x={-330} y={-60} width={20} height={60} fill="#7C8FAE" />
    <rect x={310} y={-60} width={20} height={60} fill="#7C8FAE" />
    <rect x={-340} y={-260} width={30} height={170} rx={10} fill="#9FB2CC" />
    {/* silhueta sem rosto: deitada que se ergue */}
    <g transform={`translate(-220 -160) rotate(${-55 * acorda})`}>
      <path d="M 0 -80 C 18 -80 60 -30 60 10 C 60 40 34 56 0 56 C -34 56 -60 40 -60 10 C -60 -30 -18 -80 0 -80 Z" fill="#5B6E92" transform="rotate(90)" />
    </g>
    <rect x={-170} y={-210} width={460} height={70} rx={30} fill="#C9D6E8" />
  </g>
);

export const Cerebro: React.FC<{ x: number; y: number; sirene: number }> = ({ x, y, sirene }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -70 0 Q -80 -60 -20 -66 Q 10 -90 50 -60 Q 90 -50 76 0 Q 70 40 20 40 Q -10 56 -40 40 Q -76 34 -70 0 Z" fill={COR.rosa} opacity={0.85} />
    <circle cx={0} cy={-100} r={22 + 10 * sirene} fill={COR.coral} opacity={sirene} />
    {sirene > 0.1 && [0, 1, 2].map((i) => <circle key={i} cx={0} cy={-100} r={30 + i * 22 * sirene} fill="none" stroke={COR.coral} strokeWidth={4} opacity={sirene * (1 - i * 0.3)} />)}
  </g>
);
