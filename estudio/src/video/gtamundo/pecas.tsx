// Peças 3D do Short do GTA (three.js): câmera, luz, a cidade em instâncias (com recorte por quadro), o carro do
// jogador com interior simples, o cachorro, o ícone da câmera do jogo, a pirâmide de visão e marcadores.
import React from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  ARVORES, CARROS, CHAO, COR, FAIXAS, PESSOAS, PREDIOS, type Peca, type Visao, cantosPiramide, posCarro, posPessoa,
} from "./mundo";

export type V3 = [number, number, number];
export type Cam = { pos: V3; alvo: V3; fov: number; rolar?: number; perto?: number };

// ---------- câmera e ambiente ----------
export const CameraSync: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  React.useLayoutEffect(() => {
    camera.position.set(...cam.pos);
    camera.up.set(Math.sin(cam.rolar ?? 0), Math.cos(cam.rolar ?? 0), 0);
    camera.lookAt(...cam.alvo);
    camera.fov = cam.fov;
    camera.near = cam.perto ?? 0.1;
    camera.far = 4000;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  });
  return null;
};

const CEU = (() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = (globalThis as any).document;
  if (!doc) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = doc.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#8fc1ea");
  gr.addColorStop(0.55, "#cfe5f5");
  gr.addColorStop(1, "#f4efe4");
  g.fillStyle = gr;
  g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
export const BRANCO = "#f6f6f3";

export const Ambiente: React.FC<{ ceu: "dia" | "branco"; foco: [number, number]; raio?: number; neblina?: [number, number] | null }> = ({ ceu, foco, raio = 90, neblina = [140, 700] }) => {
  const scene = useThree((s) => s.scene);
  const sol = React.useMemo(() => {
    const l = new THREE.DirectionalLight("#fff1dc", 2.6);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    return l;
  }, []);
  React.useLayoutEffect(() => {
    scene.background = ceu === "dia" && CEU ? CEU : new THREE.Color(BRANCO);
    const corNeblina = ceu === "dia" ? "#e3ecf2" : BRANCO;
    scene.fog = neblina ? new THREE.Fog(corNeblina, neblina[0], neblina[1]) : null;
    sol.position.set(foco[0] + 0.55 * 300, 300, foco[1] + 0.35 * 300);
    sol.target.position.set(foco[0], 0, foco[1]);
    sol.target.updateMatrixWorld();
    const c = sol.shadow.camera;
    c.left = -raio;
    c.right = raio;
    c.top = raio;
    c.bottom = -raio;
    c.near = 10;
    c.far = 900;
    c.updateProjectionMatrix();
  });
  return (
    <>
      <hemisphereLight args={["#eaf4ff", "#a99c88", 1.25]} />
      <primitive object={sol} />
      <primitive object={sol.target} />
    </>
  );
};

// ---------- instâncias ----------
type Item = { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry?: number; rx?: number; cor: string };
const o3 = new THREE.Object3D();
const cor3 = new THREE.Color();
export const Instancias: React.FC<{
  itens: Item[]; geo: THREE.BufferGeometry; mat: THREE.Material; max: number; sombra?: boolean; recebe?: boolean;
}> = ({ itens, geo, mat, max, sombra = false, recebe = true }) => {
  const ref = React.useRef<THREE.InstancedMesh>(null);
  React.useLayoutEffect(() => {
    const m = ref.current!;
    const n = Math.min(max, itens.length);
    for (let i = 0; i < n; i++) {
      const it = itens[i];
      o3.position.set(it.x, it.y, it.z);
      o3.rotation.set(it.rx ?? 0, it.ry ?? 0, 0);
      o3.scale.set(it.sx, it.sy, it.sz);
      o3.updateMatrix();
      m.setMatrixAt(i, o3.matrix);
      m.setColorAt(i, cor3.set(it.cor));
    }
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, max]} castShadow={sombra} receiveShadow={recebe} frustumCulled={false} />;
};

const GEO = {
  caixa: new THREE.BoxGeometry(1, 1, 1),
  cilindro: new THREE.CylinderGeometry(1, 1, 1, 10),
  roda: new THREE.CylinderGeometry(1, 1, 1, 14).rotateZ(Math.PI / 2),
  copa: new THREE.IcosahedronGeometry(1, 0),
  corpo: new THREE.CapsuleGeometry(0.24, 0.95, 4, 12),
  cabeca: new THREE.SphereGeometry(0.15, 14, 10),
};
const MAT = {
  fosco: new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0 }),
  copa: new THREE.MeshStandardMaterial({ roughness: 0.95, flatShading: true }),
  pessoa: new THREE.MeshStandardMaterial({ roughness: 0.8 }),
  carro: new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1 }),
  fantasma: new THREE.MeshBasicMaterial({ color: "#dfe5ec", transparent: true, opacity: 0.35, depthWrite: false }),
};

