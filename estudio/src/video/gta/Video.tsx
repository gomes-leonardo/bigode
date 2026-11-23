// Vídeo "E se os códigos de GTA funcionassem na vida real?" (vídeo 2). Mesma montagem do vídeo 1: planos presos às
// falas (tempo.ts), legenda com o texto exato, zoom de corte onde ficaria parado, efeitos (sfx.tsx) e a narração quando
// chegar (public/audio/gta-narracao.mp3).
import React from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "../../fontes";
import { cameraNoQuadro, planoNoQuadro } from "../../camera/Camera";
import { verificaRitmo, type Evento } from "../../camera/ritmo";
import { suave } from "../../rig/pose";
import { Legenda } from "../graficos";
import type { PlanoV } from "../cartao/comum";
import { PARTE1, FIGURADOS_P1 } from "./parte1";
import { PARTE2, FIGURADOS_P2 } from "./parte2";
import { PARTE3, FIGURADOS_P3 } from "./parte3";
import { COM_AUDIO, DURACAO, ENTRADA, FALAS, FPS, falaNoQuadro } from "./tempo";
import { Efeitos, SILENCIO } from "./sfx";

const BASE: PlanoV[] = [...PARTE1, ...PARTE2, ...PARTE3];
const FIGURADOS: Record<number, string[]> = { ...FIGURADOS_P1, ...FIGURADOS_P2, ...FIGURADOS_P3 };
export const FIM = DURACAO;

// zoom de corte (como no vídeo 1): onde ficaria mais de 2,5 s sem acontecimento, aproxima 6% e volta no seguinte
const MAX_PARADO = 74;
const ZOOM_CORTE = 1.06;
const pontosDeRespiro = (p: PlanoV): number[] => {
  const pts = [p.de, ...p.eventos.filter((e) => e.f > p.de && e.f < p.ate).map((e) => e.f), p.ate].sort((a, b) => a - b);
  const novos: number[] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const b = pts[i + 1];
    let cur = pts[i];
    while (b - cur > MAX_PARADO) {
      const ideal = cur + (b - cur) / Math.ceil((b - cur) / MAX_PARADO);
      const fala = FALAS.filter((x) => x.ini >= cur + 24 && x.ini <= cur + MAX_PARADO && b - x.ini >= 20).sort((x, y) => Math.abs(x.ini - ideal) - Math.abs(y.ini - ideal))[0];
      const q = fala && Math.abs(fala.ini - ideal) <= 20 ? fala.ini : Math.round(ideal);
      novos.push(q);
      cur = q;
    }
  }
  return novos.sort((a, b) => a - b);
};
const RESPIROS = new Map(BASE.map((p) => [p, p.semRespiro ? [] : pontosDeRespiro(p)]));
export const PLANOS: PlanoV[] = BASE.map((p) => ({ ...p, eventos: [...p.eventos, ...(RESPIROS.get(p) ?? []).map((f): Evento => ({ f, tipo: "camera", desc: "zoom de corte" }))] }));
const zoomDeCorte = (p: PlanoV, f: number) => {
  let z = 1;
  (RESPIROS.get(BASE[PLANOS.indexOf(p)]) ?? []).forEach((q, i) => {
    if (f < q) return;
    z = z + ((i % 2 === 0 ? ZOOM_CORTE : 1) - z) * suave((f - q) / 6);
  });
  return z;
};

export const ritmo = (planos: PlanoV[], ate: number) =>
  verificaRitmo({
    duracao: ate,
    eventos: planos.flatMap((p) => p.eventos.filter((e) => e.tipo !== "corte" || e.verbo).map((e) => (e.tipo === "corte" ? { ...e, tipo: "objeto" as const } : e))),
    cortes: planos.slice(1).map((p) => p.de),
    falas: FALAS.filter((x) => x.ini < ate).map((x) => ({ de: x.ini, ate: x.fim, texto: x.texto, ignorar: FIGURADOS[x.id] })),
  });

export const VideoGta: React.FC<{ legenda?: boolean }> = ({ legenda = true }) => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const f = useCurrentFrame();
  if (f === 0) console.log("RITMO " + JSON.stringify(ritmo(PLANOS, FIM)));
  const p = planoNoQuadro(PLANOS, f);
  const cam = cameraNoQuadro(p, f);
  const fala = falaNoQuadro(f);
  const mostra = legenda && fala && !(p.semLegenda ?? []).includes(fala.id) && !SILENCIO(f);
  const z = zoomDeCorte(p, f);
  return (
    <AbsoluteFill>
      {COM_AUDIO && <Sequence from={Math.round(ENTRADA * FPS)} layout="none"><Audio src={staticFile("audio/gta-narracao.mp3")} /></Sequence>}
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
