// Tempo das falas do vídeo "E se os códigos de GTA funcionassem na vida real?".
// Sem áudio: estimado com a voz do vídeo 1 (Lucas, Eleven v3), medida na narração sincronizada dele:
// fala = 0,0523 s por caractere falado + 0,227 s por vírgula + 0,156 s; pausa 0,343 s no fim de parágrafo e 0,273 s
// no meio. Com áudio (falas_audio.json preenchido pelo scripts/sincroniza_narracao.py), os tempos vêm da narração.
import dados from "./falas.json";
import audio from "./falas_audio.json";

export const FPS = 30;
export type Fala = { id: number; texto: string; paragrafo: number; fimParagrafo: boolean; citacao: boolean; caracteres: number; virgulas: number; ini: number; fim: number };

export const ENTRADA = 0.5;
const SAIDA = 2.5;
/** respiros pedidos no roteiro (segundos a mais depois da fala): as 4 teclas, o branco de 1,5 s, o silêncio do "Dois milhões." */
export const RESPIRO_DEPOIS: Record<number, number> = { 0: 0.9, 5: 1.5, 28: 1.0, 29: 1.0 };

const lista = audio as { id: number; ini: number; fim: number }[];
export const COM_AUDIO = lista.length === dados.length;
const porId = new Map(lista.map((a) => [a.id, a]));

export const FALAS: Fala[] = (() => {
  if (COM_AUDIO) return dados.map((d) => { const a = porId.get(d.id)!; return { ...d, ini: Math.round((ENTRADA + a.ini) * FPS), fim: Math.round((ENTRADA + a.fim) * FPS) }; });
  let t = ENTRADA;
  return dados.map((d) => {
    const dur = 0.0523 * d.caracteres + 0.227 * d.virgulas + 0.156;
    const ini = Math.round(t * FPS), fim = Math.round((t + dur) * FPS);
    t += dur + (d.fimParagrafo ? 0.343 : 0.273) + (RESPIRO_DEPOIS[d.id] ?? 0);
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
/** fala da legenda: segura na pausa até a próxima fala (no máximo 0,6 s depois do fim) */
export const falaNoQuadro = (f: number) => {
  let i = -1;
  for (let k = 0; k < FALAS.length && FALAS[k].ini <= f; k++) i = k;
  if (i < 0) return undefined;
  const x = FALAS[i];
  const limite = Math.min(i + 1 < FALAS.length ? FALAS[i + 1].ini : Infinity, x.fim + 18);
  return f < Math.max(x.fim, limite) ? x : undefined;
};
