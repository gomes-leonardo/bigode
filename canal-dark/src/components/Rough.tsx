import React, { useMemo } from "react";
import rough from "roughjs";
import type { Options } from "roughjs/bin/core";
import type { Drawable } from "roughjs/bin/core";
import { seedDe, useBoilTick } from "../lib/boil";
import { COR } from "../theme";

// Formas desenhadas com rough.js. A seed muda a cada 3 quadros (line boil).
const gerador = rough.generator();

export type P = [number, number];
export type EstiloRough = {
  id: string; // identifica a forma: mesma id = mesmo "jeito" de tremer
  cor?: string;
  espessura?: number;
  preenchimento?: string;
  estiloPreenchimento?: Options["fillStyle"];
  aspereza?: number;
  curvatura?: number;
  opacidade?: number;
  tracoUnico?: boolean;
};

const opcoes = (e: EstiloRough, tick: number): Options => ({
  seed: seedDe(tick, e.id),
  stroke: e.cor ?? COR.traco,
  strokeWidth: e.espessura ?? 5,
  roughness: e.aspereza ?? 1.3,
  bowing: e.curvatura ?? 1,
  fill: e.preenchimento,
  fillStyle: e.estiloPreenchimento ?? (e.preenchimento ? "solid" : undefined),
  hachureGap: 10,
  fillWeight: 2.5,
  disableMultiStroke: e.tracoUnico ?? false,
  preserveVertices: false,
});

const Desenho: React.FC<{ drawable: Drawable; opacidade?: number }> = ({
  drawable,
  opacidade = 1,
}) => {
  const caminhos = gerador.toPaths(drawable);
  return (
    <g opacity={opacidade}>
      {caminhos.map((c, i) => (
        <path
          key={i}
          d={c.d}
          stroke={c.stroke}
          strokeWidth={c.strokeWidth}
          fill={c.fill ?? "none"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
};

const useForma = (
  e: EstiloRough,
  criar: (o: Options) => Drawable,
  deps: unknown[],
) => {
  const tick = useBoilTick();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const d = useMemo(
    () => criar(opcoes(e, tick)),
    [tick, e.id, e.cor, e.espessura, e.preenchimento, e.aspereza, ...deps],
  );
  return <Desenho drawable={d} opacidade={e.opacidade} />;
};

export const Linha: React.FC<EstiloRough & { de: P; ate: P }> = (p) =>
  useForma(p, (o) => gerador.line(p.de[0], p.de[1], p.ate[0], p.ate[1], o), [
    ...p.de,
    ...p.ate,
  ]);

export const Retangulo: React.FC<
  EstiloRough & { x: number; y: number; w: number; h: number }
> = (p) =>
  useForma(p, (o) => gerador.rectangle(p.x, p.y, p.w, p.h, o), [
    p.x,
    p.y,
    p.w,
    p.h,
  ]);

export const Circulo: React.FC<
  EstiloRough & { cx: number; cy: number; d: number }
> = (p) =>
  useForma(p, (o) => gerador.circle(p.cx, p.cy, p.d, o), [p.cx, p.cy, p.d]);

export const Poligono: React.FC<EstiloRough & { pontos: P[] }> = (p) =>
  useForma(p, (o) => gerador.polygon(p.pontos, o), [JSON.stringify(p.pontos)]);

export const Trilha: React.FC<EstiloRough & { pontos: P[] }> = (p) =>
  useForma(p, (o) => gerador.linearPath(p.pontos, o), [
    JSON.stringify(p.pontos),
  ]);

export const Curva: React.FC<EstiloRough & { pontos: P[] }> = (p) =>
  useForma(p, (o) => gerador.curve(p.pontos, o), [JSON.stringify(p.pontos)]);

export const Caminho: React.FC<EstiloRough & { d: string }> = (p) =>
  useForma(p, (o) => gerador.path(p.d, o), [p.d]);
