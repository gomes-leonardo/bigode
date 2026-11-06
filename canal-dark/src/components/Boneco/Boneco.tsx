import React from "react";
import { COR } from "../../theme";
import { Circulo, Linha, P, Poligono } from "../Rough";
import { Pose } from "./poses";

// Medidas do esqueleto em unidades; "escala" converte para px. Altura total ≈ 230 * escala.
const L = {
  tronco: 78,
  pescoco: 10,
  raio: 22,
  braco: 42,
  antebraco: 40,
  coxa: 46,
  canela: 46,
};
const rad = (g: number) => (g * Math.PI) / 180;

type Props = {
  id: string;
  x: number; // centro do quadril
  chao: number; // y dos pés
  pose: Pose;
  escala?: number;
  espelhar?: boolean;
  terno?: boolean;
  oculosEscuros?: boolean;
  cor?: string;
  espessura?: number;
};

export const alturaBoneco = (escala: number) =>
  (L.coxa + L.canela + L.tronco + L.pescoco + L.raio * 2) * escala;

// Posição da cabeça em px (útil para enquadrar o olhar em 38%/62%).
export const cabecaDoBoneco = (
  x: number,
  chao: number,
  pose: Pose,
  escala = 2,
) => {
  const quadril: P = [x, chao - (L.coxa + L.canela) * escala * 0.97];
  const t = rad(pose.tronco);
  const pesc: P = [
    quadril[0] + Math.sin(t) * L.tronco * escala,
    quadril[1] - Math.cos(t) * L.tronco * escala,
  ];
  const c = rad(pose.tronco + pose.cabeca);
  return [
    pesc[0] + Math.sin(c) * (L.pescoco + L.raio) * escala,
    pesc[1] - Math.cos(c) * (L.pescoco + L.raio) * escala,
  ] as P;
};

