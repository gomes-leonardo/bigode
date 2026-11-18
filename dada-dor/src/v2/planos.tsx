import { getLength, getPointAtLength } from "@remotion/paths";
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Arcs } from "../components/Arcs";
import { IconField } from "../components/IconField";
import { Prop } from "../components/Prop";
import { Reticle } from "../components/Reticle";
import { COR, FONTE } from "../theme";
import { NaMao } from "./elenco";
import { Ator, Camera, Cartela, Fundo, Medidor, Painel, rampa, Tela, useFala, useMola, usePlano, useT } from "./kit";
import { Bola, Cama, CamaHospital, CanelaRoxa, CelularGrande, Cerebro, Churrasqueira, Estrela, Interfone, Maca, Mapa, Muro, NarizFlores, PanelaPressao, Pecinhas, Poste, Trave, Vela } from "./props2";

// Planos do roteiro v2. Tempos em segundos dentro do plano; F(i) = início da fala i, F(i, true) = fim.
// Chão dos personagens em y=930; Gotinha olha para a direita (espelhar = olha para a esquerda).
const CHAO = 930;
const MACA_X = 820;
const MACA_TOPO = CHAO - 170;

const Consultorio: React.FC<{ helena?: boolean; children?: React.ReactNode; acaoGotinha?: "sit" | "balancar"; moodGotinha?: "neutral" | "curious" | "worried" | "calm" }> = ({ helena = true, children, acaoGotinha = "sit", moodGotinha = "neutral" }) => (
  <>
    <Fundo nome="consultorio" />
    <Tela><Maca x={MACA_X} y={CHAO} /></Tela>
    <Ator quem="gotinha" x={MACA_X} chao={MACA_TOPO + 40} acoes={[{ t: 0, acao: acaoGotinha, mood: moodGotinha }]} />
    {helena && children}
  </>
);

// ------------------------------------------------------------------ Capítulo 1
const c1_consultorio: React.FC = () => {
  const t = useT();
  return (
    <Camera de={1} ate={1.08} origem={[MACA_X + 120, 640]}>
      <Consultorio acaoGotinha="balancar">
        <Ator quem="helena" x={1260} chao={CHAO} espelhar acoes={[{ t: 0, acao: "idle", mood: "calm" }, { t: 1.4, acao: "apertar", mood: "calm" }]} mao={t > 1.2 ? NaMao.agulha : null} />
      </Consultorio>
      <Medidor valor={0} tremeAgulha={false} />
    </Camera>
  );
};

const c1_dedinho: React.FC = () => {
  const F = useFala();
  const quina = F(0, true) - 0.9;
  return (
    <Camera de={1.02} ate={1.1} origem={[1000, 760]} tremores={[quina]}>
      <Fundo nome="quarto" />
      <Tela><Cama x={700} y={CHAO} /></Tela>
      <Ator
        quem="gotinha"
        x={760}
        chao={CHAO - 60}
        acoes={[
          { t: 0, acao: "sit" },
          { t: 1.3, acao: "idle", x: 1140 },
          { t: 2.0, acao: "walk", ate: 1030 },
          { t: quina - 0.35, acao: "pisar" },
          { t: quina + 0.6, acao: "olharBaixo" },
        ]}
        espelhar
        ajuste={(p, tt) => (tt >= quina && tt < quina + 0.14 ? { ...p, torso: { ...p.torso, scaleY: 0.86, scaleX: 1.1 } } : p)}
      />
    </Camera>
  );
};

const c1_nada: React.FC = () => (
  <Camera de={1.45} ate={1.55} origem={[1000, 640]}>
    <Fundo nome="quarto" />
    <Tela><Cama x={700} y={CHAO} /></Tela>
    <Ator quem="gotinha" x={1030} chao={CHAO} espelhar acoes={[{ t: 0, acao: "olharBaixo" }, { t: 1.4, acao: "idle" }]} />
  </Camera>
);

const c1_pecinha: React.FC = () => {
  const F = useFala();
  return (
    <Camera de={1} ate={1.06} origem={[960, 700]} pan={[20, -20]}>
      <Fundo nome="quarto" />
      <Tela><Pecinhas x={960} y={CHAO - 10} /></Tela>
      <Ator quem="gotinha" x={600} chao={CHAO} acoes={[{ t: 0, acao: "walk", ate: 860 }, { t: 1.4, acao: "pisar" }, { t: 2.4, acao: "idle" }, { t: F(2), acao: "olharBaixo" }]} />
      <Ator quem="caco" x={1780} chao={CHAO} espelhar acoes={[{ t: 0, acao: "idle" }, { t: Math.max(0, F(1) - 1.0), acao: "walk", ate: 1380 }, { t: F(1) + 0.2, acao: "point", mood: "curious", x: 1380 }, { t: F(2) + 0.4, acao: "idle", mood: "worried" }]} />
    </Camera>
  );
};

const c1_cascudo: React.FC = () => {
  const F = useFala();
  const coco = F(0) + 2.1;
  return (
    <Camera de={1.05} ate={1.12} origem={[960, 640]} tremores={[coco]}>
      <Fundo nome="quarto" />
      <Ator quem="gotinha" x={820} chao={CHAO} acoes={[{ t: 0, acao: "idle" }]} ajuste={(p, tt) => (tt >= coco && tt < coco + 0.12 ? { ...p, torso: { ...p.torso, scaleY: 0.95 } } : p)} />
      <Ator quem="caco" x={1080} chao={CHAO} espelhar acoes={[{ t: 0, acao: "idle", mood: "curious" }, { t: coco - 0.32, acao: "cascudo", mood: "curious" }, { t: F(1) - 0.2, acao: "correr", mood: "worried", ate: 2300 }]} />
    </Camera>
  );
};

