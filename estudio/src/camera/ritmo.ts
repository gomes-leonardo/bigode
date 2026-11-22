// Regras de ritmo para todos os vídeos (GUIA_DE_ESTILO.md), verificadas na linha do tempo:
// 1) 3 a 4 eventos visuais a cada 8 s (pose, expressão, objeto ou câmera);
// 2) nenhum plano parado por mais de 3 s;
// 3) troca de plano só nas pausas da fala;
// 4) toda fala com verbo físico mostra o verbo na imagem (um evento marcado com aquele verbo durante a fala).
export type TipoEvento = "pose" | "expressao" | "objeto" | "camera" | "corte";
export type Evento = { f: number; tipo: TipoEvento; desc: string; verbo?: string };
export type Fala = { de: number; ate: number; texto: string };
export type Problema = { regra: 1 | 2 | 3 | 4; f: number; msg: string; grave: boolean };

/** eventos a menos de 6 quadros um do outro contam como uma batida só (ex.: zoom de reação + troca de expressão) */
export const BATIDA = 6;

// ------------------------------------------------------------------ verbos físicos (formas comuns na narração)
const LETRA = "[\\wÀ-ÿ]";
const formas = (lista: string[]) => new RegExp(`(?<!${LETRA})(${lista.join("|")})(?!${LETRA})`, "i");
const ar = (r: string) => ["a", "o", "ou", "ar", "ando", "am", "aram", "e", "ei", "em", "amos", "asse", "aria", "ará"].map((t) => r + t);
const er = (r: string) => ["e", "o", "eu", "er", "endo", "em", "eram", "a", "i", "emos", "esse", "eria", "erá"].map((t) => r + t);
const ir = (r: string) => ["e", "o", "iu", "ir", "indo", "em", "iram", "a", "i", "imos", "isse", "iria", "irá"].map((t) => r + t);

/** verbo -> formas. É um filtro de candidatos: o relatório pede conferência quando o sentido pode ser figurado. */
export const VERBOS_FISICOS: Record<string, RegExp> = {
  bater: formas(er("bat")), pisar: formas(ar("pis")), comer: formas(er("com")), pegar: formas([...ar("peg"), "pegue", "peguei"]),
  cair: formas(["cai", "caiu", "cair", "caindo", "caio", "caem", "caíram", "caia", "caísse", "cairá"]),
  chutar: formas(ar("chut")), correr: formas(er("corr")), pular: formas(ar("pul")), andar: formas(ar("and")),
  sentar: formas(ar("sent")), deitar: formas(ar("deit")), levantar: formas(ar("levant")), empurrar: formas(ar("empurr")),
  puxar: formas(ar("pux")), jogar: formas([...ar("jog"), "jogue", "joguei"]), abrir: formas(ir("abr")), fechar: formas(ar("fech")),
  cortar: formas(ar("cort")), passar: formas(ar("pass")), beber: formas(er("beb")), tomar: formas(ar("tom")),
  segurar: formas(ar("segur")), quebrar: formas(ar("quebr")), rasgar: formas([...ar("rasg"), "rasgue"]), acenar: formas(ar("acen")),
  apontar: formas(ar("apont")), abraçar: formas([...ar("abraç"), "abrace", "abracei"]), tropeçar: formas([...ar("tropeç"), "tropece"]),
  entregar: formas([...ar("entreg"), "entregue"]), guardar: formas(ar("guard")), pagar: formas([...ar("pag"), "pague", "paguei"]),
  comprar: formas(ar("compr")), subir: formas([...ir("sub"), "sobe"]), descer: formas([...er("desc"), "desço", "desça"]),
  entrar: formas(ar("entr")), sair: formas(["sai", "saiu", "sair", "saindo", "saio", "saem", "saíram", "saia"]), olhar: formas(ar("olh")),
  rir: formas(["ri", "riu", "rir", "rindo", "rio", "riem"]), chorar: formas(ar("chor")), gritar: formas(ar("grit")),
  apertar: formas(ar("apert")), dormir: formas(["dorme", "dormiu", "dormir", "dormindo", "durmo"]),
};
export const verbosNaFala = (texto: string) => Object.entries(VERBOS_FISICOS).filter(([, re]) => re.test(texto)).map(([v]) => v);

