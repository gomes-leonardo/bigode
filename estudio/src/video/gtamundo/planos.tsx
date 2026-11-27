// Os 28 planos do Short "o mundo do GTA só existe onde você olha", presos às falas. Cada plano devolve, para um
// quadro, a câmera, a cena 3D e o que vai por cima em 2D (etiquetas, contador). Tudo é função do quadro: nada guarda
// estado entre quadros (o render é feito fora de ordem).
import React from "react";
import * as THREE from "three";
import { FONTE } from "../../fontes";
import {
  ARVORES, CARROS, FAIXA_JOGADOR, PESSOAS, PREDIOS, QUADRAS, type Visao, perseguicao, regiaoDe, posCarro, posPessoa, saida, suave,
} from "./mundo";
import { AMARELO, Ambiente, Aro, Cachorro, type Cam, CameraJogo, CarroJogador, Cidade, type Filtro, Fantasmas, Haste, PessoaUnica, Piramide, type V3 } from "./pecas";
import { CORTE, FPS, T, fracDe } from "./tempo";
import { TORRE, TRIANGULOS, Torre } from "./Torre";

export type Quadro = { cam: Cam; cena: React.ReactNode; sobre?: React.ReactNode };
export type Plano = { n: number; de: number; ate: number; quadro: (f: number) => Quadro };

const seg = (f: number) => f / FPS;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const camDe = (v: Visao, fov = 64): Cam => ({ pos: v.pos.toArray() as V3, alvo: v.alvo.toArray() as V3, fov });
const prog = (f: number, de: number, ate: number) => Math.min(1, Math.max(0, (f - de) / Math.max(1, ate - de)));

// ---------- 2D: etiquetas e contador ----------
const Etiqueta: React.FC<{ x: number; y: number; texto: string; cor?: string; fundo?: string; tam?: number; k?: number }> = ({ x, y, texto, cor = "#111", fundo = AMARELO, tam = 54, k = 1 }) => {
  const w = texto.length * tam * 0.66 + tam * 0.9;
  const s = 0.7 + 0.3 * saida(k);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.5} rx={tam * 0.3} fill={fundo} stroke="#111" strokeWidth={5} />
      <text x={0} y={tam * 0.28} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor}>{texto}</text>
    </g>
  );
};
const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");
const projeta = (cam: Cam, p: V3): [number, number] => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.1, 5000);
  c.position.set(...cam.pos);
  c.lookAt(...cam.alvo);
  c.updateMatrixWorld(true);
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x + 1) * 540, (1 - v.y) * 960];
};

// ---------- recorte pela pirâmide (com o "pulinho" de quem acabou de entrar) ----------
const recorte = (vis: (f: number) => Visao, f: number, fora: number, raioFantasma = Infinity): Filtro => {
  const fr = [regiaoDe(vis(f)), regiaoDe(vis(f - 1)), regiaoDe(vis(f - 2))];
  const pos = vis(f).pos;
  const centro = new THREE.Vector3();
  return (cat, caixa) => {
    if (fr[0].toca(caixa)) return fr[2].toca(caixa) ? 1 : fr[1].toca(caixa) ? 0.86 : 0.62;
    caixa.getCenter(centro);
    if (centro.distanceTo(pos) > raioFantasma) return 1; // a varredura ainda não chegou aqui
    return cat === "predio" ? fora : 0;
  };
};

// ---------- trecho 1: dentro do carro, a câmera gira, o vazio (planos 1 a 5) ----------
const carroA = (f: number) => v3(FAIXA_JOGADOR, 0, 40 - 8 * seg(f));
const olho = (carro: THREE.Vector3) => carro.clone().add(v3(-0.4, 1.38, 0.14));
const dentro = (f: number, ang = -38, carro = carroA(f), cidade?: Filtro): Quadro => {
  const o = olho(carro);
  const a = THREE.MathUtils.degToRad(ang);
  const alvo = o.clone().add(v3(-Math.sin(a) * 10, 0.35, -Math.cos(a) * 10));
  return {
    cam: { pos: o.toArray() as V3, alvo: alvo.toArray() as V3, fov: 66, perto: 0.04 },
    cena: (
      <>
        <Ambiente ceu={cidade ? "branco" : "dia"} foco={[carro.x + 10, carro.z - 25]} raio={70} />
        <Cidade t={seg(f)} filtro={cidade} />
        <CarroJogador x={carro.x} z={carro.z} dentro />
      </>
    ),
  };
};
/** no plano 1 a câmera olha pelo para-brisa e, no "janela", vira para a janela da direita */
const angDentro = (f: number, janela: number) => mix(-5, -19, suave(prog(f, janela, janela + 30)));

