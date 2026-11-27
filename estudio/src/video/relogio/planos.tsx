// Os 27 planos do Shorts "por que todo relógio de propaganda marca 10h10", presos às falas (tempo.ts).
// Tudo é 2D/2,5D em SVG: o mostrador é geometria pura, então um relógio só, girado, aproximado e trocado de cor.
import React from "react";
import { FONTE } from "../../fontes";
import { CORTE, DURACAO, FALAS, T, fracDe } from "./tempo";
import { Digital, ESTILOS, Relogio, angulos, sombreia, type Estilo } from "./Relogio";

export type Plano = { n: number; de: number; ate: number; desc: string; Cena: React.FC<{ f: number }> };

const em = (id: number, trecho: string) => T(id, fracDe(id, trecho));
const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const suave = (t: number) => { const x = lim(t); return x * x * (3 - 2 * x); };
const entre = (f: number, a: number, b: number) => suave((f - a) / Math.max(1, b - a));
const pop = (f: number, de: number, dur = 7) => {
  if (f < de) return 0;
  const k = lim((f - de) / dur);
  return 1 + 0.16 * Math.sin(k * Math.PI) - (1 - k) * (1 - k) * 0.9 * (k < 1 ? 1 : 0);
};

// ------------------------------------------------------------------ fundos
const Fundo: React.FC<{ a: string; b: string; f: number; bokeh?: string }> = ({ a, b, f, bokeh = "#FFFFFF" }) => {
  const id = `fg${a.slice(1)}${b.slice(1)}`;
  return (
    <g>
      <defs><radialGradient id={id} cx="0.5" cy="0.42" r="0.8"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient></defs>
      <rect width={1080} height={1920} fill={`url(#${id})`} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={(i * 263 + f * (0.3 + (i % 3) * 0.2)) % 1180 - 50} cy={(i * 431) % 1920} r={30 + (i % 4) * 26} fill={bokeh} opacity={0.035 + (i % 3) * 0.012} />
      ))}
    </g>
  );
};
const Spot: React.FC<{ y?: number }> = ({ y = 900 }) => (
  <g>
    <defs><radialGradient id="spot" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFFFFF" stopOpacity={0.16} /><stop offset="1" stopColor="#FFFFFF" stopOpacity={0} /></radialGradient></defs>
    <ellipse cx={540} cy={y} rx={620} ry={620} fill="url(#spot)" />
  </g>
);
/** relógio centrado num ponto, com escala e giro de câmera */
const Rel: React.FC<{ x?: number; y?: number; s?: number; rot?: number; e: Estilo; hora?: number; min?: number; seg?: number; logo?: number; brilho?: number; semPulseira?: boolean; semSegundos?: boolean }> = ({ x = 540, y = 900, s = 1, rot = 0, e, hora, min, seg, logo, brilho, semPulseira, semSegundos }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <Relogio estilo={e} r={300} hora={hora} min={min} seg={seg} mostraLogo={logo} brilhoPonteiros={brilho} semPulseira={semPulseira} semSegundos={semSegundos} />
  </g>
);
const Titulo: React.FC<{ f: number; de: number; topo: string; grande: string; cor?: string }> = ({ f, de, topo, grande, cor = "#FFD23F" }) => {
  const s1 = pop(f, de), s2 = pop(f, de + 6);
  return (
    <g>
      {s1 > 0 && <g transform={`translate(540 800) scale(${s1})`}><text textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={70} letterSpacing={10} fill="#FFFFFF" opacity={0.85}>{topo}</text></g>}
      {s2 > 0 && <g transform={`translate(540 960) scale(${s2})`}><text textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={grande.length > 10 ? 120 : 160} fill={cor} stroke="#000" strokeWidth={16} paintOrder="stroke">{grande}</text></g>}
    </g>
  );
};
const Rotulo: React.FC<{ x: number; y: number; t: string; s: number; cor?: string; tam?: number }> = ({ x, y, t, s, cor = "#FFFFFF", tam = 76 }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <text y={tam * 0.35} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor} stroke="#000" strokeWidth={tam * 0.2} strokeLinejoin="round" paintOrder="stroke">{t}</text>
    </g>
  );

