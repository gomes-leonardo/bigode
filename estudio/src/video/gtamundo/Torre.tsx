// O prédio do fundo da avenida em três versões (o que o jogo troca conforme a distância):
// 2 = de longe: caixas lisas com uma imagem de janelas colada; 1 = médio: faixas e colunas de verdade;
// 0 = de perto: cada janela com caixilho e peitoril, porta com marquise, máquinas no topo.
import React from "react";
import * as THREE from "three";
import { Instancias } from "./pecas";

export const TORRE = { x: 0, z: -400 };
const LADO = 26, ANDARES = 27, PE = 4, VAOS = 8, BASE_Y = 8;
const ALTO = ANDARES * PE; // 108
const CONCRETO = "#ddd6c8", VIDRO = "#456e8c", VIDRO2 = "#5d89a8", ESCURO = "#2f3540";

type Item = { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry?: number; cor: string };
const tris = { caixa: 12, cil24: 96, cil16: 64 };

// a imagem colada na versão de longe: as mesmas janelas da versão de perto, pintadas
const textura = (() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = (globalThis as any).document;
  if (!doc) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = doc.createElement("canvas");
  const bw = 32, fh = 40;
  c.width = bw * VAOS;
  c.height = fh * ANDARES;
  const g = c.getContext("2d");
  g.fillStyle = CONCRETO;
  g.fillRect(0, 0, c.width, c.height);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let a = 0; a < ANDARES; a++)
    for (let b = 0; b < VAOS; b++) {
      g.fillStyle = r() < 0.12 ? "#7aa3bf" : r() < 0.5 ? VIDRO : "#3c637f";
      g.fillRect(b * bw + 4, a * fh + 6, bw - 8, fh - 12);
      g.fillStyle = "rgba(255,255,255,0.18)";
      g.fillRect(b * bw + 4, a * fh + 6, (bw - 8) * 0.35, fh - 12);
    }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
})();