// ------------------------------------------------------------------ verificação
export const verificaRitmo = (o: { duracao: number; fps?: number; eventos: Evento[]; falas?: Fala[]; cortes?: number[] }) => {
  const fps = o.fps ?? 30;
  const janela = 8 * fps, maxParado = 3 * fps;
  const cortes = [...new Set([0, ...(o.cortes ?? [])])].sort((a, b) => a - b);
  const marcas = [...o.eventos.map((e) => e.f), ...cortes].sort((a, b) => a - b);
  const batidas: number[] = [];
  for (const m of marcas) if (!batidas.length || m - batidas[batidas.length - 1] >= BATIDA) batidas.push(m);
  const problemas: Problema[] = [];
  const s = (f: number) => `${(f / fps).toFixed(1)} s`;

  // 1) 3 a 4 batidas em toda janela de 8 s (janelas inteiras, passo de 1 s)
  let maxJanela = 0, minJanela = Infinity;
  for (let a = 0; a + janela <= o.duracao; a += fps) {
    const n = batidas.filter((b) => b >= a && b < a + janela).length;
    maxJanela = Math.max(maxJanela, n);
    minJanela = Math.min(minJanela, n);
    if (n < 3) problemas.push({ regra: 1, f: a, msg: `${s(a)} a ${s(a + janela)}: só ${n} evento(s) em 8 s (mínimo 3)`, grave: true });
    else if (n > 4) problemas.push({ regra: 1, f: a, msg: `${s(a)} a ${s(a + janela)}: ${n} eventos em 8 s (acima de 4, fica corrido)`, grave: false });
  }
  // 2) nenhum trecho parado por mais de 3 s
  let maiorParado = 0;
  const pontos = [...batidas, o.duracao];
  for (let i = 1; i < pontos.length; i++) {
    const g = pontos[i] - pontos[i - 1];
    maiorParado = Math.max(maiorParado, g);
    if (g > maxParado) problemas.push({ regra: 2, f: pontos[i - 1], msg: `${s(pontos[i - 1])} a ${s(pontos[i])}: ${(g / fps).toFixed(1)} s sem nenhum evento (máximo 3 s)`, grave: true });
  }
  // 3) corte só na pausa da fala (tolerância de 2 quadros)
  for (const c of cortes) {
    if (c === 0) continue;
    const fala = (o.falas ?? []).find((fl) => c > fl.de + 2 && c < fl.ate - 2);
    if (fala) problemas.push({ regra: 3, f: c, msg: `corte em ${s(c)} cai no meio da fala "${fala.texto}"`, grave: true });
  }
  // 4) verbo físico na fala precisa aparecer na imagem durante a fala
  for (const fl of o.falas ?? []) {
    for (const v of verbosNaFala(fl.texto)) {
      const mostrado = o.eventos.some((e) => e.verbo === v && e.f >= fl.de - 15 && e.f <= fl.ate + 15);
      if (!mostrado) problemas.push({ regra: 4, f: fl.de, msg: `"${fl.texto}" (${s(fl.de)}): verbo "${v}" não aparece na imagem (conferir se é sentido físico)`, grave: true });
    }
  }
  const graves = problemas.filter((p) => p.grave).length;
  const resumo =
    `${batidas.length} eventos em ${(o.duracao / fps).toFixed(1)} s · ${minJanela === Infinity ? "-" : `${minJanela} a ${maxJanela}`} por 8 s · ` +
    `maior trecho parado ${(maiorParado / fps).toFixed(1)} s · ${cortes.length - 1} cortes`;
  return { ok: graves === 0, problemas, resumo, batidas };
};
