// Capítulo 2: Pra que serve a dor.
import React from "react";

import { CONSULTORIO, Liso } from "./cenarios";
import { Ator, Camera, E, Impacto, Medidor, Painel, pts, usePlano, V } from "./kit";
import { comBracos, cruzados, maoEm, parado, pulso, rampa, sentado, sino, type Fn } from "./motor";
import { LINHA, type PoseTeo } from "./tira";
import { Consultorio } from "./cenarios";

const { chao, maca } = CONSULTORIO;
const X_TEO = 900;
const X_ROSE = 470;
const X_HELENA = 1230;

const teoMaca: Fn = (t) => sentado(X_TEO, maca.assento, 1)(t);
const balanca = (p: PoseTeo, t: number, k = 1): PoseTeo => ({
  ...p,
  leg_lower_R: -80 + 26 * k * Math.sin(2 * Math.PI * 1.3 * t),
  leg_lower_L: -84 + 26 * k * Math.sin(2 * Math.PI * 1.3 * t + Math.PI),
});
const helenaComObjeto = (t: number, x: number, obj: PoseTeo["objR"]): PoseTeo => ({ ...parado(x, chao, E("helena"), true)(t), objR: obj });

// ---------------------------------------------------------------- c2_consulta
const C2Consulta: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const teo = balanca(teoMaca(t), t, 0.4);
  let rose = parado(X_ROSE, chao, E("rose"))(t);
  // ela aponta o filho enquanto reclama
  rose = comBracos(rose, { ...rose, arm_upper_R: 62, arm_lower_R: 20 }, sino(t, 0.6, 2.4));
  rose.expr = "preocupado";
  let helena = helenaComObjeto(t, X_HELENA, null);
  helena = { ...helena, objL: "prancheta", arm_upper_L: 40, arm_lower_L: 70, arm_upper_R: 30, arm_lower_R: 80 + 10 * Math.sin(t * 9), objR: "caneta" };
  helena.head.rot = 10;
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 900, cy: 560 }, { t: dur, z: 1.06, cx: 900, cy: 560 }]}>
      <Consultorio />
      <Ator quem="rose" pose={rose} fala={fala("rose")} />
      <Ator quem="teo" pose={teo} />
      <Ator quem="helena" pose={helena} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c2_algodao