// a câmera do jogo no trecho 1: olhando para a calçada da direita, gira para a esquerda e volta
const GIRO_DE = () => T(3, fracDe(3, "gira"));
const angA = (f: number) => {
  const g0 = GIRO_DE(), g1 = g0 + 13;
  const volta0 = T(5, 0.05), volta1 = CORTE(6) - 6;
  if (f < g1) return mix(-24, 100, suave(prog(f, g0, g1)));
  return mix(100, -24, suave(prog(f, volta0, volta1)));
};
const visaoA = (f: number) => {
  const a = angA(f);
  return perseguicao(carroA(f), a, 9 - 3.6 * Math.abs(Math.sin(THREE.MathUtils.degToRad(a))), 3.0, 170, 14);
};
const CACHORRO = (f: number) => {
  const t0 = T(2, fracDe(2, "cachorro")) - 30;
  const k = seg(f - t0);
  const z = carroA(t0).z - 22;
  return { x: 8 - 4.4 * k, z, rot: Math.PI / 2, ativo: k > -0.2 && k < 4.5 };
};

// ---------- trecho 2: vista de cima, a pirâmide (planos 6 a 9) ----------
const CARRO_B = v3(FAIXA_JOGADOR, 0, 30);
const angB = (f: number) => {
  const a0 = CORTE(9), a1 = CORTE(10); // gira durante o plano 8
  if (f < a0 || f >= a1) return -32;
  const k = prog(f, a0, a1);
  return -32 + 62 * Math.sin(k * Math.PI * 1.5) * (1 - 0.35 * k);
};
const visaoB = (f: number) => perseguicao(CARRO_B, angB(f), 6.5, 2.4, 150);
const camTopo = (f: number, de: number): Cam => {
  const k = seg(f - de);
  return { pos: [CARRO_B.x + 70 + k * 3, 205 - k * 3, CARRO_B.z + 165], alvo: [CARRO_B.x + 22, 0, CARRO_B.z - 70], fov: 52 };
};
const cenaTopo = (f: number, filtro: Filtro | undefined, d: number, extra?: React.ReactNode) => (
  <>
    <Ambiente ceu="branco" foco={[CARRO_B.x + 30, CARRO_B.z - 60]} raio={230} neblina={null} />
    <Cidade t={seg(f)} filtro={filtro} />
    <CarroJogador x={CARRO_B.x} z={CARRO_B.z} />
    <CameraJogo visao={visaoB(f)} escala={3.2} />
    {d > 0 && <Piramide visao={visaoB(f)} d={d} borda={0.9} />}
    {extra}
  </>
);
const contaDesenhados = (filtro: Filtro, t: number) => {
  let n = 0, total = 0;
  for (const p of PREDIOS) { total++; if (filtro("predio", p.caixa, p.quadra) > 0) n++; }
  for (const a of ARVORES) { total++; if (filtro("arvore", a.caixa, a.quadra) > 0) n++; }
  const b = new THREE.Box3();
  for (const p of PESSOAS) {
    total++;
    const { x, z } = posPessoa(p, t);
    if (filtro("pessoa", b.set(v3(x - 0.3, 0, z - 0.3), v3(x + 0.3, 1.8, z + 0.3)), -1) > 0) n++;
  }
  for (const c of CARROS) {
    total++;
    const z = posCarro(c, t);
    if (filtro("carro", b.set(v3(c.x - 1, 0, z - 2.3), v3(c.x + 1, 1.6, z + 2.3)), -1) > 0) n++;
  }
  return { n, total };
};

// ---------- trecho 3: o prédio escondido atrás do outro (planos 10 a 12) ----------
const A = { x: 0, z: -41, w: 16, h: 20, d: 14, cor: "#d9a38a" };
const B = { x: 0, z: -86, w: 18, h: 32, d: 16, cor: "#8fb0cc" };
const visaoC: Visao = { pos: v3(0, 1.7, 0), alvo: v3(0, 9.5, -60), fov: 50, aspecto: 16 / 9, longe: 130 };
const caixaB = new THREE.Box3(v3(B.x - B.w / 2, 0, B.z - B.d / 2), v3(B.x + B.w / 2, B.h, B.z + B.d / 2));
const Bloco: React.FC<{ p: typeof A; fantasma?: number }> = ({ p, fantasma = 0 }) =>
  fantasma >= 1 ? null : (
    <mesh position={[p.x, p.h / 2, p.z]} castShadow receiveShadow>
      <boxGeometry args={[p.w, p.h, p.d]} />
      <meshStandardMaterial color={p.cor} roughness={0.85} transparent={fantasma > 0} opacity={1 - fantasma} />
    </mesh>
  );
