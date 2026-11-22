// Fase 4: um quadro de cada cenário, com o personagem apoiado na âncora certa.
import React from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { Person, maoInfo, type P, type PersonProps } from "../components/Person";
import { FPS } from "../estilo";
import { fontes } from "../fontes";
import { idle, sit, walk } from "../rig/actions";
import type { Pose } from "../rig/pose";
import { paraLocal } from "../rig/manuseio";
import { AMIGO, ELENCO, MAE, MEDICA, PADEIRO, PROTAGONISTA, VO, figurante, type Ator } from "../elenco/elenco";
import { BOLA, CELULAR, CONTROLE, COPO, MOCHILA, ObjetoNaMao, ObjetoNoMundo, PANELA, PRATO, XICARA, type EstadoObj, type ObjetoDef } from "../objects/objetos";
import { Cena, type CenarioDef } from "../cenarios/Cena";
import { apoioEm, emPe, sentadoEm, type SetJson } from "../cenarios/ancoras";
import { COZINHA } from "../cenarios/cozinha/Cozinha";
import { QUARTO } from "../cenarios/quarto/Quarto";
import { SALA } from "../cenarios/sala/Sala";
import { CONSULTORIO } from "../cenarios/consultorio/Consultorio";
import { PADARIA } from "../cenarios/padaria/Padaria";
import { RUA } from "../cenarios/rua/Rua";
import { CAMPINHO } from "../cenarios/campinho/Campinho";

export const props = (a: Ator) => {
  const { nome: _n, desc: _d, expr: _e, scale: _s, ...resto } = a;
  return resto;
};
/** ator em pé numa linha de chão (o y vem da âncora) */
export const emPeNa = (a: Ator, set: SetJson, ancora: string, x: number, f: number, extra: Partial<Pose> = {}, prof = 0): PersonProps => {
  const base = emPe(set, ancora, x, prof, a.scale ?? 1);
  return { ...props(a), ...idle({ ...base, wide: a.wide })(f), expr: a.expr, ...extra };
};
/** ator sentado num assento / quina da cama / maca (o y e a altura vêm da âncora) */
export const sentadoNa = (a: Ator, set: SetJson, ancora: string, f: number, extra: Partial<Pose> = {}): PersonProps => {
  const { assento, ...base } = sentadoEm(set, ancora, a.scale ?? 1);
  return { ...props(a), ...sit({ ...base, wide: a.wide, assento })(f + 30), expr: a.expr, ...extra };
};
/** objeto apoiado numa âncora */
export const Obj: React.FC<{ def: ObjetoDef; set: SetJson; ancora: string; x?: number; e: EstadoObj }> = ({ def, set, ancora, x, e }) => (
  <ObjetoNoMundo def={def} em={apoioEm(set, ancora, x)} s={set.escala} e={e} />
);
/** segura o celular na mão esquerda na frente do peito e olha para ele (abaixa = quanto o tronco desceu ao sentar) */
export const comCelular = (p: PersonProps, t: number): PersonProps => {
  const ab = p.abaixa ?? 0;
  const q: PersonProps = { ...p, handL: [-22, -202 + ab], gripL: "fist", headTilt: -5 };
  const m = maoInfo(q, "L");
  const c: P = [m.pos[0] + 15, m.pos[1]];
  const cab = -330 + ab;
  return { ...q, lookAt: [c[0] * 2.2, cab + (c[1] - cab) * 2.2], propsHands: <ObjetoNaMao def={CELULAR} mao={m.pos} ang={8} e={{ t, vira: 1 }} /> };
};
/** alvo do olhar (mundo -> local do ator) */
export const olhar = (p: PersonProps, w: P): P => paraLocal(w, p.x, p.y, p.scale ?? 1);

const AncorasCtx = React.createContext(false);
const Quadro: React.FC<{ cenario: CenarioDef; f: number; children: (t: number, f: number) => { noMeio?: React.ReactNode; naFrente?: React.ReactNode } }> = ({ cenario, f, children }) => {
  const t = f / FPS;
  const c = children(t, f);
  const ancoras = React.useContext(AncorasCtx);
  return <Cena cenario={cenario} t={t} noMeio={c.noMeio} naFrente={c.naFrente} mostrarAncoras={ancoras} />;
};

