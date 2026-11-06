import React from "react";
import { COR } from "../../theme";
import { P, Poligono, Trilha } from "../Rough";

// Risco/rastro no céu: curva de Bézier desenhada até "progresso", com ponta destacada.
type Props = {
  id: string;
  de: P;
  controle: P;
  ate: P;
  progresso: number;
  corPonta?: string;
  espessura?: number;
};

const bezier = (a: P, c: P, b: P, t: number): P => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];

export const RastroCeu: React.FC<Props> = ({
  id,
  de,
  controle,
  ate,
  progresso,
  corPonta = COR.vermelho,
  espessura = 6,
}) => {
  const p = Math.max(0, Math.min(1, progresso));
  if (p <= 0) return null;
  const n = 24;
  const pts: P[] = Array.from(
    { length: Math.max(2, Math.ceil(n * p) + 1) },
    (_, i) => bezier(de, controle, ate, Math.min(p, i / n)),
  );
  const ponta = bezier(de, controle, ate, p);
  return (
    <g>
      <Trilha
        id={`${id}-fumaca`}
        pontos={pts}
        espessura={espessura * 4}
        cor={COR.tracoApagado}
        opacidade={0.25}
        tracoUnico
      />
      <Trilha id={`${id}-linha`} pontos={pts} espessura={espessura} />
      {/* corpo do míssil alinhado com a tangente da curva */}
      <g
        transform={`translate(${ponta[0]} ${ponta[1]}) rotate(${(Math.atan2(ponta[1] - pts[Math.max(0, pts.length - 2)][1], ponta[0] - pts[Math.max(0, pts.length - 2)][0]) * 180) / Math.PI})`}
      >
        <Poligono
          id={`${id}-missil`}
          pontos={[
            [10, 0],
            [-8, -9],
            [-58, -9],
            [-74, -24],
            [-74, 24],
            [-58, 9],
            [-8, 9],
          ]}
          cor={corPonta}
          espessura={4}
          preenchimento={corPonta}
          tracoUnico
        />
      </g>
    </g>
  );
};