/** o volume escondido atrás do prédio da frente, visto da câmera do jogo */
const Sombra: React.FC<{ k: number }> = ({ k }) => {
  const geo = React.useMemo(() => new THREE.BufferGeometry(), []);
  const c = visaoC.pos;
  const f = [v3(A.x - A.w / 2, 0, A.z + A.d / 2), v3(A.x + A.w / 2, 0, A.z + A.d / 2), v3(A.x + A.w / 2, A.h, A.z + A.d / 2), v3(A.x - A.w / 2, A.h, A.z + A.d / 2)];
  const longe = f.map((p) => p.clone().add(p.clone().sub(c).normalize().multiplyScalar(5 + 75 * k)));
  React.useLayoutEffect(() => {
    const v: number[] = [];
    const tri = (a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3) => v.push(...a.toArray(), ...b.toArray(), ...d.toArray());
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      tri(f[i], f[j], longe[j]);
      tri(f[i], longe[j], longe[i]);
    }
    tri(longe[0], longe[1], longe[2]);
    tri(longe[0], longe[2], longe[3]);
    geo.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  });
  return (
    <mesh geometry={geo} frustumCulled={false} renderOrder={6}>
      <meshBasicMaterial color="#1c2433" transparent opacity={0.28 * Math.min(1, k * 3)} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};
/** contorno tracejado no chão: onde o prédio de trás deveria estar */
const Pegada: React.FC<{ p: typeof B; k: number }> = ({ p, k }) => {
  const pts: [THREE.Vector3, THREE.Vector3][] = [];
  const cantos = [v3(p.x - p.w / 2, 0.25, p.z - p.d / 2), v3(p.x + p.w / 2, 0.25, p.z - p.d / 2), v3(p.x + p.w / 2, 0.25, p.z + p.d / 2), v3(p.x - p.w / 2, 0.25, p.z + p.d / 2)];
  for (let i = 0; i < 4; i++) {
    const a = cantos[i], b = cantos[(i + 1) % 4];
    const L = a.distanceTo(b), n = Math.floor(L / 2);
    for (let s = 0; s < n; s += 2) pts.push([a.clone().lerp(b, s / n), a.clone().lerp(b, (s + 1) / n)]);
  }
  return <>{pts.map(([a, b], i) => <Haste key={i} a={a} b={b} r={0.28} cor="#e2463f" opacidade={k} />)}</>;
};
const cenaC = (f: number, sombra: number, fantasmaB: number, pegada: number) => (
  <>
    <Ambiente ceu="branco" foco={[0, -45]} raio={80} neblina={null} />
    <mesh position={[0, -0.05, -50]} receiveShadow>
      <boxGeometry args={[400, 0.1, 400]} />
      <meshStandardMaterial color="#e6e2d9" roughness={0.95} />
    </mesh>
    <Bloco p={A} />
    <Bloco p={B} fantasma={fantasmaB} />
    {fantasmaB > 0 && fantasmaB < 1.01 && <Fantasmas pecas={[{ ...B, y: B.h / 2, caixa: caixaB, quadra: -1, id: -1 }]} opacidade={Math.min(1, fantasmaB * 1.5)} />}
    <CameraJogo visao={visaoC} escala={2.2} />
    <Piramide visao={visaoC} d={130} borda={0.3} opacidade={0.45} />
    {sombra > 0 && <Sombra k={sombra} />}
    {pegada > 0 && <Pegada p={B} k={pegada} />}
  </>
);

// ---------- trecho 4: o prédio do fundo e as três versões (planos 13 a 19) ----------
const distTorre = (z: number) => Math.abs(z - TORRE.z);
const lodPara = (z: number) => (distTorre(z) > 250 ? 2 : distTorre(z) > 120 ? 1 : 0) as 0 | 1 | 2;
const cenaAvenida = (f: number, carro: THREE.Vector3 | null, lod: 0 | 1 | 2, foco: [number, number], extra?: React.ReactNode, flash = 0, descola = 0) => (
  <>
    <Ambiente ceu="dia" foco={foco} raio={90} neblina={[250, 1600]} />
    <Cidade t={seg(f)} />
    {carro && <CarroJogador x={carro.x} z={carro.z} />}
    <Torre lod={lod} flash={flash} descola={descola} />
    {extra}
  </>
);

const quandoTroca = (de: number, ate: number, z0: number, z1: number, alvo: 0 | 1) => {
  for (let g = de; g < ate; g++) if (lodPara(mix(z0, z1, suave(prog(g, de, ate)))) === alvo) return g;
  return ate;
};

