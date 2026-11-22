// Primitivas SVG com sombra de papel: <Papel> desenha os filhos duas vezes, primeiro uma cópia #D6D2CA
// deslocada 5px à direita e 6px para baixo (atrás), depois a forma normal. As primitivas leem o modo sombra.
import React, { createContext, useContext } from "react";
import { PAPEL, SOMBRA_DX, SOMBRA_DY } from "../estilo";

export const SombraCtx = createContext(false);
export const EscalaCtx = createContext(1); // escala acumulada, para a sombra ter sempre 5x6 px na tela
export const useSombra = () => useContext(SombraCtx);

export const Papel: React.FC<{ children: React.ReactNode; transform?: string }> = ({ children, transform }) => {
  const sombra = useContext(SombraCtx);
  const esc = useContext(EscalaCtx);
  if (sombra) return <g transform={transform}>{children}</g>;
  return (
    <g transform={transform}>
      <SombraCtx.Provider value={true}>
        <g transform={`translate(${SOMBRA_DX / esc} ${SOMBRA_DY / esc})`}>{children}</g>
      </SombraCtx.Provider>
      {children}
    </g>
  );
};

type Cores = { fill?: string; stroke?: string; opacity?: number; semSombra?: boolean };
const cor = (sombra: boolean, c?: string) => (c === undefined || c === "none" ? c : sombra ? PAPEL : c);
const prim = <T extends Cores>(Tag: string) =>
  function Prim(props: T & Record<string, unknown>) {
    const sombra = useContext(SombraCtx);
    const { semSombra, ...resto } = props as Cores & Record<string, unknown>;
    if (sombra && (semSombra || (typeof resto.opacity === "number" && resto.opacity < 1))) return null;
    return React.createElement(Tag, { ...resto, fill: cor(sombra, resto.fill as string | undefined), stroke: cor(sombra, resto.stroke as string | undefined) });
  };
export const Path = prim<React.SVGProps<SVGPathElement> & Cores>("path");
export const Ellipse = prim<React.SVGProps<SVGEllipseElement> & Cores>("ellipse");
export const Circle = prim<React.SVGProps<SVGCircleElement> & Cores>("circle");
export const Rect = prim<React.SVGProps<SVGRectElement> & Cores>("rect");
export const Line = prim<React.SVGProps<SVGLineElement> & Cores>("line");
export const Polygon = prim<React.SVGProps<SVGPolygonElement> & Cores>("polygon");