export const CENARIOS_FASE4: Record<string, React.FC> = {
  campinho: () => {
    const f = useCurrentFrame();
    const set = CAMPINHO.set;
    return (
      <Quadro cenario={CAMPINHO} f={f}>
        {(t) => {
          const amigo = emPeNa(AMIGO, set, "chao", 1120, f + 10);
          const prot = emPeNa(PROTAGONISTA, set, "chao", 760, f);
          const mae = sentadoNa(MAE, set, "banco", f + 30);
          prot.lookAt = olhar(prot, apoioEm(set, "chao", 1215));
          return {
            noMeio: (
              <>
                <Obj def={MOCHILA} set={set} ancora="chao" x={480} e={{ t }} />
                <Person {...mae} semente={2} />
                <Person {...prot} semente={1} />
                <Person {...amigo} semente={4} />
                <Obj def={BOLA} set={set} ancora="chao" x={1215} e={{ t: 0 }} />
              </>
            ),
          };
        }}
      </Quadro>
    );
  },
  rua: () => {
    const f = useCurrentFrame();
    const set = RUA.set;
    return (
      <Quadro cenario={RUA} f={f}>
        {() => {
          // protagonista andando na calçada (os pés seguem a âncora do chão)
          const base = emPe(set, "chao", 700);
          const andar = walk({ ...base, xa: 700, xb: 900, f0: 0 });
          const prot: PersonProps = { ...props(PROTAGONISTA), ...andar(f % 40), expr: PROTAGONISTA.expr };
          const vo = sentadoNa(VO, set, "banco", f);
          const figs = [[21, 120, 0], [49, 1030, 30], [90, 1700, 60]].map(([sem, x, d]) => {
            const a = figurante(sem);
            return <Person key={sem} {...emPeNa(a, set, "chao", x, f + d, {}, 1)} semente={sem} />;
          });
          return {
            noMeio: (
              <>
                {figs}
                <Person {...vo} semente={3} />
                <Person {...prot} semente={1} />
              </>
            ),
          };
        }}
      </Quadro>
    );
  },
  padaria: () => {
    const f = useCurrentFrame();
    const set = PADARIA.set;
    return (
      <Quadro cenario={PADARIA} f={f}>
        {(t) => {
          const pad = emPeNa(PADEIRO, set, "chao_balcao", 900, f + 20);
          const prot = emPeNa(PROTAGONISTA, set, "chao", 1600, f);
          prot.lookAt = olhar(prot, [pad.x, 520]);
          pad.lookAt = olhar(pad, [prot.x, 560]);
          return {
            noMeio: <Person {...pad} semente={7} />,
            naFrente: (
              <>
                <Obj def={XICARA} set={set} ancora="balcao" x={1090} e={{ t }} />
                <Obj def={PRATO} set={set} ancora="balcao" x={640} e={{ t }} />
                <Person {...prot} semente={1} />
              </>
            ),
          };
        }}
      </Quadro>
    );
  },
  consultorio: () => {
    const f = useCurrentFrame();
    const set = CONSULTORIO.set;
    return (
      <Quadro cenario={CONSULTORIO} f={f}>
        {(t) => {
          const prot = sentadoNa(PROTAGONISTA, set, "maca", f);
          const med = emPeNa(MEDICA, set, "chao", 1010, f + 50);
          prot.lookAt = olhar(prot, [med.x, 560]);
          med.lookAt = olhar(med, [prot.x, 640]);
          return {
            noMeio: (
              <>
                <Obj def={XICARA} set={set} ancora="mesa" x={1320} e={{ t }} />
                <Person {...prot} semente={1} />
                <Person {...med} semente={6} />
              </>
            ),
          };
        }}
      </Quadro>
    );
  },
  sala: () => {
    const f = useCurrentFrame();
    const set = SALA.set;
    return (
      <Quadro cenario={SALA} f={f}>
        {(t) => {
          const prot = sentadoNa(PROTAGONISTA, set, "sofa_esq", f);
          const amigo = sentadoNa(AMIGO, set, "sofa_dir", f + 40);
          prot.lookAt = olhar(prot, [amigo.x, 600]);
          return {
            noMeio: (
              <>
                <Person {...prot} semente={1} />
                <Person {...amigo} semente={4} />
              </>
            ),
            naFrente: (
              <>
                <Obj def={CONTROLE} set={set} ancora="mesa_centro" x={790} e={{ t }} />
                <Obj def={COPO} set={set} ancora="mesa_centro" x={930} e={{ t }} />
              </>
            ),
          };
        }}
      </Quadro>
    );
  },
  quarto: () => {
    const f = useCurrentFrame();
    const set = QUARTO.set;
    return (
      <Quadro cenario={QUARTO} f={f}>
        {(t) => {
          const prot = comCelular(sentadoNa(PROTAGONISTA, set, "quina_cama", f), t);
          return {
            noMeio: (
              <>
                <Obj def={XICARA} set={set} ancora="criado_mudo" x={196} e={{ t }} />
                <Obj def={CONTROLE} set={set} ancora="escrivaninha" x={1420} e={{ t }} />
                <Person {...prot} semente={1} />
              </>
            ),
          };
        }}
      </Quadro>
    );
  },
  cozinha: () => {
    const f = useCurrentFrame();
    const set = COZINHA.set;
    return (
      <Quadro cenario={COZINHA} f={f}>
        {(t) => {
          const prot = emPeNa(PROTAGONISTA, set, "chao", 1000, f);
          prot.lookAt = olhar(prot, apoioEm(set, "boca_fogao_1"));
          return {
            noMeio: (
              <>
                <Obj def={PANELA} set={set} ancora="boca_fogao_1" e={{ t, quente: 0.5 }} />
                <Obj def={XICARA} set={set} ancora="bancada" x={640} e={{ t }} />
                <Person {...prot} semente={1} />
              </>
            ),
          };
        }}
      </Quadro>
    );
  },
};

export const Fase4Quadro: React.FC<{ cenario: string; ancoras?: boolean }> = ({ cenario, ancoras = false }) => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const C = CENARIOS_FASE4[cenario];
  return (
    <AncorasCtx.Provider value={ancoras}>
      <C />
    </AncorasCtx.Provider>
  );
};
export const _usar = [AMIGO, ELENCO, MEDICA, PADEIRO, figurante, BOLA, COPO, MOCHILA, PRATO];
