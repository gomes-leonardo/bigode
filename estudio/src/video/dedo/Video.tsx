// Shorts "por que seu dedo estala" (vertical 1080x1920, 24 fps). Planos 3D renderizados no Blender (blender/dedo),
// presos às falas; corte com zoom a cada ~2,6 s nos planos longos (repete o ângulo em vez de segurar parado); legenda
// grande no meio de baixo; sobreposições (manômetro, rótulos, barra de recarga, calendário, prêmio) e efeitos.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "../../fontes";
import { PLANOS, type Plano } from "./planos";
import { COM_AUDIO, DURACAO, ENTRADA, FPS } from "./tempo";
import { Legendas } from "./legendas";
import { Sobreposicoes } from "./sobre";
import { EfeitosDedo } from "./sfx";

export const FIM = DURACAO;

/** zoom de corte: nos planos longos, a cada ~2,6 s o enquadramento pula 12% para perto e volta no seguinte */
const zoomDoPlano = (p: Plano, f: number) => {
  const dur = p.ate - p.de;
  const pedacos = Math.max(1, Math.round(dur / (2.6 * FPS)));
  if (pedacos === 1) return 1;
  const i = Math.min(pedacos - 1, Math.floor(((f - p.de) / dur) * pedacos));
  return i % 2 === 1 ? 1.12 : 1;
};

const Clipe: React.FC<{ p: Plano; prontos: Set<number> }> = ({ p, prontos }) => {
  const f = useCurrentFrame() + p.de;
  const z = zoomDoPlano(p, f);
  const nome = String(p.render).padStart(2, "0");
  const estilo: React.CSSProperties = { width: 1080, height: 1920, objectFit: "cover", transform: z !== 1 ? `scale(${z})` : undefined };
  if (prontos.has(p.render)) return <OffthreadVideo src={staticFile(`dedo/p${nome}.mp4`)} style={estilo} muted />;
  // prévia (animatic): os três quadros de teste do Blender, com um zoom lento
  const u = (f - p.de) / Math.max(1, p.ate - p.de);
  const qual = u < 0.34 ? "000" : u < 0.67 ? "050" : "100";
  return <Img src={staticFile(`dedo/testes/p${nome}_${qual}.png`)} style={{ ...estilo, transform: `scale(${(z * (1 + 0.05 * u)).toFixed(4)})` }} />;
};

/** quais planos já têm o MP4 renderizado (public/dedo/clipes.json, escrito pelo blender/dedo/renderiza.py) */
const usaProntos = () => {
  const [prontos, setProntos] = React.useState<Set<number> | null>(null);
  const [h] = React.useState(() => delayRender("clipes"));
  React.useEffect(() => {
    fetch(staticFile("dedo/clipes.json"))
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((l) => { setProntos(new Set((l as number[]).map(Number))); continueRender(h); });
  }, [h]);
  return prontos;
};

export const VideoDedo: React.FC = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const prontos = usaProntos();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {COM_AUDIO && <Sequence from={Math.round(ENTRADA * FPS)} layout="none"><Audio src={staticFile("audio/dedo-narracao.mp3")} /></Sequence>}
      <EfeitosDedo />
      {prontos && PLANOS.map((p) => (
        <Sequence key={p.n} from={p.de} durationInFrames={p.ate - p.de}>
          <Clipe p={p} prontos={prontos} />
        </Sequence>
      ))}
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <Sobreposicoes />
          <Legendas />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
