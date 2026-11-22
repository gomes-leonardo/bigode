// Renderiza quadros soltos de uma composição com um bundle só (para conferência rápida).
// uso: node scripts/quadros.mjs <IdDaComposicao> <pasta-de-saida> <quadro> [<quadro> ...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [id, saida, ...qs] = process.argv.slice(2);
const browserExecutable = "/home/user/bigode/dada-dor/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell";
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
fs.mkdirSync(saida, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "public") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const q of qs.map(Number)) {
  const output = path.join(saida, `q${String(q).padStart(4, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame: q, browserExecutable, imageFormat: "png", logLevel: "error" });
  console.log(output);
}
