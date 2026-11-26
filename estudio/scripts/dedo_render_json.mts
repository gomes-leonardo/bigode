// Exporta para o Blender quantos quadros cada plano 3D precisa (e onde caem os momentos sincronizados com a voz).
// uso: npx tsx scripts/dedo_render_json.mts > ../blender/dedo/render.json
import { PLANOS } from "../src/video/dedo/planos";
import { QUADRO_ESTALO, QUADRO_GARRAFA } from "../src/video/dedo/sfx";

const saida = PLANOS.map((p) => {
  const n = p.ate - p.de;
  const extra: Record<string, number> = {};
  if (p.render === 12) extra.bolha_u = (QUADRO_ESTALO - p.de) / n;
  if (p.render === 10) extra.solta_u = (QUADRO_GARRAFA - p.de) / n;
  return { plano: p.n, render: p.render, quadros: n, ...extra };
});
console.log(JSON.stringify(saida, null, 1));
