// Vídeo "E se você tivesse dinheiro infinito?" (cartão infinito). Sem áudio por enquanto: os tempos das falas são
// estimados (tempo.ts) e a legenda mostra o texto exato do roteiro.
import React from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { fontes } from "../../fontes";
import { cameraNoQuadro, planoNoQuadro } from "../../camera/Camera";
import { verificaRitmo } from "../../camera/ritmo";
import { Legenda } from "../graficos";
import type { PlanoV } from "./comum";
import { CAP1, FIGURADOS_CAP1, FIM_CAP1 } from "./cap1";
import { FALAS, falaNoQuadro } from "./tempo";

export const PLANOS: PlanoV[] = [...CAP1];
const FIGURADOS: Record<number, string[]> = { ...FIGURADOS_CAP1 };
export const FIM = FIM_CAP1;

export const ritmo = (planos: PlanoV[], ate: number) =>
  verificaRitmo({
    duracao: ate,
    eventos: planos.flatMap((p) => p.eventos.filter((e) => e.tipo !== "corte")),
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
