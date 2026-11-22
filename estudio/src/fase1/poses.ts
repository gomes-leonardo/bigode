// As 6 poses da folha da Fase 1 (alvos de mão e pé no espaço do personagem).
import type { PersonProps } from "../components/Person";

type Pose = Omit<PersonProps, "x" | "y">;
export const POSES: { nome: string; pose: Pose }[] = [
  { nome: "mão no bolso", pose: { expr: "sigma", hip: 5, handL: [-34, -98], gripL: "none", handR: [36, -96], gripR: "none", footL: [-34, 0], footR: [30, 0], lookAt: [400, -330] } },
  { nome: "braços cruzados", pose: { expr: "convencido", hip: -4, handL: [46, -172], gripL: "fist", handR: [-48, -168], gripR: "fist", frente: "R", footL: [-36, 0], footR: [34, 0], lookAt: [300, -340] } },
  { nome: "dando de ombros", pose: { expr: "olhar-lateral", ombros: 12, headTilt: 5, handL: [-124, -150], gripL: "open", handR: [126, -154], gripR: "open", footL: [-30, 0], footR: [32, 0], lookAt: [260, -700] } },
  { nome: "apontando", pose: { expr: "convencido", lean: -2, hip: 3, handR: [178, -238], gripR: "point", bendR: 4, handL: [-72, -112], footL: [-34, 0], footR: [36, 0], lookAt: [500, -260] } },
  { nome: "andando", pose: { expr: "sigma", lean: 3, hip: -3, footL: [-56, -6], footR: [64, 0], kneeR: 4, kneeL: 4, handL: [-92, -126], handR: [60, -110], lookAt: [600, -330] } },
  { nome: "susto", pose: { expr: "chocado", pulo: 26, ombros: 8, handL: [-96, -300], gripL: "open", handR: [98, -306], gripR: "open", footL: [-24, -4], footR: [28, 0], kneeL: 8, kneeR: 8 } },
];
