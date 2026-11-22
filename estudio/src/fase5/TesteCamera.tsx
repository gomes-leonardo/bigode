// Fase 5: teste de câmera (16 s). Três planos com corte seco: sala (push-in + zoom de reação), cozinha (travelling
// curto mostrando o parallax + pegar a xícara) e rua (travelling acompanhando o protagonista + zoom de reação).
// O HUD (opcional) mostra o que a câmera está fazendo e a linha do tempo com falas, cortes e eventos.
import React from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { Person, maoInfo, type P, type PersonProps } from "../components/Person";
import { expressaoNoQuadro } from "../components/Face";
import { FPS } from "../estilo";
import { FONTE, fontes } from "../fontes";
import { idle, walk, wave } from "../rig/actions";
import { alcance, carrega, paraLocal, squash } from "../rig/manuseio";
import { suave } from "../rig/pose";
import { AMIGO, PROTAGONISTA, VO, figurante } from "../elenco/elenco";
import { ObjetoNaMao, XICARA } from "../objects/objetos";
import { Cena, PARALLAX, type CenarioDef } from "../cenarios/Cena";
import { apoioEm, emPe } from "../cenarios/ancoras";
import { COZINHA } from "../cenarios/cozinha/Cozinha";
import { SALA } from "../cenarios/sala/Sala";
import { RUA } from "../cenarios/rua/Rua";
import { cameraNoQuadro, planoNoQuadro, PUSH_IN, QUADROS_REACAO, ZOOM_REACAO, type Plano } from "../camera/Camera";
import { verificaRitmo, type Evento, type Fala } from "../camera/ritmo";
import { Obj, emPeNa, olhar, props, sentadoNa } from "../fase4/Cenarios";

export const DURACAO_TESTE_CAMERA = 480;

// ------------------------------------------------------------------ linha do tempo
type PlanoDemo = Plano & { nome: string; cenario: CenarioDef };
const ROSTO_SALA: P = [650, 578]; // rosto do protagonista sentado no sofá (zoom de reação)
const ROSTO_RUA: P = [900, 671];
const PLANOS: PlanoDemo[] = [
  { nome: "sala", cenario: SALA, de: 0, ate: 150, enquadra: { x: 850, y: 540, zoom: 1 }, reacoes: [{ em: 75, alvo: ROSTO_SALA }] },
  { nome: "cozinha", cenario: COZINHA, de: 150, ate: 300, enquadra: { x: 760, y: 610, zoom: 1.25 }, viagem: { x: 70 } },
  { nome: "rua", cenario: RUA, de: 300, ate: 480, enquadra: { x: 760, y: 560, zoom: 1 }, viagem: { x: 180 }, reacoes: [{ em: 450, alvo: ROSTO_RUA }] },
];
export const CORTES = PLANOS.slice(1).map((p) => p.de);
export const EVENTOS: Evento[] = [
  { f: 75, tipo: "camera", desc: "zoom de reação" },
  { f: 75, tipo: "expressao", desc: "protagonista fica bravo" },
  { f: 225, tipo: "objeto", desc: "pega a xícara", verbo: "pegar" },
  { f: 375, tipo: "pose", desc: "amigo acena" },
  { f: 380, tipo: "pose", desc: "protagonista para de andar" },
  { f: 450, tipo: "pose", desc: "protagonista acena de volta", verbo: "acenar" },
  { f: 450, tipo: "camera", desc: "zoom de reação" },
];
/** falas de TESTE (só para conferir a regra de corte e a de verbo físico; não é roteiro) */
export const FALAS: Fala[] = [
  { de: 6, ate: 66, texto: "fala de teste 1" },
  { de: 84, ate: 140, texto: "fala de teste 2" },
  { de: 162, ate: 232, texto: "e ele pega a xícara" },
  { de: 248, ate: 290, texto: "fala de teste 4" },
  { de: 316, ate: 372, texto: "fala de teste 5" },
  { de: 392, ate: 470, texto: "e acena de volta" },
];
export const RITMO = verificaRitmo({ duracao: DURACAO_TESTE_CAMERA, eventos: EVENTOS, falas: FALAS, cortes: CORTES });