const C2Algodao: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  let teo = teoMaca(t);
  const alvoBraco = pts("teo", teo).bracoR;
  let helena = helenaComObjeto(t, X_HELENA - 110, "algodao");
  const esfrega = Math.sin(t * 14) * 14 * rampa(t, 0.5, 0.7);
  helena = comBracos(helena, maoEm(helena, "R", [alvoBraco[0] + esfrega, alvoBraco[1] - 10], E("helena"), V("helena")), rampa(t, 0.0, 0.45));
  helena.torso.rot = 10;
  helena.head.rot = 12;
  // cócega: ri de leve e encolhe o ombro
  const ri = sino(t, F(1).ini + 0.6, F(1).fim + 0.3, 0.2, 0.3);
  teo = { ...teo, torso: { ...teo.torso, rot: teo.torso.rot - 6 * ri, scaleY: teo.torso.scaleY + 0.02 * ri * Math.abs(Math.sin(t * 25)) }, head: { ...teo.head, rot: teo.head.rot - 8 * ri }, expr: ri > 0.4 ? "rindo" : "neutro", arm_upper_R: teo.arm_upper_R - 8 * ri };
  return (
    <Camera chaves={[{ t: 0, z: 1.55, cx: 1000, cy: 520 }, { t: dur, z: 1.65, cx: 1000, cy: 520 }]}>
      <Consultorio />
      <Ator quem="teo" pose={teo} fala={fala("teo") && ri < 0.4} />
      <Ator quem="helena" pose={helena} fala={fala("helena")} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c2_caneta
const C2Caneta: React.FC = () => {
  const { t, f, fps, dur, fala, F } = usePlano();
  const teo = teoMaca(t);
  const alvo = pts("teo", teo).bracoR;
  let helena = helenaComObjeto(t, X_HELENA - 110, "caneta");
  const aperta = sino(t, 0.3, 2.3, 0.3, 0.3);
  const fundo = pulso(t, 0.6, 0.5) + pulso(t, 1.0, 0.5);
  helena = comBracos(helena, maoEm(helena, "R", [alvo[0] + 40 + 10 * (1 - fundo), alvo[1] - 64 + 18 * fundo], E("helena"), V("helena")), aperta);
  helena.torso.rot = 10 + 4 * fundo;
  helena.head.rot = 12;
  return (
    <Camera chaves={[{ t: 0, z: 1.7, cx: 1010, cy: 500 }, { t: F(2).ini, z: 1.7, cx: 1010, cy: 500 }, { t: F(2).ini + 0.01, z: 1.15, cx: 1050, cy: 520, corte: true }, { t: dur, z: 1.2, cx: 1050, cy: 520 }]}>
      <Consultorio />
      <Ator quem="teo" pose={teo} fala={fala("teo")} />
      <Ator quem="helena" pose={{ ...helena, expr: t > F(1).fim ? "curioso" : "serio" }} fala={fala("helena")} />
      <Impacto x={alvo[0]} y={alvo[1]} d={f - Math.round(0.65 * fps)} raio={18} esc={0.6} angulos={[-150, -110, -60]} />
      <Medidor x={1550} y={330} valor={0} desde={F(2).ini + 0.9} esc={0.9} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c2_alarme: painel com o caminho do alarme
const Sirene: React.FC<{ x: number; y: number; ligada: number; t: number }> = ({ x, y, ligada, t }) => (
  <g transform={`translate(${x} ${y})`}>
    {ligada > 0 && [0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i * 60 + t * 300) * (Math.PI / 180);
      return <path key={i} d={`M 0 -30 L ${Math.cos(a) * 170 - 24} ${Math.sin(a) * 170 - 30} L ${Math.cos(a) * 170 + 24} ${Math.sin(a) * 170 - 30} Z`} fill="#FFD23F" opacity={0.55 * ligada} />;
    })}
    <rect x={-50} y={0} width={100} height={26} rx={6} fill="#9AA0A8" stroke={LINHA} strokeWidth={6} />
    <path d="M -38 0 L -38 -40 Q 0 -90 38 -40 L 38 0 Z" fill={ligada > 0 && Math.floor(t * 8) % 2 ? "#FF3B2E" : "#B91F2E"} stroke={LINHA} strokeWidth={6} />
  </g>
);
const C2Alarme: React.FC = () => {
  const { t, dur, S } = usePlano();
  const tSir = S("sirene");
  const teo = teoMaca(t);
  // caminho do nervo: mão (embaixo) -> braço -> pescoço -> cérebro
  const caminho: [number, number][] = [[170, 610], [260, 470], [300, 330], [380, 240], [500, 200]];
  const len = caminho.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - caminho[i][0], p[1] - caminho[i][1]), 0);
  const prog = rampa(t, tSir - 1.7, tSir - 0.05);
  const pulsoPos = (() => {
    let d = prog * len;
    for (let i = 1; i < caminho.length; i++) {
      const s = Math.hypot(caminho[i][0] - caminho[i - 1][0], caminho[i][1] - caminho[i - 1][1]);
      if (d <= s) return [caminho[i - 1][0] + ((caminho[i][0] - caminho[i - 1][0]) * d) / s, caminho[i - 1][1] + ((caminho[i][1] - caminho[i - 1][1]) * d) / s];
      d -= s;
    }
    return caminho[caminho.length - 1];
  })();
  const toca = t > 1.3 ? 1 : 0;
  const ligada = t >= tSir ? 1 : 0;
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: dur, z: 1.04, cx: 960, cy: 540 }]}>
      <Consultorio />
      <Ator quem="teo" pose={{ ...teo, head: { ...teo.head, rot: -6 } }} />
      <Painel x={1080} y={110} w={760} h={720} desde={0.2} fundo="#FFF6E0">
        {/* fogo */}
        <g transform="translate(120 650)">
          {[-30, 0, 30].map((dx, i) => <path key={i} d={`M ${dx - 26} 0 Q ${dx} ${-90 - 12 * Math.sin(t * 18 + i)} ${dx + 26} 0 Z`} fill={i === 1 ? "#FFD23F" : "#F2933A"} stroke={LINHA} strokeWidth={5} />)}
        </g>
        {/* mão e braço (contorno) */}
        <g transform={`translate(${170 + (1 - toca) * 60} ${610 - (1 - toca) * 30})`}>
          <circle r={34} fill="#C9895E" stroke={LINHA} strokeWidth={7} />
        </g>
        <path d="M 196 590 L 290 420 L 320 300" stroke="#C9895E" strokeWidth={50} fill="none" strokeLinecap="round" />
        <path d="M 196 590 L 290 420 L 320 300" stroke={LINHA} strokeWidth={6} fill="none" strokeDasharray="2 0" opacity={0} />
        {/* cabeça com cérebro */}
        <circle cx={520} cy={250} r={150} fill="#F2C9A0" stroke={LINHA} strokeWidth={8} />
        <path d="M 430 250 Q 420 160 510 150 Q 600 140 620 220 Q 640 300 560 310 Q 480 330 430 250 Z" fill="#F0A3B4" stroke={LINHA} strokeWidth={6} />
        <path d="M 470 220 Q 500 190 530 220 Q 560 250 590 220" stroke="#C9687E" strokeWidth={6} fill="none" />
        {/* nervo */}
        <polyline points={caminho.map((p) => p.join(",")).join(" ")} fill="none" stroke="#FFD23F" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={caminho.map((p) => p.join(",")).join(" ")} fill="none" stroke={LINHA} strokeWidth={3} strokeDasharray="12 10" />
        {prog > 0 && prog < 1 && <circle cx={pulsoPos[0]} cy={pulsoPos[1]} r={22} fill="#FF5A4A" stroke={LINHA} strokeWidth={5} />}
        <Sirene x={560} y={80} ligada={ligada} t={t} />
        {toca > 0 && <g stroke={LINHA} strokeWidth={6} strokeLinecap="round">{[-150, -110, -70].map((a, i) => <line key={i} x1={170 + Math.cos((a * Math.PI) / 180) * 50} y1={610 + Math.sin((a * Math.PI) / 180) * 50} x2={170 + Math.cos((a * Math.PI) / 180) * 80} y2={610 + Math.sin((a * Math.PI) / 180) * 80} />)}</g>}
      </Painel>
    </Camera>
  );
};

