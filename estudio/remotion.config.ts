import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
// reaproveita o navegador headless já baixado no projeto vizinho
Config.setBrowserExecutable("/home/user/bigode/dada-dor/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell");
