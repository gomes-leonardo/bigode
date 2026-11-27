// Tempo das falas do Shorts "todo mundo pulando ao mesmo tempo" (30 fps, vertical).
// Sem áudio: estimado com a voz Lucas (vídeo 1): fala = 0,0523 s por caractere + 0,227 s por vírgula + 0,156 s; pausas
// curtas de Shorts (0,18 s entre frases, 0,26 s entre parágrafos). Com áudio, os tempos vêm da narração sincronizada.
import dados from "./falas.json";
import audio from "./falas_audio.json";

export const FPS = 30;
export type Fala = { id: number; texto: string; paragrafo: number; fimParagrafo: boolean; citacao: boolean; caracteres: number; virgulas: number; ini: number; fim: number };

export const ENTRADA = 0.25;
const SAIDA = 1.3;

const lista = audio as { id: number; ini: number; fim: number }[];
export const COM_AUDIO = lista.length === dados.length;
const porId = new Map(lista.map((a) => [a.id, a]));

export const FALAS: Fala[] = (() => {
  if (COM_AUDIO) return dados.map((d) => { const a = porId.get(d.id)!; return { ...d, ini: Math.round((ENTRADA + a.ini) * FPS), fim: Math.round((ENTRADA + a.fim) * FPS) }; });
  let t = ENTRADA;
  return dados.map((d) => {
    const dur = 0.0523 * d.caracteres + 0.227 * d.virgulas + 0.156;
    const ini = Math.round(t * FPS), fim = Math.round((t + dur) * FPS);
    t += dur + (d.fimParagrafo ? 0.26 : 0.18);
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
/** fração da fala onde começa um trecho do texto */
export const fracDe = (id: number, trecho: string) => {
  const t = FALAS[id].texto;
  const i = t.indexOf(trecho);
  if (i < 0) throw new Error(`"${trecho}" não está na fala ${id}`);
  return i / t.length;
};