// ---------------------------------------------------------------- c2_mapa: três casas acesas + DNA com um trecho piscando
const C2Mapa: React.FC = () => {
  const { t, dur } = usePlano();
  const casas: [number, number, number][] = [[380, 420, 0.9], [520, 560, 1.5], [300, 640, 2.1]];
  const pisca = t > 3.6 ? (Math.floor(t * 4) % 2 ? 1 : 0.35) : 0;
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: 3.2, z: 1.0, cx: 960, cy: 540 }, { t: 3.9, z: 1.25, cx: 1300, cy: 540 }, { t: dur, z: 1.3, cx: 1300, cy: 540 }]} fundo="#BFE6FF">
      <Liso cor="#BFE6FF" />
      {/* mapa estilizado */}
      <path d="M 140 300 Q 260 180 420 220 Q 560 160 700 280 Q 760 420 690 560 Q 640 760 470 800 Q 300 860 220 740 Q 120 620 160 480 Q 100 400 140 300 Z" fill="#B7D88A" stroke={LINHA} strokeWidth={9} strokeLinejoin="round" />
      <path d="M 520 240 Q 470 420 560 600 Q 600 700 560 800" stroke="#7FB7F0" strokeWidth={14} fill="none" strokeLinecap="round" />
      {casas.map(([x, y, a], i) => {
        const on = rampa(t, a, a + 0.15);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.8 + 0.25 * pulso(t, a, 0.4) * 2})`}>
            {on > 0 && <circle r={70} fill="#FFD23F" opacity={0.45 * on} />}
            <rect x={-34} y={-30} width={68} height={56} fill="#FBFBF7" stroke={LINHA} strokeWidth={6} />
            <path d="M -46 -30 L 0 -70 L 46 -30 Z" fill="#E9707F" stroke={LINHA} strokeWidth={6} strokeLinejoin="round" />
            <rect x={-12} y={-14} width={24} height={22} fill={on > 0 ? "#FFD23F" : "#7F8A9A"} stroke={LINHA} strokeWidth={4} />
          </g>
        );
      })}
      {/* DNA */}
      <g transform={`translate(1300 ${540}) rotate(-14)`}>
        {Array.from({ length: 16 }, (_, i) => {
          const y = -380 + i * 50;
          const a = i * 0.55 + t * 1.6;
          const x1 = Math.sin(a) * 110, x2 = -Math.sin(a) * 110;
          const quebrado = i === 9 || i === 10;
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={quebrado ? "#E23B2E" : "#9AA0A8"} strokeWidth={quebrado ? 14 : 8} opacity={quebrado ? Math.max(0.35, pisca || 0.6) : 1} strokeDasharray={quebrado && t > 3.6 ? "14 10" : undefined} />
              <circle cx={x1} cy={y} r={14} fill="#3B6FD6" stroke={LINHA} strokeWidth={4} />
              <circle cx={x2} cy={y} r={14} fill="#E9707F" stroke={LINHA} strokeWidth={4} />
            </g>
          );
        })}
        {t > 3.6 && <rect x={-150} y={-380 + 9 * 50 - 34} width={300} height={118} rx={16} fill="none" stroke="#E23B2E" strokeWidth={8} opacity={pisca} />}
      </g>
      {/* peça do nervo: canalzinho na membrana (receita do gene) */}
      {t > 5.0 && (
        <g transform={`translate(1660 ${880}) scale(${rampa(t, 5.0, 5.25)})`}>
          <rect x={-160} y={-26} width={320} height={52} fill="#F2C9A0" stroke={LINHA} strokeWidth={6} />
          <rect x={-34} y={-60} width={68} height={120} rx={20} fill="#86DDBE" stroke={LINHA} strokeWidth={6} />
          <rect x={-10} y={-60} width={20} height={120} fill="#3FAF63" />
        </g>
      )}
    </Camera>
  );
};

// ---------------------------------------------------------------- c2_interfone
const Dedo: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M 0 0 L 520 120" stroke={LINHA} strokeWidth={130} strokeLinecap="round" />
    <path d="M 0 0 L 520 120" stroke="#C9895E" strokeWidth={116} strokeLinecap="round" />
    <rect x={-6} y={-30} width={90} height={56} rx={28} fill="#C9895E" stroke={LINHA} strokeWidth={7} transform="rotate(12)" />
    <path d="M -70 -14 L 30 -8" stroke={LINHA} strokeWidth={48} strokeLinecap="round" transform="rotate(12)" />
    <path d="M -70 -14 L 30 -8" stroke="#C9895E" strokeWidth={36} strokeLinecap="round" transform="rotate(12)" />
  </g>
);
const C2Interfone: React.FC = () => {
  const { t, dur } = usePlano();
  const apertos = [2.9, 3.6, 4.3, 4.9];
  const ap = apertos.reduce((a, b) => Math.max(a, pulso(t, b, 0.3)), 0);
  const dedoX = 1040 - 0 * ap;
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: 1.2, z: 1.0, cx: 960, cy: 540 }, { t: 2.0, z: 1.5, cx: 860, cy: 760 }, { t: 2.6, z: 1.0, cx: 960, cy: 540 }, { t: dur, z: 1.08, cx: 960, cy: 540 }]} fundo="#E8DCC4">
      <Liso cor="#E8DCC4" />
      <rect x={-400} y={-400} width={2800} height={1900} fill="#E8DCC4" />
      {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-400} y1={i * 60 - 200} x2={2400} y2={i * 60 - 200} stroke="#DCCDB0" strokeWidth={4} />)}
      {/* interfone da portaria */}
      <rect x={620} y={240} width={360} height={480} rx={30} fill="#9AA0A8" stroke={LINHA} strokeWidth={9} />
      <rect x={680} y={300} width={240} height={140} rx={12} fill="#5A6070" stroke={LINHA} strokeWidth={6} />
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={700} y1={320 + i * 24} x2={900} y2={320 + i * 24} stroke="#3A3E48" strokeWidth={8} />)}
      <circle cx={800} cy={560 + 8 * ap} r={56} fill="#E23B2E" stroke={LINHA} strokeWidth={8} />
      {/* fio cortado */}
      <path d="M 800 720 Q 800 800 760 850" stroke={LINHA} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d="M 800 720 Q 800 800 760 850" stroke="#3B6FD6" strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M 700 920 Q 660 980 560 1000" stroke={LINHA} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d="M 700 920 Q 660 980 560 1000" stroke="#3B6FD6" strokeWidth={12} fill="none" strokeLinecap="round" />
      {t > 1.4 && Math.floor(t * 6) % 3 === 0 && <g stroke="#FFD23F" strokeWidth={6}>{[0, 1, 2].map((i) => <line key={i} x1={735} y1={880} x2={735 + Math.cos(i * 2) * 40} y2={880 + Math.sin(i * 2) * 40} />)}</g>}
      {/* do outro lado: o telefone do apartamento, mudo */}
      <rect x={1340} y={300} width={260} height={360} rx={24} fill="#FBFBF7" stroke={LINHA} strokeWidth={9} />
      <rect x={1380} y={340} width={180} height={90} rx={40} fill="#E8E4DA" stroke={LINHA} strokeWidth={6} />
      <circle cx={1470} cy={540} r={40} fill="#E8E4DA" stroke={LINHA} strokeWidth={6} />
      {t > 5.3 && <path d="M 1380 720 Q 1470 690 1560 720" stroke={LINHA} strokeWidth={8} fill="none" strokeLinecap="round" />}
      {t > 2.4 && <Dedo x={dedoX - 160 * (1 - ap) + 120 * (1 - rampa(t, 2.4, 2.7))} y={560 - 20 * (1 - ap)} />}
    </Camera>
  );
};

// ---------------------------------------------------------------- c2_curativo: o machucado chega sem avisar
const C2Curativo: React.FC = () => {
  const { t, dur } = usePlano();
  let teo = teoMaca(t);
  const b = pts("teo", teo).bracoR;
  // mão esquerda segura o próprio braço
  teo = comBracos(teo, { ...teo, arm_upper_L: 52, arm_lower_L: 64 }, rampa(t, 0.2, 0.6), "L");
  teo.head.rot = 16 * rampa(t, 0.9, 1.2);
  const corte = rampa(t, 0.7, 0.85);
  return (
    <Camera chaves={[{ t: 0, z: 2.2, cx: b[0] + 20, cy: b[1] - 60 }, { t: dur, z: 2.35, cx: b[0] + 20, cy: b[1] - 60 }]}>
      <Consultorio />
      <Ator quem="teo" pose={{ ...teo, curativo: t > 1.9 }} />
      {t < 1.9 && corte > 0 && <line x1={b[0] - 16 * corte} y1={b[1] - 6} x2={b[0] + 16 * corte} y2={b[1] + 6} stroke="#D9363A" strokeWidth={6} strokeLinecap="round" />}
      <Impacto x={b[0]} y={b[1]} d={Math.round((t - 1.9) * 30)} raio={30} esc={0.6} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c2_branca
const C2Branca: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const teo = balanca(teoMaca(t), t, 1);
  teo.head.rot = -6;
  teo.expr = fala("teo") ? "neutro" : "sorriso";
  let rose = parado(X_ROSE + 120, chao, E("rose"))(t);
  rose = comBracos(rose, cruzados(rose), 0.0);
  rose.palido = rampa(t, 0.4, 1.3);
  rose.expr = "surpreso";
  rose = comBracos(rose, maoEm(rose, "R", pts("rose", rose).boca, E("rose"), V("rose")), rampa(t, 0.5, 0.9), "R");
  return (
    <Camera chaves={[{ t: 0, z: 1.35, cx: 760, cy: 520 }, { t: F(1).ini - 0.02, z: 1.4, cx: 760, cy: 520 }, { t: F(1).ini, z: 1.6, cx: 920, cy: 560, corte: true }, { t: dur, z: 1.65, cx: 920, cy: 560 }]}>
      <Consultorio />
      <Ator quem="rose" pose={rose} />
      <Ator quem="teo" pose={teo} fala={fala("teo")} />
    </Camera>
  );
};

export const CAP2: Record<string, React.FC> = {
  c2_consulta: C2Consulta, c2_algodao: C2Algodao, c2_caneta: C2Caneta, c2_alarme: C2Alarme, c2_mapa: C2Mapa, c2_interfone: C2Interfone, c2_curativo: C2Curativo, c2_branca: C2Branca,
};
