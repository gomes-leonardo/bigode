// Legenda grande do Shorts: a fala em pedaços de 2 a 4 palavras, um de cada vez, no meio de baixo da tela.
// Palavras-chave em amarelo.
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONTE } from "../../fontes";
import { FALAS } from "./tempo";

const CHAVES = /^(INTERNET|MESES|TÉDIO|DINHEIRO|PIX|CONEXÃO|RECORDE|MILHÕES|BILHÕES|TRILHÕES|RODA|PARA|CARTÃO|BANCO|ENTREGA|JUNTO|DÓLARES|FÉRIAS|TELA)$/;
const SEM_LEGENDA = new Set<number>([0]); // a pergunta de abertura já está escrita grande na tela

type Pedaco = { de: number; ate: number; palavras: string[] };

const pedacos: Pedaco[] = FALAS.flatMap((f) => {
  if (SEM_LEGENDA.has(f.id)) return [];
  const palavras = f.texto.split(/\s+/);
  const grupos: string[][] = [];
  let atual: string[] = [];
  for (const p of palavras) {
    atual.push(p);
    const tam = atual.join(" ").length;
    if (/[.,?!:]$/.test(p) || atual.length >= 3 || tam >= 15) {
      grupos.push(atual);
      atual = [];
    }
  }
  if (atual.length) grupos.push(atual);
  const total = grupos.reduce((s, g) => s + g.join(" ").length + 2, 0);
  let t = f.ini;
  return grupos.map((g, i) => {
    const d = ((g.join(" ").length + 2) / total) * (f.fim - f.ini);
    const de = Math.round(t);
    t += d;
    return { de, ate: i === grupos.length - 1 ? f.fim + 5 : Math.round(t), palavras: g };
  });
});

export const Legendas: React.FC = () => {
  const f = useCurrentFrame();
  const p = pedacos.find((x) => f >= x.de && f < x.ate);
  if (!p) return null;
  const k = Math.min(1, (f - p.de) / 3);
  const s = 0.86 + 0.14 * (1 - Math.pow(1 - k, 3));
  const tam = 96;
  const largura = p.palavras.join(" ").length * 0.7 * tam;
  const cabe = Math.min(1, 980 / largura);
  return (
    <g transform={`translate(540 1640) scale(${(s * cabe).toFixed(3)})`}>
      <text x={0} y={0} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} stroke="#000" strokeWidth={tam * 0.2} strokeLinejoin="round" paintOrder="stroke" fill="#FFFFFF">
        {p.palavras.map((w, i) => {
          const limpa = w.replace(/[.,!:]/g, "").toUpperCase();
          return <tspan key={i} fill={CHAVES.test(limpa) ? "#FFD23F" : "#FFFFFF"}>{(i ? " " : "") + w.toUpperCase()}</tspan>;
        })}
      </text>
    </g>
  );
};
