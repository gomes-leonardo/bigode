// Procura avisos do navegador (ex.: atributo SVG inválido, valor negativo, NaN) em quadros soltos.
// uso: node scripts/avisos.mjs <Id@quadro> [<Id@quadro> ...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import os from "node:os";

const browserExecutable = "/home/user/bigode/dada-dor/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell";
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "public") });
const comps = {};
let total = 0;
for (const pedido of process.argv.slice(2)) {
  const [id, q] = pedido.split("@");
  comps[id] ??= await selectComposition({ serveUrl, id, browserExecutable });
  const avisos = [];
  await renderStill({
    composition: comps[id], serveUrl, browserExecutable, frame: Number(q), output: path.join(os.tmpdir(), "aviso.png"), logLevel: "error",
    onBrowserLog: (l) => { if (l.type === "error" || l.type === "warning") avisos.push(`${l.type}: ${l.text}`); },
  });
  total += avisos.length;
  console.log(`${pedido}: ${avisos.length ? avisos.join(" | ") : "sem avisos"}`);
}
console.log(total ? `${total} aviso(s)` : "nenhum aviso");
