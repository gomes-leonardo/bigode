// Cena em 3 camadas para parallax: FUNDO (com desfoque leve), MEIO (piso, móveis, personagens) e FRENTE.
// Por cima: luz direcional (polígono claro, baixa opacidade), vinheta e granulado (o granulado vem do Palco).
// BALCÃO é opcional: um plano do meio que fica na frente de quem está atrás dele (padaria, mesa de centro).
import React, { useId } from "react";
import { Palco } from "../components/Papel";
import type { SetJson } from "./ancoras";
import { LuzDirecional, MARGEM, Vinheta } from "./pecas";
import { FONTE } from "../fontes";

export type CenarioDef = {
  set: SetJson;
  Fundo: React.FC<{ t: number }>;
  Meio: React.FC<{ t: number }>;
  Balcao?: React.FC<{ t: number }>;
  Frente: React.FC<{ t: number }>;
};

/** câmera: centro do enquadramento no mundo (padrão 960, 540) e zoom (padrão 1) */
export type Camera = { x?: number; y?: number; zoom?: number };
/** quanto cada camada acompanha a câmera: o fundo anda menos, a frente anda mais */
export const PARALLAX = { fundo: 0.5, meio: 1, frente: 1.35 };

export const transformCamada = (c: Camera, k: number) => {
  const cx = 960 + ((c.x ?? 960) - 960) * k;
  const cy = 540 + ((c.y ?? 540) - 540) * k;
  const z = 1 + ((c.zoom ?? 1) - 1) * k;
  return `translate(960 540) scale(${z.toFixed(5)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`;
};

/** desenha as âncoras do set por cima (conferência): chão tracejado, assentos e bocas como pontos, tampos como traço */
export const MostraAncoras: React.FC<{ set: SetJson }> = ({ set }) => {
  const cor = "#E0242C";
  const Rot: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => (
    <g>
      <rect x={x - t.length * 5.4 - 8} y={y - 17} width={t.length * 10.8 + 16} height={24} rx={12} fill="#FFFFFF" stroke={cor} strokeWidth={2} />
      <text x={x} y={y + 1} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={16} fill={cor}>{t}</text>
    </g>
  );
  return (
    <g>
      {Object.entries(set.ancoras).map(([nome, a]) => {
        if (a.tipo === "chao")
          return (
            <g key={nome}>
              <line x1={a.x0} y1={a.y} x2={a.x1} y2={a.y} stroke={cor} strokeWidth={4} strokeDasharray="16 10" />
              {a.yFundo !== undefined && a.yFundo !== a.y && <line x1={a.x0} y1={a.yFundo} x2={a.x1} y2={a.yFundo} stroke={cor} strokeWidth={2.5} strokeDasharray="6 10" opacity={0.7} />}
              <Rot x={a.x0 + 70} y={a.y - 14} t={nome} />
            </g>
          );
        if (a.tipo === "tampo")
          return (
            <g key={nome}>
              <line x1={a.x0} y1={a.y} x2={a.x1} y2={a.y} stroke={cor} strokeWidth={5} />
              <Rot x={(a.x0 + a.x1) / 2} y={a.y - 22} t={nome} />
            </g>
          );
        if (a.tipo === "boca")
          return (
            <g key={nome}>
              <circle cx={a.x} cy={a.y} r={9} fill={cor} stroke="#FFFFFF" strokeWidth={3} />
              <Rot x={a.x} y={a.y - 26} t={nome} />
            </g>
          );
        return (
          <g key={nome}>
            <line x1={a.x} y1={a.y} x2={a.x} y2={a.chao} stroke={cor} strokeWidth={3} strokeDasharray="5 5" />
            <line x1={a.x - 22} y1={a.chao} x2={a.x + 22} y2={a.chao} stroke={cor} strokeWidth={4} />
            <circle cx={a.x} cy={a.y} r={10} fill={cor} stroke="#FFFFFF" strokeWidth={3} />
            <Rot x={a.x} y={a.y - 26} t={nome} />
          </g>
        );
      })}
    </g>
  );
};

export const Cena: React.FC<{
  cenario: CenarioDef;
  t: number;
  camera?: Camera;
  noMeio?: React.ReactNode; // objetos e personagens atrás do balcão (ou todos, se não houver balcão)
  naFrente?: React.ReactNode; // objetos em cima do balcão e personagens na frente dele
  desfoque?: number;
  mostrarAncoras?: boolean;
}> = ({ cenario, t, camera = {}, noMeio, naFrente, desfoque = 2.4, mostrarAncoras }) => {
  const id = useId().replace(/:/g, "");
  const { set, Fundo, Meio, Balcao, Frente } = cenario;
  return (
    <Palco>
      <defs>
        <filter id={`desf-${id}`} filterUnits="userSpaceOnUse" x={-MARGEM} y={-MARGEM} width={1920 + 2 * MARGEM} height={1080 + 2 * MARGEM}>
          <feGaussianBlur stdDeviation={desfoque} />
        </filter>
      </defs>
      <g transform={transformCamada(camera, PARALLAX.fundo)}>
        <g filter={`url(#desf-${id})`}>
          <Fundo t={t} />
        </g>
      </g>
      <g transform={transformCamada(camera, PARALLAX.meio)}>
        <Meio t={t} />
        {noMeio}
        {Balcao && <Balcao t={t} />}
        {naFrente}
        <LuzDirecional {...set.luz} />
      </g>
      <g transform={transformCamada(camera, PARALLAX.frente)}>
        <Frente t={t} />
      </g>
      <Vinheta />
      {mostrarAncoras && (
        <g transform={transformCamada(camera, PARALLAX.meio)}>
          <MostraAncoras set={set} />
        </g>
      )}
    </Palco>
  );
};