export const Boneco: React.FC<Props> = ({
  id,
  x,
  chao,
  pose,
  escala = 2,
  espelhar = false,
  terno = false,
  oculosEscuros = false,
  cor = COR.traco,
  espessura = 5,
}) => {
  const sx = espelhar ? -1 : 1;
  const k = escala;
  // segmento a partir de "de", ângulo "a" (0 = para baixo), lado: +1 direita, -1 esquerda
  const seg = (de: P, a: number, comp: number, lado: number): P => [
    de[0] + Math.sin(rad(a)) * comp * k * lado * sx,
    de[1] + Math.cos(rad(a)) * comp * k,
  ];

  const flexao = Math.max(0, -Math.min(pose.pernaE[1], pose.pernaD[1])) / 90; // joelho dobrado abaixa o quadril
  const quadril: P = [
    x,
    chao - (L.coxa + L.canela) * k * (0.97 - flexao * 0.12),
  ];
  const t = pose.tronco * sx;
  const pescoco: P = [
    quadril[0] + Math.sin(rad(t)) * L.tronco * k,
    quadril[1] - Math.cos(rad(t)) * L.tronco * k,
  ];
  const ombro: P = [pescoco[0] + Math.sin(rad(t)) * -6 * k, pescoco[1] + 6 * k];
  const ac = rad(t + pose.cabeca * sx);
  const cabeca: P = [
    pescoco[0] + Math.sin(ac) * (L.pescoco + L.raio) * k,
    pescoco[1] - Math.cos(ac) * (L.pescoco + L.raio) * k,
  ];
  const baseCabeca: P = [
    cabeca[0] - Math.sin(ac) * L.raio * k,
    cabeca[1] + Math.cos(ac) * L.raio * k,
  ];

  const cotoveloE = seg(ombro, pose.bracoE[0] - t * sx, L.braco, -1);
  const maoE = seg(
    cotoveloE,
    pose.bracoE[0] + pose.bracoE[1] - t * sx,
    L.antebraco,
    -1,
  );
  const cotoveloD = seg(ombro, pose.bracoD[0] + t * sx, L.braco, 1);
  const maoD = seg(
    cotoveloD,
    pose.bracoD[0] + pose.bracoD[1] + t * sx,
    L.antebraco,
    1,
  );
  const joelhoE = seg(quadril, pose.pernaE[0], L.coxa, -1);
  const peE = seg(joelhoE, pose.pernaE[0] + pose.pernaE[1], L.canela, -1);
  const joelhoD = seg(quadril, pose.pernaD[0], L.coxa, 1);
  const peD = seg(joelhoD, pose.pernaD[0] + pose.pernaD[1], L.canela, 1);

  const estilo = { cor, espessura };
  // olhos: só de frente; deslizam com o giro da cabeça e sobem com o olhar
  const giro = Math.max(0, Math.min(1, pose.giro));
  const olhoY = cabeca[1] - pose.olhar * 9 * k - 2 * k;
  const desloc = (1 - giro) * L.raio * 0.9 * k * sx;
  const olhos: P[] = [
    [cabeca[0] - 8 * k * giro + desloc, olhoY],
    [cabeca[0] + 8 * k * giro + desloc, olhoY],
  ];

  return (
    <g>
      <Linha id={`${id}-tronco`} de={quadril} ate={pescoco} {...estilo} />
      <Linha id={`${id}-pescoco`} de={pescoco} ate={baseCabeca} {...estilo} />
      <Linha id={`${id}-pernaE1`} de={quadril} ate={joelhoE} {...estilo} />
      <Linha id={`${id}-pernaE2`} de={joelhoE} ate={peE} {...estilo} />
      <Linha id={`${id}-pernaD1`} de={quadril} ate={joelhoD} {...estilo} />
      <Linha id={`${id}-pernaD2`} de={joelhoD} ate={peD} {...estilo} />
      {terno && (
        <>
          <Poligono
            id={`${id}-paleto`}
            pontos={[
              [ombro[0] - 20 * k, ombro[1]],
              [ombro[0] + 20 * k, ombro[1]],
              [quadril[0] + 16 * k, quadril[1] + 4 * k],
              [quadril[0] - 16 * k, quadril[1] + 4 * k],
            ]}
            cor={cor}
            espessura={espessura * 0.8}
            preenchimento={COR.fundo}
          />
          <Linha
            id={`${id}-lapelaE`}
            de={[ombro[0] - 12 * k, ombro[1]]}
            ate={[ombro[0], ombro[1] + 26 * k]}
            cor={cor}
            espessura={espessura * 0.7}
          />
          <Linha
            id={`${id}-lapelaD`}
            de={[ombro[0] + 12 * k, ombro[1]]}
            ate={[ombro[0], ombro[1] + 26 * k]}
            cor={cor}
            espessura={espessura * 0.7}
          />
          <Poligono
            id={`${id}-gravata`}
            pontos={[
              [ombro[0] - 3 * k, ombro[1] + 2 * k],
              [ombro[0] + 3 * k, ombro[1] + 2 * k],
              [ombro[0] + 4 * k, ombro[1] + 30 * k],
              [ombro[0], ombro[1] + 36 * k],
              [ombro[0] - 4 * k, ombro[1] + 30 * k],
            ]}
            cor={cor}
            espessura={espessura * 0.5}
            preenchimento={cor}
            tracoUnico
          />
        </>
      )}
      <Linha id={`${id}-bracoE1`} de={ombro} ate={cotoveloE} {...estilo} />
      <Linha id={`${id}-bracoE2`} de={cotoveloE} ate={maoE} {...estilo} />
      <Linha id={`${id}-bracoD1`} de={ombro} ate={cotoveloD} {...estilo} />
      <Linha id={`${id}-bracoD2`} de={cotoveloD} ate={maoD} {...estilo} />
      <Circulo
        id={`${id}-cabeca`}
        cx={cabeca[0]}
        cy={cabeca[1]}
        d={L.raio * 2 * k}
        {...estilo}
        preenchimento={COR.fundo}
      />
      {giro > 0.15 &&
        !oculosEscuros &&
        olhos.map(([ox, oy], i) => (
          <circle
            key={i}
            cx={ox}
            cy={oy}
            r={2.6 * k}
            fill={cor}
            opacity={Math.min(1, (giro - 0.15) * 3)}
          />
        ))}
      {giro > 0.05 && oculosEscuros && (
        <g opacity={Math.min(1, giro * 2)}>
          {olhos.map(([ox, oy], i) => (
            <Poligono
              key={i}
              id={`${id}-lente${i}`}
              pontos={[
                [ox - 7 * k * giro, oy - 4 * k],
                [ox + 7 * k * giro, oy - 4 * k],
                [ox + 6 * k * giro, oy + 5 * k],
                [ox - 6 * k * giro, oy + 5 * k],
              ]}
              cor={cor}
              espessura={3}
              preenchimento="#000"
              tracoUnico
            />
          ))}
          <Linha
            id={`${id}-ponte`}
            de={[olhos[0][0] + 6 * k * giro, olhos[0][1] - 2 * k]}
            ate={[olhos[1][0] - 6 * k * giro, olhos[1][1] - 2 * k]}
            cor={cor}
            espessura={3}
            tracoUnico
          />
        </g>
      )}
    </g>
  );
};