// ---------- trecho 5: as pessoas da calçada (planos 20 a 24) ----------
const PONTO = { x: 7.4, z: 120 };
const OLHO_D = v3(5.7, 1.62, 129.5);
const PESSOAS_TROCA = [
  { altura: 1.12, roupa: "#d64541", pele: "#5e3b26" },
  { altura: 0.84, roupa: "#f2b134", pele: "#f1c9a5", bolsa: "#7b4b2a" },
  { altura: 1.0, roupa: "#47a76a", pele: "#d9a47c", chapeu: "#2f3640" },
  { altura: 1.1, roupa: "#8e5bc8", pele: "#b07850" },
  { altura: 0.9, roupa: "#3c8dde", pele: "#8a5a3b", chapeu: "#e9e4da" },
];
// quem está no ponto em cada momento (troca só quando a câmera não está olhando)
const voltas = () => {
  const a = CORTE(26), b = CORTE(27), c = CORTE(28), d = CORTE(30);
  const giros: { de: number; ate: number }[] = [];
  giros.push({ de: T(27, 0.15), ate: T(27, 0.15) + 12 }); // vira para a rua
  giros.push({ de: b + 2, ate: b + 14 }); // volta: outra pessoa
  const passos = 3;
  for (let k = 0; k < passos; k++) {
    const ini = c + 4 + (k * (d - c - 10)) / passos;
    giros.push({ de: ini, ate: ini + 7 }, { de: ini + 12, ate: ini + 19 });
  }
  return { a, giros };
};
const giroD = (f: number) => {
  const { giros } = voltas();
  let ang = 0, quem = 0;
  for (let i = 0; i < giros.length; i++) {
    const g = giros[i];
    const ida = i % 2 === 0;
    if (f >= g.ate) { ang = ida ? 1 : 0; if (!ida) quem++; continue; }
    if (f >= g.de) { const k = suave(prog(f, g.de, g.ate)); ang = ida ? k : 1 - k; if (!ida && k > 0.5) quem++; }
    break;
  }
  return { ang, quem: Math.min(quem, PESSOAS_TROCA.length - 1) };
};
const tiraPerto = (_id: number, x: number, z: number) => x > 0 && Math.abs(z - PONTO.z) < 7;

// ---------- trecho 6: o anel que se arrasta (planos 25 a 27) ----------
const R_ANEL = 120;
const T_ANEL = () => CORTE(30);
const carroF = (f: number) => v3(FAIXA_JOGADOR, 0, 250 - 30 * seg(f - T_ANEL()));
const carga = (bx: number, bz: number, f: number) => {
  const dx = bx - FAIXA_JOGADOR;
  if (Math.abs(dx) > R_ANEL) return 0;
  const s = Math.sqrt(R_ANEL * R_ANEL - dx * dx);
  const z0 = 250, v = 30, t = seg(f - T_ANEL());
  const tin = (z0 - (bz + s)) / v, tout = (z0 - (bz - s)) / v;
  if (t < tin) return 0;
  if (t < tout) return saida((t - tin) / 0.55) || 0.001;
  return 1 - suave((t - tout) / 0.45);
};
const filtroAnel = (f: number): Filtro => {
  const c = new THREE.Vector3();
  return (cat, caixa, quadra) => {
    if (cat === "predio" && quadra >= 0) { const q = QUADRAS[quadra]; return carga(q.x, q.z, f); }
    caixa.getCenter(c);
    return carga(c.x, c.z, f) > 0.5 ? 1 : 0;
  };
};
const Mapa: React.FC<{ opacidade: number }> = ({ opacidade }) => {
  const geo = React.useMemo(() => {
    const v: number[] = [];
    for (const q of QUADRAS) {
      const a = [q.x - 30, q.z - 30], b = [q.x + 30, q.z + 30];
      const c = [[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]];
      for (let i = 0; i < 4; i++) v.push(c[i][0], 0.05, c[i][1], c[(i + 1) % 4][0], 0.05, c[(i + 1) % 4][1]);
    }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  }, []);
  return (
    <lineSegments geometry={geo} frustumCulled={false}>
      <lineBasicMaterial color="#9aa3ad" transparent opacity={opacidade} />
    </lineSegments>
  );
};