const c1_raro: React.FC = () => {
  const F = useFala();
  const t = useT();
  const sozinha = F(0) + 3.4;
  return t < sozinha ? (
    <Camera de={1} ate={1.08}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }} />
      <IconField rows={4} cols={13} highlightIndex={32} cor={COR.menta} />
    </Camera>
  ) : (
    <Camera de={1.05} ate={1.18} origem={[960, 640]}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 60%, ${COR.fundo2}, ${COR.fundo})` }} />
      <Tela><circle cx={960} cy={760} r={300} fill={COR.menta} opacity={0.08} /></Tela>
      <Ator quem="gotinha" x={960} chao={CHAO} escala={1.2} acoes={[{ t: 0, acao: "idle" }, { t: 1.6, acao: "olharBaixo" }]} />
    </Camera>
  );
};

const c1_titulo: React.FC = () => (
  <Cartela texto="E se você parasse de sentir dor?" desde={0.15}>
    <Medidor valor={0} pisca x={830} y={800} />
  </Cartela>
);

// ------------------------------------------------------------------ Capítulo 2
const c2_pena: React.FC = () => (
  <Camera de={1.08} ate={1.16} origem={[MACA_X + 160, 600]}>
    <Consultorio>
      <Ator quem="helena" x={1160} chao={CHAO} espelhar acoes={[{ t: 0, acao: "apertar", mood: "calm" }]} mao={NaMao.pena} />
    </Consultorio>
    <Medidor valor={0} />
  </Camera>
);

const c2_clipe: React.FC = () => {
  const F = useFala();
  return (
    <Camera de={1.08} ate={1.12} origem={[MACA_X + 160, 600]} cortes={[{ t: F(2), zoom: 1.12, origem: [1200, 520] }]}>
      <Consultorio moodGotinha="neutral">
        <Ator quem="helena" x={1160} chao={CHAO} espelhar acoes={[{ t: 0, acao: "apertar", mood: "curious" }, { t: F(2), acao: "idle", mood: "calm" }]} mao={NaMao.clipe} />
      </Consultorio>
      <Medidor valor={0} />
    </Camera>
  );
};

// pulso de luz percorrendo um path dentro do painel
const PulsoPainel: React.FC<{ d: string; de: number; ate: number; morreEm?: number; cor?: string }> = ({ d, de, ate, morreEm = 1, cor = COR.menta }) => {
  const t = useT();
  const k = rampa(t, de, ate);
  if (t < de) return null;
  const total = getLength(d);
  const fim = Math.min(k, morreEm);
  const p = getPointAtLength(d, fim * total) ?? { x: 0, y: 0 };
  const apaga = k > morreEm ? Math.max(0, 1 - (k - morreEm) * 6) : 1;
  return (
    <g>
      <path d={d} stroke={cor} strokeWidth={6} fill="none" opacity={0.25} />
      <circle cx={p.x} cy={p.y} r={16} fill={cor} opacity={apaga} style={{ filter: `drop-shadow(0 0 12px ${cor})` }} />
    </g>
  );
};

const c2_alarme: React.FC = () => {
  const F = useFala();
  const t = useT();
  const sirene = rampa(t, F(0, true) - 1.4, F(0, true) - 1.0);
  return (
    <Camera de={1} ate={1.05} origem={[700, 600]}>
      <Fundo nome="consultorio" escurece={0.4} />
      <Ator quem="gotinha" x={480} chao={CHAO} acoes={[{ t: 0, acao: "idle", mood: "curious" }]} />
      <Painel x={760} y={150} w={1000} h={620} desde={0.2}>
        <rect width={1000} height={620} fill={COR.fundo2} />
        <g transform="translate(250 560) scale(0.9)"><PanelaPressao x={0} y={0} vapor /></g>
        <path d="M 330 420 Q 420 260 600 230 Q 760 200 780 150" stroke={COR.coral} strokeWidth={46} fill="none" strokeLinecap="round" />
        <circle cx={320} cy={430} r={34} fill={COR.indigo} />
        <PulsoPainel d="M 320 430 Q 420 260 600 230 Q 760 200 790 150" de={F(0) + 2.2} ate={F(0) + 3.8} />
        <Cerebro x={820} y={150} sirene={sirene} />
      </Painel>
    </Camera>
  );
};

const c2_paquistao: React.FC = () => {
  const F = useFala();
  const t = useT();
  const dna = F(0) + 4.0;
  return t < dna ? (
    <Camera de={1} ate={1.1} pan={[30, -30]}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }} />
      <Tela><Mapa x={960} y={560} acesas={t > 2.4 ? 3 : t > 1.8 ? 2 : t > 1.2 ? 1 : 0} /></Tela>
    </Camera>
  ) : (
    <Camera de={1.04} ate={1.14}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }} />
      <Prop asset="dna" x={960} y={520} scale={0.9} animate="float" />
    </Camera>
  );
};

const c2_comporta: React.FC = () => {
  const t = useT();
  const F = useFala();
  const fecha = F(0) + 1.4;
  return (
    <Camera de={1} ate={1.08}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }} />
      <Prop asset={t < fecha ? "comporta-aceso" : "comporta-apagado"} x={960} y={480} scale={1.0} animate="float" />
      <Tela><PulsoPainel d="M 120 480 L 1800 480" de={F(0) + 0.3} ate={F(0, true)} morreEm={0.44} /></Tela>
    </Camera>
  );
};

const c2_interfone: React.FC = () => {
  const F = useFala();
  const t = useT();
  const apertos = [F(0) + 1.75, F(0) + 2.35];
  const aperta = apertos.some((a) => t >= a && t < a + 0.25);
  if (t < F(1) - 0.2) {
    return (
      <Camera de={1.05} ate={1.15} origem={[960, 560]}>
        <AbsoluteFill style={{ background: "#6E6A8C" }} />
        <Tela>
          <Interfone x={960} y={680} aperta={aperta} />
          <g transform={`translate(${aperta ? 1000 : 1060} ${aperta ? 770 : 800})`}>
            <circle r={44} fill={COR.indigo} />
            <rect x={20} y={-26} width={240} height={52} rx={26} fill={COR.coral} />
          </g>
        </Tela>
      </Camera>
    );
  }
  const marcas = [[880, 760], [1010, 640], [930, 860]];
  return (
    <Camera de={1} ate={1.08} origem={[960, 700]}>
      <Fundo nome="rua" />
      <Ator quem="gotinha" x={960} chao={CHAO} acoes={[{ t: 0, acao: "walk", x: 860, ate: 1000 }, { t: F(1) + 1.2, acao: "idle" }]} />
      <Tela>
        {marcas.map(([x, y], i) => {
          const m = rampa(t, F(1) + 0.4 + i * 0.6, F(1) + 0.7 + i * 0.6);
          return <ellipse key={i} cx={x + 100} cy={y} rx={18 * m} ry={12 * m} fill={COR.coral} opacity={0.9} />;
        })}
      </Tela>
    </Camera>
  );
};

const c2_mae: React.FC = () => {
  const F = useFala();
  const t = useT();
  const branca = rampa(t, 0.4, 1.4);
  return (
    <Camera de={1.06} ate={1.12} origem={[760, 600]}>
      <Consultorio acaoGotinha="balancar" moodGotinha="neutral" helena={false} />
      <AbsoluteFill style={{ filter: `saturate(${1 - 0.8 * branca}) brightness(${1 + 0.35 * branca})` }}>
        <Ator quem="lucia" x={460} chao={CHAO} acoes={[{ t: 0, acao: "idle", mood: "neutral" }, { t: 0.4, acao: "maoBoca", mood: "worried" }]} />
      </AbsoluteFill>
      {t > F(1) && <Ator quem="gotinha" x={MACA_X} chao={MACA_TOPO + 40} acoes={[{ t: 0, acao: "balancar", mood: "curious" }]} />}
    </Camera>
  );
};

// ------------------------------------------------------------------ Capítulo 3
const c3_vacina: React.FC = () => {
  const F = useFala();
  const t = useT();
  const estrela = useMola(F(2) + 0.4);
  return (
    <Camera de={1.02} ate={1.07} pan={[-30, 30]} origem={[960, 640]}>
      <Fundo nome="posto" />
      {(["turma1", "turma2", "turma3", "turma4"] as const).map((q, i) => (
        <Ator key={q} quem={q} x={1130 + i * 190} chao={CHAO} espelhar acoes={[{ t: 0, acao: "tremer" }]} />
      ))}
      <Ator quem="gotinha" x={900} chao={CHAO} espelhar acoes={[{ t: 0, acao: "idle", mood: "curious" }, { t: F(1), acao: "point", mood: "curious" }, { t: F(2), acao: "idle", mood: "neutral" }]} />
      <Ator quem="helena" x={560} chao={CHAO} acoes={[{ t: 0, acao: "idle", mood: "calm" }, { t: F(0) + 5.0, acao: "apertar", mood: "calm" }, { t: F(2), acao: "apertar", mood: "calm" }]} mao={t > F(2) ? <g transform="translate(160 80)"><Estrela x={0} y={0} r={26} /></g> : NaMao.agulha} />
      {estrela > 0.02 && <Tela><g transform={`translate(905 ${CHAO - 230}) scale(${estrela})`}><Estrela x={0} y={0} r={30} /></g></Tela>}
    </Camera>
  );
};

const c3_churrasco: React.FC = () => {
  const F = useFala();
  const t = useT();
  const come = [F(1) - 0.9, F(1) + 0.4];
  return (
    <Camera de={1} ate={1.08} origem={[960, 640]}>
      <Fundo nome="quintal" />
      <Tela><Churrasqueira x={1620} y={CHAO} /></Tela>
      <Ator quem="caco" x={1180} chao={CHAO} espelhar acoes={[{ t: 0, acao: "segurar", mood: "curious" }, { t: F(1) + 1.1, acao: "caiSentado", mood: "worried" }]} mao={t < come[0] ? NaMao.pimenta : null} maoL={NaMao.controle} />
      <Ator quem="gotinha" x={780} chao={CHAO} acoes={[{ t: 0, acao: "idle" }, { t: come[0], acao: "maoBoca", mood: "neutral" }, { t: come[0] + 0.6, acao: "idle" }, { t: come[1], acao: "maoBoca", mood: "neutral" }, { t: come[1] + 0.6, acao: "point", mood: "calm" }]} mao={t >= come[0] - 0.2 && t < come[1] + 0.6 ? NaMao.pimenta : null} />
    </Camera>
  );
};

const c3_pimenta: React.FC = () => {
  const F = useFala();
  const t = useT();
  const nervo = "M 260 300 C 360 420 300 560 420 680 C 520 780 470 860 560 900";
  return (
    <Camera de={1} ate={1.05}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }} />
      <Tela>
        <g transform="translate(330 300) rotate(-25) scale(4)"><path d="M -6 -40 Q 18 -10 6 34 Q -2 40 -10 30 Q -12 -10 -6 -40 Z" fill="#E23B2E" /><rect x={-8} y={-52} width={10} height={14} rx={3} fill="#3FAF63" /></g>
        <path d={nervo} stroke={COR.coral} strokeWidth={12} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rampa(t, 0.4, F(0) + 2.0)} style={{ filter: `drop-shadow(0 0 14px ${COR.coral})` }} />
        <line x1={960} y1={140} x2={960} y2={960} stroke="#3B3270" strokeWidth={4} />
      </Tela>
      <Ator quem="gotinha" x={1380} chao={CHAO} acoes={[{ t: 0, acao: "idle" }]} />
      <Tela><path d="M 1350 560 C 1300 640 1340 720 1310 800" stroke="#5B5480" strokeWidth={10} fill="none" strokeLinecap="round" opacity={rampa(t, F(0) + 3.4, F(0) + 4.0)} strokeDasharray="10 14" /></Tela>
      <Medidor valor={0} x={1560} y={120} />
    </Camera>
  );
};

const c3_bolada: React.FC = () => {
  const F = useFala();
  const t = useT();
  const chute = F(0) + 2.1;
  const impacto = F(0, true) - 0.4;
  const devolve = F(1) + 1.5;
  // bola: do pé do Tião até a cara da Gotinha; cai; depois volta pela mão dela
  let bx = 1300, by = 880, rot = 0;
  if (t >= chute && t < impacto) {
    const k = (t - chute) / (impacto - chute);
    bx = interpolate(k, [0, 1], [1290, 780]);
    by = interpolate(k, [0, 1], [880, 620]) - Math.sin(Math.PI * k) * 120;
    rot = k * 720;
  } else if (t >= impacto && t < devolve) {
    const k = Math.min(1, (t - impacto) / 0.6);
    bx = 780 + 60 * k;
    by = 620 + 280 * k - Math.sin(Math.PI * k) * 60;
  } else if (t >= devolve) {
    const k = Math.min(1, (t - devolve) / 0.8);
    bx = interpolate(k, [0, 1], [860, 1250]);
    by = interpolate(k, [0, 1], [760, 800]) - Math.sin(Math.PI * k) * 140;
    rot = -k * 540;
  }
  const congela = t >= impacto && t < devolve;
  return (
    <Camera de={1} ate={1.06} origem={[960, 640]} tremores={[impacto]}>
      <Fundo nome="rua2" />
      {(["turma2", "turma3"] as const).map((q, i) => (
        <Ator key={q} quem={q} x={1540 + i * 170} chao={CHAO - 30} espelhar escala={0.9} acoes={congela ? [{ t: 0, acao: "segurar" }] : [{ t: 0, acao: "idle" }]} />
      ))}
      <Ator quem="tiao" x={1340} chao={CHAO} espelhar acoes={[{ t: 0, acao: "idle", mood: "curious" }, { t: chute - 0.3, acao: "chutar", mood: "curious" }, { t: impacto, acao: "segurar", mood: "worried" }, { t: F(2), acao: "point", mood: "worried" }]} />
      <Ator quem="gotinha" x={760} chao={CHAO} acoes={[{ t: 0, acao: "idle" }, { t: devolve - 0.6, acao: "segurar" }, { t: devolve, acao: "point" }, { t: F(3), acao: "idle", mood: "curious" }]} ajuste={(p, tt) => (tt >= impacto && tt < impacto + 0.1 ? { ...p, head: { ...p.head, rot: p.head.rot - 3 } } : p)} />
      <Tela><Bola x={bx} y={by} rot={rot} /></Tela>
    </Camera>
  );
};

// ------------------------------------------------------------------ Capítulo 4
const c4_viral: React.FC = () => {
  const F = useFala();
  const t = useT();
  const cont = Math.round(interpolate(t, [F(0) + 1.1, F(0) + 2.7], [0, 1000000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) / 137) * 137;
  const titulo = useMola(F(0) + 3.0);
  return (
    <Camera de={1} ate={1.06} origem={[960, 560]}>
      <Fundo nome="rua" escurece={0.35} />
      <Ator quem="caco" x={560} chao={CHAO} acoes={[{ t: 0, acao: "filmar", mood: "curious" }]} mao={NaMao.celular} />
      <Tela><CelularGrande x={1260} y={520} contador={Math.min(1000000, cont)} /></Tela>
      {titulo > 0.02 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 870, textAlign: "center", fontFamily: FONTE, fontWeight: 900, fontSize: 76, color: "#fff", textTransform: "uppercase", transform: `scale(${0.9 + 0.1 * titulo})`, textShadow: `0 5px 0 ${COR.coral}` }}>a menina que não cai</div>
      )}
    </Camera>
  );
};

const c4_montagem: React.FC = () => {
  const t = useT();
  const parte = Math.min(2, Math.floor(t / 2));
  const tl = t - parte * 2;
  const caco = <Ator quem="caco" x={1700} chao={CHAO} escala={0.8} espelhar acoes={[{ t: 0, acao: "filmar", mood: "curious" }]} mao={NaMao.celular} />;
  if (parte === 0)
    return (
      <Camera de={1.04} ate={1.08}>
        <Fundo nome="rua" />
        <Tela><Muro x={760} y={CHAO} w={520} h={300} /></Tela>
        <Ator quem="gotinha" x={tl < 0.6 ? 760 : 980} chao={tl < 0.6 ? CHAO - 300 : CHAO} acoes={[{ t: 0, acao: "pular" }, { t: 1.0, acao: "celebrate" }]} />
        {caco}
      </Camera>
    );
  if (parte === 1)
    return (
      <Camera de={1.2} ate={1.26} origem={[900, 640]}>
        <Fundo nome="cozinha" escurece={0.3} />
        <Tela><Vela x={1000} y={CHAO - 20} /></Tela>
        <Ator quem="gotinha" x={780} chao={CHAO} acoes={[{ t: 0, acao: "apertar" }]} ajuste={(p, tt) => ({ ...p, arm_upper_R: 60 + 14 * Math.sin(tt * 6) })} />
        {caco}
      </Camera>
    );
  return (
    <Camera de={1.04} ate={1.08} tremores={[1.0]}>
      <Fundo nome="rua2" />
      <Tela><Poste x={1080} y={CHAO} /></Tela>
      <Ator quem="gotinha" x={760} chao={CHAO} acoes={[{ t: 0, acao: "walk", ate: 960 }, { t: 1.0, acao: "flinch" }, { t: 1.4, acao: "idle" }]} />
      {caco}
    </Camera>
  );
};

const c4_tiao_cai: React.FC = () => {
  const F = useFala();
  const queda = F(0, true) - 1.9;
  const t = useT();
  return (
    <Camera de={1} ate={1.08} origem={[960, 640]} tremores={[queda]}>
      <Fundo nome="rua" />
      <Tela><Muro x={1080} y={CHAO} w={520} h={300} /></Tela>
      <Ator quem="tiao" x={t < queda ? 1080 : 1260} chao={t < queda ? CHAO - 300 : CHAO} acoes={[{ t: 0, acao: "idle", mood: "curious" }, { t: queda - 0.6, acao: "pular", mood: "curious" }, { t: queda, acao: "chorar", mood: "worried" }]} />
      <Ator quem="gotinha" x={620} chao={CHAO} acoes={[{ t: 0, acao: "idle" }, { t: queda + 0.4, acao: "olharBaixo" }]} />
    </Camera>
  );
};

const c4_zefa: React.FC = () => {
  const F = useFala();
  const pau = F(0, true) - 0.6;
  return (
    <Camera de={1.02} ate={1.1} origem={[900, 600]} tremores={[pau]}>
      <Fundo nome="rua" />
      <Ator quem="caco" x={1080} chao={CHAO} espelhar acoes={[{ t: 0, acao: "filmar", mood: "curious" }, { t: pau, acao: "pular", mood: "worried" }]} mao={NaMao.celular} />
      <Ator quem="zefa" x={200} chao={CHAO} acoes={[{ t: 0, acao: "walk", ate: 760, mood: "worried" }, { t: pau - 0.35, acao: "cascudo", mood: "worried" }]} mao={NaMao.colher} />
    </Camera>
  );
};

const c4_final: React.FC = () => {
  const F = useFala();
  const t = useT();
  const gol = F(0) + 4.1;
  const torcida = F(0, true) - 2.6;
  let bx = 0, by = 900;
  const kb = Math.min(1, Math.max(0, (t - gol) / 0.5));
  bx = t < gol ? 0 : interpolate(kb, [0, 1], [1250, 1640]);
  by = t < gol ? 0 : interpolate(kb, [0, 1], [880, 720]);
  return (
    <Camera de={1} ate={1.08} pan={[60, -60]} origem={[1100, 640]}>
      <Fundo nome="rua2" />
      <Tela><Trave x={1450} y={CHAO} /></Tela>
      <Ator quem="gotinha" x={280} chao={CHAO} acoes={[{ t: 0, acao: "correr", ate: 1180 }, { t: gol - 0.3, acao: "chutar" }, { t: gol + 0.6, acao: "celebrate", mood: "calm" }, { t: gol + 1.8, acao: "correr", ate: 700, mood: "calm" }]} espelhar={t > gol + 1.8} />
      {t >= gol && <Tela><Bola x={bx} y={by} rot={kb * 600} /></Tela>}
      {(["turma1", "turma2", "turma4"] as const).map((q, i) => (
        <Ator key={q} quem={q} x={-200 - i * 160} chao={CHAO} acoes={[{ t: 0, acao: "idle" }, { t: torcida + i * 0.15, acao: "correr", ate: 520 + i * 170 }, { t: torcida + 1.6, acao: "celebrate" }]} />
      ))}
    </Camera>
  );
};

const c4_manca: React.FC = () => (
  <Camera de={1} ate={1.9} origem={[980, 900]}>
    <Fundo nome="rua2" />
    <Ator quem="gotinha" x={900} chao={CHAO} acoes={[{ t: 0, acao: "celebrate", mood: "calm" }, { t: 1.1, acao: "mancar", ate: 1060, mood: "calm" }]} />
  </Camera>
);

const c4_entrevista: React.FC = () => {
  const F = useFala();
  return (
    <Camera de={1.04} ate={1.12} origem={[960, 600]} cortes={[{ t: F(1) - 0.1, zoom: 1.2, origem: [780, 560] }]}>
      <Fundo nome="rua" />
      <Ator quem="vizinho" x={1220} chao={CHAO} espelhar acoes={[{ t: 0, acao: "filmar", mood: "curious" }]} mao={NaMao.celular} />
      <Ator quem="gotinha" x={780} chao={CHAO} acoes={[{ t: 0, acao: "idle" }, { t: F(1), acao: "idle", mood: "neutral" }]} ajuste={(p, tt) => (tt > F(1) ? { ...p, arm_upper_R: 30, arm_upper_L: -30, head: { ...p.head, rot: -4 } } : p)} />
    </Camera>
  );
};

const c4_roxo: React.FC = () => {
  const F = useFala();
  const t = useT();
  const roxo = useMola(0.4);
  if (t < F(1) - 0.2)
    return (
      <Camera de={1} ate={1.1} origem={[960, 520]}>
        <AbsoluteFill style={{ background: "#241F52" }} />
        <Tela><CanelaRoxa x={960} y={560} roxo={roxo} /></Tela>
      </Camera>
    );
  return (
    <Camera de={1.1} ate={1.2} origem={[900, 600]}>
      <Fundo nome="quarto" tinta="rgba(10,8,40,0.55)" />
      <Tela><Cama x={760} y={CHAO} /></Tela>
      <Ator quem="gotinha" x={820} chao={CHAO - 60} acoes={[{ t: 0, acao: "sit", mood: "neutral" }]} ajuste={(p) => ({ ...p, head: { ...p.head, rot: -16 } })} />
    </Camera>
  );
};

// ------------------------------------------------------------------ Capítulo 5
const c5_panela: React.FC = () => {
  const F = useFala();
  const t = useT();
  const pega = F(0, true) - 0.9;
  return (
    <Camera de={1} ate={1.06} origem={[700, 600]}>
      <Fundo nome="cozinha" />
      {t < pega && <Tela><PanelaPressao x={360} y={640} /></Tela>}
      <Ator quem="zefa" x={760} chao={CHAO} espelhar acoes={[{ t: 0, acao: "point", mood: "calm" }]} mao={NaMao.colher} />
      <Ator quem="gotinha" x={1500} chao={CHAO} espelhar acoes={[{ t: 0, acao: "walk", ate: 1040 }, { t: pega - 0.2, acao: "segurar" }]} mao={t >= pega ? NaMao.panela : null} />
    </Camera>
  );
};

const c5_mao: React.FC = () => {
  const t = useT();
  return (
    <Camera de={1.1} ate={1.25} origem={[960, 560]}>
      <AbsoluteFill style={{ background: "#4A2E3C" }} />
      <Tela>
        <g transform="translate(860 760) scale(1.8)"><PanelaPressao x={0} y={0} /></g>
        <path d="M 1300 520 Q 1500 380 1620 160" stroke={COR.coral} strokeWidth={70} fill="none" strokeLinecap="round" />
        <circle cx={1290} cy={530} r={56} fill={COR.indigo} />
        <PulsoPainel d="M 1290 530 Q 1500 380 1630 150" de={0.8} ate={3.2} morreEm={0.55} />
      </Tela>
      <Medidor valor={0} x={140} y={80} tremeAgulha={t > 2.5} />
    </Camera>
  );
};

const c5_larga: React.FC = () => {
  const t = useT();
  const arranca = 0.75;
  return (
    <Camera de={1.04} ate={1.1} origem={[960, 600]} tremores={[arranca]}>
      <Fundo nome="cozinha" />
      <Ator quem="gotinha" x={760} chao={CHAO} acoes={[{ t: 0, acao: "segurar" }, { t: arranca, acao: "idle", mood: "curious" }]} mao={t < arranca ? NaMao.panela : null} />
      <Ator quem="lucia" x={1700} chao={CHAO} espelhar acoes={[{ t: 0, acao: "correr", ate: 1080, mood: "worried" }, { t: arranca, acao: "segurar", mood: "worried" }]} mao={t >= arranca ? NaMao.panela : null} />
    </Camera>
  );
};

const c5_raiox: React.FC = () => {
  const F = useFala();
  const t = useT();
  const antigas = rampa(t, F(0) + 3.6, F(0) + 4.4);
  return (
    <Camera de={1} ate={1.08} origem={[760, 520]}>
      <Fundo nome="consultorio" escurece={0.35} />
      <Prop asset="raio-x-pe" x={720} y={470} scale={1.15} />
      <Tela>
        {[[620, 470], [760, 380]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={26} ry={18} fill="none" stroke={COR.coral} strokeWidth={5} opacity={0.45 * antigas} />)}
      </Tela>
      <Ator quem="helena" x={1450} chao={CHAO} espelhar acoes={[{ t: 0, acao: "point", mood: "calm" }, { t: F(0) + 3.5, acao: "apertar", mood: "worried" }]} />
    </Camera>
  );
};

const c5_inimiga: React.FC = () => (
  <Camera de={1.15} ate={1.35} origem={[960, 520]}>
    <Fundo nome="consultorio" />
    <Ator quem="helena" x={960} chao={CHAO + 60} escala={1.1} acoes={[{ t: 0, acao: "idle", mood: "neutral" }, { t: 0.8, acao: "idle", mood: "calm" }]} />
  </Camera>
);

const c5_olho: React.FC = () => {
  const F = useFala();
  const t = useT();
  const nariz = F(0) + 5.6;
  return t < nariz ? (
    <Camera de={1} ate={1.3}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }} />
      <Prop asset="olho" x={960} y={480} scale={1.6} />
    </Camera>
  ) : (
    <Camera de={1} ate={1.1} pan={[-20, 20]}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }} />
      <Tela><NarizFlores x={720} y={520} /></Tela>
    </Camera>
  );
};

const c5_fresco: React.FC = () => {
  const F = useFala();
  return (
    <Camera de={1} ate={1.06} origem={[960, 600]} cortes={[{ t: F(2), zoom: 1.2, origem: [760, 560] }]}>
      <Fundo nome="rua" />
      <Ator quem="tiao" x={1180} chao={CHAO} espelhar acoes={[{ t: 0, acao: "walk", ate: 1120 }, { t: 0.8, acao: "chorar", mood: "worried" }]} />
      <Ator quem="gotinha" x={740} chao={CHAO} acoes={[{ t: 0, acao: "idle" }, { t: F(1), acao: "idle", mood: "neutral" }]} ajuste={(p, tt) => (tt > F(1) && tt < F(1, true) + 0.4 ? { ...p, head: { ...p.head, rot: 6 * Math.sin(tt * 9) } } : p)} />
    </Camera>
  );
};

// ------------------------------------------------------------------ Capítulo 6
const MURO_TOPO = CHAO - 330;
const c6_muro: React.FC = () => (
  <Camera de={1} ate={1.08} origem={[960, 520]}>
    <Fundo nome="noite" />
    <Tela><Muro x={960} y={CHAO} w={900} h={330} noite /></Tela>
    <Ator quem="tiao" x={720} chao={MURO_TOPO} acoes={[{ t: 0, acao: "walk", ate: 1080, mood: "calm" }]} ajuste={(p) => ({ ...p, arm_upper_R: 100, arm_upper_L: -100, arm_lower_R: 0, arm_lower_L: 0 })} />
    <Ator quem="gotinha" x={420} chao={CHAO} acoes={[{ t: 0, acao: "idle", mood: "calm" }]} />
  </Camera>
);

const c6_queda: React.FC = () => {
  const F = useFala();
  const t = useT();
  const queda = F(0) + 0.55;
  return (
    <Camera de={1.04} ate={1.1} origem={[900, 600]} tremores={[queda + 0.45]}>
      <Fundo nome="noite" />
      <Tela><Muro x={960} y={CHAO} w={900} h={330} noite /></Tela>
      <Ator quem="tiao" x={t < queda + 0.4 ? 1080 : 1180} chao={t < queda + 0.4 ? MURO_TOPO : CHAO} acoes={[{ t: 0, acao: "fall", mood: "worried" }, { t: queda + 0.4, acao: "chorar", mood: "worried" }]} />
      <Ator quem="gotinha" x={520} chao={CHAO} acoes={[{ t: 0, acao: "idle", mood: "calm" }, { t: F(0) + 1.6, acao: "rir", mood: "calm" }]} />
    </Camera>
  );
};

const c6_rostos: React.FC = () => {
  const F = useFala();
  const t = useT();
  const d = F(0, true) - F(0);
  const a = F(0) + d * 0.36;
  const b = F(0) + d * 0.66;
  if (t < a)
    return (
      <Camera de={1} ate={1.08}>
        <Fundo nome="noite" />
        <Ator quem="mae_tiao" x={1700} chao={CHAO} espelhar acoes={[{ t: 0, acao: "correr", ate: 700, mood: "worried" }]} />
      </Camera>
    );
  if (t < b)
    return (
      <Camera de={1.6} ate={1.7} origem={[960, 560]}>
        <Fundo nome="noite" />
        <Ator quem="lucia" x={960} chao={CHAO + 120} acoes={[{ t: 0, acao: "idle", mood: "neutral" }, { t: 0.2, acao: "idle", mood: "worried" }]} />
      </Camera>
    );
  return (
    <Camera de={1.4} ate={1.5} origem={[960, 600]}>
      <Fundo nome="noite" />
      <Ator quem="zefa" x={960} chao={CHAO + 80} acoes={[{ t: 0, acao: "maoBoca", mood: "worried" }]} mao={null} />
    </Camera>
  );
};

const c6_para: React.FC = () => {
  const F = useFala();
  return (
    <Camera de={1.25} ate={1.75} origem={[960, 520]}>
      <Fundo nome="noite" />
      <Ator quem="gotinha" x={960} chao={CHAO} acoes={[{ t: 0, acao: "rir", mood: "calm" }, { t: F(0) + 0.3, acao: "idle", mood: "calm" }, { t: F(0) + 1.0, acao: "idle", mood: "worried" }]} blendQuadros={10} />
    </Camera>
  );
};

const c6_mao: React.FC = () => {
  const F = useFala();
  return (
    <Camera de={1.25} ate={1.0} origem={[960, 640]}>
      <Fundo nome="noite" />
      <Tela><Muro x={1400} y={CHAO} w={700} h={330} noite /></Tela>
      <Ator quem="tiao" x={1100} chao={CHAO} espelhar acoes={[{ t: 0, acao: "chorar", mood: "worried" }]} />
      <Ator quem="gotinha" x={560} chao={CHAO} acoes={[{ t: 0, acao: "walk", ate: 880, mood: "worried" }, { t: F(0) + 1.6, acao: "sit", mood: "worried" }]} ajuste={(p, tt) => (tt > F(0) + 2.0 ? { ...p, arm_upper_R: 62, arm_lower_R: 5 } : p)} />
    </Camera>
  );
};

// ------------------------------------------------------------------ Capítulo 7
const c7_lab: React.FC = () => (
  <Camera de={1} ate={1.06} pan={[30, -30]}>
    <Fundo nome="laboratorio" />
    {[520, 960, 1400].map((x, i) => (
      <Ator key={x} quem="helena" x={x} chao={CHAO} semArcos espelhar={i === 2} acoes={[{ t: 0, acao: i === 1 ? "apertar" : "idle" }]} />
    ))}
  </Camera>
);

const c7_alvo: React.FC = () => {
  const F = useFala();
  const t = useT();
  return (
    <Camera de={1} ate={1.08}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }} />
      <Prop asset={t < 1.2 ? "comporta-aceso" : "comporta-apagado"} x={560} y={480} scale={0.95} animate="float" />
      <Prop asset="rede-nervosa" x={1340} y={480} scale={0.75} />
      <Tela><path d="M 1340 260 L 1340 560" stroke="#5B5480" strokeWidth={12} strokeDasharray="12 14" opacity={rampa(t, 3.0, 3.8)} /></Tela>
      {t > F(1) && <Reticle targetX={1340} targetY={480} cor={COR.coral} />}
    </Camera>
  );
};

const c7_2025: React.FC = () => {
  const F = useFala();
  const t = useT();
  const pilula = 4.0;
  if (t < pilula)
    return (
      <Camera de={1} ate={1.08}>
        <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }} />
        <Prop asset="comporta-apagado" x={640} y={480} scale={0.8} />
        <Prop asset="comporta-aceso" x={1280} y={480} scale={0.8} animate="float" />
        <Reticle targetX={1280} targetY={480} cor={COR.coral} />
      </Camera>
    );
  return (
    <Camera de={1} ate={1.12}>
      <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }} />
      <Prop asset="data-2025" x={960} y={420} scale={1.0} />
      <Prop asset="comprimido" x={960} y={470} scale={0.8} animate="spin" />
      {t > F(1) - 0.3 && <Ator quem="gotinha" x={1560} chao={CHAO} escala={0.9} espelhar acoes={[{ t: 0, acao: "walk", ate: 1460 }, { t: 0.8, acao: "idle", mood: "calm" }]} />}
    </Camera>
  );
};

const c7_hospital: React.FC = () => {
  const F = useFala();
  const t = useT();
  const corte = F(0) + 2.4;
  if (t < corte)
    return (
      <Camera de={1.04} ate={1.1} origem={[MACA_X + 120, 640]}>
        <Consultorio>
          <Ator quem="helena" x={1260} chao={CHAO} espelhar acoes={[{ t: 0, acao: "apertar", mood: "calm" }]} mao={NaMao.agulha} />
        </Consultorio>
        <Medidor valor={0} />
      </Camera>
    );
  return (
    <Camera de={1} ate={1.08} origem={[900, 640]}>
      <Fundo nome="hospital" />
      <Tela><CamaHospital x={960} y={CHAO} acorda={rampa(t, corte + 1.2, corte + 3.2)} /></Tela>
    </Camera>
  );
};

const Bike: React.FC<{ arquivo: string; x: number; y: number; fase: number; escala?: number }> = ({ arquivo, x, y, fase, escala = 0.85 }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f * 0.6 + fase) * 4;
  return <Img src={staticFile(`v2/${arquivo}`)} style={{ position: "absolute", left: x - 688 * escala, top: y - 640 * escala + bob, width: 1376 * escala, height: 768 * escala, transform: `rotate(${Math.sin(f * 0.6 + fase) * 1.2}deg)` }} />;
};

const c7_bike: React.FC = () => {
  const t = useT();
  const { durationInFrames, fps } = useVideoConfig();
  const fim = durationInFrames / fps;
  const preto = rampa(t, fim - 1.4, fim - 0.1);
  return (
    <>
      <Camera de={1} ate={1.25} origem={[960, 560]}>
        <Fundo nome="entardecer" />
        <Bike arquivo="tiao-bike.png" x={760 + t * 60} y={860} fase={1.3} escala={0.72} />
        <Bike arquivo="gotinha-bike.png" x={1120 + t * 60} y={900} fase={0} escala={0.82} />
      </Camera>
      <AbsoluteFill style={{ background: "#000", opacity: preto }} />
    </>
  );
};

const c7_inscreva: React.FC = () => (
  <Cartela texto="Inscreva-se" cor="coral" tamanho={130} desde={0.1}>
    <svg width={260} height={160} style={{ position: "absolute", top: 700 }}>
      <g transform="translate(130 80) scale(2)"><Arcs mood="calm" /></g>
    </svg>
  </Cartela>
);

export const PLANOS: Record<string, React.FC> = {
  c1_consultorio, c1_dedinho, c1_nada, c1_pecinha, c1_cascudo, c1_raro, c1_titulo,
  c2_pena, c2_clipe, c2_alarme, c2_paquistao, c2_comporta, c2_interfone, c2_mae,
  c3_vacina, c3_churrasco, c3_pimenta, c3_bolada,
  c4_viral, c4_montagem, c4_tiao_cai, c4_zefa, c4_final, c4_manca, c4_entrevista, c4_roxo,
  c5_panela, c5_mao, c5_larga, c5_raiox, c5_inimiga, c5_olho, c5_fresco,
  c6_muro, c6_queda, c6_rostos, c6_para, c6_mao,
  c7_lab, c7_alvo, c7_2025, c7_hospital, c7_bike, c7_inscreva,
};

export const usePlanoAtual = usePlano;
void spring;
