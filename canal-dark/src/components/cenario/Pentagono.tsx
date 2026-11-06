import React from "react";
import { COR } from "../../theme";
import { Linha, P, Poligono } from "../Rough";

// Pentágono visto de cima: anel externo, anel interno, pátio e corredores radiais.
const vertices = (cx: number, cy: number, r: number, rot: number): P[] =>
  Array.from({ length: 5 }, (_, i) => {
    const a = ((rot + i * 72 - 90) * Math.PI) / 180;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });

export const Pentagono: React.FC<{
  id: string;
  cx: number;
  cy: number;
  r: number;
  rot?: number;
  impacto?: number;
}> = ({ id, cx, cy, r, rot = 0, impacto = 0 }) => {
  const ext = vertices(cx, cy, r, rot);
  const meio = vertices(cx, cy, r * 0.72, rot);
  const pat = vertices(cx, cy, r * 0.42, rot);
  return (
    <g>
      <Poligono
        id={`${id}-ext`}
        pontos={ext}
        espessura={6}
        preenchimento={COR.fundo}
      />
      <Poligono id={`${id}-meio`} pontos={meio} espessura={3} opacidade={0.6} />
      <Poligono id={`${id}-pat`} pontos={pat} espessura={5} />
      {ext.map((v, i) => (
        <Linha
          key={i}
          id={`${id}-rad${i}`}
          de={v}
          ate={pat[i]}
          espessura={3}
          opacidade={0.55}
          tracoUnico
        />
      ))}
      {impacto > 0 && (
        <g opacity={impacto}>
          <Poligono
            id={`${id}-dano`}
            pontos={[
              ext[1],
              [(ext[1][0] + ext[2][0]) / 2, (ext[1][1] + ext[2][1]) / 2],
              [(meio[1][0] + meio[2][0]) / 2, (meio[1][1] + meio[2][1]) / 2],
            ]}
            cor={COR.vermelho}
            espessura={4}
            preenchimento={COR.vermelho}
            estiloPreenchimento="hachure"
          />
        </g>
      )}
    </g>
  );
};

export const verticePentagono = (
  cx: number,
  cy: number,
  r: number,
  rot: number,
  i: number,
) => vertices(cx, cy, r, rot)[i];
