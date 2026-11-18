// Copia os PNGs de assets/ para public/assets/ e gera src/assets-manifest.json.
// Asset presente = usa o PNG do Flow; ausente = o componente desenha a versão vetorial (e vai para PENDENCIAS.md).
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const pastas = ["personagens", "cenarios", "conceituais"];
const presentes = [];
mkdirSync("public/assets", { recursive: true });
for (const p of pastas) {
  const dir = join("assets", p);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".png") || f === "dada-folha.png") continue; // a folha é só referência
    if (existsSync(join(dir, "limpo", f))) continue; // tem versão sem fundo: usa a de limpo/
    cpSync(join(dir, f), join("public/assets", f));
    presentes.push(f.replace(/\.png$/, ""));
  }
}
// poses com fundo removido (scripts/remover_fundo.py) -> public/assets/limpo/
const limpo = join("assets", "personagens", "limpo");
if (existsSync(limpo)) {
  mkdirSync("public/assets/limpo", { recursive: true });
  for (const f of readdirSync(limpo)) if (f.endsWith(".png")) cpSync(join(limpo, f), join("public/assets/limpo", f));
}
// rig de recorte da Gotinha: partes -> public/assets/rig/gotinha/, parts.json -> src/rig/parts.json
// (e as variantes do elenco geradas por v2/rig_variantes.py: mesma geometria, outra cor)
if (existsSync(join("assets", "rig"))) {
  for (const variante of readdirSync(join("assets", "rig"))) {
    const dir = join("assets", "rig", variante);
    if (!existsSync(join(dir, "parts.json"))) continue;
    mkdirSync(join("public/assets/rig", variante), { recursive: true });
    for (const f of readdirSync(dir)) if (f.endsWith(".png")) cpSync(join(dir, f), join("public/assets/rig", variante, f));
  }
  mkdirSync("src/rig", { recursive: true });
  cpSync(join("assets", "rig", "gotinha", "parts.json"), "src/rig/parts.json");
}
writeFileSync("src/assets-manifest.json", JSON.stringify(presentes, null, 1));
console.log(`assets do Flow em uso: ${presentes.length ? presentes.join(", ") : "nenhum (tudo vetorial)"}`);
