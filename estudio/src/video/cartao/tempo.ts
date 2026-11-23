// Tempo das falas do roteiro. Agora vem da narração (ElevenLabs): scripts/sincroniza_narracao.py alinha a transcrição
// de cada parte às falas, encurta as pausas longas, abre o respiro dos "Bip." e grava a trilha (public/audio/narracao.mp3)
// com o começo e o fim de cada fala (falas_audio.json). Todo o vídeo é preso a T(fala) e CORTE(fala), então acompanha.
import dados from "./falas.json";
import audio from "./falas_audio.json";

export const FPS = 30;
export type Fala = { id: number; texto: string; paragrafo: number; fimParagrafo: boolean; citacao: boolean; caracteres: number; virgulas: number; ini: number; fim: number };

/** a narração começa meio segundo depois do primeiro quadro; o último plano segura 2 s depois da última fala */
export const ENTRADA = 0.5;
const SAIDA = 2.0;
const porId = new Map(audio.map((a) => [a.id, a]));

export const FALAS: Fala[] = dados.map((d) => {
  const a = porId.get(d.id);
  if (!a) throw new Error(`fala ${d.id} sem tempo na narração`);
  return { ...d, ini: Math.round((ENTRADA + a.ini) * FPS), fim: Math.round((ENTRADA + a.fim) * FPS) };
});
export const DURACAO = FALAS[FALAS.length - 1].fim + Math.round(SAIDA * FPS);

/** quadro dentro da fala `id` (frac 0 = começo, 1 = fim) */
export const T = (id: number, frac = 0) => {
  const f = FALAS[id];
  return Math.round(f.ini + (f.fim - f.ini) * frac);
};
/** ponto de corte depois da fala `id`: meio da pausa até a próxima */
export const CORTE = (id: number) => (id + 1 < FALAS.length ? Math.round((FALAS[id].fim + FALAS[id + 1].ini) / 2) : DURACAO);
/** fala da legenda num quadro: segura na pausa até a próxima fala começar (no máximo 0,6 s depois do fim),
 * para frase curta não piscar na tela */
export const falaNoQuadro = (f: number) => {
  let i = -1;
  for (let k = 0; k < FALAS.length && FALAS[k].ini <= f; k++) i = k;
  if (i < 0) return undefined;
  const x = FALAS[i];
  const limite = Math.min(i + 1 < FALAS.length ? FALAS[i + 1].ini : Infinity, x.fim + 18);
  return f < Math.max(x.fim, limite) ? x : undefined;
};