const pecasNivel = (lod: 0 | 1 | 2) => {
  const caixas: Item[] = [], vidros: Item[] = [], escuros: Item[] = [];
  let cilindros: { p: [number, number, number]; r: number; h: number; seg: 16 | 24; cor: string }[] = [];
  // térreo, corpo, coroa e antena
  caixas.push({ x: 0, y: BASE_Y / 2, z: 0, sx: 30, sy: BASE_Y, sz: 30, cor: CONCRETO });
  caixas.push({ x: 0, y: BASE_Y + ALTO + 7, z: 0, sx: 19, sy: 14, sz: 19, cor: CONCRETO });
  escuros.push({ x: 0, y: BASE_Y + ALTO + 14 + 10, z: 0, sx: 0.8, sy: 20, sz: 0.8, cor: "#8b8f96" });
  if (lod === 2) {
    caixas.push({ x: 0, y: BASE_Y + ALTO / 2, z: 0, sx: LADO, sy: ALTO, sz: LADO, cor: CONCRETO });
    return { caixas, vidros, escuros, cilindros };
  }
  vidros.push({ x: 0, y: BASE_Y + ALTO / 2, z: 0, sx: LADO - 1.2, sy: ALTO, sz: LADO - 1.2, cor: VIDRO });
  // lajes de cada andar e colunas entre as janelas (as quatro fachadas)
  for (let a = 0; a <= ANDARES; a++) {
    const y = BASE_Y + a * PE;
    caixas.push({ x: 0, y, z: LADO / 2, sx: LADO + 0.6, sy: 0.55, sz: 0.6, cor: CONCRETO });
    caixas.push({ x: 0, y, z: -LADO / 2, sx: LADO + 0.6, sy: 0.55, sz: 0.6, cor: CONCRETO });
    caixas.push({ x: LADO / 2, y, z: 0, sx: 0.6, sy: 0.55, sz: LADO + 0.6, cor: CONCRETO });
    caixas.push({ x: -LADO / 2, y, z: 0, sx: 0.6, sy: 0.55, sz: LADO + 0.6, cor: CONCRETO });
  }
  const vao = LADO / VAOS;
  for (let b = 0; b <= VAOS; b++) {
    const u = -LADO / 2 + b * vao;
    for (const [x, z] of [[u, LADO / 2], [u, -LADO / 2], [LADO / 2, u], [-LADO / 2, u]])
      caixas.push({ x, y: BASE_Y + ALTO / 2, z, sx: 0.5, sy: ALTO, sz: 0.5, cor: CONCRETO });
  }
  if (lod === 1) return { caixas, vidros, escuros, cilindros };
  // de perto: caixilho em cruz e peitoril em cada janela
  for (let a = 0; a < ANDARES; a++)
    for (let b = 0; b < VAOS; b++) {
      const u = -LADO / 2 + (b + 0.5) * vao, y = BASE_Y + a * PE + PE / 2;
      for (const [nx, nz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const x = nx ? (nx * (LADO - 1.2)) / 2 + nx * 0.05 : u, z = nz ? (nz * (LADO - 1.2)) / 2 + nz * 0.05 : u;
        const larg = nx ? { sx: 0.12, sz: vao - 0.5 } : { sx: vao - 0.5, sz: 0.12 };
        escuros.push({ x, y: y + 0.35, z, ...larg, sy: 0.1, cor: "#c9c3b5" });
        escuros.push({ x, y: y + 0.2, z, sx: nx ? 0.12 : 0.1, sy: PE - 1.1, sz: nx ? 0.1 : 0.12, cor: "#c9c3b5" });
        const ps = nx ? { sx: 0.5, sz: vao - 0.3 } : { sx: vao - 0.3, sz: 0.5 };
        escuros.push({ x: x + nx * 0.2, y: y - PE / 2 + 0.55, z: z + nz * 0.2, ...ps, sy: 0.14, cor: "#efe9dc" });
      }
    }
  // portaria: vidro, porta, marquise e floreiras
  vidros.push({ x: 0, y: 3.2, z: 15.05, sx: 18, sy: 5.2, sz: 0.2, cor: VIDRO2 });
  escuros.push({ x: 0, y: 1.7, z: 15.2, sx: 3.6, sy: 3.4, sz: 0.25, cor: ESCURO });
  escuros.push({ x: 0, y: 6.2, z: 17.5, sx: 12, sy: 0.4, sz: 5, cor: "#6b6f77" });
  for (const px of [-11, -7, 7, 11]) escuros.push({ x: px, y: 0.5, z: 16.4, sx: 3, sy: 1, sz: 1.4, cor: "#7b6a55" });
  // topo: máquinas, caixa d'água e antena com travessas
  const topo = BASE_Y + ALTO + 14;
  for (const [px, pz] of [[-5, -5], [-5, 0], [-5, 5], [4, -5], [4, 5]]) {
    escuros.push({ x: px, y: topo + 0.9, z: pz, sx: 3, sy: 1.8, sz: 2.4, cor: "#a7abb2" });
    cilindros.push({ p: [px, topo + 1.85, pz], r: 0.8, h: 0.15, seg: 16, cor: "#565b63" });
  }
  cilindros.push({ p: [4, topo + 2.5, 0], r: 2.2, h: 5, seg: 24, cor: "#b9a58a" });
  for (let k = 0; k < 4; k++) escuros.push({ x: 0, y: topo + 4 + k * 4, z: 0, sx: 3 - k * 0.5, sy: 0.2, sz: 0.2, cor: "#8b8f96" });
  return { caixas, vidros, escuros, cilindros };
};

const NIVEIS = [pecasNivel(0), pecasNivel(1), pecasNivel(2)];
/** quantos triângulos cada versão tem de verdade */
export const TRIANGULOS = NIVEIS.map((n, i) => {
  const base = (n.caixas.length + n.vidros.length + n.escuros.length) * tris.caixa + n.cilindros.reduce((s, c) => s + (c.seg === 24 ? tris.cil24 : tris.cil16), 0);
  return i === 2 ? base + 8 : base; // a versão de longe ainda tem as 4 imagens coladas (2 triângulos cada)
});

const GEO = new THREE.BoxGeometry(1, 1, 1);
const MAT = {
  concreto: new THREE.MeshStandardMaterial({ roughness: 0.85 }),
  vidro: new THREE.MeshStandardMaterial({ roughness: 0.15, metalness: 0.35 }),
  arame: new THREE.MeshBasicMaterial({ color: "#26303c", wireframe: true }),
};

/** `arame`: só as arestas dos triângulos (para ver quantos cada versão tem) */
export const Torre: React.FC<{ lod: 0 | 1 | 2; x?: number; z?: number; descola?: number; flash?: number; praca?: boolean; arame?: boolean }> = ({ lod, x = TORRE.x, z = TORRE.z, descola = 0, flash = 0, praca = true, arame = false }) => {
  const n = NIVEIS[lod];
  const desloca = (l: Item[]) => l.map((i) => ({ ...i, x: i.x + x, z: i.z + z }));
  return (
    <group>
      {praca && (
        <mesh position={[x, 0.06, z]} receiveShadow>
          <boxGeometry args={[90, 0.12, 80]} />
          <meshStandardMaterial color="#d8d1c3" roughness={0.9} />
        </mesh>
      )}
      <Instancias itens={desloca(n.caixas)} geo={GEO} mat={arame ? MAT.arame : MAT.concreto} max={n.caixas.length} sombra={!arame} />
      {n.vidros.length > 0 && <Instancias itens={desloca(n.vidros)} geo={GEO} mat={arame ? MAT.arame : MAT.vidro} max={n.vidros.length} sombra={!arame} />}
      {n.escuros.length > 0 && <Instancias itens={desloca(n.escuros)} geo={GEO} mat={arame ? MAT.arame : MAT.concreto} max={n.escuros.length} sombra={!arame} />}
      {n.cilindros.map((c, i) => (
        <mesh key={i} position={[c.p[0] + x, c.p[1], c.p[2] + z]} castShadow={!arame} material={arame ? MAT.arame : undefined}>
          <cylinderGeometry args={[c.r, c.r, c.h, c.seg]} />
          {!arame && <meshStandardMaterial color={c.cor} roughness={0.7} />}
        </mesh>
      ))}
      {lod === 2 && textura && !arame && <Adesivos x={x} z={z} descola={descola} />}
      {flash > 0 && (
        <mesh position={[x, BASE_Y + ALTO / 2 + 10, z]}>
          <boxGeometry args={[34, ALTO + 40, 34]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85 * flash} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

/** a imagem das janelas, colada em cada face da caixa; a da frente pode descolar (gira pela borda esquerda) */
const Adesivos: React.FC<{ x: number; z: number; descola: number }> = ({ x, z, descola }) => {
  const mat = React.useMemo(() => new THREE.MeshStandardMaterial({ map: textura!, roughness: 0.8, side: THREE.DoubleSide }), []);
  const yc = BASE_Y + ALTO / 2, m = LADO / 2 + 0.04;
  return (
    <group position={[x, yc, z]}>
      <group position={[-21 * descola, 0, m + 7 * descola]} rotation={[0, 0.3 * descola, 0]}>
        <mesh material={mat}><planeGeometry args={[LADO, ALTO]} /></mesh>
      </group>
      <mesh position={[0, 0, -m]} rotation-y={Math.PI} material={mat}><planeGeometry args={[LADO, ALTO]} /></mesh>
      <mesh position={[m, 0, 0]} rotation-y={Math.PI / 2} material={mat}><planeGeometry args={[LADO, ALTO]} /></mesh>
      <mesh position={[-m, 0, 0]} rotation-y={-Math.PI / 2} material={mat}><planeGeometry args={[LADO, ALTO]} /></mesh>
    </group>
  );
};
