import React from "react";
import { interpolate, random } from "remotion";
import { tremor, useBoilTick } from "../../lib/boil";
import { COR, FONTE } from "../../theme";
import { Poligono, Retangulo, Trilha } from "../Rough";

// Pilha de relatórios: folhas empilhadas com linhas de texto. O topo recebe um ícone (children).
export const PilhaRelatorios: React.FC<{
  id: string;
  x: number;
  base: number;
  w: number;
  folhas?: number;
  children?: React.ReactNode;
}> = ({ id, x, base, w, folhas = 9, children }) => {
  const esp = 16;
  const topoY = base - folhas * esp - w * 1.25;
  return (
    <g>
      {Array.from({ length: folhas }, (_, i) => {
        const dx = (random(`${id}-dx${i}`) - 0.5) * 26;
        return (
          <Retangulo
            key={i}
            id={`${id}-f${i}`}
            x={x + dx}
            y={base - (i + 1) * esp}
            w={w}
            h={esp}
            espessura={3.5}
            preenchimento={COR.fundo}
            tracoUnico
          />
        );
      })}
      {/* folha do topo, em perspectiva leve */}
      <Poligono
        id={`${id}-topo`}
        pontos={[
          [x - 6, base - folhas * esp],
          [x + w + 6, base - folhas * esp],
          [x + w - 10, topoY],
          [x + 10, topoY],
        ]}
        espessura={4}
        preenchimento={COR.fundo}
      />
      {Array.from({ length: 6 }, (_, i) => (
        <line
          key={i}
          x1={x + 50}
          x2={x + 50 + (w - 100) * (0.55 + random(`${id}-l${i}`) * 0.4)}
          y1={topoY + 70 + i * 34}
          y2={topoY + 70 + i * 34}
          stroke={COR.traco}
          strokeWidth={4}
          opacity={0.3}
        />
      ))}
      <g
        transform={`translate(${x + w / 2} ${topoY + (base - folhas * esp - topoY) * 0.62})`}
      >
        {children}
      </g>
    </g>
  );
};

// Carimbo que bate: escala 2.2 -> 1 com tranco.
export const Carimbo: React.FC<{
  id: string;
  x: number;
  y: number;
  texto: string;
  progresso: number;
  rot?: number;
  tamanho?: number;
}> = ({ id, x, y, texto, progresso, rot = -8, tamanho = 76 }) => {
  if (progresso <= 0) return null;
  const s = interpolate(progresso, [0, 1], [2.2, 1]);
  const largura = texto.length * tamanho * 0.74 + 50;
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      opacity={Math.min(1, progresso * 2)}
    >
      <Retangulo
        id={`${id}-borda`}
        x={-largura / 2}
        y={-tamanho * 0.85}
        w={largura}
        h={tamanho * 1.45}
        cor={COR.vermelho}
        espessura={8}
      />
      <text
        x={0}
        y={tamanho * 0.32}
        fill={COR.vermelho}
        fontFamily={FONTE}
        fontWeight={900}
        fontSize={tamanho}
        textAnchor="middle"
        letterSpacing={tamanho * 0.08}
      >
        {texto}
      </text>
    </g>
  );
};