// ------------------------------------------------------------------ plano 1: sala
const Plano1: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const set = SALA.set;
  const prot = sentadoNa(PROTAGONISTA, set, "sofa_esq", f);
  const am0 = sentadoNa(AMIGO, set, "sofa_dir", f + 40);
  const ab = am0.abaixa ?? 0;
  // amigo rindo: balança para trás e para a frente, ombros pulando, mãos na barriga
  const amigo: PersonProps = {
    ...am0, lean: -3 + 2.5 * Math.sin(f * 0.9), ombros: 4 + 5 * Math.abs(Math.sin(f * 0.45)), headTilt: 4 * Math.sin(f * 0.9),
    handL: [-36, -150 + ab], handR: [40, -146 + ab], gripL: "open", gripR: "open",
  };
  prot.expr = expressaoNoQuadro([[0, "sigma"], [75, "bravo"]], f, 6);
  if (f >= 71) prot.lookAt = olhar(prot, [amigo.x, 600]); // os olhos vão antes
  prot.headTilt = 5 * suave((f - 75) / 8); // a cabeça vem 4 quadros depois
  return <Cena cenario={SALA} t={t} camera={cameraNoQuadro(PLANOS[0], f)} noMeio={<><Person {...prot} semente={1} /><Person {...amigo} semente={4} /></>} />;
};

// ------------------------------------------------------------------ plano 2: cozinha (pega a xícara e toma um gole)
const SEGURA: P = [96, -196];
const BOCA: P = [58, -303];
const Plano2: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const set = COZINHA.set;
  const X = 640;
  const base = emPe(set, "chao", X);
  const S = base.scale;
  const apoio = apoioEm(set, "bancada", 820);
  const pg = XICARA.pega({ t });
  const g = paraLocal([apoio[0] + pg[0] * S, apoio[1] + pg[1] * S], base.x, base.y, S);
  const f0 = 211, fC = 225;
  const parado = idle(base)(f);
  const repouso = idle(base)(f0).handR ?? [74, -108];
  let mao: P = parado.handR ?? [74, -108];
  let pegando = false;
  if (f >= f0 && f < fC) mao = alcance(f, f0, fC, repouso, g, 24);
  if (f >= fC) {
    pegando = true;
    mao = carrega(f, fC + 4, fC + 22, g, SEGURA, 14);
    if (f >= 252) mao = carrega(f, 252, 264, SEGURA, BOCA, 0);
    if (f >= 282) mao = carrega(f, 282, 298, BOCA, SEGURA, 0);
  }
  const gole = suave((f - 256) / 8) * (1 - suave((f - 282) / 10));
  const rot = -24 * gole;
  const pose: PersonProps = { ...props(PROTAGONISTA), ...parado, expr: "sigma", handR: mao, gripR: pegando ? "fist" : "open", squashR: squash(f, fC) };
  const angContato = maoInfo({ ...pose, handR: g, gripR: "fist" }, "R").ang;
  if (pegando) pose.pulsoR = angContato + rot;
  const m = maoInfo(pose, "R");
  pose.lookAt = olhar(pose, pegando ? [base.x + m.pos[0] * S - 30, base.y + m.pos[1] * S + 40] : [apoio[0], apoio[1] - 30]);
  pose.headTilt = 3;
  return (
    <Cena
      cenario={COZINHA}
      t={t}
      camera={cameraNoQuadro(PLANOS[1], f)}
      noMeio={
        <>
          {!pegando && <Obj def={XICARA} set={set} ancora="bancada" x={820} e={{ t }} />}
          <Person {...pose} semente={1} propsHands={pegando ? <ObjetoNaMao def={XICARA} mao={m.pos} ang={rot} e={{ t, vapor: 1 - gole }} /> : undefined} />
        </>
      }
    />
  );
};

// ------------------------------------------------------------------ plano 3: rua (anda, o amigo acena, ele acena de volta)
const Plano3: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const set = RUA.set;
  const base = emPe(set, "chao", 600);
  const andar = walk({ ...base, xa: 600, xb: 900, f0: 300 });
  let prot: PersonProps = { ...props(PROTAGONISTA), ...andar(f), expr: "sigma" };
  if (f >= andar.fim) prot = { ...props(PROTAGONISTA), ...idle({ ...emPe(set, "chao", 900) })(f), expr: "sigma" };
  if (f >= 450) prot = { ...props(PROTAGONISTA), ...wave({ ...emPe(set, "chao", 900), expr: "convencido" })(f - 450) };
  const amigoBase = emPe(set, "chao", 1600, 0.5);
  const amigo: PersonProps = f >= 375 ? { ...props(AMIGO), ...wave({ ...amigoBase, expr: "rindo" })(f - 375) } : { ...props(AMIGO), ...idle(amigoBase)(f), expr: "rindo" };
  if (f >= 385) prot.lookAt = olhar(prot, [amigo.x, 640]);
  const figs = [[21, 240], [90, 1720]].map(([sem, x]) => <Person key={sem} {...emPeNa(figurante(sem), set, "chao", x, f + sem, {}, 1)} semente={sem} />);
  return (
    <Cena
      cenario={RUA}
      t={t}
      camera={cameraNoQuadro(PLANOS[2], f)}
      noMeio={<>{figs}<Person {...sentadoNa(VO, set, "banco", f)} semente={3} /><Person {...amigo} semente={4} /><Person {...prot} semente={1} /></>}
    />
  );
};