// ---------- a cidade ----------
/** o que fazer com cada objeto: 0 some, -1 vira fantasma, (0, 1] aparece (o número é a altura, para "subir" do chão) */
export type Filtro = (cat: "chao" | "predio" | "arvore" | "pessoa" | "carro" | "faixa", caixa: THREE.Box3, quadra: number) => number;
const tudo: Filtro = () => 1;
const bx = new THREE.Box3();
const caixaPessoa = (x: number, z: number, a: number) => bx.set(new THREE.Vector3(x - 0.3, 0, z - 0.3), new THREE.Vector3(x + 0.3, 1.75 * a, z + 0.3));

export const Cidade: React.FC<{ t: number; filtro?: Filtro; sem?: ("pessoas" | "carros" | "arvores" | "predios" | "chao")[]; tirarPessoas?: (id: number, x: number, z: number) => boolean }> = ({ t, filtro = tudo, sem = [], tirarPessoas }) => {
  const chao: Item[] = [], predios: Item[] = [], fantasmas: Peca[] = [], troncos: Item[] = [], copas: Item[] = [];
  const corpos: Item[] = [], cabecas: Item[] = [], lataria: Item[] = [], cabines: Item[] = [], rodas: Item[] = [], faixas: Item[] = [];
  if (!sem.includes("chao")) {
    for (const p of CHAO) {
      const e = filtro("chao", p.caixa, p.quadra);
      if (e > 0) chao.push({ x: p.x, y: (p.h * e) / 2, z: p.z, sx: p.w, sy: p.h * e, sz: p.d, cor: p.cor });
    }
    for (const p of FAIXAS) if (filtro("faixa", p.caixa, -1) > 0) faixas.push({ x: p.x, y: p.y, z: p.z, sx: p.w, sy: p.h, sz: p.d, cor: p.cor });
  }
  if (!sem.includes("predios"))
    for (const p of PREDIOS) {
      const e = filtro("predio", p.caixa, p.quadra);
      if (e > 0) predios.push({ x: p.x, y: (p.h * e) / 2, z: p.z, sx: p.w, sy: p.h * e, sz: p.d, cor: p.cor });
      else if (e < 0) fantasmas.push(p);
    }
  if (!sem.includes("arvores"))
    for (const a of ARVORES) {
      const e = filtro("arvore", a.caixa, a.quadra);
      if (e <= 0) continue;
      troncos.push({ x: a.x, y: 1.1 * a.s * e, z: a.z, sx: 0.16 * a.s, sy: 2.2 * a.s * e, sz: 0.16 * a.s, cor: COR.tronco });
      copas.push({ x: a.x, y: 3.3 * a.s * e, z: a.z, sx: 1.7 * a.s * e, sy: 1.55 * a.s * e, sz: 1.7 * a.s * e, ry: a.id, cor: a.cor });
    }
  if (!sem.includes("pessoas"))
    for (const p of PESSOAS) {
      const { x, z, passo } = posPessoa(p, t);
      if (tirarPessoas?.(p.id, x, z)) continue;
      const e = filtro("pessoa", caixaPessoa(x, z, p.altura), -1);
      if (e <= 0) continue;
      const a = p.altura * e, bob = 0.04 * passo;
      corpos.push({ x, y: 0.715 * a + 0.15 + bob, z, sx: 1, sy: a, sz: 1, cor: p.roupa });
      cabecas.push({ x, y: 1.43 * a + 0.15 + 0.13 + bob, z, sx: 1, sy: 1, sz: 1, cor: p.pele });
    }
  if (!sem.includes("carros"))
    for (const c of CARROS) {
      const z = posCarro(c, t);
      const caixa = bx.set(new THREE.Vector3(c.x - 1, 0, z - 2.3), new THREE.Vector3(c.x + 1, 1.6, z + 2.3));
      if (filtro("carro", caixa, -1) <= 0) continue;
      lataria.push({ x: c.x, y: 0.62, z, sx: 1.8, sy: 0.6, sz: 4.3, cor: c.cor });
      cabines.push({ x: c.x, y: 1.17, z: z + 0.2, sx: 1.6, sy: 0.52, sz: 2.2, cor: "#3a4350" });
      for (const [dx, dz] of [[-0.82, -1.35], [0.82, -1.35], [-0.82, 1.35], [0.82, 1.35]])
        rodas.push({ x: c.x + dx, y: 0.33, z: z + dz, sx: 0.22, sy: 0.33, sz: 0.33, cor: "#1d1f22" });
    }
  return (
    <>
      <Instancias itens={chao} geo={GEO.caixa} mat={MAT.fosco} max={CHAO.length} />
      <Instancias itens={faixas} geo={GEO.caixa} mat={MAT.fosco} max={FAIXAS.length} />
      <Instancias itens={predios} geo={GEO.caixa} mat={MAT.fosco} max={PREDIOS.length} sombra />
      <Instancias itens={troncos} geo={GEO.cilindro} mat={MAT.fosco} max={ARVORES.length} sombra />
      <Instancias itens={copas} geo={GEO.copa} mat={MAT.copa} max={ARVORES.length} sombra />
      <Instancias itens={corpos} geo={GEO.corpo} mat={MAT.pessoa} max={PESSOAS.length} sombra />
      <Instancias itens={cabecas} geo={GEO.cabeca} mat={MAT.pessoa} max={PESSOAS.length} sombra />
      <Instancias itens={lataria} geo={GEO.caixa} mat={MAT.carro} max={CARROS.length} sombra />
      <Instancias itens={cabines} geo={GEO.caixa} mat={MAT.carro} max={CARROS.length} sombra />
      <Instancias itens={rodas} geo={GEO.roda} mat={MAT.fosco} max={CARROS.length * 4} />
      {fantasmas.length > 0 && <Fantasmas pecas={fantasmas} />}
    </>
  );
};