// Documento antigo amarelado saindo de uma pasta. saida 0..1 = quanto já saiu.
export const DocumentoAntigo: React.FC<{
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  saida: number;
  carimbo?: number;
}> = ({ id, x, y, w, h, saida, carimbo = 0 }) => {
  const tick = useBoilTick();
  const subida = saida * h * 0.45; // sobe o bastante para ler o cabeçalho, sem sair do quadro
  const pastaTopo = y + h * 0.42;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-dentro`}>
          <rect
            x={x - 200}
            y={-2000}
            width={w + 400}
            height={pastaTopo + 2000 + h * 0.6}
          />
        </clipPath>
      </defs>
      {/* fundo da pasta */}
      <Poligono
        id={`${id}-pastaFundo`}
        pontos={[
          [x - 40, pastaTopo - 40],
          [x + w * 0.35, pastaTopo - 40],
          [x + w * 0.42, pastaTopo - 70],
          [x + w + 40, pastaTopo - 70],
          [x + w + 40, pastaTopo + h * 0.62],
          [x - 40, pastaTopo + h * 0.62],
        ]}
        espessura={5}
        preenchimento="#141312"
      />
      {/* recorte fora do translate: a pasta fica parada e o papel sobe de dentro dela */}
      <g clipPath={`url(#${id}-dentro)`}>
        <g transform={`translate(0 ${-subida})`}>
          <g
            transform={`rotate(${-2 + saida * 1.5} ${x + w / 2} ${y + h / 2})`}
          >
            <Retangulo
              id={`${id}-papel`}
              x={x}
              y={y + h * 0.35}
              w={w}
              h={h}
              cor={COR.tinta}
              espessura={3}
              preenchimento={COR.papelVelho}
            />
            <text
              x={x + 46}
              y={y + h * 0.35 + 84}
              fill={COR.tinta}
              fontFamily="'Liberation Mono', 'DejaVu Sans Mono', monospace"
              fontWeight={700}
              fontSize={34}
              letterSpacing={2}
            >
              JOINT CHIEFS OF STAFF
            </text>
            <text
              x={x + 46}
              y={y + h * 0.35 + 130}
              fill={COR.tinta}
              fontFamily="'Liberation Mono', 'DejaVu Sans Mono', monospace"
              fontSize={26}
              opacity={0.8}
            >
              MEMORANDUM · 1962
            </text>
            <text
              x={x + 46}
              y={y + h * 0.35 + 164}
              fill={COR.tinta}
              fontFamily={FONTE}
              fontWeight={800}
              fontSize={24}
              opacity={0.75}
            >
              (Estado-Maior Conjunto dos EUA)
            </text>
            {Array.from({ length: 9 }, (_, i) => {
              const [dx, dy] = tremor(tick, `${id}-txt${i}`, 0.8);
              return (
                <rect
                  key={i}
                  x={x + 46 + dx}
                  y={y + h * 0.35 + 205 + i * 44 + dy}
                  width={(w - 92) * (0.5 + random(`${id}-tl${i}`) * 0.48)}
                  height={13}
                  fill={COR.tinta}
                  opacity={i === 4 ? 0.85 : 0.35}
                />
              );
            })}
            <Trilha
              id={`${id}-assin1`}
              pontos={[
                [x + 60, y + h * 0.35 + h - 120],
                [x + 100, y + h * 0.35 + h - 160],
                [x + 130, y + h * 0.35 + h - 110],
                [x + 170, y + h * 0.35 + h - 150],
                [x + 230, y + h * 0.35 + h - 120],
              ]}
              cor={COR.tinta}
              espessura={4}
            />
            <Trilha
              id={`${id}-assin2`}
              pontos={[
                [x + w - 300, y + h * 0.35 + h - 130],
                [x + w - 260, y + h * 0.35 + h - 170],
                [x + w - 220, y + h * 0.35 + h - 120],
                [x + w - 170, y + h * 0.35 + h - 160],
              ]}
              cor={COR.tinta}
              espessura={4}
            />
            <Carimbo
              id={`${id}-ts`}
              x={x + w * 0.62}
              y={y + h * 0.35 + 300}
              texto="TOP SECRET"
              progresso={carimbo}
              rot={-12}
              tamanho={58}
            />
          </g>
        </g>
      </g>
      {/* frente da pasta por cima do papel */}
      <Poligono
        id={`${id}-pastaFrente`}
        pontos={[
          [x - 50, pastaTopo + 40],
          [x + w + 50, pastaTopo + 40],
          [x + w + 40, pastaTopo + h * 0.62],
          [x - 40, pastaTopo + h * 0.62],
        ]}
        espessura={5}
        preenchimento="#1b1a18"
      />
      <text
        x={x + w / 2}
        y={pastaTopo + h * 0.36}
        fill={COR.traco}
        fontFamily={FONTE}
        fontWeight={800}
        fontSize={34}
        letterSpacing={6}
        textAnchor="middle"
        opacity={0.6}
      >
        ARQUIVO
      </text>
    </g>
  );
};
