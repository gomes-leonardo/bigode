import type { ArcMood } from "../components/Arcs";

// Pose do rig de recorte. Ângulos em graus, positivo = "para frente" (a Gotinha olha para a direita).
// Membros: 0 = pendurado reto para baixo. Antebraço/canela são relativos ao braço/coxa (hierarquia).
export type PoseTorso = { x: number; y: number; rot: number; scaleX: number; scaleY: number };
export type PoseArcos = { mood: ArcMood; de?: ArcMood; progresso?: number };

export type Pose = {
  torso: PoseTorso;
  head: { rot: number; offsetY: number };
  arm_upper_R: number;
  arm_lower_R: number;
  arm_upper_L: number;
  arm_lower_L: number;
  leg_upper_R: number;
  leg_lower_R: number;
  leg_upper_L: number;
  leg_lower_L: number;
  arcos?: PoseArcos;
};

export type NomeMembro = "arm_upper_R" | "arm_lower_R" | "arm_upper_L" | "arm_lower_L" | "leg_upper_R" | "leg_lower_R" | "leg_upper_L" | "leg_lower_L";
export const MEMBROS: NomeMembro[] = ["arm_upper_R", "arm_lower_R", "arm_upper_L", "arm_lower_L", "leg_upper_R", "leg_lower_R", "leg_upper_L", "leg_lower_L"];

type P2 = [number, number];
export type Parte = {
  arquivo: string;
  largura: number;
  altura: number;
  pivo: P2;
  ancora?: P2;
  repouso?: number;
  pai: [string, string] | null;
  rosto?: P2;
  pescoco?: P2;
  ombro_R?: P2;
  ombro_L?: P2;
  quadril_R?: P2;
  quadril_L?: P2;
};
export type Partes = { partes: Record<string, Parte> };

export const POSE_NEUTRA: Pose = {
  torso: { x: 960, y: 560, rot: 0, scaleX: 1, scaleY: 1 },
  head: { rot: 0, offsetY: 0 },
  arm_upper_R: 6,
  arm_lower_R: 10,
  arm_upper_L: -6,
  arm_lower_L: 10,
  leg_upper_R: 4,
  leg_lower_R: 0,
  leg_upper_L: -4,
  leg_lower_L: 0,
  arcos: { mood: "neutral" },
};
