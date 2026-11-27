// Renderiza quadros soltos com um bundle só (para conferência rápida).
// uso: node scripts/quadros.mjs <IdDaComposicao> <pasta-de-saida> <quadro> [<quadro> ...]
//  ou: node scripts/quadros.mjs --varios <pasta-de-saida> <Id@quadro> [<Id@quadro> ...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const args = process.argv.slice(2);
const varios = args[0] === "--varios";
const [id, saida, ...qs] = varios ? [null, args[1], ...args.slice(2)] : args;
// o primeiro navegador sem janela que existir nesta máquina (o do dada-dor some quando o container é recriado)
const browserExecutable = [
  process.env.REMOTION_CHROME,
  "/home/user/bigode/dada-dor/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell",
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
  "/opt/pw-browsers/headless_shell_as_downloaded/chrome-headless-shell",
].find((c) => c && fs.existsSync(c)) ?? null;
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
fs.mkdirSync(saida, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "public") });
const pedidos = qs.map((q) => (varios ? { id: q.split("@")[0], frame: Number(q.split("@")[1]) } : { id, frame: Number(q) }));
const comps = {};
for (const p of pedidos) {
  comps[p.id] ??= await selectComposition({ serveUrl, id: p.id, browserExecutable });
  const output = path.join(saida, varios ? `${p.id}.png` : `q${String(p.frame).padStart(4, "0")}.png`);
  await renderStill({ composition: comps[p.id], serveUrl, output, frame: p.frame, browserExecutable, imageFormat: "png", logLevel: "error" });
  console.log(output);
}
