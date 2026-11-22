// Tempo das falas do roteiro (sem áudio ainda): estimado pelo tamanho falado de cada frase.
// Ritmo calibrado na narração do Téo (ElevenLabs, voz B): 15,6 caracteres/s, 0,42 s entre frases, 0,2 s nas vírgulas,
// 0,7 s no fim de parágrafo. Tudo é acelerado pelo mesmo fator para o vídeo durar ALVO_S (pedido: 8 a 9 min).
// Quando a narração chegar, os tempos de cada fala vêm do áudio e o resto do vídeo acompanha sozinho.
import dados from "./falas.json";

export const FPS = 30;
export const ALVO_S = 540;
export type Fala = { id: number; texto: string; paragrafo: number; fimParagrafo: boolean; citacao: boolean; caracteres: number; virgulas: number; ini: number; fim: number };

const ENTRADA = 0.6, SAIDA = 2.0; // segundos antes da primeira fala e depois da última
const bruto = (d: (typeof dados)[number]) => d.caracteres / 15.6 + d.virgulas * 0.2;
const pausa = (d: (typeof dados)[number]) => (d.fimParagrafo ? 0.7 : 0.42);
const somaBase = dados.reduce((a, d) => a + bruto(d) + pausa(d), 0);
export const ACELERA = somaBase / (ALVO_S - ENTRADA - SAIDA);

export const FALAS: Fala[] = (() => {
  let t = ENTRADA;
  return dados.map((d) => {
    const dur = Math.max(0.42, bruto(d) / ACELERA);
    const ini = Math.round(t * FPS), fim = Math.round((t + dur) * FPS);
    t += dur + pausa(d) / ACELERA;
    return { ...d, ini, fim };
  });
})();
export const DURACAO = FALAS[FALAS.length - 1].fim + Math.round(SAIDA * FPS);

/** quadro dentro da fala `id` (frac 0 = começo, 1 = fim) */
export const T = (id: number, frac = 0) => {
  const f = FALAS[id];
  return Math.round(f.ini + (f.fim - f.ini) * frac);
};
/** ponto de corte depois da fala `id`: meio da pausa até a próxima */
export const CORTE = (id: number) => (id + 1 < FALAS.length ? Math.round((FALAS[id].fim + FALAS[id + 1].ini) / 2) : DURACAO);
/** fala no ar num quadro (ou undefined na pausa) */
export const falaNoQuadro = (f: number) => FALAS.find((x) => f >= x.ini && f < x.fim);
