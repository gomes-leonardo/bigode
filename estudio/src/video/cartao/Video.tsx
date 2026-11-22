// Vídeo "E se você tivesse dinheiro infinito?" (cartão infinito). Sem áudio por enquanto: os tempos das falas são
// estimados (tempo.ts) e a legenda mostra o texto exato do roteiro.
import React from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { fontes } from "../../fontes";
import { cameraNoQuadro, planoNoQuadro } from "../../camera/Camera";
import { verificaRitmo } from "../../camera/ritmo";
import { Legenda } from "../graficos";
import type { PlanoV } from "./comum";
import { CAP1, FIGURADOS_CAP1 } from "./cap1";
import { CAP2, FIGURADOS_CAP2 } from "./cap2";
import { CAP3, FIGURADOS_CAP3 } from "./cap3";
import { CAP4, FIGURADOS_CAP4 } from "./cap4";
import { CAP5, FIGURADOS_CAP5 } from "./cap5";
import { CAP6, FIGURADOS_CAP6 } from "./cap6";
import { CAP7, FIGURADOS_CAP7, FIM_CAP7 } from "./cap7";
import { FALAS, falaNoQuadro } from "./tempo";

export const PLANOS: PlanoV[] = [...CAP1, ...CAP2, ...CAP3, ...CAP4, ...CAP5, ...CAP6, ...CAP7];
const FIGURADOS: Record<number, string[]> = { ...FIGURADOS_CAP1, ...FIGURADOS_CAP2, ...FIGURADOS_CAP3, ...FIGURADOS_CAP4, ...FIGURADOS_CAP5, ...FIGURADOS_CAP6, ...FIGURADOS_CAP7 };
export const FIM = FIM_CAP7;

export const ritmo = (planos: PlanoV[], ate: number) =>
  verificaRitmo({
    duracao: ate,
    // um corte com verbo mostra a ação no plano que entra: conta como evento
    eventos: planos.flatMap((p) => p.eventos.filter((e) => e.tipo !== "corte" || e.verbo).map((e) => (e.tipo === "corte" ? { ...e, tipo: "objeto" as const } : e))),
    cortes: planos.slice(1).map((p) => p.de),
    falas: FALAS.filter((x) => x.ini < ate).map((x) => ({ de: x.ini, ate: x.fim, texto: x.texto, ignorar: FIGURADOS[x.id] })),
  });

export const VideoCartao: React.FC<{ legenda?: boolean }> = ({ legenda = true }) => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const f = useCurrentFrame();
  if (f === 0) console.log("RITMO " + JSON.stringify(ritmo(PLANOS, FIM)));
  const p = planoNoQuadro(PLANOS, f);
  const cam = cameraNoQuadro(p, f);
  const fala = falaNoQuadro(f);
  const mostra = legenda && fala && !(p.semLegenda ?? []).includes(fala.id);
  return (
    <AbsoluteFill>
      <p.Cena f={f} cam={cam} />
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          {p.Sobre && <p.Sobre f={f} />}
          {mostra && <Legenda texto={fala.texto} citacao={fala.citacao} />}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
