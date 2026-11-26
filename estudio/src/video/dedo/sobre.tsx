// Sobreposições do Shorts (por cima do 3D): rótulos do gás, manômetro, "O ESTALO", os falsos culpados riscados,
// "NADA", 20 MIN, barra de recarga, balão de fala, mãos (estala / nunca), anos passando, sem artrite, o prêmio e a
// pergunta final. Tudo preso às falas.
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONTE } from "../../fontes";
import { DURACAO, FALAS, T, fracDe } from "./tempo";

const em = (id: number, trecho: string) => T(id, fracDe(id, trecho));
const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const pop = (f: number, de: number, dur = 6) => {
  if (f < de) return 0;
  const k = lim((f - de) / dur);
  return 1 + 0.18 * Math.sin(k * Math.PI) * (1 - k) + (k < 1 ? -(1 - k) * (1 - k) : 0);
};
const Txt: React.FC<{ x: number; y: number; t: string; tam: number; cor?: string; rot?: number; s?: number; ancora?: "middle" | "start" | "end" }> = ({ x, y, t, tam, cor = "#FFFFFF", rot = 0, s = 1, ancora = "middle" }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s.toFixed(3)})`}>
      <text x={0} y={tam * 0.35} textAnchor={ancora} fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor} stroke="#000" strokeWidth={tam * 0.2} strokeLinejoin="round" paintOrder="stroke">{t}</text>
    </g>
  );
const Pilula: React.FC<{ x: number; y: number; t: string; cor: string; s: number }> = ({ x, y, t, cor, s }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s.toFixed(3)})`}>
      <rect x={-t.length * 27 - 34} y={-50} width={t.length * 54 + 68} height={100} rx={50} fill={cor} stroke="#000" strokeWidth={8} />
      <text x={0} y={24} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={68} fill="#0B0F1A">{t}</text>
    </g>
  );
const Xis: React.FC<{ x: number; y: number; k: number; larg: number }> = ({ x, y, k, larg }) =>
  k <= 0 ? null : <line x1={x - larg / 2} y1={y + 18} x2={x - larg / 2 + larg * k} y2={y - 18} stroke="#FF3B30" strokeWidth={16} strokeLinecap="round" />;

