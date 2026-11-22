// Mostra o relatório de ritmo que a composição registra no quadro 0 (console.log "RITMO {...}").
// uso: node scripts/ritmo.mjs <IdDaComposicao>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import os from "node:os";
const browserExecutable = "/home/user/bigode/dada-dor/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell";
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "public") });
const composition = await selectComposition({ serveUrl, id: process.argv[2], browserExecutable });
let rel;
await renderStill({ composition, serveUrl, browserExecutable, frame: 0, output: path.join(os.tmpdir(), "ritmo.png"), logLevel: "error",
  onBrowserLog: (l) => { if (l.text.startsWith("RITMO ")) rel = JSON.parse(l.text.slice(6)); } });
if (!rel) { console.log("sem relatório"); process.exit(1); }
console.log((rel.ok ? "RITMO OK · " : "RITMO COM ERRO · ") + rel.resumo);
for (const p of rel.problemas) console.log(`${p.grave ? "ERRO " : "aviso"} [regra ${p.regra}] ${p.msg}`);