const A1010 = angulos(10, 10);
const E = ESTILOS;
/** minutos desde 0h para ângulos de ponteiros */
const deMinutos = (t: number) => angulos(Math.floor(t / 60), t % 60);

// ------------------------------------------------------------------ os planos
const p = (n: number, de: number, ate: number, desc: string, Cena: React.FC<{ f: number }>): Plano => ({ n, de, ate, desc, Cena });

export const PLANOS: Plano[] = [
  // 1. um mostrador preenchendo a tela, 10h10
  p(1, 0, CORTE(1), "mostrador gigante em 10h10", ({ f }) => (
    <g>
      <Fundo a="#2A3448" b="#07090E" f={f} />
      <Spot />
      <Rel e={E.classico} s={1.55 + f * 0.0018} y={930} semPulseira />
    </g>
  )),
  // 2. outro relógio, outro estilo, mesma hora
  p(2, CORTE(1), T(3), "segundo relógio, mesma hora", ({ f }) => {
    const k = entre(f, CORTE(1), T(3));
    return (
      <g>
        <Fundo a="#1C2C3E" b="#05080C" f={f} />
        <Spot />
        <Rel e={E.mergulho} s={1.25 + 0.08 * k} rot={-6 + 6 * k} y={920} />
      </g>
    );
  }),
  // 3. terceiro, quarto (digital), quinto: corte rápido
  p(3, T(3), CORTE(4), "três relógios em corte rápido", ({ f }) => {
    const d = CORTE(4) - T(3);
    const i = Math.min(2, Math.floor(((f - T(3)) / d) * 3));
    return (
      <g>
        <Fundo a={["#203A5C", "#2A2A2A", "#21402F"][i]} b="#05070A" f={f} />
        <Spot />
        {i === 0 && <Rel e={E.azul} s={1.3} y={910} rot={4} />}
        {i === 1 && <g transform="translate(540 920) scale(1.25)"><Digital /></g>}
        {i === 2 && <Rel e={E.verde} s={1.3} y={910} rot={-4} />}
      </g>
    );
  }),
  // 4. grade de doze relógios, todos em 10h10
  p(4, CORTE(4), em(5, "há décadas"), "grade de doze relógios", ({ f }) => {
    const nomes = Object.keys(E);
    return (
      <g>
        <Fundo a="#2A2F3A" b="#08090C" f={f} />
        {nomes.map((n, i) => {
          const s = pop(f, CORTE(4) + i * 2.5, 6);
          return s > 0 ? <Rel key={n} e={E[n]} x={190 + (i % 3) * 350} y={260 + Math.floor(i / 3) * 370} s={0.45 * s} semPulseira /> : null;
        })}
      </g>
    );
  }),
  // 5. zoom até um único mostrador
  p(5, em(5, "há décadas"), CORTE(6), "zoom até um mostrador", ({ f }) => {
    const k = entre(f, em(5, "há décadas"), CORTE(6) - 8);
    const nomes = Object.keys(E);
    const s = 1 + 2.4 * k;
    const alvo = { x: 540, y: 260 + 370 }; // o relógio do meio da segunda linha
    return (
      <g>
        <Fundo a="#2A2F3A" b="#08090C" f={f} />
        <g transform={`translate(540 ${900}) scale(${s}) translate(${-alvo.x} ${-alvo.y})`}>
          {nomes.map((n, i) => <Rel key={n} e={E[n]} x={190 + (i % 3) * 350} y={260 + Math.floor(i / 3) * 370} s={0.45} semPulseira />)}
        </g>
      </g>
    );
  }),
  // 6. letreiro: motivo um
  p(6, CORTE(6), CORTE(7), "letreiro: motivo um", ({ f }) => (
    <g>
      <Fundo a="#1E2A4A" b="#06080F" f={f} />
      <g opacity={0.25}><Rel e={E.branco} s={1.7} y={900} semPulseira /></g>
      <Titulo f={f} de={CORTE(6) + 2} topo="MOTIVO 1" grande="SIMETRIA" />
    </g>
  )),
  // 7. a linha de simetria descendo pelo meio
  p(7, CORTE(7), em(8, "formam"), "linha de simetria", ({ f }) => {
    const k = entre(f, CORTE(7) + 3, em(8, "formam"));
    return (
      <g>
        <Fundo a="#2A3448" b="#07090E" f={f} />
        <Spot />
        <Rel e={E.branco} s={1.5} y={900} semPulseira />
        <line x1={540} y1={360} x2={540} y2={360 + 1080 * k} stroke="#FFD23F" strokeWidth={8} strokeDasharray="30 18" />
      </g>
    );
  }),
  // 8. os ponteiros destacados formando o V
  p(8, em(8, "formam"), CORTE(8), "o V dos ponteiros", ({ f }) => {
    const k = entre(f, em(8, "formam"), em(8, "formam") + 10);
    const v = entre(f, em(8, "V quase"), em(8, "V quase") + 10);
    const R = 300 * 1.5;
    const ph = { x: 540 + Math.sin((A1010.hora * Math.PI) / 180) * R * 0.52, y: 900 - Math.cos((A1010.hora * Math.PI) / 180) * R * 0.52 };
    const pm = { x: 540 + Math.sin((A1010.min * Math.PI) / 180) * R * 0.8, y: 900 - Math.cos((A1010.min * Math.PI) / 180) * R * 0.8 };
    return (
      <g>
        <Fundo a="#2A3448" b="#07090E" f={f} />
        <Spot />
        <Rel e={E.branco} s={1.5} y={900} brilho={k} semPulseira />
        {v > 0 && <path d={`M ${ph.x} ${ph.y} L 540 900 L ${pm.x} ${pm.y}`} fill="none" stroke="#FFD23F" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={`${v} 1`} />}
        <Rotulo x={540} y={300} t="V" s={pop(f, em(8, "V quase"))} cor="#FFD23F" tam={180} />
      </g>
    );
  }),
  // 9. o V espelhado dos dois lados: equilíbrio
  p(9, CORTE(8), CORTE(9), "equilíbrio: os dois lados espelham", ({ f }) => {
    const k = entre(f, CORTE(8) + 4, em(9, "equilíbrio"));
    return (
      <g>
        <Fundo a="#2C2A44" b="#07060E" f={f} />
        <Spot />
        <defs>
          <clipPath id="esq"><rect x={0} y={0} width={540} height={1920} /></clipPath>
          <clipPath id="dir"><rect x={540} y={0} width={540} height={1920} /></clipPath>
        </defs>
        <g clipPath="url(#esq)"><Rel e={E.branco} s={1.5} y={900} semPulseira semSegundos /></g>
        <g clipPath="url(#dir)" opacity={k}><g transform="translate(1080 0) scale(-1 1)"><Rel e={E.branco} s={1.5} y={900} semPulseira semSegundos /></g></g>
        <g clipPath="url(#dir)" opacity={1 - k}><Rel e={E.branco} s={1.5} y={900} semPulseira semSegundos /></g>
        <line x1={540} y1={300} x2={540} y2={1500} stroke="#FFD23F" strokeWidth={6} opacity={0.8} />
        <Rotulo x={540} y={1460} t="EQUILÍBRIO" s={pop(f, em(9, "equilíbrio"))} cor="#FFD23F" tam={96} />
      </g>
    );
  }),
  // 10. letreiro: motivo dois
  p(10, CORTE(9), em(10, "esse V abre"), "letreiro: motivo dois", ({ f }) => (
    <g>
      <Fundo a="#3A2A1E" b="#0C0806" f={f} />
      <g opacity={0.25}><Rel e={E.classico} s={1.7} y={900} semPulseira /></g>
      <Titulo f={f} de={CORTE(9) + 2} topo="MOTIVO 2" grande="O ESPAÇO" />
    </g>
  )),
  // 11. o espaço vazio entre os ponteiros acende
  p(11, em(10, "esse V abre"), em(10, "logo abaixo"), "o espaço entre os ponteiros acende", ({ f }) => {
    const k = entre(f, em(10, "espaço vazio"), em(10, "espaço vazio") + 12);
    return (
      <g>
        <Fundo a="#3A2A1E" b="#0C0806" f={f} />
        <Spot />
        <Rel e={E.classico} s={1.5} y={900} logo={0} semPulseira />
        <defs><radialGradient id="luzV"><stop offset="0" stopColor="#FFE27A" stopOpacity={0.85} /><stop offset="1" stopColor="#FFE27A" stopOpacity={0} /></radialGradient></defs>
        <path d={`M 540 900 L ${540 - 300} ${900 - 300} A 420 420 0 0 1 ${540 + 320} ${900 - 290} Z`} fill="url(#luzV)" opacity={0.75 * k} />
      </g>
    );
  }),
  // 12. a câmera desce do 12 até esse espaço
  p(12, em(10, "logo abaixo"), CORTE(11), "a câmera desce do 12 até o espaço", ({ f }) => {
    const k = entre(f, em(10, "logo abaixo"), CORTE(11) - 4);
    const s = 2.6;
    const y12 = -300 * 0.78, yLogo = -300 * 0.47;
    const yAlvo = y12 + (yLogo - y12) * k;
    return (
      <g>
        <Fundo a="#3A2A1E" b="#0C0806" f={f} />
        <g transform={`translate(540 900) scale(${s}) translate(0 ${-yAlvo})`}>
          <Relogio estilo={E.classico} r={300} mostraLogo={0} semPulseira />
        </g>
        <Rotulo x={540} y={1300} t="?" s={pop(f, em(11, "escrito"))} cor="#FFD23F" tam={200} />
      </g>
    );
  }),
  // 13. a marca (inventada) aparece exatamente ali
  p(13, CORTE(11), CORTE(12), "a marca aparece no espaço", ({ f }) => {
    const k = entre(f, T(12), T(12) + 8);
    return (
      <g>
        <Fundo a="#3A2A1E" b="#0C0806" f={f} />
        <g transform={`translate(540 900) scale(2.6) translate(0 ${300 * 0.47})`}>
          <Relogio estilo={E.classico} r={300} mostraLogo={k} semPulseira />
        </g>
        <Rotulo x={540} y={1320} t="A MARCA" s={pop(f, T(12))} cor="#FFD23F" tam={110} />
      </g>
    );
  }),
  // 14. os ponteiros vão para outra hora e cobrem a marca
  p(14, CORTE(12), CORTE(13), "os ponteiros cobrem a marca", ({ f }) => {
    const k = entre(f, CORTE(12) + 2, CORTE(13) - 10);
    const t = 610 + (720 - 610) * k; // 10h10 -> 12h00
    const a = deMinutos(t);
    return (
      <g>
        <Fundo a="#3A2A1E" b="#0C0806" f={f} />
        <Spot />
        <Rel e={E.classico} s={1.5} y={900} hora={a.hora} min={a.min} semSegundos semPulseira />
        {k > 0.85 && <Rotulo x={540} y={330} t="✗ TAPOU A MARCA" s={pop(f, CORTE(13) - 10)} cor="#FF5A4E" tam={76} />}
      </g>
    );
  }),
  // 15. voltam para 10h10: a marca reaparece, emoldurada
  p(15, CORTE(13), CORTE(14), "de volta ao 10h10: a marca emoldurada", ({ f }) => {
    const k = entre(f, CORTE(13) + 2, CORTE(13) + 22);
    const t = 720 + (610 + 720 - 720) * 0 + (610 - 720) * k;
    const a = deMinutos(t);
    const R = 450;
    return (
      <g>
        <Fundo a="#3A2A1E" b="#0C0806" f={f} />
        <Spot />
        <Rel e={E.classico} s={1.5} y={900} hora={a.hora} min={a.min} semSegundos semPulseira />
        {k >= 1 && <rect x={540 - 170} y={900 - R * 0.47 - 110} width={340} height={150} rx={20} fill="none" stroke="#FFD23F" strokeWidth={8} opacity={entre(f, CORTE(13) + 22, CORTE(13) + 30)} />}
        <Rotulo x={540} y={1460} t="EMOLDURADA" s={pop(f, em(14, "emoldurando"))} cor="#FFD23F" tam={96} />
      </g>
    );
  }),
  // 16. letreiro: motivo três
  p(16, CORTE(14), CORTE(15), "letreiro: motivo três", ({ f }) => (
    <g>
      <Fundo a="#1E3A36" b="#050C0B" f={f} />
      <g opacity={0.25}><Rel e={E.crono} s={1.7} y={900} semPulseira /></g>
      <Titulo f={f} de={CORTE(14) + 2} topo="MOTIVO 3" grande="NADA COBERTO" />
    </g>
  )),
  // 17. o mostrador completo, com data e submostradores
  p(17, CORTE(15), em(16, "que normalmente"), "mostrador com data e submostradores", ({ f }) => {
    const sd = pop(f, em(16, "janelinha")), ss = pop(f, em(16, "mostradores pequenos"));
    const R = 300 * 1.45;
    return (
      <g>
        <Fundo a="#1E3A36" b="#050C0B" f={f} />
        <Spot />
        <Rel e={E.crono} s={1.45} y={900} semPulseira />
        {sd > 0 && <g transform={`translate(${540 + R * 0.64} 900) scale(${sd})`}><rect x={-50} y={-40} width={100} height={80} rx={12} fill="none" stroke="#FFD23F" strokeWidth={8} /></g>}
        {ss > 0 && [[540 - R * 0.45, 900], [540, 900 + R * 0.45]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y}) scale(${ss})`}><circle r={R * 0.22} fill="none" stroke="#FFD23F" strokeWidth={8} /></g>)}
      </g>
    );
  }),
  // 18. os ponteiros giram e tapam cada elemento, um por um
  p(18, em(16, "que normalmente"), CORTE(16), "os ponteiros tapam cada elemento", ({ f }) => {
    const k = entre(f, em(16, "que normalmente"), CORTE(16));
    const t = 9 * 60 + 10 + 35 * k; // 9h10 -> 9h45 (passa pela data, pelo de baixo e pelo da esquerda)
    const a = deMinutos(t);
    const R = 300 * 1.45;
    const coberto = (mAlvo: number) => Math.abs(((t % 60) - mAlvo)) < 4;
    return (
      <g>
        <Fundo a="#1E3A36" b="#050C0B" f={f} />
        <Spot />
        <Rel e={E.crono} s={1.45} y={900} hora={a.hora} min={a.min} semSegundos semPulseira />
        {coberto(15) && <rect x={540 + R * 0.64 - 50} y={860} width={100} height={80} rx={12} fill="#FF3B30" opacity={0.35} />}
        {coberto(30) && <circle cx={540} cy={900 + R * 0.45} r={R * 0.22} fill="#FF3B30" opacity={0.35} />}
        {coberto(45) && <circle cx={540 - R * 0.45} cy={900} r={R * 0.22} fill="#FF3B30" opacity={0.35} />}
        {(coberto(15) || coberto(30) || coberto(45)) && <Rotulo x={540} y={300} t="✗ TAPADO" s={1} cor="#FF5A4E" tam={80} />}
      </g>
    );
  }),
  // 19. param no 10h10: nada coberto, tudo visível
  p(19, CORTE(16), CORTE(17), "10h10: tudo visível", ({ f }) => {
    const k = entre(f, CORTE(16), CORTE(16) + 18);
    const t = 9 * 60 + 45 + 25 * k; // 9h45 -> 10h10
    const a = deMinutos(t);
    const R = 300 * 1.45;
    const ok = entre(f, CORTE(16) + 18, CORTE(16) + 26);
    return (
      <g>
        <Fundo a="#1E3A36" b="#050C0B" f={f} />
        <Spot />
        <Rel e={E.crono} s={1.45} y={900} hora={a.hora} min={a.min} semSegundos semPulseira />
        {ok > 0 && (
          <g opacity={ok}>
            <rect x={540 + R * 0.64 - 50} y={860} width={100} height={80} rx={12} fill="none" stroke="#3FBF6A" strokeWidth={8} />
            <circle cx={540} cy={900 + R * 0.45} r={R * 0.22} fill="none" stroke="#3FBF6A" strokeWidth={8} />
            <circle cx={540 - R * 0.45} cy={900} r={R * 0.22} fill="none" stroke="#3FBF6A" strokeWidth={8} />
          </g>
        )}
        <Rotulo x={540} y={300} t="✓ TUDO VISÍVEL" s={pop(f, CORTE(16) + 22)} cor="#5BE08A" tam={80} />
      </g>
    );
  }),
  // 20. o V vira uma boca sorrindo (sutil) — "ninguém prova"
  p(20, CORTE(17), CORTE(18), "o V vira um sorriso (não comprovado)", ({ f }) => {
    const fs = em(18, "sorriso");
    const k = entre(f, fs - 6, fs + 10);
    const R = 300 * 1.5;
    const ph = { x: Math.sin((A1010.hora * Math.PI) / 180) * R * 0.52, y: -Math.cos((A1010.hora * Math.PI) / 180) * R * 0.52 };
    const pm = { x: Math.sin((A1010.min * Math.PI) / 180) * R * 0.8, y: -Math.cos((A1010.min * Math.PI) / 180) * R * 0.8 };
    const cy = 0 + 260 * k; // o vértice do V desce e vira curva
    return (
      <g>
        <Fundo a="#3A2440" b="#0B060E" f={f} />
        <Spot />
        <Rel e={E.rose} s={1.5} y={900} semPulseira semSegundos />
        <path d={`M ${540 + ph.x} ${900 + ph.y} Q 540 ${900 + cy} ${540 + pm.x} ${900 + pm.y}`} fill="none" stroke="#FFD23F" strokeWidth={14} strokeLinecap="round" opacity={0.25 + 0.75 * entre(f, fs - 16, fs - 4)} />
        <Rotulo x={540} y={300} t="QUARTO MOTIVO?" s={pop(f, T(18))} cor="#FFFFFF" tam={80} />
        <Rotulo x={540} y={1470} t="NINGUÉM PROVA" s={pop(f, em(18, "ninguém prova"))} cor="#FF9E5E" tam={80} />
      </g>
    );
  }),
  // 21. o fundo muda de cor: entra o bloco dos mitos
  p(21, CORTE(18), CORTE(19), "fundo muda: os mitos", ({ f }) => {
    const k = entre(f, CORTE(18), CORTE(18) + 10);
    return (
      <g>
        <Fundo a="#3A2440" b="#0B060E" f={f} />
        <rect width={1080} height={1920} fill="#7A1218" opacity={k} />
        <Titulo f={f} de={CORTE(18) + 4} topo="O QUE TE CONTARAM" grande="MENTIRA" cor="#FF5A4E" />
      </g>
    );
  }),
  // 22 e 23. os três cartões e os três riscados
  p(22, CORTE(19), CORTE(20), "cartão: Lincoln", ({ f }) => <g><Fundo a="#5A1016" b="#14030A" f={f} /><Cartoes f={f} /></g>),
  p(23, CORTE(20), CORTE(23), "cartões: Kennedy e Hiroshima, riscados", ({ f }) => <g><Fundo a="#5A1016" b="#14030A" f={f} /><Cartoes f={f} /></g>),
  // 24. é só design (e uma empresa quebra a regra)
  p(24, CORTE(23), CORTE(25), "é só design; uma empresa quebra a regra", ({ f }) => {
    const quebra = f >= em(25, "quebra");
    return (
      <g>
        <Fundo a="#1E2A4A" b="#06080F" f={f} />
        {!quebra && <Titulo f={f} de={T(24)} topo="" grande="É SÓ DESIGN" />}
        {quebra && (
          <g>
            <Rel e={E.azul} s={1.3} y={900} semPulseira />
            <Rotulo x={540} y={1480} t="QUEBRA A REGRA" s={pop(f, em(25, "quebra"))} cor="#FF5A4E" tam={90} />
          </g>
        )}
      </g>
    );
  }),
  // 25. uma tela de celular genérica marcando 9h41
  p(25, CORTE(25), CORTE(26), "celular genérico: 9h41", ({ f }) => {
    const s = 0.9 + 0.1 * entre(f, CORTE(25), CORTE(25) + 12);
    return (
      <g>
        <Fundo a="#20283A" b="#05070C" f={f} />
        <Spot />
        <g transform={`translate(540 940) scale(${s})`}>
          <rect x={-300 + 14} y={-620 + 20} width={600} height={1240} rx={90} fill="#000" opacity={0.45} />
          <rect x={-300} y={-620} width={600} height={1240} rx={90} fill="#15171C" stroke="#3A3E48" strokeWidth={10} />
          <defs><linearGradient id="papel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3E5BA8" /><stop offset="0.55" stopColor="#7A4FA0" /><stop offset="1" stopColor="#E08A5E" /></linearGradient></defs>
          <rect x={-272} y={-592} width={544} height={1184} rx={70} fill="url(#papel)" />
          <text y={-330} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={180} fill="#FFFFFF" opacity={0.95}>9:41</text>
          <rect x={-90} y={540} width={180} height={10} rx={5} fill="#FFFFFF" opacity={0.7} />
        </g>
        <Rotulo x={540} y={180} t="9:41" s={pop(f, em(26, "nove e quarenta"))} cor="#FFD23F" tam={110} />
      </g>
    );
  }),
  // 26. palco escuro, uma silhueta ao longe, o ano: 2007
  p(26, CORTE(26), CORTE(27), "palco escuro, silhueta, 2007", ({ f }) => {
    const k = entre(f, CORTE(26), CORTE(27));
    return (
      <g>
        <rect width={1080} height={1920} fill="#040508" />
        <defs><linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity={0.22} /><stop offset="1" stopColor="#FFFFFF" stopOpacity={0.02} /></linearGradient></defs>
        <path d="M 500 0 L 580 0 L 760 1300 L 320 1300 Z" fill="url(#cone)" />
        <rect x={240} y={560} width={600} height={340} rx={16} fill="#0E1424" stroke="#1E2A44" strokeWidth={6} opacity={0.9} />
        <ellipse cx={540} cy={1300} rx={320} ry={40} fill="#FFFFFF" opacity={0.08} />
        <g transform={`translate(540 1295) scale(${0.9 + 0.05 * k})`} fill="#000">
          <circle cy={-250} r={34} />
          <path d="M -60 -210 Q 0 -230 60 -210 L 74 -60 L 40 -60 L 34 0 L -34 0 L -40 -60 L -74 -60 Z" />
        </g>
        <Rotulo x={540} y={1560} t="2007" s={pop(f, em(27, "dois mil"))} cor="#FFFFFF" tam={170} />
      </g>
    );
  }),
  // 27. de volta ao primeiro plano: vitrine com vários relógios; a pergunta final
  p(27, CORTE(27), DURACAO, "vitrine de relógios e a pergunta", ({ f }) => {
    const k = entre(f, CORTE(27), CORTE(27) + 40);
    const nomes = Object.keys(E);
    return (
      <g>
        <Fundo a="#2A3448" b="#07090E" f={f} />
        {/* a vitrine: prateleiras e reflexo do vidro */}
        <g opacity={k}>
          {[520, 1000, 1480].map((y) => <rect key={y} x={0} y={y + 150} width={1080} height={26} fill="#3A3226" />)}
          {nomes.slice(0, 9).map((n, i) => <Rel key={n} e={E[n]} x={190 + (i % 3) * 350} y={500 + Math.floor(i / 3) * 480} s={0.42} semPulseira />)}
          <path d="M 0 0 L 380 0 L 0 900 Z" fill="#FFFFFF" opacity={0.05} />
          <path d="M 700 0 L 1080 0 L 1080 300 L 400 1920 L 200 1920 Z" fill="#FFFFFF" opacity={0.04} />
        </g>
        {/* começa no mesmo mostrador do plano 1 e abre para a vitrine */}
        <g opacity={1 - k}><Rel e={E.classico} s={1.55} y={930} semPulseira /></g>
      </g>
    );
  }),
];

/** cartões dos mitos: Lincoln, Kennedy, Hiroshima, com a hora real; riscados um por um */
const CARTOES: { nome: string; hora: string; aparece: () => number; risca: () => number; y: number }[] = [
  // horários conferidos: Lincoln baleado por volta das 22h15 (14/4/1865); Kennedy às 12h30 (22/11/1963, hora de Dallas);
  // Hiroshima às 8h15 (6/8/1945, hora local). O 10h10 nos anúncios só virou padrão décadas depois de Lincoln.
  { nome: "LINCOLN", hora: "TIRO ~22H15 · 1865", aparece: () => em(20, "Lincoln"), risca: () => em(20, "levou o tiro") + 8, y: 520 },
  { nome: "KENNEDY", hora: "TIRO 12H30 · 1963", aparece: () => em(21, "Kennedy"), risca: () => FALAS[21].fim + 4, y: 860 },
  { nome: "HIROSHIMA", hora: "BOMBA 8H15 · 1945", aparece: () => em(22, "Hiroshima"), risca: () => FALAS[22].fim + 4, y: 1200 },
];
const Cartoes: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {CARTOES.map((c) => {
      const s = pop(f, c.aparece());
      if (s <= 0) return null;
      const r = lim((f - c.risca()) / 6);
      return (
        <g key={c.nome} transform={`translate(540 ${c.y}) scale(${s})`}>
          <rect x={-390 + 10} y={-130 + 14} width={780} height={260} rx={28} fill="#000" opacity={0.4} />
          <rect x={-390} y={-130} width={780} height={260} rx={28} fill="#F4EFE6" stroke="#000" strokeWidth={8} />
          <text y={-14} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={96} fill="#1A1A1A">{c.nome}</text>
          <text y={82} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={62} fill="#8A1C1C">{c.hora}</text>
          {r > 0 && <line x1={-360} y1={60} x2={-360 + 720 * r} y2={-60} stroke="#FF3B30" strokeWidth={24} strokeLinecap="round" />}
          {r >= 1 && <g transform="translate(300 -150) rotate(10)"><rect x={-130} y={-44} width={260} height={84} rx={14} fill="#FF3B30" stroke="#000" strokeWidth={6} /><text y={20} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={54} fill="#FFFFFF">MITO</text></g>}
        </g>
      );
    })}
    {f >= em(23, "nenhuma") && <Rotulo x={540} y={1500} t="NENHUMA SE SUSTENTA" s={pop(f, em(23, "nenhuma"))} cor="#FFD23F" tam={76} />}
  </g>
);

export { sombreia };