export const Sobreposicoes: React.FC = () => {
  const f = useCurrentFrame();
  const els: React.ReactNode[] = [];
  // gás dissolvido: O₂, N₂, CO₂
  if (f >= T(5) - 2 && f < FALAS[5].fim + 20) {
    [["O₂", 260, 640, "oxigênio"], ["N₂", 540, 560, "nitrogênio"], ["CO₂", 820, 660, "gás carbônico"]].forEach(([t, x, y, w]) => {
      els.push(<Pilula key={t as string} x={x as number} y={y as number} t={t as string} cor="#9FE3FF" s={1.35 * pop(f, em(5, (w as string).replace("oxigênio", "Oxigênio")))} />);
    });
  }
  // a pressão despenca: manômetro
  if (f >= T(9) - 4 && f < FALAS[9].fim + 14) {
    const k = lim((f - T(9, 0.3)) / Math.max(1, FALAS[9].fim - T(9, 0.3)));
    const v = 0.85 - 0.8 * k * k;
    const a = -210 + 240 * v;
    const s = pop(f, T(9) - 4);
    els.push(
      <g key="mano" transform={`translate(540 560) scale(${s.toFixed(3)})`}>
        <circle r={190} fill="#F4F1EA" stroke="#000" strokeWidth={12} />
        <path d="M -134 98 A 166 166 0 1 1 134 98" fill="none" stroke="#D9D2C3" strokeWidth={26} />
        <path d="M 134 98 A 166 166 0 0 0 166 -10" fill="none" stroke="#3FBF6A" strokeWidth={26} />
        <path d="M -134 98 A 166 166 0 0 1 -166 -10" fill="none" stroke="#FF3B30" strokeWidth={26} />
        <line x1={0} y1={0} x2={150 * Math.cos((a * Math.PI) / 180)} y2={150 * Math.sin((a * Math.PI) / 180)} stroke="#111" strokeWidth={14} strokeLinecap="round" />
        <circle r={20} fill="#111" />
        <text y={130} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={44} fill="#111">PRESSÃO</text>
      </g>,
    );
  }
  // esse é o estalo
  if (f >= T(13) - 2 && f < FALAS[13].fim + 10) {
    els.push(<Txt key="estalo" x={540} y={560} t="O ESTALO" tam={150} cor="#FFD23F" rot={-4} s={pop(f, T(13) - 2)} />);
  }
  // os falsos culpados
  if (f >= T(14) - 3 && f < T(16)) {
    const itens: [string, number, number][] = [["OSSO", 400, em(14, "osso")], ["CARTILAGEM", 560, em(15, "cartilagem")], ["TENDÃO", 720, FALAS[15].fim]];
    itens.forEach(([t, y, quando]) => {
      els.push(<Txt key={t} x={540} y={y} t={t} tam={96} s={pop(f, T(14) - 3)} />);
      els.push(<Xis key={t + "x"} x={540} y={y} k={lim((f - quando) / 5)} larg={t.length * 70 + 40} />);
    });
  }
  // é uma bolha de gás
  if (f >= em(16, "bolha") && f < FALAS[16].fim + 12) els.push(<Pilula key="bolha" x={540} y={560} t="BOLHA DE GÁS ✓" cor="#7CF2A8" s={pop(f, em(16, "bolha"))} />);
  // não consegue de novo
  if (f >= em(18, "não consegue") + 8 && f < FALAS[18].fim + 10) els.push(<Txt key="nada" x={540} y={600} t="NADA." tam={140} cor="#C9D1E0" s={pop(f, em(18, "não consegue") + 8)} />);
  // vinte minutos
  if (f >= em(19, "vinte") && f < FALAS[19].fim + 14) els.push(<Pilula key="20" x={540} y={330} t="≈ 20 MIN" cor="#FFD23F" s={pop(f, em(19, "vinte"))} />);
  // recarregando
  if (f >= T(21) - 4 && f < FALAS[21].fim + 12) {
    const k = lim((f - T(21)) / Math.max(1, FALAS[21].fim - T(21)));
    const s = pop(f, T(21) - 4);
    els.push(
      <g key="bateria" transform={`translate(540 520) scale(${s.toFixed(3)})`}>
        <rect x={-260} y={-80} width={500} height={160} rx={28} fill="#0B0F1A" stroke="#FFFFFF" strokeWidth={12} />
        <rect x={244} y={-36} width={30} height={72} rx={10} fill="#FFFFFF" />
        <rect x={-242} y={-62} width={Math.max(0, 464 * (0.12 + 0.88 * k))} height={124} rx={16} fill={k > 0.6 ? "#3FBF6A" : "#FFD23F"} />
        <text y={150} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={56} fill="#FFFFFF" stroke="#000" strokeWidth={12} paintOrder="stroke">RECARREGANDO</text>
      </g>,
    );
  }
  // o conselho de sempre
  if (f >= em(22, "que estalar") && f < FALAS[22].fim + 14) {
    const s = pop(f, em(22, "que estalar"));
    els.push(
      <g key="balao" transform={`translate(560 420) scale(${s.toFixed(3)})`}>
        <path d="M -400 -130 Q -400 -170 -360 -170 L 360 -170 Q 400 -170 400 -130 L 400 90 Q 400 130 360 130 L -60 130 L -160 220 L -150 130 L -360 130 Q -400 130 -400 90 Z" fill="#FFFFFF" stroke="#000" strokeWidth={10} />
        <text y={-8} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={78} fill="#111">VAI DAR</text>
        <text y={84} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={78} fill="#E0362C">ARTRITE!</text>
      </g>,
    );
  }
  // uma mão estala, a outra nunca
  if (f >= T(24) && f < T(26)) {
    els.push(<Pilula key="estala" x={540} y={300} t="ESTALA" cor="#FFD23F" s={pop(f, em(24, "ele estalou"))} />);
    els.push(<Pilula key="nunca" x={540} y={1660} t="NUNCA" cor="#9FE3FF" s={pop(f, em(25, "Nunca"))} />);
  }
  // os anos passando
  if (f >= T(26) - 2 && f < T(28)) {
    const k = lim((f - T(26)) / Math.max(1, FALAS[27].fim - T(26)));
    const ano = Math.max(1, Math.round(1 + 59 * k));
    els.push(<Txt key="ano" x={540} y={520} t={`ANO ${ano}`} tam={150} cor="#FFD23F" s={pop(f, T(26) - 2)} />);
  }
  // sem artrite nas duas, e o prêmio
  if (f >= T(28) && f < T(30)) {
    els.push(<Pilula key="sa1" x={540} y={300} t="SEM ARTRITE ✓" cor="#7CF2A8" s={pop(f, em(28, "artrite") - 6)} />);
    els.push(<Pilula key="sa2" x={540} y={1660} t="SEM ARTRITE ✓" cor="#7CF2A8" s={pop(f, em(28, "artrite"))} />);
    const sp = pop(f, em(29, "prêmio"));
    if (sp > 0) {
      els.push(
        <g key="premio" transform={`translate(540 960) scale(${sp.toFixed(3)})`}>
          <path d="M -60 -230 L -110 -330 L -40 -330 L 0 -260 L 40 -330 L 110 -330 L 60 -230 Z" fill="#3C6FE0" stroke="#000" strokeWidth={8} />
          <circle r={150} cy={-90} fill="#FFD23F" stroke="#000" strokeWidth={10} />
          <circle r={112} cy={-90} fill="none" stroke="#C99A12" strokeWidth={10} />
          <text y={-64} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={84} fill="#7A5A00">IG</text>
          <text y={140} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={64} fill="#FFFFFF" stroke="#000" strokeWidth={14} paintOrder="stroke">PRÊMIO IG NOBEL</text>
          <text y={210} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={52} fill="#FFD23F" stroke="#000" strokeWidth={12} paintOrder="stroke">2009</text>
        </g>,
      );
    }
  }
  // a pergunta final (fica até o fim)
  if (f >= T(30)) {
    const s = pop(f, T(30));
    els.push(<Txt key="q1" x={540} y={1240} t="QUANTAS VEZES" tam={104} s={s} />);
    els.push(<Txt key="q2" x={540} y={1370} t="VOCÊ ESTALOU" tam={104} s={pop(f, em(30, "você estalou"))} />);
    els.push(<Txt key="q3" x={540} y={1500} t="O DEDO?" tam={140} cor="#FFD23F" s={pop(f, em(30, "o dedo"))} />);
  }
  if (f >= DURACAO) return null;
  return <g>{els}</g>;
};
