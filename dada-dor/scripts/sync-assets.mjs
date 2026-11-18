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
    cpSync(join(dir, f), join("public/assets", f));
    presentes.push(f.replace(/\.png$/, ""));
  }
}
writeFileSync("src/assets-manifest.json", JSON.stringify(presentes, null, 1));
console.log(`assets do Flow em uso: ${presentes.length ? presentes.join(", ") : "nenhum (tudo vetorial)"}`);