/** prédios que existem nos dados mas não são desenhados: vidro claro com contorno */
export const Fantasmas: React.FC<{ pecas: Peca[]; opacidade?: number }> = ({ pecas, opacidade = 1 }) => {
  const linhas = React.useMemo(() => new THREE.BufferGeometry(), []);
  const mat = React.useMemo(() => new THREE.LineBasicMaterial({ color: "#8d9bab", transparent: true, opacity: 0.75 }), []);
  React.useLayoutEffect(() => {
    const v: number[] = [];
    for (const p of pecas) {
      const a = p.caixa.min, b = p.caixa.max;
      const c = [[a.x, a.y, a.z], [b.x, a.y, a.z], [b.x, a.y, b.z], [a.x, a.y, b.z], [a.x, b.y, a.z], [b.x, b.y, a.z], [b.x, b.y, b.z], [a.x, b.y, b.z]];
      for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) v.push(...c[i], ...c[j]);
    }
    linhas.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    mat.opacity = 0.75 * opacidade;
  });
  const itens: Item[] = pecas.map((p) => ({ x: p.x, y: p.y, z: p.z, sx: p.w, sy: p.h, sz: p.d, cor: "#ffffff" }));
  return (
    <>
      <Instancias itens={itens} geo={GEO.caixa} mat={MAT.fantasma} max={PREDIOS.length} recebe={false} />
      <lineSegments geometry={linhas} material={mat} frustumCulled={false} />
    </>
  );
};

