// Vídeo "E se você tivesse dinheiro infinito?" (cartão infinito), com a narração do ElevenLabs: os tempos das falas
// vêm do áudio (tempo.ts), a legenda mostra o texto exato do roteiro e os efeitos sonoros ficam em sfx.tsx.
import React from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "../../fontes";
import { cameraNoQuadro, planoNoQuadro } from "../../camera/Camera";
import { verificaRitmo, type Evento } from "../../camera/ritmo";
import { suave } from "../../rig/pose";
import { Legenda } from "../graficos";
import type { PlanoV } from "./comum";
import { CAP1, FIGURADOS_CAP1 } from "./cap1";
import { CAP2, FIGURADOS_CAP2 } from "./cap2";
import { CAP3, FIGURADOS_CAP3 } from "./cap3";
import { CAP4, FIGURADOS_CAP4 } from "./cap4";
import { CAP5, FIGURADOS_CAP5 } from "./cap5";
import { CAP6, FIGURADOS_CAP6 } from "./cap6";
import { CAP7, FIGURADOS_CAP7 } from "./cap7";
import { CAP8, FIGURADOS_CAP8 } from "./cap8";
import { CAP9, FIGURADOS_CAP9 } from "./cap9";
import { CAP10, FIGURADOS_CAP10 } from "./cap10";
import { CAP11, FIGURADOS_CAP11, FIM_CAP11 } from "./cap11";
import { ENTRADA, FALAS, FPS, falaNoQuadro } from "./tempo";
import { Efeitos, SO_SOM } from "./sfx";

const BASE: PlanoV[] = [...CAP1, ...CAP2, ...CAP3, ...CAP4, ...CAP5, ...CAP6, ...CAP7, ...CAP8, ...CAP9, ...CAP10, ...CAP11];
const FIGURADOS: Record<number, string[]> = { ...FIGURADOS_CAP1, ...FIGURADOS_CAP2, ...FIGURADOS_CAP3, ...FIGURADOS_CAP4, ...FIGURADOS_CAP5, ...FIGURADOS_CAP6, ...FIGURADOS_CAP7, ...FIGURADOS_CAP8, ...FIGURADOS_CAP9, ...FIGURADOS_CAP10, ...FIGURADOS_CAP11 };
export const FIM = FIM_CAP11;

// ------------------------------------------------------------------ zoom de corte (respiro)
// Com a narração real, alguns trechos ficam mais de 3 s sem acontecimento. Neles entra um zoom de corte no quadro
// inteiro (cena e gráficos; a legenda não): aproxima 6% e, no respiro seguinte, volta. De preferência no começo de
// uma fala, como um corte de edição.
const MAX_PARADO = 86; // quadros (2,9 s)
const ZOOM_CORTE = 1.06;
const pontosDeRespiro = (p: PlanoV): number[] => {
  const pts = [p.de, ...p.eventos.filter((e) => e.f > p.de && e.f < p.ate).map((e) => e.f), p.ate].sort((a, b) => a - b);
  const novos: number[] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    const n = Math.ceil((b - a) / MAX_PARADO) - 1;
    for (let k = 1; k <= n; k++) {
      const ideal = a + ((b - a) * k) / (n + 1);
      const fala = FALAS.filter((x) => x.ini > a + 24 && x.ini < b - 24).sort((x, y) => Math.abs(x.ini - ideal) - Math.abs(y.ini - ideal))[0];
      novos.push(fala && Math.abs(fala.ini - ideal) < (b - a) / (2 * (n + 1)) ? fala.ini : Math.round(ideal));
    }
  }
  return novos.sort((a, b) => a - b);
};
const RESPIROS = new Map(BASE.map((p) => [p, pontosDeRespiro(p)]));
export const PLANOS: PlanoV[] = BASE.map((p) => ({
  ...p,
  eventos: [...p.eventos, ...(RESPIROS.get(p) ?? []).map((f): Evento => ({ f, tipo: "camera", desc: "zoom de corte" }))],
}));
const zoomDeCorte = (p: PlanoV, f: number) => {
  let z = 1;
  (RESPIROS.get(BASE[PLANOS.indexOf(p)]) ?? []).forEach((q, i) => {
    if (f < q) return;
    const alvo = i % 2 === 0 ? ZOOM_CORTE : 1;
    z = z + (alvo - z) * suave((f - q) / 6);
  });
  return z;
};

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
  const mostra = legenda && fala && !(p.semLegenda ?? []).includes(fala.id) && !SO_SOM.includes(fala.id);
  const z = zoomDeCorte(p, f);
  return (
    <AbsoluteFill>
      <Sequence from={Math.round(ENTRADA * FPS)} layout="none"><Audio src={staticFile("audio/narracao.wav")} /></Sequence>
      <Efeitos />
      <AbsoluteFill style={{ transform: z !== 1 ? `scale(${z.toFixed(4)})` : undefined, transformOrigin: "50% 50%" }}>
        <p.Cena f={f} cam={cam} />
        <AbsoluteFill>
          <svg width={1920} height={1080}>{p.Sobre && <p.Sobre f={f} />}</svg>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill>
        <svg width={1920} height={1080}>{mostra && <Legenda texto={fala.texto} citacao={fala.citacao} />}</svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