// ------------------------------------------------------------------ HUD
const Pilula: React.FC<{ x: number; y: number; t: string; cor?: string; fundo?: string }> = ({ x, y, t, cor = "#FFFFFF", fundo = "rgba(20,20,20,0.72)" }) => (
  <g>
    <rect x={x} y={y} width={t.length * 13.2 + 28} height={38} rx={19} fill={fundo} />
    <text x={x + 14} y={y + 26} fontFamily={FONTE} fontWeight={800} fontSize={22} fill={cor}>{t}</text>
  </g>
);
const HUD: React.FC<{ f: number }> = ({ f }) => {
  const p = planoNoQuadro(PLANOS, f);
  const i = PLANOS.indexOf(p);
  const cam = cameraNoQuadro(p, f);
  const base = p.enquadra?.zoom ?? 1;
  const push = (cam.zoom ?? 1) / base;
  const x0 = 140, x1 = 1780, y = 1022;
  const X = (q: number) => x0 + ((x1 - x0) * q) / DURACAO_TESTE_CAMERA;
  const linhas: React.ReactNode[] = [<Pilula key="p" x={40} y={36} t={`PLANO ${i + 1}/3 · ${p.nome} · push-in ${(1).toFixed(2)} → ${(1 + PUSH_IN).toFixed(2)} (agora ${push.toFixed(3)})`} />];
  let yy = 84;
  if (f - p.de < 14 && i > 0) { linhas.push(<Pilula key="c" x={40} y={yy} t="CORTE SECO (na pausa da fala)" cor="#FFFFFF" fundo="rgba(224,36,44,0.9)" />); yy += 48; }
  if (cam.otico && cam.otico.z > 1.001) { linhas.push(<Pilula key="r" x={40} y={yy} t={`ZOOM DE REAÇÃO ×${cam.otico.z.toFixed(3)} (1.00 → ${ZOOM_REACAO.toFixed(2)} em ${QUADROS_REACAO} quadros)`} cor="#141414" fundo="rgba(242,209,107,0.95)" />); yy += 48; }
  if (p.viagem?.x) linhas.push(<Pilula key="v" x={40} y={yy} t={`TRAVELLING → PARALLAX: fundo ${PARALLAX.fundo}× · meio ${PARALLAX.meio}× · frente ${PARALLAX.frente}×`} cor="#141414" fundo="rgba(158,216,245,0.95)" />);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        {linhas}
        <rect x={20} y={y - 18} width={1880} height={70} rx={16} fill="rgba(20,20,20,0.72)" />
        <text x={36} y={y + 6} fontFamily={FONTE} fontWeight={800} fontSize={15} fill="#BDB6A8">fala</text>
        <text x={36} y={y + 26} fontFamily={FONTE} fontWeight={800} fontSize={15} fill="#F2D16B">evento</text>
        <text x={36} y={y + 46} fontFamily={FONTE} fontWeight={800} fontSize={15} fill="#FF5A5F">corte</text>
        {FALAS.map((fl, k) => <rect key={k} x={X(fl.de)} y={y - 6} width={X(fl.ate) - X(fl.de)} height={12} rx={6} fill="#BDB6A8" />)}
        {RITMO.batidas.map((b, k) => <circle key={k} cx={X(b)} cy={y + 22} r={7} fill="#F2D16B" />)}
        {CORTES.map((c) => <line key={c} x1={X(c)} y1={y - 14} x2={X(c)} y2={y + 46} stroke="#FF5A5F" strokeWidth={4} />)}
        <line x1={X(f)} y1={y - 16} x2={X(f)} y2={y + 48} stroke="#FFFFFF" strokeWidth={3} />
        <text x={1884} y={y + 42} textAnchor="end" fontFamily={FONTE} fontWeight={700} fontSize={14} fill={RITMO.ok ? "#9BE08A" : "#FF5A5F"}>{RITMO.ok ? `ritmo ok · ${RITMO.resumo}` : `ritmo com problema: ${RITMO.problemas[0]?.msg}`}</text>
      </svg>
    </AbsoluteFill>
  );
};

export const TesteCamera: React.FC<{ hud?: boolean }> = ({ hud = true }) => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const f = useCurrentFrame();
  const p = planoNoQuadro(PLANOS, f);
  const i = PLANOS.indexOf(p);
  return (
    <AbsoluteFill>
      {i === 0 && <Plano1 f={f} />}
      {i === 1 && <Plano2 f={f} />}
      {i === 2 && <Plano3 f={f} />}
      {hud && <HUD f={f} />}
    </AbsoluteFill>
  );
};