// ---------- uma pessoa avulsa (a que é destacada) ----------
export const PessoaUnica: React.FC<{ x: number; z: number; altura: number; roupa: string; pele: string; chapeu?: string; bolsa?: string; passo?: number; rot?: number }> = ({ x, z, altura, roupa, pele, chapeu, bolsa, passo = 0, rot = 0 }) => {
  const bob = 0.04 * passo;
  return (
    <group position={[x, 0.15 + bob, z]} rotation-y={rot}>
      <mesh geometry={GEO.corpo} position-y={0.715 * altura} scale={[1, altura, 1]} castShadow receiveShadow>
        <meshStandardMaterial color={roupa} roughness={0.8} />
      </mesh>
      <mesh geometry={GEO.cabeca} position-y={1.43 * altura + 0.13} castShadow>
        <meshStandardMaterial color={pele} roughness={0.8} />
      </mesh>
      {chapeu && (
        <group position-y={1.43 * altura + 0.25}>
          <mesh castShadow><cylinderGeometry args={[0.22, 0.22, 0.03, 16]} /><meshStandardMaterial color={chapeu} /></mesh>
          <mesh position-y={0.08} castShadow><cylinderGeometry args={[0.12, 0.13, 0.16, 16]} /><meshStandardMaterial color={chapeu} /></mesh>
        </group>
      )}
      {bolsa && (
        <mesh position={[0.3, 0.75 * altura, 0]} castShadow><boxGeometry args={[0.12, 0.34, 0.3]} /><meshStandardMaterial color={bolsa} /></mesh>
      )}
    </group>
  );
};