// ---------- os 28 planos ----------
export const PLANOS: Plano[] = [
  // 1. Dentro do carro, a cidade passando pela janela
  { n: 1, de: 0, ate: CORTE(1), quadro: (f) => dentro(f, angDentro(f, T(1, fracDe(1, "janela")) - 6)) },
  // 2. Calçada com pedestres, trânsito, o cachorro atravessando
  {
    n: 2, de: CORTE(1), ate: CORTE(2), quadro: (f) => {
      const v = visaoA(f), c = carroA(f), cao = CACHORRO(f);
      return {
        cam: camDe(v, 60),
        cena: (
          <>
            <Ambiente ceu="dia" foco={[c.x + 15, c.z - 20]} raio={70} />
            <Cidade t={seg(f)} />
            <CarroJogador x={c.x} z={c.z} />
            {cao.ativo && <Cachorro x={cao.x} z={cao.z} rot={cao.rot} t={seg(f)} />}
          </>
        ),
      };
    },
  },
  // 3. A câmera gira rápido para o outro lado
  {
    n: 3, de: CORTE(2), ate: CORTE(3), quadro: (f) => {
      const v = visaoA(f), c = carroA(f);
      return {
        cam: camDe(v, 60),
        cena: (
          <>
            <Ambiente ceu="dia" foco={[c.x, c.z - 10]} raio={70} />
            <Cidade t={seg(f)} />
            <CarroJogador x={c.x} z={c.z} />
          </>
        ),
      };
    },
  },
  // 4. Câmera de fora: atrás da câmera do jogo não tem nada
  {
    n: 4, de: CORTE(3), ate: CORTE(4), quadro: (f) => {
      const c = carroA(f), k = seg(f - CORTE(3));
      return {
        cam: { pos: [c.x - 4, 92 - k * 3, c.z + 34 - k * 2], alvo: [c.x - 4, 0, c.z - 14], fov: 58 },
        cena: (
          <>
            <Ambiente ceu="branco" foco={[c.x - 15, c.z]} raio={90} neblina={null} />
            <Cidade t={seg(f)} filtro={recorte(visaoA, f, 0)} />
            <CarroJogador x={c.x} z={c.z} />
            <CameraJogo visao={visaoA(f)} escala={2.2} />
          </>
        ),
      };
    },
  },
  // 5. A câmera do jogo volta e a cidade volta a existir conforme ela gira
  {
    n: 5, de: CORTE(4), ate: CORTE(6), quadro: (f) => {
      const c = carroA(f), k = seg(f - CORTE(4));
      return {
        cam: { pos: [c.x - 4, 90 - k * 2, c.z + 36 - k * 2], alvo: [c.x - 4, 0, c.z - 16], fov: 58 },
        cena: (
          <>
            <Ambiente ceu="branco" foco={[c.x, c.z - 10]} raio={90} neblina={null} />
            <Cidade t={seg(f)} filtro={recorte(visaoA, f, 0)} />
            <CarroJogador x={c.x} z={c.z} />
            <CameraJogo visao={visaoA(f)} escala={2.2} />
          </>
        ),
      };
    },
  },
  // 6. Vista de cima: a pirâmide de visão saindo da câmera
  {
    n: 6, de: CORTE(6), ate: CORTE(8), quadro: (f) => {
      const d = 150 * saida(prog(f, T(8, 0.15), T(8, 0.15) + 26));
      return {
        cam: camTopo(f, CORTE(6)),
        cena: cenaTopo(f, undefined, d),
        sobre: d > 40 ? <Etiqueta x={540} y={300} texto="A PIRÂMIDE" k={prog(f, T(8, 0.45), T(8, 0.45) + 8)} /> : null,
      };
    },
  },
  // 7. Dentro dela, desenhado; fora, apagado
  {
    n: 7, de: CORTE(8), ate: CORTE(9), quadro: (f) => {
      const R = 600 * suave(prog(f, CORTE(8) + 3, CORTE(8) + 30));
      return {
        cam: camTopo(f, CORTE(6)),
        cena: cenaTopo(f, recorte(visaoB, f, -1, R), 150),
        sobre: <Etiqueta x={540} y={300} texto="DESENHADO" k={prog(f, CORTE(8) + 6, CORTE(8) + 14)} />,
      };
    },
  },
  // 8. A pirâmide girando: o que entra acende, o que sai apaga
  {
    n: 8, de: CORTE(9), ate: CORTE(10), quadro: (f) => ({
      cam: camTopo(f, CORTE(6)),
      cena: cenaTopo(f, recorte(visaoB, f, -1), 150),
      sobre: <Etiqueta x={540} y={300} texto="FORA: IGNORADO" fundo="#e9edf2" k={prog(f, CORTE(9) + 4, CORTE(9) + 12)} />,
    }),
  },
  // 9. O contador de objetos desenhados caindo
  {
    n: 9, de: CORTE(10), ate: CORTE(11), quadro: (f) => {
      const R = 640 * suave(prog(f, CORTE(10) + 6, CORTE(10) + 52));
      const filtro = recorte(visaoB, f, -1, R);
      const { n } = contaDesenhados(filtro, seg(f));
      return {
        cam: camTopo(f, CORTE(6)),
        cena: cenaTopo(f, filtro, 150),
        sobre: (
          <g transform="translate(540 330)">
            <rect x={-330} y={-150} width={660} height={250} rx={34} fill="#111" opacity={0.86} />
            <text y={-78} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={46} fill="#ffffff">OBJETOS DESENHADOS</text>
            <text y={62} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={150} fill={AMARELO}>{fmt(n)}</text>
          </g>
        ),
      };
    },
  },
  // 10. Um prédio na frente, outro atrás, os dois dentro da pirâmide
  {
    n: 10, de: CORTE(11), ate: CORTE(13), quadro: (f) => {
      const k = seg(f - CORTE(11));
      const sombra = prog(f, T(13, fracDe(13, "tudo que está atrás")), CORTE(13) - 2);
      return {
        cam: { pos: [34 - k, 46, 40], alvo: [0, 6, -50], fov: 56 },
        cena: cenaC(f, sombra, 0, 0),
        sobre: <Etiqueta x={540} y={300} texto="NA FRENTE · ATRÁS" k={prog(f, CORTE(11) + 6, CORTE(11) + 14)} />,
      };
    },
  },
  // 11. O de trás some, mesmo dentro da pirâmide
  {
    n: 11, de: CORTE(13), ate: CORTE(14), quadro: (f) => {
      const k = seg(f - CORTE(11));
      const sumir = prog(f, CORTE(13) + 4, CORTE(13) + 16);
      return {
        cam: { pos: [34 - k, 46, 40], alvo: [0, 6, -50], fov: 56 },
        cena: cenaC(f, 1, sumir, 0),
        sobre: <Etiqueta x={540} y={300} texto="DENTRO DA PIRÂMIDE" k={prog(f, CORTE(13) + 8, CORTE(13) + 16)} />,
      };
    },
  },
  // 12. De lado: o de trás simplesmente não existe
  {
    n: 12, de: CORTE(14), ate: CORTE(15), quadro: (f) => {
      const k = suave(prog(f, CORTE(14), CORTE(15)));
      const a = mix(0.35, 1.25, k);
      return {
        cam: { pos: [Math.sin(a) * 105, 40, -55 + Math.cos(a) * 105], alvo: [0, 8, -60], fov: 54 },
        cena: cenaC(f, 1, 1.5, prog(f, CORTE(14) + 4, CORTE(14) + 14)),
        sobre: <Etiqueta x={540} y={300} texto="NÃO DESENHADO" fundo="#e2463f" cor="#ffffff" k={prog(f, CORTE(14) + 10, CORTE(14) + 18)} />,
      };
    },
  },
  // 13. De volta à visão normal: parece tudo certo
  {
    n: 13, de: CORTE(15), ate: CORTE(17), quadro: (f) => {
      const c = v3(FAIXA_JOGADOR, 0, -40 - 8 * seg(f - CORTE(15)));
      const v = perseguicao(c, -8, 7, 2.6);
      return { cam: camDe(v, 60), cena: cenaAvenida(f, c, 2, [c.x, c.z - 30]) };
    },
  },
  // 14. O prédio lá no fundo
  {
    n: 14, de: CORTE(17), ate: CORTE(18), quadro: (f) => {
      const k = seg(f - CORTE(17));
      const cam: Cam = { pos: [1.5, 2.4, -60 - k * 4], alvo: [0, 62, TORRE.z], fov: 46 };
      const [x, y] = projeta(cam, [TORRE.x, 70, TORRE.z]);
      const pulsa = 1 + 0.06 * Math.sin(k * 8);
      return {
        cam,
        cena: cenaAvenida(f, null, 2, [0, -120]),
        sobre: <circle cx={x} cy={y} r={300 * pulsa * saida(prog(f, CORTE(17) + 4, CORTE(17) + 14))} fill="none" stroke={AMARELO} strokeWidth={12} />,
      };
    },
  },
  // 15. Chegando perto: é uma caixa com uma imagem colada
  {
    n: 15, de: CORTE(18), ate: CORTE(20), quadro: (f) => {
      const k = seg(f - CORTE(18));
      const deCaixa = T(20, fracDe(20, "caixa"));
      const descola = suave(prog(f, deCaixa, deCaixa + 16)) * (1 - suave(prog(f, CORTE(20) - 14, CORTE(20) - 2)));
      const cam: Cam = { pos: [62 - k * 2, 52, TORRE.z + 168 - k * 3], alvo: [-6, 70, TORRE.z], fov: 54 };
      const [cx, cy] = projeta(cam, [TORRE.x + 4, 96, TORRE.z + 13]);
      const [ix, iy] = projeta(cam, [TORRE.x - 21 * descola, 40, TORRE.z + 13 + 7 * descola]);
      return {
        cam,
        cena: cenaAvenida(f, null, 2, [TORRE.x, TORRE.z], undefined, 0, descola),
        sobre: (
          <>
            <Etiqueta x={cx} y={cy} texto="CAIXA" k={prog(f, deCaixa + 6, deCaixa + 14)} />
            <Etiqueta x={ix} y={iy} texto="IMAGEM COLADA" fundo="#ffffff" k={prog(f, T(20, fracDe(20, "textura")), T(20, fracDe(20, "textura")) + 8)} />
          </>
        ),
      };
    },
  },
  // 16. A câmera avança: o modelo troca na frente de quem olha
  {
    n: 16, de: CORTE(20), ate: CORTE(21), quadro: (f) => {
      const z = mix(-70, -205, suave(prog(f, CORTE(20), CORTE(21))));
      const zAntes = mix(-70, -205, suave(prog(f - 3, CORTE(20), CORTE(21))));
      const troca = lodPara(z) !== lodPara(zAntes);
      const flash = troca ? 1 : lodPara(z) !== lodPara(mix(-70, -205, suave(prog(f - 5, CORTE(20), CORTE(21))))) ? 0.4 : 0;
      const quando = quandoTroca(CORTE(20), CORTE(21), -70, -205, 1);
      return {
        cam: { pos: [3, 3 + (z + 70) * -0.12, z], alvo: [0, 66, TORRE.z], fov: 50 },
        cena: cenaAvenida(f, null, lodPara(z), [0, z - 60], undefined, flash),
        sobre: f >= quando ? <Etiqueta x={540} y={330} texto="TROCOU" k={prog(f, quando, quando + 6)} /> : null,
      };
    },
  },
  // 17. Avança mais: troca de novo, agora com janelas e porta
  {
    n: 17, de: CORTE(21), ate: CORTE(22), quadro: (f) => {
      const z = mix(-205, -318, suave(prog(f, CORTE(21), CORTE(22))));
      const zAntes = mix(-205, -318, suave(prog(f - 3, CORTE(21), CORTE(22))));
      const flash = lodPara(z) !== lodPara(zAntes) ? 1 : 0;
      const quando = quandoTroca(CORTE(21), CORTE(22), -205, -318, 0);
      return {
        cam: { pos: [6, 19 + (z + 205) * -0.2, z], alvo: [0, 40, TORRE.z], fov: 54 },
        cena: cenaAvenida(f, null, lodPara(z), [0, TORRE.z + 30], undefined, flash),
        sobre: f >= quando ? <Etiqueta x={540} y={330} texto="TROCOU DE NOVO" k={prog(f, quando, quando + 6)} /> : null,
      };
    },
  },
  // 18 e 19. As três versões lado a lado; depois, só as arestas e quantos triângulos cada uma tem
  ...[18, 19].map((n): Plano => ({
    n, de: n === 18 ? CORTE(22) : T(23, 0.5), ate: n === 18 ? T(23, 0.5) : CORTE(23), quadro: (f) => {
      const k = seg(f - CORTE(22));
      const cam: Cam = { pos: [0, 66 + k * 1.2, 292 - k * 3], alvo: [0, 66, 0], fov: 44 };
      const xs = [-44, 0, 44];
      const nomes = ["LONGE", "MÉDIO", "PERTO"];
      const lods: (0 | 1 | 2)[] = [2, 1, 0];
      return {
        cam,
        cena: (
          <>
            <Ambiente ceu="branco" foco={[0, 0]} raio={110} neblina={null} />
            <mesh position={[0, -0.05, 0]} receiveShadow>
              <boxGeometry args={[600, 0.1, 400]} />
              <meshStandardMaterial color="#e6e2d9" />
            </mesh>
            {xs.map((x, i) => <Torre key={i} lod={lods[i]} x={x} z={0} praca={false} arame={n === 19} />)}
          </>
        ),
        sobre: (
          <>
            {xs.map((x, i) => {
              const [px, py] = projeta(cam, [x, 152, 0]);
              return <Etiqueta key={i} x={px} y={py - 60} texto={nomes[i]} tam={44} fundo="#ffffff" k={prog(f, CORTE(22) + 3 + i * 4, CORTE(22) + 11 + i * 4)} />;
            })}
            {n === 19 && xs.map((x, i) => {
              const [px, py] = projeta(cam, [x, 64, 15]);
              const kk = prog(f, T(23, 0.5) + i * 5, T(23, 0.5) + 8 + i * 5);
              return (
                <g key={`t${i}`} transform={`translate(${px} ${py})`} opacity={Math.min(1, kk * 2)}>
                  <rect x={-150} y={-74} width={300} height={130} rx={24} fill="#ffffff" stroke="#111" strokeWidth={5} />
                  <text y={4} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={62} fill={i === 2 ? "#e2463f" : "#111"}>{fmt(TRIANGULOS[lods[i]] * saida(kk))}</text>
                  <text y={42} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={28} fill="#444">triângulos</text>
                </g>
              );
            })}
          </>
        ),
      };
    },
  })),
  // 20. De volta à rua: pedestres andando normalmente
  {
    n: 20, de: CORTE(23), ate: CORTE(25), quadro: (f) => {
      const k = seg(f - CORTE(23));
      return {
        cam: { pos: [OLHO_D.x, OLHO_D.y, OLHO_D.z + 14 - k * 1.5], alvo: [8, 1.4, PONTO.z - 14], fov: 58 },
        cena: (
          <>
            <Ambiente ceu="dia" foco={[PONTO.x, PONTO.z]} raio={50} />
            <Cidade t={seg(f)} />
          </>
        ),
      };
    },
  },
  // 21 a 24. A pessoa destacada, a câmera vira, outra pessoa no lugar (e de novo, e de novo)
  ...[21, 22, 23, 24].map((n): Plano => {
    const de = n === 21 ? CORTE(25) : n === 22 ? CORTE(26) : n === 23 ? CORTE(27) : CORTE(28);
    const ate = n === 21 ? CORTE(26) : n === 22 ? CORTE(27) : n === 23 ? CORTE(28) : CORTE(30);
    return {
      n, de, ate, quadro: (f) => {
        const { ang, quem } = giroD(f);
        // a primeira pessoa chega andando até o ponto e para
        const chega = prog(f, CORTE(25) - 10, CORTE(26) - 6);
        const p = PESSOAS_TROCA[quem];
        const z = quem === 0 ? mix(PONTO.z - 14, PONTO.z, saida(chega)) : PONTO.z;
        const andando = quem === 0 && chega < 1 ? Math.abs(Math.sin(seg(f) * 5)) : 0;
        const a = THREE.MathUtils.degToRad(ang * 95);
        const alvoBase = v3(PONTO.x, 1.2, z);
        const dirBase = alvoBase.clone().sub(OLHO_D).normalize();
        const dir = dirBase.clone().applyAxisAngle(v3(0, 1, 0), a);
        const alvo = OLHO_D.clone().addScaledVector(dir, 12);
        return {
          cam: { pos: OLHO_D.toArray() as V3, alvo: [alvo.x, 1.25, alvo.z], fov: 56 },
          cena: (
            <>
              <Ambiente ceu="dia" foco={[PONTO.x - 4, PONTO.z]} raio={45} />
              <Cidade t={seg(f)} tirarPessoas={tiraPerto} />
              <PessoaUnica x={PONTO.x} z={z} rot={quem === 0 && chega < 1 ? Math.PI : -Math.PI / 2} passo={andando} {...p} />
              <Aro x={PONTO.x} z={z} raio={0.85} largura={0.16} />
              <mesh position={[PONTO.x, 1.43 * p.altura + 0.75 + 0.06 * Math.sin(seg(f) * 6), z]} rotation-x={Math.PI}>
                <coneGeometry args={[0.16, 0.3, 4]} />
                <meshBasicMaterial color={AMARELO} />
              </mesh>
            </>
          ),
        };
      },
    };
  }),
  // 25 a 27. Vista de cima: só um anel de cidade em volta do jogador; ele se arrasta junto; de longe, é só isso
  ...[25, 26, 27].map((n): Plano => {
    const de = n === 25 ? CORTE(30) : n === 26 ? CORTE(31) : T(32, 0.62);
    const ate = n === 25 ? CORTE(31) : n === 26 ? T(32, 0.62) : CORTE(32);
    return {
      n, de, ate, quadro: (f) => {
        const c = carroF(f);
        const longe = n === 27 ? suave(prog(f, de, ate - 4)) : 0;
        const alt = mix(330, 1000, longe), atras = mix(215, 640, longe);
        return {
          cam: { pos: [c.x + mix(40, 0, longe), alt, c.z + atras], alvo: [c.x, 0, c.z - mix(30, 120, longe)], fov: 46 },
          cena: (
            <>
              <Ambiente ceu="branco" foco={[c.x, c.z - 20]} raio={mix(150, 420, longe)} neblina={null} />
              <Mapa opacidade={0.55 + 0.35 * longe} />
              <Cidade t={seg(f)} filtro={filtroAnel(f)} />
              <CarroJogador x={c.x} z={c.z} />
              <Aro x={c.x} z={c.z} raio={R_ANEL} largura={mix(2.4, 6, longe)} opacidade={0.95} y={0.4} />
              <Aro x={c.x} z={c.z} raio={mix(6, 14, longe)} largura={mix(4, 10, longe)} y={0.5} />
            </>
          ),
        };
      },
    };
  }),
  // 28. De volta para dentro do carro; no fim da pergunta, o lado de fora apaga
  {
    n: 28, de: CORTE(32), ate: 1e9, quadro: (f) => {
      const t0 = CORTE(32);
      const c = v3(FAIXA_JOGADOR, 0, 20 - 8 * seg(f - t0));
      const apaga = f >= T(33, 1) + 6;
      return dentro(f, mix(-8, -22, suave(prog(f, t0, t0 + 110))), c, apaga ? () => 0 : undefined);
    },
  },
];

/** momentos para os efeitos sonoros: o giro da câmera, as viradas na calçada e as trocas de modelo */
export const MOMENTOS = {
  giros: [GIRO_DE(), ...voltas().giros.map((g) => g.de)],
  trocas: [quandoTroca(CORTE(20), CORTE(21), -70, -205, 1), quandoTroca(CORTE(21), CORTE(22), -205, -318, 0)],
  apaga: T(33, 1) + 6,
};
