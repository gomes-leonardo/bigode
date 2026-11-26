// Os planos do Shorts presos às falas (o corte cai na pausa ou numa palavra). `render` é o número do plano no Blender
// (dedo/plano.py); o 27 é o close das cartilagens ("para que um osso não raspe no outro"), um ângulo a mais.
import { CORTE, DURACAO, T, fracDe } from "./tempo";

export type Plano = { n: number; render: number; de: number; ate: number; desc: string };

const p = (n: number, render: number, de: number, ate: number, desc: string): Plano => ({ n, render, de, ate, desc });

const em = (id: number, trecho: string) => T(id, fracDe(id, trecho));

export const PLANOS: Plano[] = [
  p(1, 1, 0, CORTE(0), "close na mão, o dedo sendo puxado"),
  p(2, 2, CORTE(0), CORTE(1), "raio-x: os ossos da junta"),
  p(3, 3, CORTE(1), em(2, "parecido"), "corte da junta, o líquido brilha"),
  p(4, 4, em(2, "parecido"), em(3, "para que"), "macro do líquido entre as cartilagens"),
  p(5, 27, em(3, "para que"), CORTE(3), "as cartilagens deslizando, sem raspar"),
  p(6, 5, CORTE(3), CORTE(5), "zoom no líquido até as bolinhas de gás"),
  p(7, 6, CORTE(5), CORTE(6), "garrafa de refrigerante fechada"),
  p(8, 7, CORTE(6), em(7, "você afasta"), "a mão começa a puxar"),
  p(9, 8, em(7, "você afasta"), CORTE(8), "os ossos se afastando"),
  p(10, 9, CORTE(8), CORTE(9), "a pressão despenca"),
  p(11, 10, CORTE(9), CORTE(10), "a tampa gira e solta"),
  p(12, 11, CORTE(10), CORTE(11), "o gás saindo da solução"),
  p(13, 12, CORTE(11), CORTE(12), "a cavidade se abre"),
  p(14, 13, CORTE(12), CORTE(13), "congela na bolha"),
  p(15, 14, CORTE(13), T(16), "os falsos culpados riscados"),
  p(16, 15, T(16), CORTE(16), "a bolha girando devagar"),
  p(17, 16, CORTE(16), em(18, "você não consegue"), "a mão tenta estalar de novo"),
  p(18, 17, em(18, "você não consegue"), CORTE(18), "tenta de novo: nada"),
  p(19, 18, CORTE(18), CORTE(19), "relógio: vinte minutos"),
  p(20, 19, CORTE(19), CORTE(20), "o gás se dissolvendo de volta"),
  p(21, 20, CORTE(20), CORTE(21), "a junta recarregando"),
  p(22, 21, CORTE(21), CORTE(22), "cozinha: o dedo em riste"),
  p(23, 22, CORTE(22), CORTE(23), "o médico de costas na escrivaninha"),
  p(24, 23, CORTE(23), CORTE(25), "uma mão estala, a outra não"),
  p(25, 24, CORTE(25), CORTE(27), "sessenta anos passando"),
  p(26, 25, CORTE(27), CORTE(29), "as duas mãos em raio-x, iguais"),
  p(27, 26, CORTE(29), DURACAO, "volta ao primeiro plano: a pergunta"),
];
export const DURACOES = PLANOS.map((x) => ({ render: x.render, quadros: x.ate - x.de }));