// ---------- o carro do jogador (com o interior que aparece na vista de dentro) ----------
export const CARRO_JOGADOR = "#e0662f";
const Caixa: React.FC<{ p: V3; s: V3; cor: string; r?: V3; sombra?: boolean; emissivo?: string; rugosidade?: number }> = ({ p, s, cor, r = [0, 0, 0], sombra = true, emissivo, rugosidade = 0.6 }) => (
  <mesh position={p} rotation={r} scale={s} castShadow={sombra} receiveShadow geometry={GEO.caixa}>
    <meshStandardMaterial color={cor} roughness={rugosidade} emissive={emissivo ?? "#000000"} emissiveIntensity={emissivo ? 0.6 : 0} />
  </mesh>
);
const VIDRO_FORA = "#27313d", COLUNA = "#24262b", FORRO = "#45484f";
const Vidro: React.FC<{ p: V3; s: [number, number]; r?: V3 }> = ({ p, s, r = [0, 0, 0] }) => (
  <mesh position={p} rotation={r}>
    <planeGeometry args={s} />
    <meshStandardMaterial color={VIDRO_FORA} roughness={0.15} metalness={0.3} transparent opacity={0.82} side={THREE.DoubleSide} />
  </mesh>
);
/** o carro do jogador; `dentro` tira os vidros (a câmera está no banco do motorista) */
export const CarroJogador: React.FC<{ x: number; z: number; rot?: number; cor?: string; dentro?: boolean }> = ({ x, z, rot = 0, cor = CARRO_JOGADOR, dentro = false }) => (
  <group position={[x, 0, z]} rotation-y={rot}>
    {/* lataria: corpo até a linha das janelas, capô e porta-malas */}
    <Caixa p={[0, 0.655, 0]} s={[1.86, 0.65, 4.5]} cor={cor} rugosidade={0.35} />
    {/* colunas pretas (A, B, C) e teto */}
    {[-0.88, 0.88].map((px) => (
      <React.Fragment key={px}>
        <Caixa p={[px, 1.35, -0.86]} s={[0.07, 0.8, 0.1]} cor={COLUNA} r={[0.5, 0, 0]} />
        <Caixa p={[px, 1.35, 0.42]} s={[0.07, 0.74, 0.14]} cor={COLUNA} />
        <Caixa p={[px, 1.35, 1.36]} s={[0.07, 0.8, 0.18]} cor={COLUNA} r={[-0.45, 0, 0]} />
        <Caixa p={[px * 1.12, 1.08, -0.78]} s={[0.08, 0.13, 0.22]} cor={COLUNA} />
        {/* acabamento interno da porta, logo abaixo da janela */}
        <Caixa p={[px * 0.95, 1.0, 0.25]} s={[0.06, 0.06, 2.3]} cor="#33363d" sombra={false} />
      </React.Fragment>
    ))}
    <Caixa p={[0, 1.735, 0.27]} s={[1.84, 0.07, 1.95]} cor={cor} rugosidade={0.35} />
    <Caixa p={[0, 1.69, 0.27]} s={[1.7, 0.02, 1.85]} cor={FORRO} sombra={false} />
    {/* interior: painel, volante, encostos */}
    <Caixa p={[0, 0.97, -0.78]} s={[1.74, 0.14, 0.34]} cor="#2a2c31" sombra={false} />
    <mesh position={[-0.4, 1.1, -0.5]} rotation={[-1.05, 0, 0]} castShadow>
      <torusGeometry args={[0.19, 0.026, 8, 28]} />
      <meshStandardMaterial color="#17181b" roughness={0.6} />
    </mesh>
    {[-0.42, 0.42].map((px) => <Caixa key={px} p={[px, 1.2, 0.62]} s={[0.5, 0.5, 0.12]} cor="#3b3e45" sombra={false} />)}
    {/* faróis e lanternas */}
    {[-0.62, 0.62].map((px) => (
      <React.Fragment key={px}>
        <Caixa p={[px, 0.8, -2.26]} s={[0.42, 0.13, 0.04]} cor="#fff6dd" emissivo="#fff6dd" sombra={false} />
        <Caixa p={[px, 0.82, 2.26]} s={[0.42, 0.13, 0.04]} cor="#c2181f" emissivo="#c2181f" sombra={false} />
      </React.Fragment>
    ))}
    {[[-0.86, -1.42], [0.86, -1.42], [-0.86, 1.42], [0.86, 1.42]].map(([px, pz]) => (
      <mesh key={`${px}${pz}`} geometry={GEO.roda} position={[px, 0.33, pz]} scale={[0.24, 0.33, 0.33]} castShadow>
        <meshStandardMaterial color="#1d1f22" roughness={0.8} />
      </mesh>
    ))}
    {!dentro && (
      <>
        <Vidro p={[0, 1.36, -0.86]} s={[1.7, 0.82]} r={[0.5, 0, 0]} />
        <Vidro p={[0, 1.36, 1.36]} s={[1.7, 0.82]} r={[-0.45, 0, 0]} />
        {[-0.9, 0.9].map((px) => <Vidro key={px} p={[px, 1.35, 0.27]} s={[2.3, 0.74]} r={[0, Math.PI / 2, 0]} />)}
      </>
    )}
  </group>
);

// ---------- o cachorro ----------
export const Cachorro: React.FC<{ x: number; z: number; rot: number; t: number }> = ({ x, z, rot, t }) => {
  const k = Math.sin(t * 14);
  const c = "#b98652";
  return (
    <group position={[x, 0, z]} rotation-y={rot} scale={1.45}>
      <Caixa p={[0, 0.52, 0]} s={[0.3, 0.3, 0.78]} cor={c} />
      <Caixa p={[0, 0.74, -0.46]} s={[0.26, 0.26, 0.3]} cor={c} />
      <Caixa p={[0, 0.68, -0.66]} s={[0.15, 0.13, 0.16]} cor="#8a5e36" />
      <Caixa p={[-0.1, 0.9, -0.42]} s={[0.07, 0.12, 0.05]} cor="#6b4626" />
      <Caixa p={[0.1, 0.9, -0.42]} s={[0.07, 0.12, 0.05]} cor="#6b4626" />
      <Caixa p={[0, 0.7, 0.45]} s={[0.06, 0.06, 0.3]} cor={c} r={[0.7, 0, 0]} />
      {[[-0.1, -0.28, 1], [0.1, -0.28, -1], [-0.1, 0.28, -1], [0.1, 0.28, 1]].map(([px, pz, s], i) => (
        <Caixa key={i} p={[px, 0.2, pz]} s={[0.08, 0.4, 0.08]} cor={c} r={[0.45 * k * s, 0, 0]} />
      ))}
    </group>
  );
};

