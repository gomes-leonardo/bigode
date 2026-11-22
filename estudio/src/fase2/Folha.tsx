// Fase 2: folha com os 9 objetos (ponto de pega marcado) e as 13 ações da biblioteca.
import React from "react";
import { continueRender, delayRender } from "remotion";
import { Person, maoInfo, type P } from "../components/Person";
import { Palco, Papel } from "../components/Papel";
import { EscalaCtx, Path, Rect } from "../components/prim";
import { LINHA } from "../estilo";
import { FONTE, fontes } from "../fontes";
import * as A from "../rig/actions";
import type { Pose } from "../rig/pose";
import { CELULAR, OBJETOS, ObjetoNaMao, type EstadoObj } from "../objects/objetos";

const Rotulo: React.FC<{ x: number; y: number; t: string; tam?: number; peso?: number; cor?: string }> = ({ x, y, t, tam = 22, peso = 800, cor = LINHA }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONTE} fontWeight={peso} fontSize={tam} fill={cor}>{t}</text>
);
const ALVO = "#E23B2E";
const Mira: React.FC<{ p: P }> = ({ p }) => (
  <g>
    <circle cx={p[0]} cy={p[1]} r={9} fill="none" stroke={ALVO} strokeWidth={3.5} />
    <line x1={p[0] - 15} y1={p[1]} x2={p[0] + 15} y2={p[1]} stroke={ALVO} strokeWidth={3} />
    <line x1={p[0]} y1={p[1] - 15} x2={p[0]} y2={p[1] + 15} stroke={ALVO} strokeWidth={3} />
  </g>
);

const ES = 1.55; // escala dos objetos na folha
const ESP = 0.56; // escala do personagem na folha
const Y1 = 650, Y2 = 1000; // chão das duas fileiras de ações

type Item = { nome: string; desc: string; pose: Pose; extra?: React.ReactNode; maos?: React.ReactNode };
const base = (x: number, y: number) => ({ x, y, scale: ESP });

export const Folha2: React.FC = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const lista = Object.values(OBJETOS);
  // 13 ações: 7 na primeira fileira, 6 na segunda
  const xs1 = Array.from({ length: 7 }, (_, i) => 150 + i * 270);
  const xs2 = Array.from({ length: 6 }, (_, i) => 200 + i * 300);
  const cel = A.lookAtPhone(base(xs2[5], Y2))(10);
  const mCel = maoInfo(cel, "L");
  const andar = A.walk({ ...base(xs1[1] - 30, Y1), xa: xs1[1] - 30, xb: xs1[1] + 60, f0: 0, passo: 86 });
  const acoes: Item[] = [
    { nome: "idle", desc: "respira, cabeça balança", pose: A.idle(base(xs1[0], Y1))(20) },
    { nome: "walk", desc: "pés por alvo (passo lateral)", pose: andar(5) },
    { nome: "pocket", desc: "mãos no bolso", pose: A.pocket(base(xs1[2], Y1))(10) },
    { nome: "crossArms", desc: "braços cruzados", pose: A.crossArms(base(xs1[3], Y1))(10) },
    { nome: "shrug", desc: "dar de ombros", pose: A.shrug(base(xs1[4], Y1))(12) },
    { nome: "point", desc: "apontar", pose: A.point({ ...base(xs1[5], Y1) })(14) },
    { nome: "wave", desc: "acenar", pose: A.wave(base(xs1[6], Y1))(10) },
    { nome: "celebrate", desc: "comemorar (pula)", pose: A.celebrate(base(xs2[0], Y2))(5) },
    { nome: "scared", desc: "susto", pose: A.scared(base(xs2[1], Y2))(5) },
    {
      nome: "sit", desc: "sentar (no assento)", pose: A.sit({ ...base(xs2[2], Y2), assento: 66 })(24),
      extra: (
        <EscalaCtx.Provider value={ESP}>
          <g transform={`translate(${xs2[2]} ${Y2}) scale(${ESP})`}>
            <Papel>
              <Path d="M -74 -52 L -80 0 M 74 -52 L 80 0" stroke={LINHA} strokeWidth={16} strokeLinecap="round" />
              <Path d="M -74 -52 L -80 0 M 74 -52 L 80 0" stroke="#A86F43" strokeWidth={7} strokeLinecap="round" />
              <Rect x={-96} y={-70} width={192} height={20} rx={8} fill="#C68B59" stroke={LINHA} strokeWidth={7} />
            </Papel>
          </g>
        </EscalaCtx.Provider>
      ),
    },
    { nome: "fall", desc: "cair", pose: A.fall({ ...base(xs2[3] - 60, Y2 - 34), lado: 1 })(30) },
    { nome: "hug", desc: "abraçar", pose: A.hug(base(xs2[4], Y2))(20) },
    {
      nome: "lookAtPhone", desc: "olhar o celular", pose: cel,
      maos: <ObjetoNaMao def={CELULAR} mao={mCel.pos} ang={mCel.ang - mCel.ang + 8} e={{ t: 0, vira: 1 }} />,
    },
  ];
  return (
    <Palco>
      <Rotulo x={960} y={52} t="9 objetos · a mira vermelha é o ponto de pega (onde o punho fecha)" tam={24} />
      {(() => {
        // largura de cada objeto (px locais, da esquerda para a direita a partir do apoio) para espaçar a fileira
        const caixa: Record<string, [number, number]> = { "xícara": [-21, 33], celular: [-15, 15], panela: [-122, 56], prato: [-46, 46], bola: [-24, 24], chinelo: [-38, 40], copo: [-16, 16], controle: [-34, 34], mochila: [-37, 37] };
        const vao = 92;
        const total = lista.reduce((a, o) => a + (caixa[o.nome][1] - caixa[o.nome][0]) * ES, 0) + vao * (lista.length - 1);
        let x = (1920 - total) / 2;
        return lista.map((o) => {
          const [c0, c1] = caixa[o.nome];
          const ax = x - c0 * ES; // apoio do objeto
          const cx = x + ((c1 - c0) * ES) / 2;
          x += (c1 - c0) * ES + vao;
          const e: EstadoObj = { t: 0.6, quente: o.nome === "panela" ? 0.3 : 0, vira: o.nome === "celular" ? 1 : 0 };
          const pg = o.pega(e);
          return (
            <g key={o.nome}>
              <EscalaCtx.Provider value={ES}>
                <g transform={`translate(${ax} 250) scale(${ES})`}>
                  <o.Desenho {...e} />
                </g>
              </EscalaCtx.Provider>
              <Mira p={[ax + pg[0] * ES, 250 + pg[1] * ES]} />
              <Rotulo x={cx} y={300} t={o.nome} />
              <Rotulo x={cx} y={326} t={`peso ${o.peso}`} tam={16} peso={600} cor="#6E6A62" />
            </g>
          );
        });
      })()}
      <line x1={80} y1={356} x2={1840} y2={356} stroke="#CFC9BE" strokeWidth={3} strokeDasharray="12 10" />
      {acoes.map((a, i) => {
        const cx = i < 7 ? xs1[i] : xs2[i - 7];
        const y = i < 7 ? Y1 : Y2;
        return (
          <g key={a.nome}>
            {a.extra}
            <Person {...a.pose} blink={0} semente={i + 1} propsHands={a.maos} />
            <Rotulo x={cx} y={y + 34} t={a.nome} />
            <Rotulo x={cx} y={y + 56} t={a.desc} tam={15} peso={600} cor="#6E6A62" />
          </g>
        );
      })}
    </Palco>
  );
};
