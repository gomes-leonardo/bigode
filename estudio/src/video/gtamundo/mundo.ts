// A cidade genérica do Short "o mundo do GTA só existe onde você olha": só geometria simples (caixas como prédios,
// cápsulas como pessoas), gerada de forma determinística. Unidades em metros, Y para cima. A avenida principal corre
// no eixo Z (x = 0); o carro do jogador anda para -Z na faixa da direita (x = +2,2).
import * as THREE from "three";

export const PASSO = 70; // de uma rua à outra (quadra de 60 m + rua de 10 m)
export const RUA = 10;
export const CALCADA = 4;
export const N = 5; // quadras para cada lado do eixo
export const BORDA = N * PASSO + RUA / 2; // 355: fim do mapa
export const FAIXA_JOGADOR = 2.2;

const gerador = (semente: number) => {
  let s = semente;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

export type Peca = { x: number; y: number; z: number; w: number; h: number; d: number; cor: string; caixa: THREE.Box3; quadra: number; id: number };
const caixaDe = (x: number, y: number, z: number, w: number, h: number, d: number) =>
  new THREE.Box3(new THREE.Vector3(x - w / 2, y - h / 2, z - d / 2), new THREE.Vector3(x + w / 2, y + h / 2, z + d / 2));

export const COR = {
  asfalto: "#4d5058",
  faixa: "#f1efe6",
  calcada: "#d3cdc2",
  lote: "#bdb5a7",
  grama: "#8db36f",
  tronco: "#7a5a3c",
};
const PREDIO = ["#e8d8c3", "#d9a38a", "#c7d3dd", "#a9c1a6", "#e6c178", "#bfb3d1", "#d7c9b0", "#9fb4c7", "#e3b5a4", "#b8c9b9", "#f0e4cf", "#c9a98d"];
const FOLHA = ["#6f9e4f", "#5f8f45", "#7eae5a", "#4f8040"];
export const ROUPA = ["#d64541", "#f2b134", "#3c8dde", "#47a76a", "#8e5bc8", "#f07c3c", "#2f3640", "#e9e4da", "#e86fa0", "#1f9e9e"];
export const PELE = ["#f1c9a5", "#d9a47c", "#b07850", "#8a5a3b", "#5e3b26"];
const CARRO = ["#c0392b", "#2c6fbb", "#e8e6e1", "#2b2d31", "#7f8c8d", "#d6a531", "#3e8e5e", "#6c4f9e"];

// ---------- quadras ----------
export type Quadra = { i: number; j: number; x: number; z: number; parque: boolean; id: number };
const PARQUES = new Set(["-3,2", "2,-4", "3,1", "-4,-3", "1,3", "-2,-1"]);
export const QUADRAS: Quadra[] = [];
for (let i = -N; i < N; i++)
  for (let j = -N; j < N; j++) QUADRAS.push({ i, j, x: (i + 0.5) * PASSO, z: (j + 0.5) * PASSO, parque: PARQUES.has(`${i},${j}`), id: QUADRAS.length });

// ---------- chão (em pedaços, para poder sumir por partes) ----------
export const CHAO: Peca[] = [];
const chao = (x: number, z: number, w: number, d: number, h: number, cor: string, quadra = -1) =>
  CHAO.push({ x, y: h / 2, z, w, h, d, cor, caixa: caixaDe(x, h / 2, z, w, h, d), quadra, id: CHAO.length });
for (let k = -N; k <= N; k++)
  for (let z = -BORDA + 5; z < BORDA; z += 10) chao(k * PASSO, z, RUA, 10, 0.06, COR.asfalto, -1); // ruas N-S
for (let k = -N; k <= N; k++)
  for (let x = -BORDA + 5; x < BORDA; x += 10) if (((x % PASSO) + PASSO) % PASSO !== 0) chao(x, k * PASSO, 10, RUA, 0.06, COR.asfalto, -1); // ruas L-O
for (const q of QUADRAS) {
  for (let a = -25; a <= 25; a += 10) {
    chao(q.x + a, q.z - 28, 10, CALCADA, 0.15, COR.calcada, q.id);
    chao(q.x + a, q.z + 28, 10, CALCADA, 0.15, COR.calcada, q.id);
  }
  for (const a of [-19.5, -6.5, 6.5, 19.5]) {
    chao(q.x - 28, q.z + a, CALCADA, 13, 0.15, COR.calcada, q.id);
    chao(q.x + 28, q.z + a, CALCADA, 13, 0.15, COR.calcada, q.id);
    for (const b of [-19.5, -6.5, 6.5, 19.5]) chao(q.x + a, q.z + b, 13, 13, 0.1, q.parque ? COR.grama : COR.lote, q.id);
  }
}
// faixa tracejada no meio da avenida
export const FAIXAS: Peca[] = [];
for (let z = -BORDA + 3; z < BORDA; z += 7) {
  if (Math.abs(((z % PASSO) + PASSO) % PASSO - 0) < 7 || Math.abs(((z % PASSO) + PASSO) % PASSO - PASSO) < 7) continue;
  FAIXAS.push({ x: 0, y: 0.07, z, w: 0.18, h: 0.02, d: 3, cor: COR.faixa, caixa: caixaDe(0, 0.07, z, 0.18, 0.02, 3), quadra: -1, id: FAIXAS.length });
}

// ---------- prédios ----------
export const PREDIOS: Peca[] = [];
{
  const r = gerador(20261127);
  for (const q of QUADRAS) {
    if (q.parque) continue;
    const corta = (n: number) => {
      const c = [-26];
      for (let k = 1; k < n; k++) c.push(-26 + (52 * k) / n + (r() - 0.5) * 8);
      c.push(26);
      return c;
    };
    const cx = corta(r() < 0.55 ? 2 : 3), cz = corta(r() < 0.5 ? 2 : 3);
    const dist = Math.hypot(q.x, q.z);
    for (let a = 0; a < cx.length - 1; a++)
      for (let b = 0; b < cz.length - 1; b++) {
        if (r() < 0.08) continue; // um lote vazio de vez em quando
        const x0 = cx[a] + (a === 0 ? 0 : 1), x1 = cx[a + 1] - (a === cx.length - 2 ? 0 : 1);
        const z0 = cz[b] + (b === 0 ? 0 : 1), z1 = cz[b + 1] - (b === cz.length - 2 ? 0 : 1);
        const base = 9 + 38 * Math.exp(-dist / 230);
        let h = base * (0.55 + 0.9 * r());
        if (r() < 0.06) h *= 1.8;
        const w = x1 - x0, d = z1 - z0, x = q.x + (x0 + x1) / 2, z = q.z + (z0 + z1) / 2;
        PREDIOS.push({ x, y: h / 2, z, w, h, d, cor: PREDIO[Math.floor(r() * PREDIO.length)], caixa: caixaDe(x, h / 2, z, w, h, d), quadra: q.id, id: PREDIOS.length });
      }
  }
}

// ---------- árvores (calçadas da avenida e parques) ----------
export type Arvore = { x: number; z: number; s: number; cor: string; caixa: THREE.Box3; quadra: number; id: number };
export const ARVORES: Arvore[] = [];
{
  const r = gerador(777);
  const arvore = (x: number, z: number, quadra: number) => {
    const s = 0.85 + r() * 0.4;
    ARVORES.push({ x, z, s, cor: FOLHA[Math.floor(r() * FOLHA.length)], caixa: caixaDe(x, 2.6 * s, z, 3.4 * s, 5.2 * s, 3.4 * s), quadra, id: ARVORES.length });
  };
  for (const lado of [-1, 1])
    for (let z = -BORDA + 9; z < BORDA - 4; z += 13) {
      const m = ((z % PASSO) + PASSO) % PASSO;
      if (m < 10 || m > PASSO - 10) continue;
      const q = QUADRAS.find((k) => Math.abs(k.x - lado * 35) < 1 && Math.abs(k.z - z) <= 30);
      arvore(lado * 5.9, z, q ? q.id : -1);
    }
  for (const q of QUADRAS.filter((k) => k.parque))
    for (let a = -18; a <= 18; a += 12) for (let b = -18; b <= 18; b += 12) arvore(q.x + a + (r() - 0.5) * 5, q.z + b + (r() - 0.5) * 5, q.id);
}

// ---------- pessoas (calçadas da avenida) ----------
export type Pessoa = { lado: number; x: number; z0: number; v: number; altura: number; roupa: string; pele: string; id: number };
export const PESSOAS: Pessoa[] = [];
{
  const r = gerador(4242);
  for (let k = 0; k < 150; k++) {
    const lado = r() < 0.5 ? -1 : 1;
    const parada = r() < 0.12;
    PESSOAS.push({
      lado, x: lado * (6.6 + r() * 1.9), z0: -260 + r() * 520, v: parada ? 0 : (r() < 0.5 ? -1 : 1) * (1.0 + r() * 0.6),
      altura: 0.9 + r() * 0.22, roupa: ROUPA[Math.floor(r() * ROUPA.length)], pele: PELE[Math.floor(r() * PELE.length)], id: k,
    });
  }
}
const ZMIN = -270, ZMAX = 270;
export const posPessoa = (p: Pessoa, t: number) => {
  const z = ZMIN + ((((p.z0 - ZMIN + p.v * t) % (ZMAX - ZMIN)) + (ZMAX - ZMIN)) % (ZMAX - ZMIN));
  return { x: p.x, z, passo: p.v === 0 ? 0 : Math.abs(Math.sin((t * 2 * Math.abs(p.v) * Math.PI) / 1.3 + p.id)) };
};

// ---------- trânsito: só na faixa contrária (para não atravessar o carro do jogador) e carros estacionados ----------
export type Carro = { x: number; z0: number; v: number; cor: string; id: number };
export const CARROS: Carro[] = [];
{
  const r = gerador(99);
  for (let k = 0; k < 14; k++) CARROS.push({ x: -2.3, z0: -350 + k * 50 + r() * 20, v: 9 + r() * 3, cor: CARRO[Math.floor(r() * CARRO.length)], id: k });
  for (let k = 0; k < 12; k++) {
    const z = -300 + k * 52 + r() * 10;
    const m = ((z % PASSO) + PASSO) % PASSO;
    if (m < 12 || m > PASSO - 12) continue;
    CARROS.push({ x: 4.15, z0: z, v: 0, cor: CARRO[Math.floor(r() * CARRO.length)], id: 100 + k });
  }
}
export const posCarro = (c: Carro, t: number) => {
  if (c.v === 0) return c.z0;
  const L = 2 * BORDA;
  return -BORDA + ((((c.z0 + BORDA + c.v * t) % L) + L) % L);
};

// ---------- câmera do jogo e recorte ----------
export type Visao = { pos: THREE.Vector3; alvo: THREE.Vector3; fov: number; aspecto: number; longe: number };
export const cameraDe = (v: Visao) => {
  const c = new THREE.PerspectiveCamera(v.fov, v.aspecto, 0.3, v.longe);
  c.position.copy(v.pos);
  c.lookAt(v.alvo);
  c.updateMatrixWorld(true);
  c.updateProjectionMatrix();
  return c;
};
/**
 * A pirâmide de visão como volume de verdade, com teste exato contra caixas (eixos separadores). O teste rápido do
 * three.js é conservador: aceita caixas grandes que só "encostam" em planos diferentes com cantos diferentes, e aí um
 * prédio atrás da câmera aparecia. Aqui só entra o que de fato tem algum pedaço dentro da pirâmide.
 */
export type Regiao = { toca: (b: THREE.Box3) => boolean };
export const regiaoDe = (v: Visao): Regiao => {
  const c = cameraDe(v);
  const perto = 0.3, longe = v.longe;
  const t = Math.tan(THREE.MathUtils.degToRad(v.fov / 2));
  const vert: THREE.Vector3[] = [];
  for (const d of [perto, longe])
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) vert.push(new THREE.Vector3(sx * d * t * v.aspecto, sy * d * t, -d).applyMatrix4(c.matrixWorld));
  const frente = new THREE.Vector3(), cima = new THREE.Vector3(), lado = new THREE.Vector3();
  c.matrixWorld.extractBasis(lado, cima, frente);
  const arestas = [lado, cima, ...[0, 1, 2, 3].map((i) => vert[i + 4].clone().sub(vert[i]).normalize())];
  const eixosCaixa = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
  const eixos: THREE.Vector3[] = [...eixosCaixa, frente];
  for (let i = 0; i < 4; i++) {
    const a = vert[i], b = vert[(i + 1) % 4], cc = vert[i + 4];
    eixos.push(b.clone().sub(a).cross(cc.clone().sub(a)).normalize()); // faces laterais
  }
  for (const e of arestas) for (const k of eixosCaixa) {
    const x = e.clone().cross(k);
    if (x.lengthSq() > 1e-8) eixos.push(x.normalize());
  }
  const min = eixos.map((e) => Math.min(...vert.map((p) => p.dot(e))));
  const max = eixos.map((e) => Math.max(...vert.map((p) => p.dot(e))));
  const centro = new THREE.Vector3(), meio = new THREE.Vector3();
  return {
    toca: (b) => {
      b.getCenter(centro);
      b.getSize(meio).multiplyScalar(0.5);
      for (let i = 0; i < eixos.length; i++) {
        const e = eixos[i];
        const pc = centro.dot(e), r = meio.x * Math.abs(e.x) + meio.y * Math.abs(e.y) + meio.z * Math.abs(e.z);
        if (pc + r < min[i] || pc - r > max[i]) return false;
      }
      return true;
    },
  };
};
/** os 4 cantos do fundo da pirâmide de visão, a uma distância d */
export const cantosPiramide = (v: Visao, d: number) => {
  const c = cameraDe(v);
  const hh = d * Math.tan(THREE.MathUtils.degToRad(v.fov / 2)), hw = hh * v.aspecto;
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => new THREE.Vector3(x, y, -d).applyMatrix4(c.matrixWorld));
};

/** direção para onde a câmera de perseguição olha: ang 0 = para a frente do carro (-Z), -90 = direita (+X), +90 = esquerda */
export const direcao = (ang: number) => {
  const a = THREE.MathUtils.degToRad(ang);
  return new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a));
};
/** câmera de terceira pessoa em volta do carro, como num jogo de mundo aberto */
export const perseguicao = (carro: THREE.Vector3, ang: number, dist = 6.5, altura = 2.4, longe = 170, frente = 5): Visao => {
  const d = direcao(ang);
  return {
    pos: carro.clone().add(new THREE.Vector3(0, altura, 0)).addScaledVector(d, -dist),
    alvo: carro.clone().add(new THREE.Vector3(0, 1.1, 0)).addScaledVector(d, frente),
    fov: 50, aspecto: 16 / 9, longe,
  };
};

export const suave = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
export const saida = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