// ---------- a câmera do jogo, a pirâmide de visão e outras marcas ----------
export const AMARELO = "#ffd23f";
export const CameraJogo: React.FC<{ visao: Visao; escala?: number }> = ({ visao, escala = 1 }) => {
  const ref = React.useRef<THREE.Group>(null);
  React.useLayoutEffect(() => {
    ref.current!.position.copy(visao.pos);
    ref.current!.lookAt(visao.alvo);
  });
  return (
    <group ref={ref}>
      <group scale={escala}>
        <Caixa p={[0, 0, 0]} s={[1.0, 0.7, 0.8]} cor={AMARELO} rugosidade={0.4} />
        <mesh position={[0, 0, 0.62]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.26, 0.3, 0.45, 20]} />
          <meshStandardMaterial color="#1b1c20" roughness={0.3} />
        </mesh>
        <Caixa p={[0, 0.47, -0.12]} s={[0.4, 0.24, 0.36]} cor="#e0b52c" />
      </group>
    </group>
  );
};

const eixoY = new THREE.Vector3(0, 1, 0);
export const Haste: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; r: number; cor: string; opacidade?: number }> = ({ a, b, r, cor, opacidade = 1 }) => {
  const d = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(eixoY, d.clone().normalize());
  const m = a.clone().add(b).multiplyScalar(0.5);
  return (
    <mesh position={m} quaternion={q} scale={[r, d.length(), r]} geometry={GEO.cilindro}>
      <meshBasicMaterial color={cor} transparent={opacidade < 1} opacity={opacidade} />
    </mesh>
  );
};

export const Piramide: React.FC<{ visao: Visao; d: number; opacidade?: number; borda?: number; cor?: string }> = ({ visao, d, opacidade = 1, borda = 0.35, cor = AMARELO }) => {
  const cantos = cantosPiramide(visao, Math.max(0.01, d));
  const geo = React.useMemo(() => new THREE.BufferGeometry(), []);
  React.useLayoutEffect(() => {
    const p = visao.pos;
    const v: number[] = [];
    for (let i = 0; i < 4; i++) v.push(p.x, p.y, p.z, ...cantos[i].toArray(), ...cantos[(i + 1) % 4].toArray());
    v.push(...cantos[0].toArray(), ...cantos[1].toArray(), ...cantos[2].toArray(), ...cantos[0].toArray(), ...cantos[2].toArray(), ...cantos[3].toArray());
    geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    geo.computeVertexNormals();
  });
  return (
    <>
      <mesh geometry={geo} frustumCulled={false} renderOrder={5}>
        <meshBasicMaterial color={cor} transparent opacity={0.16 * opacidade} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {cantos.map((c, i) => <Haste key={`a${i}`} a={visao.pos} b={c} r={borda} cor={cor} opacidade={opacidade} />)}
      {cantos.map((c, i) => <Haste key={`b${i}`} a={c} b={cantos[(i + 1) % 4]} r={borda} cor={cor} opacidade={opacidade} />)}
    </>
  );
};

/** círculo no chão (o marcador da pessoa, o limite do que está carregado) */
export const Aro: React.FC<{ x: number; z: number; raio: number; largura: number; cor?: string; opacidade?: number; y?: number }> = ({ x, z, raio, largura, cor = AMARELO, opacidade = 1, y = 0.2 }) => (
  <mesh position={[x, y, z]} rotation-x={-Math.PI / 2} renderOrder={4}>
    <ringGeometry args={[raio - largura / 2, raio + largura / 2, 96]} />
    <meshBasicMaterial color={cor} transparent opacity={opacidade} side={THREE.DoubleSide} depthWrite={false} />
  </mesh>
);
