import React from "react";
import { COR, FONTE } from "../../theme";
import { Circulo, Linha, Retangulo } from "../Rough";

// Porta fechada com placa "CLASSIFIED" e luz vazando por baixo.
export const PortaClassified: React.FC<{
  id: string;
  x: number;
  base: number;
  w: number;
  h: number;
  luz: number;
  texto?: string;
}> = ({ id, x, base, w, h, luz, texto = "CLASSIFIED" }) => {
  const topo = base - h;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-luz`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={COR.traco} stopOpacity={0.55 * luz} />
          <stop offset="1" stopColor={COR.traco} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`${x + 8},${base} ${x + w - 8},${base} ${x + w + 70},${base + 150} ${x - 70},${base + 150}`}
        fill={`url(#${id}-luz)`}
      />
      <Retangulo
        id={`${id}-batente`}
        x={x - 22}
        y={topo - 22}
        w={w + 44}
        h={h + 22}
        espessura={6}
      />
      <Retangulo
        id={`${id}-folha`}
        x={x}
        y={topo}
        w={w}
        h={h}
        espessura={5}
        preenchimento={COR.fundo}
      />
      <Retangulo
        id={`${id}-almofada1`}
        x={x + w * 0.14}
        y={topo + h * 0.08}
        w={w * 0.72}
        h={h * 0.3}
        espessura={2.5}
        opacidade={0.45}
        tracoUnico
      />
      <Retangulo
        id={`${id}-almofada2`}
        x={x + w * 0.14}
        y={topo + h * 0.55}
        w={w * 0.72}
        h={h * 0.36}
        espessura={2.5}
        opacidade={0.45}
        tracoUnico
      />
      <Circulo
        id={`${id}-macaneta`}
        cx={x + w * 0.84}
        cy={topo + h * 0.5}
        d={26}
        espessura={4}
      />
      <Linha
        id={`${id}-fresta`}
        de={[x + 4, base]}
        ate={[x + w - 4, base]}
        cor={COR.traco}
        espessura={4 + luz * 4}
        opacidade={0.4 + luz * 0.6}
      />
      <Retangulo
        id={`${id}-placa`}
        x={x + w * 0.06}
        y={topo + h * 0.42}
        w={w * 0.88}
        h={h * 0.1}
        cor={COR.vermelho}
        espessura={5}
        preenchimento={COR.fundo}
      />
      <text
        x={x + w / 2}
        y={topo + h * 0.42 + h * 0.072}
        fill={COR.vermelho}
        fontFamily={FONTE}
        fontWeight={900}
        fontSize={h * 0.058}
        textAnchor="middle"
        textLength={w * 0.74}
        lengthAdjust="spacingAndGlyphs"
      >
        {texto}
      </text>
    </g>
  );
};
